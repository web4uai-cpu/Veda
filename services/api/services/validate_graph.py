"""
VEDA — Knowledge Graph Validation
=====================================
Compares Neo4j node counts against PostgreSQL source-of-truth counts.
Reports mismatches and missing relationships.

Usage:
    cd services/api
    python -m services.validate_graph
"""

from __future__ import annotations

import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.postgres import init_postgres, close_postgres, fetchval
from db.neo4j_client import init_neo4j, close_neo4j, read_query

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.validate.graph")


async def count_pg(table: str) -> int:
    """Count rows in a PostgreSQL table."""
    return await fetchval(f"SELECT COUNT(*) FROM {table}") or 0


async def count_neo4j(label: str) -> int:
    """Count nodes with a given label in Neo4j."""
    result = await read_query(
        f"MATCH (n:{label}) RETURN count(n) AS total"
    )
    return result[0]["total"] if result else 0


async def count_neo4j_rels(rel_type: str) -> int:
    """Count relationships of a given type in Neo4j."""
    result = await read_query(
        f"MATCH ()-[r:{rel_type}]->() RETURN count(r) AS total"
    )
    return result[0]["total"] if result else 0


async def validate_counts() -> list[dict]:
    """Compare PostgreSQL counts against Neo4j counts. Returns list of checks."""
    checks = []

    pairs = [
        ("scriptures", "Scripture"),
        ("books", "Book"),
        ("chapters", "Chapter"),
        ("verses", "Verse"),
    ]

    for table, label in pairs:
        pg_count = await count_pg(table)
        neo4j_count = await count_neo4j(label)
        match = pg_count == neo4j_count
        checks.append({
            "entity": label,
            "pg_count": pg_count,
            "neo4j_count": neo4j_count,
            "match": match,
        })
        status = "OK" if match else "MISMATCH"
        logger.info(
            "  %-12s  PG=%4d  Neo4j=%4d  [%s]",
            label, pg_count, neo4j_count, status,
        )

    return checks


async def validate_hierarchy() -> list[dict]:
    """Validate PART_OF relationship completeness."""
    checks = []

    hierarchy_checks = [
        ("Verse", "Chapter", "PART_OF", "verses"),
        ("Chapter", "Book", "PART_OF", "chapters"),
        ("Book", "Scripture", "PART_OF", "books"),
    ]

    for child_label, parent_label, rel_type, pg_table in hierarchy_checks:
        pg_count = await count_pg(pg_table)

        result = await read_query(
            f"""
            MATCH (child:{child_label})-[:{rel_type}]->(parent:{parent_label})
            RETURN count(child) AS linked
            """
        )
        linked = result[0]["linked"] if result else 0

        orphan_result = await read_query(
            f"""
            MATCH (child:{child_label})
            WHERE NOT (child)-[:{rel_type}]->()
            RETURN count(child) AS orphans
            """
        )
        orphans = orphan_result[0]["orphans"] if orphan_result else 0

        match = linked == pg_count and orphans == 0
        checks.append({
            "relationship": f"{child_label}-[:{rel_type}]->{parent_label}",
            "expected": pg_count,
            "linked": linked,
            "orphans": orphans,
            "match": match,
        })
        status = "OK" if match else "INCOMPLETE"
        logger.info(
            "  %-35s  expected=%4d  linked=%4d  orphans=%d  [%s]",
            f"{child_label}->{parent_label}", pg_count, linked, orphans, status,
        )

    return checks


async def validate_mentions() -> dict:
    """Validate MENTIONS relationships exist and report coverage."""
    total_verses = await count_neo4j("Verse")
    result = await read_query(
        """
        MATCH (v:Verse)-[:MENTIONS]->(:Concept)
        RETURN count(DISTINCT v) AS with_concepts
        """
    )
    with_concepts = result[0]["with_concepts"] if result else 0

    mentions_count = await count_neo4j_rels("MENTIONS")

    coverage = (with_concepts / total_verses * 100) if total_verses > 0 else 0

    logger.info("  Verses with concepts: %d / %d (%.1f%%)", with_concepts, total_verses, coverage)
    logger.info("  Total MENTIONS rels:  %d", mentions_count)

    return {
        "total_verses": total_verses,
        "verses_with_concepts": with_concepts,
        "coverage_pct": round(coverage, 1),
        "total_mentions": mentions_count,
    }


async def validate_concepts() -> dict:
    """Validate all seeded concepts exist and have connections."""
    result = await read_query(
        """
        MATCH (c:Concept)
        OPTIONAL MATCH (v:Verse)-[:MENTIONS]->(c)
        WITH c.slug AS slug, c.name AS name, count(v) AS verse_count
        RETURN slug, name, verse_count ORDER BY verse_count DESC
        """
    )

    connected = sum(1 for r in result if r["verse_count"] > 0)
    disconnected = [r["slug"] for r in result if r["verse_count"] == 0]

    logger.info("  Concepts: %d total, %d connected, %d disconnected", len(result), connected, len(disconnected))
    if disconnected:
        logger.info("  Disconnected: %s", ", ".join(disconnected))

    return {
        "total_concepts": len(result),
        "connected": connected,
        "disconnected": disconnected,
    }


async def main() -> bool:
    """Run full graph validation. Returns True if all checks pass."""
    logger.info("=" * 60)
    logger.info("VEDA — Knowledge Graph Validation")
    logger.info("=" * 60)

    await init_postgres()
    await init_neo4j()

    all_passed = True

    try:
        logger.info("\n--- Node Counts ---")
        count_checks = await validate_counts()
        if not all(c["match"] for c in count_checks):
            all_passed = False

        logger.info("\n--- Hierarchy (PART_OF) ---")
        hierarchy_checks = await validate_hierarchy()
        if not all(c["match"] for c in hierarchy_checks):
            all_passed = False

        logger.info("\n--- Concept Mentions ---")
        mentions = await validate_mentions()

        logger.info("\n--- Concept Coverage ---")
        concepts = await validate_concepts()

        logger.info("\n" + "=" * 60)
        if all_passed:
            logger.info("PASSED — Graph matches PostgreSQL source of truth")
        else:
            logger.info("FAILED — Mismatches detected (run sync_graph to fix)")
        logger.info("=" * 60)

        return all_passed

    finally:
        await close_neo4j()
        await close_postgres()


if __name__ == "__main__":
    passed = asyncio.run(main())
    sys.exit(0 if passed else 1)
