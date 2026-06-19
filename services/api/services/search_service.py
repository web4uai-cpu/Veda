"""
VEDA — Hybrid Search Service
==============================
Evidence-first retrieval across PostgreSQL, Neo4j, Qdrant, and OpenSearch.
Returns citation-ready evidence packets, not generated answers.
"""

from __future__ import annotations

import asyncio
import logging
import re
import time
from dataclasses import dataclass, field

from config import settings
from core.ulid import generate_id
from db import postgres
from db.neo4j_client import read_query
from models.schemas import (
    EvidencePacketResponse,
    QueryUnderstanding,
    SearchRequest,
    SearchResponse,
)
from services.cache_service import get_cached, set_cached, search_key, TTL_SEARCH_RESULTS
from services.citation_service import resolve_scripture_citation, persist_citation

logger = logging.getLogger("veda.services.search")

REFERENCE_RE = re.compile(
    r"\b(?P<prefix>BG|GITA)\s*\.?\s*(?P<chapter>\d{1,2})\s*[\.:]\s*(?P<verse>\d{1,3})\b",
    re.IGNORECASE,
)

CONCEPT_HINTS = {
    "moksha": "moksha",
    "dharma": "dharma",
    "karma": "karma",
    "atman": "atman",
    "aatman": "atman",
    "brahman": "brahman",
    "maya": "maya",
    "bhakti": "bhakti-yoga",
    "jnana": "jnana-yoga",
    "gyan": "jnana-yoga",
    "yoga": "raja-yoga",
    "samsara": "samsara",
}

_SOURCE_WEIGHTS = {
    "postgres.reference": 1.0,
    "qdrant.semantic": 0.40,
    "opensearch.fulltext": 0.25,
    "neo4j.concept": 0.20,
    "postgres.keyword": 0.15,
}


@dataclass
class Candidate:
    """Internal retrieval candidate before citation validation."""

    source_id: str
    title: str
    content: str
    score: float
    retrieval_source: str
    metadata: dict = field(default_factory=dict)
    graph_score: float = 0.0


def understand_query(request: SearchRequest) -> QueryUnderstanding:
    """Classify a query enough to choose retrieval paths."""
    normalized = " ".join(request.query.strip().split())
    reference_match = REFERENCE_RE.search(normalized)
    if reference_match:
        chapter = int(reference_match.group("chapter"))
        verse = int(reference_match.group("verse"))
        return QueryUnderstanding(
            intent="verse",
            normalized_query=normalized,
            canonical_reference=f"BG.{chapter}.{verse}",
            graph_depth=0,
        )

    lowered = normalized.lower()
    concepts = [slug for key, slug in CONCEPT_HINTS.items() if key in lowered]
    if request.concept_slugs:
        concepts = sorted(set(concepts + request.concept_slugs))

    if "compare" in lowered or "difference" in lowered or " vs " in lowered:
        intent = "comparison"
    elif request.mode == "research":
        intent = "research"
    elif concepts:
        intent = "concept"
    else:
        intent = "unknown"

    depth = 1 if request.mode == "quick" else 3 if request.mode == "scholar" else 5
    return QueryUnderstanding(
        intent=intent,
        normalized_query=normalized,
        concepts=concepts,
        graph_depth=depth,
    )


# ---------------------------------------------------------------------------
# Retrieval paths
# ---------------------------------------------------------------------------

async def _reference_candidates(reference: str) -> list[Candidate]:
    rows = await postgres.fetch(
        """
        SELECT v.id AS verse_id,
               v.canonical_reference,
               vc.content,
               vc.content_type,
               vc.source
        FROM verses v
        JOIN verse_contents vc ON vc.verse_id = v.id
        WHERE v.canonical_reference = $1
        ORDER BY
            CASE vc.content_type
                WHEN 'sanskrit' THEN 1
                WHEN 'transliteration' THEN 2
                WHEN 'translation' THEN 3
                ELSE 4
            END,
            vc.is_primary DESC
        """,
        reference,
    )
    if not rows:
        return []

    content = "\n\n".join(
        f"{row['content_type'].title()} ({row['source']}): {row['content']}"
        for row in rows
    )
    return [
        Candidate(
            source_id=rows[0]["verse_id"],
            title=reference,
            content=content,
            score=1.0,
            retrieval_source="postgres.reference",
            graph_score=1.0,
        )
    ]


