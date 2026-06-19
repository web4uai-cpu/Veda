"""
VEDA — Concept Detection for Gita Verses
============================================
Scans verse translations in PostgreSQL and creates
Verse -[:MENTIONS]-> Concept relationships in Neo4j.

Detection strategy (layered, highest-confidence first):
  1. Chapter-level theme mapping — each Gita chapter has known primary concepts
  2. Keyword matching — concept names/synonyms found in English translations
  3. Sanskrit term matching — Devanagari concept terms in Sanskrit text

Idempotent — uses MERGE for all relationships.

Usage:
    cd services/api
    python -m services.detect_concepts
"""

from __future__ import annotations

import asyncio
import logging
import re
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
logger = logging.getLogger("veda.detect.concepts")


# ============================================================================
# Chapter → Concept theme mapping (authoritative, weight 0.90)
# Based on traditional Gita chapter classifications
# ============================================================================

CHAPTER_CONCEPTS: dict[int, list[str]] = {
    1: ["dharma", "samsara"],
    2: ["atman", "brahman", "karma-yoga", "sankhya", "dharma", "vairagya"],
    3: ["karma-yoga", "karma", "dharma"],
    4: ["jnana-yoga", "karma", "dharma", "shraddha"],
    5: ["karma-yoga", "jnana-yoga", "moksha", "vairagya"],
    6: ["dhyana", "raja-yoga", "atman", "vairagya"],
    7: ["brahman", "maya", "prakriti", "bhakti-yoga"],
    8: ["brahman", "karma", "moksha", "dhyana"],
    9: ["bhakti-yoga", "brahman", "maya", "shraddha"],
    10: ["brahman", "bhakti-yoga"],
    11: ["brahman", "bhakti-yoga", "shraddha"],
    12: ["bhakti-yoga", "shraddha", "vairagya", "ahimsa"],
    13: ["prakriti", "purusha", "atman", "jnana-yoga"],
    14: ["sattva", "rajas", "tamas", "prakriti"],
    15: ["brahman", "atman", "purusha", "maya"],
    16: ["dharma", "satya", "ahimsa", "tapas", "shraddha"],
    17: ["shraddha", "sattva", "rajas", "tamas", "tapas", "satya"],
    18: ["moksha", "karma-yoga", "jnana-yoga", "bhakti-yoga", "dharma", "vairagya"],
}


# ============================================================================
# Keyword → concept slug mapping for text matching (weight 0.75)
# ============================================================================

KEYWORD_MAP: dict[str, str] = {
    # Exact concept names
    "brahman": "brahman",
    "atman": "atman",
    "self": "atman",
    "soul": "atman",
    "maya": "maya",
    "illusion": "maya",
    "samsara": "samsara",
    "cycle of birth": "samsara",
    "rebirth": "samsara",
    "dharma": "dharma",
    "duty": "dharma",
    "righteous": "dharma",
    "karma": "karma",
    "action": "karma",
    "moksha": "moksha",
    "liberation": "moksha",
    "freedom": "moksha",
    "karma yoga": "karma-yoga",
    "selfless action": "karma-yoga",
    "desireless action": "karma-yoga",
    "without attachment": "karma-yoga",
    "jnana": "jnana-yoga",
    "knowledge": "jnana-yoga",
    "discrimination": "jnana-yoga",
    "bhakti": "bhakti-yoga",
    "devotion": "bhakti-yoga",
    "worship": "bhakti-yoga",
    "raja yoga": "raja-yoga",
    "meditation": "dhyana",
    "dhyana": "dhyana",
    "contemplate": "dhyana",
    "sattva": "sattva",
    "goodness": "sattva",
    "purity": "sattva",
    "rajas": "rajas",
    "passion": "rajas",
    "tamas": "tamas",
    "ignorance": "tamas",
    "darkness": "tamas",
    "inertia": "tamas",
    "ahimsa": "ahimsa",
    "non-violence": "ahimsa",
    "nonviolence": "ahimsa",
    "satya": "satya",
    "truth": "satya",
    "tapas": "tapas",
    "austerity": "tapas",
    "penance": "tapas",
    "shraddha": "shraddha",
    "faith": "shraddha",
    "viveka": "viveka",
    "discernment": "viveka",
    "vairagya": "vairagya",
    "detachment": "vairagya",
    "renunciation": "vairagya",
    "dispassion": "vairagya",
    "prakriti": "prakriti",
    "nature": "prakriti",
    "purusha": "purusha",
    "consciousness": "purusha",
    "supreme person": "purusha",
    "avidya": "avidya",
}

