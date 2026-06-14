"""
VEDA — Knowledge Graph Seed Data
===================================
Seeds the Neo4j knowledge graph with core ontology nodes:
  - Concepts (dharma, karma, atman, brahman, etc.)
  - Philosophical Schools (Advaita, Dvaita, Vishishtadvaita, etc.)
  - Key Persons (Rishis, Acharyas)
  - Scriptures (linked to PostgreSQL records)
  - Relationships between all of the above

Derived from: docs/ontology/*.md (12 ontology documents)

Usage:
    cd services/api
    python -m services.seed_graph
"""

from __future__ import annotations

import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.ulid import generate_id
from db.neo4j_client import init_neo4j, close_neo4j, write_query, read_query

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.seed.graph")


# =============================================================================
# CORE CONCEPTS (from CONCEPT_ONTOLOGY.md)
# =============================================================================

CONCEPTS = [
    # Metaphysical
    {"slug": "brahman", "name": "Brahman", "sanskrit": "ब्रह्मन्", "category": "metaphysics", "summary": "The ultimate, unchanging reality amidst and beyond the world. The absolute ground of all existence."},
    {"slug": "atman", "name": "Atman", "sanskrit": "आत्मन्", "category": "metaphysics", "summary": "The eternal, innermost Self or soul. Distinct from body, mind, and ego."},
    {"slug": "maya", "name": "Maya", "sanskrit": "माया", "category": "metaphysics", "summary": "Cosmic illusion or the power of Brahman that conceals the true nature of reality."},
    {"slug": "samsara", "name": "Samsara", "sanskrit": "संसार", "category": "metaphysics", "summary": "The cycle of birth, death, and rebirth driven by karma."},

    # Ethics & Duty
    {"slug": "dharma", "name": "Dharma", "sanskrit": "धर्म", "category": "ethics", "summary": "Cosmic law, moral duty, righteous conduct. The foundation of social and cosmic order."},
    {"slug": "karma", "name": "Karma", "sanskrit": "कर्म", "category": "ethics", "summary": "Action and its consequences. The universal law of cause and effect across lifetimes."},
    {"slug": "moksha", "name": "Moksha", "sanskrit": "मोक्ष", "category": "soteriology", "summary": "Liberation from the cycle of samsara. The ultimate goal of human existence."},

    # Yoga Paths
    {"slug": "karma-yoga", "name": "Karma Yoga", "sanskrit": "कर्मयोग", "category": "yoga", "summary": "The path of selfless action — performing duty without attachment to results."},
    {"slug": "jnana-yoga", "name": "Jnana Yoga", "sanskrit": "ज्ञानयोग", "category": "yoga", "summary": "The path of knowledge — Self-realization through discrimination and inquiry."},
    {"slug": "bhakti-yoga", "name": "Bhakti Yoga", "sanskrit": "भक्तियोग", "category": "yoga", "summary": "The path of devotion — loving surrender to the Divine."},
    {"slug": "raja-yoga", "name": "Raja Yoga", "sanskrit": "राजयोग", "category": "yoga", "summary": "The royal path — mastery of mind through meditation (Patanjali's Ashtanga Yoga)."},
    {"slug": "dhyana", "name": "Dhyana", "sanskrit": "ध्यान", "category": "yoga", "summary": "Deep meditation — sustained concentration leading to absorption in the object of meditation."},

    # Gunas
    {"slug": "sattva", "name": "Sattva", "sanskrit": "सत्त्व", "category": "sankhya", "summary": "The quality of goodness, harmony, balance, and knowledge."},
    {"slug": "rajas", "name": "Rajas", "sanskrit": "रजस्", "category": "sankhya", "summary": "The quality of passion, activity, restlessness, and desire."},
    {"slug": "tamas", "name": "Tamas", "sanskrit": "तमस्", "category": "sankhya", "summary": "The quality of darkness, inertia, ignorance, and delusion."},

    # Key Concepts
    {"slug": "ahimsa", "name": "Ahimsa", "sanskrit": "अहिंसा", "category": "ethics", "summary": "Non-violence — the highest dharma. Abstaining from harm in thought, word, and deed."},
    {"slug": "satya", "name": "Satya", "sanskrit": "सत्य", "category": "ethics", "summary": "Truth — truthfulness in speech and conduct as a supreme virtue."},
    {"slug": "tapas", "name": "Tapas", "sanskrit": "तपस्", "category": "practice", "summary": "Austerity — spiritual discipline and purification through voluntary self-restraint."},
    {"slug": "shraddha", "name": "Shraddha", "sanskrit": "श्रद्धा", "category": "practice", "summary": "Faith — trust in the teachings, the teacher, and the process of spiritual growth."},
    {"slug": "viveka", "name": "Viveka", "sanskrit": "विवेक", "category": "philosophy", "summary": "Discrimination — the ability to discern the real from the unreal, the eternal from the transient."},
    {"slug": "vairagya", "name": "Vairagya", "sanskrit": "वैराग्य", "category": "philosophy", "summary": "Dispassion — detachment from worldly objects and sensory pleasures."},
    {"slug": "prakriti", "name": "Prakriti", "sanskrit": "प्रकृति", "category": "sankhya", "summary": "Primordial nature — the material cause of the universe composed of three gunas."},
    {"slug": "purusha", "name": "Purusha", "sanskrit": "पुरुष", "category": "sankhya", "summary": "Pure consciousness — the witnessing Self, distinct from Prakriti."},
    {"slug": "avidya", "name": "Avidya", "sanskrit": "अविद्या", "category": "metaphysics", "summary": "Ignorance — the fundamental cause of suffering and bondage in samsara."},
]

