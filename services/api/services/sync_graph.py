"""
VEDA — PostgreSQL to Neo4j Knowledge Graph Sync
==================================================
Reads scriptures, books, chapters, and verses from PostgreSQL and creates
corresponding Neo4j nodes with PART_OF relationships.

This is the Phase 3B bridge: canonical data lives in PostgreSQL, but the
knowledge graph needs Verse/Chapter/Book/Scripture nodes to enable graph
traversal, concept linking, and cross-scripture reference queries.

Idempotent — safe to re-run. Uses MERGE to skip existing nodes.

Usage:
    cd services/api
    python -m services.sync_graph
"""

from __future__ import annotations

import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.postgres import init_postgres, close_postgres, fetch
from db.neo4j_client import init_neo4j, close_neo4j, write_query, read_query

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.sync.graph")

BATCH_SIZE = 50


async def sync_scriptures() -> int:
    """Sync Scripture nodes from PostgreSQL to Neo4j."""
    rows = await fetch(
        "SELECT id, slug, name, sanskrit_name, category, language FROM scriptures"
    )
    created = 0
    for row in rows:
        result = await write_query(
            """
            MERGE (s:Scripture {id: $id})
            ON CREATE SET
                s.slug = $slug,
                s.name = $name,
                s.sanskrit_name = $sanskrit_name,
                s.category = $category,
                s.language = $language
            ON MATCH SET
                s.name = $name,
                s.sanskrit_name = $sanskrit_name,
                s.category = $category
            RETURN s.id AS id, true AS existed
            """,
            {
                "id": row["id"],
                "slug": row["slug"],
                "name": row["name"],
                "sanskrit_name": row["sanskrit_name"],
                "category": row["category"],
                "language": row["language"],
            },
        )
        created += 1
    logger.info("Scriptures synced: %d", created)
    return created


async def sync_books() -> int:
    """Sync Book nodes and Book -[:PART_OF]-> Scripture relationships."""
    rows = await fetch(
        "SELECT id, scripture_id, name, sanskrit_name, position FROM books"
    )
    created = 0
    for row in rows:
        await write_query(
            """
            MERGE (b:Book {id: $id})
            ON CREATE SET
                b.name = $name,
                b.sanskrit_name = $sanskrit_name,
                b.position = $position,
                b.scripture_id = $scripture_id
            ON MATCH SET
                b.name = $name,
                b.sanskrit_name = $sanskrit_name
            WITH b
            MATCH (s:Scripture {id: $scripture_id})
            MERGE (b)-[:PART_OF]->(s)
            """,
            {
                "id": row["id"],
                "scripture_id": row["scripture_id"],
                "name": row["name"],
                "sanskrit_name": row["sanskrit_name"],
                "position": row["position"],
            },
        )
        created += 1
    logger.info("Books synced: %d", created)
    return created


async def sync_chapters() -> int:
    """Sync Chapter nodes and Chapter -[:PART_OF]-> Book relationships."""
    rows = await fetch(
        """
        SELECT id, book_id, scripture_id, chapter_number, title, sanskrit_title, summary
        FROM chapters ORDER BY scripture_id, chapter_number
        """
    )
    created = 0
    for row in rows:
        await write_query(
            """
            MERGE (c:Chapter {id: $id})
            ON CREATE SET
                c.chapter_number = $chapter_number,
                c.title = $title,
                c.sanskrit_title = $sanskrit_title,
                c.summary = $summary,
                c.scripture_id = $scripture_id,
                c.book_id = $book_id
            ON MATCH SET
                c.title = $title,
                c.sanskrit_title = $sanskrit_title,
                c.summary = $summary
            WITH c
            MATCH (b:Book {id: $book_id})
            MERGE (c)-[:PART_OF]->(b)
            """,
            {
                "id": row["id"],
                "book_id": row["book_id"],
                "scripture_id": row["scripture_id"],
                "chapter_number": row["chapter_number"],
                "title": row["title"],
                "sanskrit_title": row["sanskrit_title"],
                "summary": row["summary"],
            },
        )
        created += 1
    logger.info("Chapters synced: %d", created)
    return created


async def sync_verses() -> int:
    """Sync Verse nodes and Verse -[:PART_OF]-> Chapter relationships, in batches."""
    total_count = await _count_pg_verses()
    logger.info("Verses to sync: %d", total_count)

    rows = await fetch(
        """
        SELECT id, scripture_id, chapter_id, verse_number, canonical_reference
        FROM verses ORDER BY scripture_id, chapter_id, verse_number
        """
    )

    created = 0
    batch: list[dict] = []

    for row in rows:
        batch.append({
            "id": row["id"],
            "scripture_id": row["scripture_id"],
            "chapter_id": row["chapter_id"],
            "verse_number": row["verse_number"],
            "canonical_reference": row["canonical_reference"],
        })

        if len(batch) >= BATCH_SIZE:
            created += await _flush_verse_batch(batch)
            batch = []

    if batch:
        created += await _flush_verse_batch(batch)

    logger.info("Verses synced: %d", created)
    return created


async def _flush_verse_batch(batch: list[dict]) -> int:
    """MERGE a batch of Verse nodes and their PART_OF relationships."""
    await write_query(
        """
        UNWIND $batch AS row
        MERGE (v:Verse {id: row.id})
        ON CREATE SET
            v.canonical_reference = row.canonical_reference,
            v.verse_number = row.verse_number,
            v.scripture_id = row.scripture_id
        ON MATCH SET
            v.canonical_reference = row.canonical_reference,
            v.verse_number = row.verse_number
        WITH v, row
        MATCH (c:Chapter {id: row.chapter_id})
        MERGE (v)-[:PART_OF]->(c)
        """,
        {"batch": batch},
    )
    return len(batch)


async def _count_pg_verses() -> int:
    """Count total verses in PostgreSQL."""
    from db.postgres import fetchval
    return await fetchval("SELECT COUNT(*) FROM verses") or 0


async def print_sync_summary():
    """Print sync statistics from Neo4j."""
    stats = await read_query(
        """
        MATCH (n)
        WHERE n:Scripture OR n:Book OR n:Chapter OR n:Verse
        WITH labels(n)[0] AS label, COUNT(*) AS count
        RETURN label, count ORDER BY count DESC
        """
    )
    logger.info("Neo4j hierarchy after sync:")
    for row in stats:
        logger.info("  %-15s %d nodes", row["label"], row["count"])

    rel_count = await read_query(
        "MATCH ()-[r:PART_OF]->() RETURN count(r) AS total"
    )
    if rel_count:
        logger.info("  PART_OF rels:   %d", rel_count[0]["total"])


async def main():
    """Run the full PostgreSQL -> Neo4j sync pipeline."""
    logger.info("=" * 60)
    logger.info("VEDA — PostgreSQL to Neo4j Sync")
    logger.info("=" * 60)

    await init_postgres()
    await init_neo4j()

    try:
        await sync_scriptures()
        await sync_books()
        await sync_chapters()
        await sync_verses()
        await print_sync_summary()

        logger.info("=" * 60)
        logger.info("Sync complete!")
        logger.info("=" * 60)
    finally:
        await close_neo4j()
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
