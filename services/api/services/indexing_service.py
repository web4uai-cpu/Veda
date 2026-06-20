"""
VEDA — Indexing Service
==========================
Orchestrates embedding generation and bulk indexing into Qdrant + OpenSearch.
Idempotent — safe to re-run. Uses upserts for both vector and text indexes.

Usage:
    cd services/api
    python -m services.index_corpus
"""

from __future__ import annotations

import logging
from typing import Any

from db import postgres
from db.qdrant_client import upsert_vectors
from db.opensearch_client import index_document
from services.embedding_service import generate_embeddings

logger = logging.getLogger("veda.services.indexing")

BATCH_SIZE = 50


async def index_scripture_verses() -> dict[str, int]:
    """Embed and index all canonical verse content into Qdrant + OpenSearch.

    For each verse:
      - Combines Sanskrit + primary translation into embedding text
      - Generates embedding via OpenAI
      - Upserts into Qdrant `scripture_chunks` collection
      - Indexes into OpenSearch `veda-scriptures` index

    Returns stats dict with counts.
    """
    rows = await postgres.fetch(
        """
        SELECT v.id AS verse_id, v.canonical_reference, v.scripture_id, v.verse_number,
               s.name AS scripture_name, s.slug AS scripture_slug,
               c.chapter_number,
               (SELECT vc.content FROM verse_contents vc
                WHERE vc.verse_id = v.id AND vc.content_type = 'sanskrit' AND vc.is_primary = true
                LIMIT 1) AS sanskrit,
               (SELECT vc.content FROM verse_contents vc
                WHERE vc.verse_id = v.id AND vc.content_type = 'translation' AND vc.is_primary = true
                LIMIT 1) AS translation
        FROM verses v
        JOIN scriptures s ON s.id = v.scripture_id
        LEFT JOIN chapters ch ON ch.id = v.chapter_id
        LEFT JOIN LATERAL (SELECT ch.chapter_number) c ON true
        ORDER BY v.scripture_id, v.canonical_reference
        """
    )

    if not rows:
        logger.info("No verses found to index")
        return {"verses_found": 0, "qdrant_upserted": 0, "opensearch_indexed": 0}

    logger.info("Found %d verses to index", len(rows))
    qdrant_total = 0
    opensearch_total = 0

    for start in range(0, len(rows), BATCH_SIZE):
        batch = rows[start : start + BATCH_SIZE]

        texts = []
        for row in batch:
            parts = []
            if row["canonical_reference"]:
                parts.append(row["canonical_reference"])
            if row["sanskrit"]:
                parts.append(row["sanskrit"])
            if row["translation"]:
                parts.append(row["translation"])
            texts.append("\n".join(parts) if parts else row["canonical_reference"] or "")

        embeddings = await generate_embeddings(texts)

        qdrant_points = []
        for i, row in enumerate(batch):
            if not embeddings[i]:
                continue
            qdrant_points.append({
                "id": row["verse_id"],
                "vector": embeddings[i],
                "payload": {
                    "source_id": row["verse_id"],
                    "source_type": "SCRIPTURE",
                    "scripture_id": row["scripture_id"],
                    "scripture_name": row["scripture_name"],
                    "canonical_reference": row["canonical_reference"],
                    "content": texts[i][:1000],
                    "language": "sanskrit",
                    "chapter": row["chapter_number"],
                    "verse_number": row["verse_number"],
                },
            })

        if qdrant_points:
            try:
                await upsert_vectors("scripture_chunks", qdrant_points)
                qdrant_total += len(qdrant_points)
            except Exception as e:
                logger.error("Qdrant upsert failed for batch %d: %s", start, e)

        for i, row in enumerate(batch):
            try:
                await index_document("veda-scriptures", row["verse_id"], {
                    "reference": row["canonical_reference"],
                    "scripture_name": row["scripture_name"],
                    "scripture_slug": row["scripture_slug"],
                    "chapter": row["chapter_number"],
                    "verse_number": row["verse_number"],
                    "sanskrit": row["sanskrit"] or "",
                    "translation": row["translation"] or "",
                    "content": texts[i],
                    "source_type": "SCRIPTURE",
                })
                opensearch_total += 1
            except Exception as e:
                logger.error("OpenSearch index failed for %s: %s", row["verse_id"], e)

        logger.info(
            "  Batch %d-%d: %d qdrant, %d opensearch",
            start, start + len(batch), len(qdrant_points), len(batch),
        )

    stats = {
        "verses_found": len(rows),
        "qdrant_upserted": qdrant_total,
        "opensearch_indexed": opensearch_total,
    }
    logger.info("Scripture indexing complete: %s", stats)
    return stats