# =============================================================================
# PHILOSOPHICAL SCHOOLS (from PHILOSOPHY_ONTOLOGY.md)
# =============================================================================

SCHOOLS = [
    {"slug": "advaita", "name": "Advaita Vedanta", "sanskrit": "अद्वैतवेदान्त", "summary": "Non-dualism. Brahman alone is real; the world is appearance (maya); Atman IS Brahman."},
    {"slug": "vishishtadvaita", "name": "Vishishtadvaita", "sanskrit": "विशिष्टाद्वैत", "summary": "Qualified non-dualism. Brahman, souls, and matter are real; souls are parts of Brahman but not identical."},
    {"slug": "dvaita", "name": "Dvaita Vedanta", "sanskrit": "द्वैतवेदान्त", "summary": "Dualism. God, souls, and matter are eternally distinct and real."},
    {"slug": "sankhya", "name": "Sankhya", "sanskrit": "सांख्य", "summary": "Enumeration philosophy. Dualistic system distinguishing Purusha (consciousness) from Prakriti (matter)."},
    {"slug": "yoga-darshana", "name": "Yoga (Darshana)", "sanskrit": "योगदर्शन", "summary": "Patanjali's system of mental discipline. Closely allied with Sankhya metaphysics."},
    {"slug": "nyaya", "name": "Nyaya", "sanskrit": "न्याय", "summary": "Logic and epistemology. Systematic analysis of valid knowledge through four pramanas."},
    {"slug": "vaisheshika", "name": "Vaisheshika", "sanskrit": "वैशेषिक", "summary": "Atomistic naturalism. Analysis of reality into categories (padarthas) including atoms."},
    {"slug": "mimamsa", "name": "Purva Mimamsa", "sanskrit": "पूर्वमीमांसा", "summary": "Exegesis of the Vedas. Emphasis on ritual action (karma) as the path to heaven."},
]

# =============================================================================
# KEY PERSONS (from PERSON_ONTOLOGY.md)
# =============================================================================