async def _keyword_candidates(request: SearchRequest) -> list[Candidate]:
    """PostgreSQL fallback keyword search for canonical verse content."""
    query = request.query.strip()
    rows = await postgres.fetch(
        """
        SELECT v.id AS verse_id,
               v.canonical_reference,
               MAX(CASE WHEN vc.content_type = 'sanskrit' THEN vc.content END) AS sanskrit,
               MAX(CASE WHEN vc.content_type = 'translation' AND vc.is_primary THEN vc.content END) AS translation,
               MAX(CASE WHEN vc.content_type = 'translation' THEN vc.content END) AS any_translation,
               ts_rank_cd(to_tsvector('english', string_agg(vc.content, ' ')), plainto_tsquery('english', $1)) AS rank
        FROM verses v
        JOIN verse_contents vc ON vc.verse_id = v.id
        WHERE vc.content ILIKE '%' || $1 || '%'
           OR v.canonical_reference ILIKE '%' || $1 || '%'
        GROUP BY v.id, v.canonical_reference
        ORDER BY rank DESC, v.canonical_reference
        LIMIT $2
        """,
        query,
        request.limit,
    )

    candidates: list[Candidate] = []
    for row in rows:
        translation = row["translation"] or row["any_translation"] or ""
        parts = []
        if row["sanskrit"]:
            parts.append(f"Sanskrit: {row['sanskrit']}")
        if translation:
            parts.append(f"Translation: {translation}")
        score = 0.75 if row["rank"] is None else min(0.95, 0.65 + float(row["rank"]))
        candidates.append(
            Candidate(
                source_id=row["verse_id"],
                title=row["canonical_reference"],
                content="\n\n".join(parts),
                score=round(score, 4),
                retrieval_source="postgres.keyword",
            )
        )
    return candidates


async def _graph_concept_candidates(understanding: QueryUnderstanding) -> list[Candidate]:
    """Use Neo4j concept expansion to locate verses linked to requested concepts."""
    if not understanding.concepts or understanding.graph_depth <= 0:
        return []

    candidates: list[Candidate] = []
    for slug in understanding.concepts:
        try:
            graph_rows = await read_query(
                """
                MATCH (c:Concept {slug: $slug})
                OPTIONAL MATCH (v:Verse)-[:MENTIONS]->(c)
                RETURN c.name AS concept_name,
                       c.summary AS summary,
                       collect(v.id)[0..10] AS verse_ids
                """,
                {"slug": slug},
            )
        except Exception:
            continue

        if not graph_rows:
            continue

        verse_ids = [vid for vid in graph_rows[0].get("verse_ids", []) if vid]
        if not verse_ids:
            continue

        rows = await postgres.fetch(
            """
            SELECT v.id AS verse_id,
                   v.canonical_reference,
                   MAX(CASE WHEN vc.content_type = 'translation' AND vc.is_primary THEN vc.content END) AS translation,
                   MAX(CASE WHEN vc.content_type = 'translation' THEN vc.content END) AS any_translation
            FROM verses v
            JOIN verse_contents vc ON vc.verse_id = v.id
            WHERE v.id = ANY($1::text[])
            GROUP BY v.id, v.canonical_reference
            LIMIT 10
            """,
            verse_ids,
        )
        for row in rows:
            candidates.append(
                Candidate(
                    source_id=row["verse_id"],
                    title=row["canonical_reference"],
                    content=f"Translation: {row['translation'] or row['any_translation'] or ''}",
                    score=0.82,
                    retrieval_source="neo4j.concept",
                    metadata={"concept": slug},
                    graph_score=0.85,
                )
            )
    return candidates


async def _vector_candidates(
    request: SearchRequest, understanding: QueryUnderstanding
) -> list[Candidate]:
    """Semantic search via Qdrant. Generates embedding then searches scripture_chunks."""
    if not settings.openai_api_key:
        return []

    try:
        from db.qdrant_client import search_vectors, get_client
        get_client()
    except (RuntimeError, ImportError):
        return []

    try:
        import openai
        client = openai.AsyncOpenAI(api_key=settings.openai_api_key)
        resp = await client.embeddings.create(
            model=settings.embedding_model,
            input=understanding.normalized_query,
            dimensions=settings.embedding_dimensions,
        )
        query_vector = resp.data[0].embedding
    except Exception as exc:
        logger.debug("Embedding generation failed: %s", exc)
        return []

    try:
        hits = await search_vectors(
            collection_name="scripture_chunks",
            query_vector=query_vector,
            limit=request.limit,
            score_threshold=0.65,
        )
    except Exception as exc:
        logger.debug("Qdrant search failed: %s", exc)
        return []

    candidates: list[Candidate] = []
    for hit in hits:
        payload = hit.get("payload", {})
        candidates.append(
            Candidate(
                source_id=payload.get("verse_id", str(hit["id"])),
                title=payload.get("canonical_reference", ""),
                content=payload.get("content", ""),
                score=round(hit["score"], 4),
                retrieval_source="qdrant.semantic",
                metadata={"collection": "scripture_chunks"},
            )
        )
    return candidates