async def index_upload_chunks(upload_id: str) -> dict[str, int]:
    """Embed and index all chunks from a processed upload.

    Args:
        upload_id: The upload whose chunks should be indexed.

    Returns stats dict with counts.
    """
    rows = await postgres.fetch(
        """
        SELECT c.id AS chunk_id, c.upload_id, c.chunk_index, c.content,
               c.page_start, c.page_end,
               u.title, u.filename, u.scripture_id, u.language
        FROM upload_chunks c
        JOIN user_uploads u ON u.id = c.upload_id
        WHERE c.upload_id = $1
        ORDER BY c.chunk_index
        """,
        upload_id,
    )

    if not rows:
        logger.info("No chunks found for upload %s", upload_id)
        return {"chunks_found": 0, "qdrant_upserted": 0, "opensearch_indexed": 0}

    logger.info("Indexing %d chunks for upload %s", len(rows), upload_id)

    texts = [row["content"] for row in rows]
    embeddings = await generate_embeddings(texts)

    qdrant_total = 0
    opensearch_total = 0

    qdrant_points = []
    for i, row in enumerate(rows):
        if not embeddings[i]:
            continue
        title = row["title"] or row["filename"]
        qdrant_points.append({
            "id": row["chunk_id"],
            "vector": embeddings[i],
            "payload": {
                "source_id": row["chunk_id"],
                "source_type": "UPLOAD",
                "upload_id": row["upload_id"],
                "scripture_id": row["scripture_id"],
                "content": row["content"][:1000],
                "title": title,
                "page_start": row["page_start"],
                "page_end": row["page_end"],
                "language": row["language"] or "en",
                "chunk_index": row["chunk_index"],
            },
        })

    if qdrant_points:
        try:
            for batch_start in range(0, len(qdrant_points), BATCH_SIZE):
                batch = qdrant_points[batch_start : batch_start + BATCH_SIZE]
                await upsert_vectors("upload_chunks", batch)
                qdrant_total += len(batch)
        except Exception as e:
            logger.error("Qdrant upsert failed for upload %s: %s", upload_id, e)

    for i, row in enumerate(rows):
        try:
            title = row["title"] or row["filename"]
            await index_document("veda-uploads", row["chunk_id"], {
                "upload_id": row["upload_id"],
                "title": title,
                "content": row["content"],
                "page_start": row["page_start"],
                "page_end": row["page_end"],
                "chunk_index": row["chunk_index"],
                "language": row["language"] or "en",
                "source_type": "UPLOAD",
            })
            opensearch_total += 1
        except Exception as e:
            logger.error("OpenSearch index failed for chunk %s: %s", row["chunk_id"], e)

    stats = {
        "chunks_found": len(rows),
        "qdrant_upserted": qdrant_total,
        "opensearch_indexed": opensearch_total,
    }
    logger.info("Upload %s indexing complete: %s", upload_id, stats)
    return stats


async def index_all_uploads() -> dict[str, int]:
    """Index all completed uploads that haven't been indexed yet."""
    upload_ids = await postgres.fetch(
        "SELECT id FROM user_uploads WHERE status = 'completed' ORDER BY uploaded_at"
    )

    total = {"uploads_processed": 0, "qdrant_upserted": 0, "opensearch_indexed": 0}
    for row in upload_ids:
        stats = await index_upload_chunks(row["id"])
        total["uploads_processed"] += 1
        total["qdrant_upserted"] += stats["qdrant_upserted"]
        total["opensearch_indexed"] += stats["opensearch_indexed"]

    return total


async def index_all() -> dict[str, Any]:
    """Run full indexing pipeline: scriptures + uploads. Idempotent."""
    logger.info("=" * 60)
    logger.info("VEDA — Full Corpus Indexing")
    logger.info("=" * 60)

    scripture_stats = await index_scripture_verses()
    upload_stats = await index_all_uploads()

    result = {
        "scriptures": scripture_stats,
        "uploads": upload_stats,
    }
    logger.info("Full indexing complete: %s", result)
    return result