PERSONS = [
    {"name": "Adi Shankaracharya", "sanskrit": "आदि शंकराचार्य", "type": "acharya", "period": "788-820 CE", "desc": "Founder of Advaita Vedanta. Consolidated the doctrine of non-dualism and established four mathas."},
    {"name": "Ramanujacharya", "sanskrit": "रामानुजाचार्य", "type": "acharya", "period": "1017-1137 CE", "desc": "Founder of Vishishtadvaita. Emphasized devotion (bhakti) alongside knowledge."},
    {"name": "Madhvacharya", "sanskrit": "मध्वाचार्य", "type": "acharya", "period": "1238-1317 CE", "desc": "Founder of Dvaita Vedanta. Argued for eternal distinction between God and souls."},
    {"name": "Vyasa", "sanskrit": "व्यास", "type": "rishi", "period": "Vedic period", "desc": "Compiler of the Vedas, author of the Mahabharata including the Bhagavad Gita, and the Brahma Sutras."},
    {"name": "Patanjali", "sanskrit": "पतञ्जलि", "type": "rishi", "period": "~200 BCE", "desc": "Author of the Yoga Sutras — the foundational text of Raja Yoga."},
    {"name": "Valmiki", "sanskrit": "वाल्मीकि", "type": "rishi", "period": "Vedic period", "desc": "Author of the Ramayana. Known as the Adi Kavi (first poet)."},
    {"name": "Kapila", "sanskrit": "कपिल", "type": "rishi", "period": "Vedic period", "desc": "Founder of the Sankhya school of philosophy."},
    {"name": "Swami Vivekananda", "sanskrit": "स्वामी विवेकानन्द", "type": "saint", "period": "1863-1902 CE", "desc": "Key figure in introducing Vedanta to the Western world. Disciple of Ramakrishna."},
]

# =============================================================================
# RELATIONSHIPS
# =============================================================================

CONCEPT_RELATIONS = [
    # Related concepts
    ("atman", "brahman", "RELATED_TO", 0.95),
    ("karma", "samsara", "RELATED_TO", 0.90),
    ("moksha", "samsara", "RELATED_TO", 0.85),
    ("dharma", "karma", "RELATED_TO", 0.80),
    ("avidya", "maya", "RELATED_TO", 0.85),
    ("viveka", "vairagya", "RELATED_TO", 0.80),
    ("purusha", "prakriti", "RELATED_TO", 0.95),
    ("sattva", "rajas", "RELATED_TO", 0.70),
    ("rajas", "tamas", "RELATED_TO", 0.70),

    # Explanatory
    ("jnana-yoga", "viveka", "EXPLAINS", 0.85),
    ("karma-yoga", "karma", "EXPLAINS", 0.90),
    ("bhakti-yoga", "shraddha", "EXPLAINS", 0.80),
    ("dhyana", "raja-yoga", "EXPLAINS", 0.85),
    ("moksha", "atman", "EXPLAINS", 0.80),
    ("maya", "avidya", "EXPLAINS", 0.85),
]

SCHOOL_SUPPORTS = [
    ("advaita", "atman"),
    ("advaita", "brahman"),
    ("advaita", "maya"),
    ("advaita", "viveka"),
    ("advaita", "jnana-yoga"),
    ("vishishtadvaita", "bhakti-yoga"),
    ("vishishtadvaita", "shraddha"),
    ("dvaita", "bhakti-yoga"),
    ("sankhya", "purusha"),
    ("sankhya", "prakriti"),
    ("sankhya", "sattva"),
    ("yoga-darshana", "dhyana"),
    ("yoga-darshana", "raja-yoga"),
]

PERSON_TEACHES = [
    ("Adi Shankaracharya", "advaita"),
    ("Ramanujacharya", "vishishtadvaita"),
    ("Madhvacharya", "dvaita"),
    ("Patanjali", "yoga-darshana"),
    ("Kapila", "sankhya"),
]


async def seed_concepts():
    """Seed all core concepts into Neo4j."""
    count = 0
    for c in CONCEPTS:
        result = await read_query(
            "MATCH (c:Concept {slug: $slug}) RETURN c.id AS id", {"slug": c["slug"]}
        )
        if result:
            continue

        cid = generate_id("cpt")
        await write_query(
            """
            CREATE (c:Concept {
                id: $id, slug: $slug, name: $name,
                sanskrit_name: $sanskrit, category: $category, summary: $summary
            })
            """,
            {"id": cid, **c},
        )
        count += 1
    logger.info("Concepts: %d created, %d already existed", count, len(CONCEPTS) - count)


