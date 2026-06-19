"""
VEDA — Citation Service
=========================
Validates source references and converts retrieved rows into citation objects.

This service is deliberately conservative: if a source cannot be verified, it
does not receive a citation.
"""

from __future__ import annotations

from core.ulid import generate_id
from db import postgres
from models.schemas import (
    CitationResponse,
    CitationValidateRequest,
    CitationValidateResponse,
    EvidenceLevel,
    SourceType,
)


SOURCE_QUALITY: dict[SourceType, float] = {
    "SCRIPTURE": 1.00,
    "COMMENTARY": 0.90,
    "SCHOLARLY_SOURCE": 0.80,
    "UPLOAD": 0.50,
    "AI_NOTE": 0.20,
}


def evidence_level_for_score(score: float) -> EvidenceLevel:
    """Map a confidence score to the VEDA evidence scale."""
    if score >= 0.95:
        return "A"
    if score >= 0.80:
        return "B"
    if score >= 0.60:
        return "C"
    if score >= 0.40:
        return "D"
    return "E"


def calculate_confidence(
    source_type: SourceType,
    retrieval_score: float,
    graph_score: float = 0.0,
    citation_strength: float = 1.0,
    agent_agreement: float = 1.0,
) -> float:
    """
    Calculate confidence using the weights from CITATION_ENGINE.md.

    Agent agreement defaults to neutral approval until the agent runtime exists.
    """
    source_quality = SOURCE_QUALITY[source_type]
    confidence = (
        (source_quality * 0.40)
        + (retrieval_score * 0.20)
        + (graph_score * 0.15)
        + (agent_agreement * 0.15)
        + (citation_strength * 0.10)
    )
    return round(min(max(confidence, 0.0), 1.0), 4)


async def resolve_scripture_citation(
    verse_id: str,
    retrieval_score: float,
    graph_score: float = 0.0,
) -> CitationResponse | None:
    """Verify a verse exists and return its canonical scripture citation."""
    row = await postgres.fetchrow(
        """
        SELECT v.id AS verse_id,
               v.canonical_reference,
               v.verse_number,
               c.chapter_number,
               s.name AS scripture_name
        FROM verses v
        JOIN scriptures s ON s.id = v.scripture_id
        LEFT JOIN chapters c ON c.id = v.chapter_id
        WHERE v.id = $1
        """,
        verse_id,
    )
    if not row:
        return None

    confidence = calculate_confidence(
        "SCRIPTURE",
        retrieval_score=retrieval_score,
        graph_score=graph_score,
        citation_strength=1.0,
    )
    return CitationResponse(
        citation_id=generate_id("cit"),
        source_type="SCRIPTURE",
        source_name=row["scripture_name"],
        reference=row["canonical_reference"],
        source_id=row["verse_id"],
        chapter=row["chapter_number"],
        verse=row["verse_number"],
        confidence=confidence,
        evidence_level=evidence_level_for_score(confidence),
    )


async def resolve_scripture_citation_by_reference(
    reference: str,
    retrieval_score: float = 1.0,
    graph_score: float = 0.0,
) -> CitationResponse | None:
    """Resolve a canonical reference like BG.2.47 to a verified citation."""
    normalized = normalize_reference(reference)
    row = await postgres.fetchrow(
        "SELECT id FROM verses WHERE canonical_reference = $1",
        normalized,
    )
    if not row:
        return None
    return await resolve_scripture_citation(
        row["id"],
        retrieval_score=retrieval_score,
        graph_score=graph_score,
    )


def normalize_reference(reference: str) -> str:
    """Normalize common Bhagavad Gita reference formats to canonical form."""
    cleaned = " ".join(reference.strip().upper().replace(":", ".").split())
    cleaned = cleaned.replace("GITA", "BG")
    cleaned = cleaned.replace(" ", ".")
    while ".." in cleaned:
        cleaned = cleaned.replace("..", ".")
    return cleaned


async def persist_citation(citation: CitationResponse) -> None:
    """Persist a citation when the trust-layer migration exists."""
    try:
        await postgres.execute(
            """
            INSERT INTO citations (
                id, source_type, source_id, source_name, reference,
                chapter, verse, confidence, evidence_level
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (id) DO NOTHING
            """,
            citation.citation_id,
            citation.source_type,
            citation.source_id,
            citation.source_name,
            citation.reference,
            citation.chapter,
            citation.verse,
            citation.confidence,
            citation.evidence_level,
        )
    except Exception:
        # Local dev may not have run migration 002 yet. Validation should still work.
        return