# Sanskrit term → concept slug (weight 0.85)
SANSKRIT_TERM_MAP: dict[str, str] = {
    "ब्रह्म": "brahman",
    "आत्म": "atman",
    "माया": "maya",
    "संसार": "samsara",
    "धर्म": "dharma",
    "कर्म": "karma",
    "मोक्ष": "moksha",
    "भक्ति": "bhakti-yoga",
    "ज्ञान": "jnana-yoga",
    "ध्यान": "dhyana",
    "योग": "karma-yoga",
    "सत्त्व": "sattva",
    "रजस": "rajas",
    "तमस": "tamas",
    "प्रकृति": "prakriti",
    "पुरुष": "purusha",
    "अहिंसा": "ahimsa",
    "सत्य": "satya",
    "तपस": "tapas",
    "श्रद्धा": "shraddha",
    "वैराग्य": "vairagya",
    "विवेक": "viveka",
    "अविद्या": "avidya",
}


def detect_concepts_in_text(text: str, source_map: dict[str, str]) -> dict[str, float]:
    """Find concept slugs in text using a keyword map. Returns {slug: weight}."""
    text_lower = text.lower()
    found: dict[str, float] = {}
    for keyword, slug in source_map.items():
        pattern = re.compile(r'\b' + re.escape(keyword.lower()) + r'\b', re.IGNORECASE)
        if pattern.search(text_lower):
            existing = found.get(slug, 0.0)
            found[slug] = max(existing, 0.75)
    return found


def detect_sanskrit_concepts(text: str) -> dict[str, float]:
    """Find concept slugs in Sanskrit/Devanagari text. Returns {slug: weight}."""
    found: dict[str, float] = {}
    for term, slug in SANSKRIT_TERM_MAP.items():
        if term in text:
            found[slug] = 0.85
    return found


def extract_chapter_number(canonical_ref: str) -> int | None:
    """Extract chapter number from 'BG.2.47' format."""
    parts = canonical_ref.split(".")
    if len(parts) >= 2:
        try:
            return int(parts[1])
        except ValueError:
            return None
    return None