async def seed_schools():
    """Seed philosophical schools."""
    count = 0
    for s in SCHOOLS:
        result = await read_query(
            "MATCH (sc:School {slug: $slug}) RETURN sc.id AS id", {"slug": s["slug"]}
        )
        if result:
            continue

        sid = generate_id("cpt")  # Using concept prefix for schools too
        await write_query(
            """
            CREATE (sc:School {
                id: $id, slug: $slug, name: $name,
                sanskrit_name: $sanskrit, summary: $summary
            })
            """,
            {"id": sid, **s},
        )
        count += 1
    logger.info("Schools: %d created, %d already existed", count, len(SCHOOLS) - count)


async def seed_persons():
    """Seed key persons."""
    count = 0
    for p in PERSONS:
        result = await read_query(
            "MATCH (p:Person {name: $name}) RETURN p.id AS id", {"name": p["name"]}
        )
        if result:
            continue

        pid = generate_id("prs")
        await write_query(
            """
            CREATE (p:Person {
                id: $id, name: $name, sanskrit_name: $sanskrit,
                type: $type, period: $period, description: $desc
            })
            """,
            {"id": pid, **p},
        )
        count += 1
    logger.info("Persons: %d created, %d already existed", count, len(PERSONS) - count)


async def seed_relationships():
    """Create relationships between nodes."""
    # Concept ↔ Concept
    rel_count = 0
    for src, tgt, rel_type, weight in CONCEPT_RELATIONS:
        result = await read_query(
            f"""
            MATCH (a:Concept {{slug: $src}})-[r:{rel_type}]->(b:Concept {{slug: $tgt}})
            RETURN type(r) AS t
            """,
            {"src": src, "tgt": tgt},
        )
        if not result:
            await write_query(
                f"""
                MATCH (a:Concept {{slug: $src}}), (b:Concept {{slug: $tgt}})
                CREATE (a)-[:{rel_type} {{weight: $weight}}]->(b)
                """,
                {"src": src, "tgt": tgt, "weight": weight},
            )
            rel_count += 1

    # School → Concept (SUPPORTS)
    for school_slug, concept_slug in SCHOOL_SUPPORTS:
        result = await read_query(
            """
            MATCH (s:School {slug: $school})-[r:SUPPORTS]->(c:Concept {slug: $concept})
            RETURN type(r) AS t
            """,
            {"school": school_slug, "concept": concept_slug},
        )
        if not result:
            await write_query(
                """
                MATCH (s:School {slug: $school}), (c:Concept {slug: $concept})
                CREATE (s)-[:SUPPORTS]->(c)
                """,
                {"school": school_slug, "concept": concept_slug},
            )
            rel_count += 1

    # Person → School (TEACHES)
    for person_name, school_slug in PERSON_TEACHES:
        result = await read_query(
            """
            MATCH (p:Person {name: $person})-[r:TEACHES]->(s:School {slug: $school})
            RETURN type(r) AS t
            """,
            {"person": person_name, "school": school_slug},
        )
        if not result:
            await write_query(
                """
                MATCH (p:Person {name: $person}), (s:School {slug: $school})
                CREATE (p)-[:TEACHES]->(s)
                """,
                {"person": person_name, "school": school_slug},
            )
            rel_count += 1

    logger.info("Relationships: %d created", rel_count)


async def print_summary():
    """Print graph statistics."""
    stats = await read_query(
        """
        MATCH (n)
        WITH labels(n)[0] AS label, COUNT(*) AS count
        RETURN label, count ORDER BY count DESC
        """
    )
    logger.info("Graph Summary:")
    for row in stats:
        logger.info("  %-20s %d nodes", row["label"], row["count"])

    rel_count = await read_query("MATCH ()-[r]->() RETURN count(r) AS total")
    if rel_count:
        logger.info("  Total relationships: %d", rel_count[0]["total"])


async def main():
    """Run the full knowledge graph seeding pipeline."""
    logger.info("=" * 60)
    logger.info("VEDA — Knowledge Graph Seed")
    logger.info("=" * 60)

    await init_neo4j()

    try:
        await seed_concepts()
        await seed_schools()
        await seed_persons()
        await seed_relationships()
        await print_summary()

        logger.info("=" * 60)
        logger.info("✅  Knowledge graph seeded successfully!")
        logger.info("=" * 60)
    finally:
        await close_neo4j()


if __name__ == "__main__":
    asyncio.run(main())