async def persist_citation_audit(
    decision: str,
    reason: str,
    confidence: float | None = None,
    citation_id: str | None = None,
    correlation_id: str | None = None,
) -> None:
    """Persist a citation decision for auditability when available."""
    try:
        await postgres.execute(
            """
            INSERT INTO citation_audit_logs (
                id, correlation_id, citation_id, decision, reason, confidence
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            generate_id("aud"),
            correlation_id,
            citation_id,
            decision,
            reason,
            confidence,
        )
    except Exception:
        return


async def resolve_upload_citation(
    upload_id: str,
    chunk_id: str,
    retrieval_score: float,
) -> CitationResponse | None:
    """Resolve an upload chunk into a citation with appropriate confidence."""
    row = await postgres.fetchrow(
        """
        SELECT u.id AS upload_id, u.title, u.filename,
               c.chunk_index, c.page_start, c.page_end
        FROM user_uploads u
        JOIN upload_chunks c ON c.upload_id = u.id
        WHERE u.id = $1 AND c.id = $2
        """,
        upload_id,
        chunk_id,
    )
    if not row:
        return None

    title = row["title"] or row["filename"]
    page_ref = ""
    if row["page_start"] and row["page_end"]:
        if row["page_start"] == row["page_end"]:
            page_ref = f", p. {row['page_start']}"
        else:
            page_ref = f", pp. {row['page_start']}-{row['page_end']}"

    reference = f"{title}{page_ref}"

    confidence = calculate_confidence(
        "UPLOAD",
        retrieval_score=retrieval_score,
    )
    return CitationResponse(
        citation_id=generate_id("cit"),
        source_type="UPLOAD",
        source_name=title,
        reference=reference,
        source_id=chunk_id,
        chapter=None,
        verse=row["chunk_index"],
        confidence=confidence,
        evidence_level=evidence_level_for_score(confidence),
    )


async def validate_citation(
    request: CitationValidateRequest,
    correlation_id: str | None = None,
) -> CitationValidateResponse:
    """
    Validate source existence and basic citation confidence.

    Claim-to-evidence semantic matching is intentionally deferred until the
    retrieval/RLM layer exists. For now, this is a strict source gate.
    """
    if request.source_type != "SCRIPTURE":
        reason = "Only SCRIPTURE citation validation is implemented in this phase."
        await persist_citation_audit(
            "rejected",
            reason,
            correlation_id=correlation_id,
        )
        return CitationValidateResponse(valid=False, decision="rejected", reason=reason)

    citation = await resolve_scripture_citation_by_reference(
        request.reference,
        retrieval_score=request.retrieval_score,
        graph_score=request.graph_score,
    )
    if not citation:
        reason = f"Reference '{request.reference}' was not found in the canonical corpus."
        await persist_citation_audit(
            "rejected",
            reason,
            correlation_id=correlation_id,
        )
        return CitationValidateResponse(valid=False, decision="rejected", reason=reason)

    if request.source_id and request.source_id != citation.source_id:
        reason = "Citation source_id does not match the canonical reference."
        await persist_citation_audit(
            "rejected",
            reason,
            confidence=citation.confidence,
            citation_id=citation.citation_id,
            correlation_id=correlation_id,
        )
        return CitationValidateResponse(
            valid=False,
            decision="rejected",
            citation=citation,
            reason=reason,
        )

    await persist_citation(citation)

    if citation.confidence < 0.60:
        reason = "Citation exists but confidence is below the approval threshold."
        await persist_citation_audit(
            "flagged",
            reason,
            confidence=citation.confidence,
            citation_id=citation.citation_id,
            correlation_id=correlation_id,
        )
        return CitationValidateResponse(
            valid=True,
            decision="flagged",
            citation=citation,
            reason=reason,
        )

    reason = "Citation verified against canonical scripture."
    await persist_citation_audit(
        "approved",
        reason,
        confidence=citation.confidence,
        citation_id=citation.citation_id,
        correlation_id=correlation_id,
    )
    return CitationValidateResponse(
        valid=True,
        decision="approved",
        citation=citation,
        reason=reason,
    )