async def detect_and_link() -> dict[str, int]:
    """Main detection loop: scan all verses, create MENTIONS relationships."""
    rows = await fetch(
        """
        SELECT v.id AS verse_id, v.canonical_reference,
               vc.content, vc.content_type
        FROM verses v
        JOIN verse_contents vc ON vc.verse_id = v.id
        WHERE vc.content_type IN ('translation', 'sanskrit')
          AND vc.content IS NOT NULL AND vc.content != ''
        ORDER BY v.canonical_reference
        """
    )

    verse_concepts: dict[str, dict[str, float]] = {}

    for row in rows:
        verse_id = row["verse_id"]
        ref = row["canonical_reference"]
        content = row["content"]
        content_type = row["content_type"]

        if verse_id not in verse_concepts:
            verse_concepts[verse_id] = {}

        # Layer 1: chapter theme (applied once per verse)
        ch_num = extract_chapter_number(ref)
        if ch_num and ch_num in CHAPTER_CONCEPTS:
            for slug in CHAPTER_CONCEPTS[ch_num]:
                existing = verse_concepts[verse_id].get(slug, 0.0)
                verse_concepts[verse_id][slug] = max(existing, 0.90)

        # Layer 2: keyword matching on translations
        if content_type == "translation":
            kw_hits = detect_concepts_in_text(content, KEYWORD_MAP)
            for slug, weight in kw_hits.items():
                existing = verse_concepts[verse_id].get(slug, 0.0)
                verse_concepts[verse_id][slug] = max(existing, weight)

        # Layer 3: Sanskrit term matching
        if content_type == "sanskrit":
            sk_hits = detect_sanskrit_concepts(content)
            for slug, weight in sk_hits.items():
                existing = verse_concepts[verse_id].get(slug, 0.0)
                verse_concepts[verse_id][slug] = max(existing, weight)

    # Write MENTIONS relationships to Neo4j
    total_rels = 0
    skipped = 0
    batch: list[dict] = []

    for verse_id, concepts in verse_concepts.items():
        for slug, weight in concepts.items():
            batch.append({
                "verse_id": verse_id,
                "concept_slug": slug,
                "weight": weight,
            })
            if len(batch) >= 50:
                count, skip = await _flush_mentions_batch(batch)
                total_rels += count
                skipped += skip
                batch = []

    if batch:
        count, skip = await _flush_mentions_batch(batch)
        total_rels += count
        skipped += skip

    logger.info(
        "MENTIONS relationships: %d created/updated, %d concept nodes not found",
        total_rels, skipped,
    )
    return {
        "verses_scanned": len(verse_concepts),
        "relationships_written": total_rels,
        "concepts_not_found": skipped,
    }


async def _flush_mentions_batch(batch: list[dict]) -> tuple[int, int]:
    """MERGE a batch of MENTIONS relationships. Returns (created, skipped)."""
    result = await write_query(
        """
        UNWIND $batch AS row
        OPTIONAL MATCH (v:Verse {id: row.verse_id})
        OPTIONAL MATCH (c:Concept {slug: row.concept_slug})
        WITH v, c, row
        WHERE v IS NOT NULL AND c IS NOT NULL
        MERGE (v)-[r:MENTIONS]->(c)
        ON CREATE SET r.weight = row.weight, r.source = 'auto-detect'
        ON MATCH SET r.weight = CASE WHEN row.weight > r.weight THEN row.weight ELSE r.weight END
        RETURN count(r) AS created
        """,
        {"batch": batch},
    )
    created = result[0]["created"] if result else 0
    skipped = len(batch) - created
    return created, skipped


async def print_detection_summary():
    """Print concept mention statistics."""
    stats = await read_query(
        """
        MATCH (v:Verse)-[r:MENTIONS]->(c:Concept)
        WITH c.slug AS concept, c.name AS name, count(v) AS verse_count,
             avg(r.weight) AS avg_weight
        RETURN concept, name, verse_count, avg_weight
        ORDER BY verse_count DESC
        LIMIT 25
        """
    )
    logger.info("Top concept mentions:")
    for row in stats:
        logger.info(
            "  %-20s %4d verses  (avg weight: %.2f)",
            row["name"], row["verse_count"], row["avg_weight"],
        )

    total = await read_query("MATCH ()-[r:MENTIONS]->() RETURN count(r) AS total")
    if total:
        logger.info("  Total MENTIONS: %d", total[0]["total"])


async def main():
    """Run concept detection pipeline."""
    logger.info("=" * 60)
    logger.info("VEDA — Concept Detection for Gita Verses")
    logger.info("=" * 60)

    await init_postgres()
    await init_neo4j()

    try:
        result = await detect_and_link()
        await print_detection_summary()

        logger.info("=" * 60)
        logger.info("Detection complete!")
        logger.info("  Verses scanned: %d", result["verses_scanned"])
        logger.info("  MENTIONS created: %d", result["relationships_written"])
        logger.info("=" * 60)
    finally:
        await close_neo4j()
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