async def _fulltext_candidates(request: SearchRequest) -> list[Candidate]:
    """Full-text search via OpenSearch on veda-scriptures index."""
    try:
        from db.opensearch_client import search as os_search, get_client
        get_client()
    except (RuntimeError, ImportError):
        return []

    try:
        query_dsl = {
            "multi_match": {
                "query": request.query,
                "fields": ["content^2", "canonical_reference^3", "sanskrit", "transliteration"],
                "type": "best_fields",
                "fuzziness": "AUTO",
            }
        }
        result = await os_search(
            index="veda-scriptures",
            query=query_dsl,
            size=request.limit,
            highlight={"fields": {"content": {}, "sanskrit": {}}},
        )
    except Exception as exc:
        logger.debug("OpenSearch search failed: %s", exc)
        return []

    candidates: list[Candidate] = []
    for hit in result.get("hits", {}).get("hits", []):
        source = hit.get("_source", {})
        os_score = hit.get("_score", 1.0)
        candidates.append(
            Candidate(
                source_id=source.get("verse_id", hit.get("_id", "")),
                title=source.get("canonical_reference", ""),
                content=source.get("content", ""),
                score=round(min(os_score / 10.0, 0.95), 4),
                retrieval_source="opensearch.fulltext",
                metadata={"highlights": hit.get("highlight", {})},
            )
        )
    return candidates


# ---------------------------------------------------------------------------
# Fusion ranking
# ---------------------------------------------------------------------------

def _fuse_candidates(candidates: list[Candidate], k: int = 60) -> list[Candidate]:
    """Reciprocal Rank Fusion across retrieval sources."""
    by_source: dict[str, list[Candidate]] = {}
    for c in candidates:
        by_source.setdefault(c.retrieval_source, []).append(c)

    rrf_scores: dict[str, float] = {}
    best_candidate: dict[str, Candidate] = {}

    for source, source_candidates in by_source.items():
        weight = _SOURCE_WEIGHTS.get(source, 0.10)
        for rank, c in enumerate(source_candidates):
            rrf = weight / (k + rank + 1)
            sid = c.source_id
            rrf_scores[sid] = rrf_scores.get(sid, 0.0) + rrf
            if sid not in best_candidate or c.score > best_candidate[sid].score:
                best_candidate[sid] = c

    for sid, rrf_score in rrf_scores.items():
        best_candidate[sid].score = round(min(rrf_score * 100, 1.0), 4)

    return sorted(best_candidate.values(), key=lambda c: c.score, reverse=True)


# ---------------------------------------------------------------------------
# Evidence builder + orchestrator
# ---------------------------------------------------------------------------

async def _to_evidence(candidate: Candidate) -> EvidencePacketResponse | None:
    citation = await resolve_scripture_citation(
        candidate.source_id,
        retrieval_score=candidate.score,
        graph_score=candidate.graph_score,
    )
    if not citation:
        return None

    await persist_citation(citation)

    return EvidencePacketResponse(
        packet_id=generate_id("pkt"),
        source_id=candidate.source_id,
        source_type="SCRIPTURE",
        title=candidate.title,
        content=candidate.content,
        citation=citation,
        score=candidate.score,
        retrieval_source=candidate.retrieval_source,
        metadata=candidate.metadata,
    )


async def search_evidence(request: SearchRequest) -> SearchResponse:
    """Run all available retrieval paths and return citation-ready evidence."""
    cache_k = search_key(request.query, request.mode)
    cached = await get_cached(cache_k)
    if cached is not None:
        return SearchResponse(**cached)

    started = time.perf_counter()
    understanding = understand_query(request)
    warnings: list[str] = []
    candidates: list[Candidate] = []

    if understanding.canonical_reference:
        candidates.extend(await _reference_candidates(understanding.canonical_reference))

    retrieval_results = await asyncio.gather(
        _graph_concept_candidates(understanding),
        _keyword_candidates(request),
        _vector_candidates(request, understanding),
        _fulltext_candidates(request),
        return_exceptions=True,
    )
    for result in retrieval_results:
        if isinstance(result, list):
            candidates.extend(result)
        elif isinstance(result, Exception):
            warnings.append(f"Retrieval path failed: {result}")

    ranked = _fuse_candidates(candidates)

    evidence: list[EvidencePacketResponse] = []
    for candidate in ranked[: request.limit]:
        packet = await _to_evidence(candidate)
        if packet:
            evidence.append(packet)

    if not evidence:
        warnings.append(
            "No citation-ready evidence found. Ingest scripture content and build search indexes before reasoning."
        )

    elapsed_ms = (time.perf_counter() - started) * 1000

    try:
        await postgres.execute(
            """
            INSERT INTO search_queries (id, query, mode, intent, result_count, latency_ms)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            generate_id("qry"),
            request.query,
            request.mode,
            understanding.intent,
            len(evidence),
            round(elapsed_ms, 2),
        )
    except Exception:
        pass

    response = SearchResponse(
        query=request.query,
        mode=request.mode,
        understanding=understanding,
        results=evidence,
        total=len(evidence),
        query_time_ms=round(elapsed_ms, 2),
        warnings=warnings,
    )

    if evidence:
        await set_cached(cache_k, response.model_dump(), ttl=TTL_SEARCH_RESULTS)

    return response
