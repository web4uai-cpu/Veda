"""
VEDA — Bhagavad Gita Ingestion Service
=========================================
Fetches the complete Bhagavad Gita (18 chapters, 700 verses) from the
public bhagavadgitaapi.in API and seeds it into PostgreSQL.

This is the FIRST scripture ingested — per Constitutional Rule #1:
"Never build intelligence before knowledge."

Usage:
    cd services/api
    python -m services.ingest_gita

Data source: https://bhagavadgitaapi.in/
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import httpx

from core.ulid import generate_id
from db.postgres import init_postgres, close_postgres, execute, fetch, fetchrow, fetchval

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.ingest.gita")

API_BASE = "https://vedicscriptures.github.io"

# Chapter metadata (from tools/seed_gita.py — Sanskrit titles and summaries)
CHAPTER_META = {
    1: {"title": "Arjuna Vishada Yoga", "sanskrit": "अर्जुनविषादयोग", "summary": "Arjuna's grief and moral dilemma on the battlefield of Kurukshetra"},
    2: {"title": "Sankhya Yoga", "sanskrit": "सांख्ययोग", "summary": "The immortality of the soul, Karma Yoga, and the characteristics of a wise person"},
    3: {"title": "Karma Yoga", "sanskrit": "कर्मयोग", "summary": "The path of selfless action and duty without attachment to results"},
    4: {"title": "Jnana Karma Sanyasa Yoga", "sanskrit": "ज्ञानकर्मसंन्यासयोग", "summary": "The path of knowledge, divine incarnation, and renunciation of action in knowledge"},
    5: {"title": "Karma Sanyasa Yoga", "sanskrit": "कर्मसंन्यासयोग", "summary": "Renunciation versus selfless action — both lead to liberation"},
    6: {"title": "Dhyana Yoga", "sanskrit": "ध्यानयोग", "summary": "The practice of meditation, self-control, and the nature of the disciplined mind"},
    7: {"title": "Jnana Vijnana Yoga", "sanskrit": "ज्ञानविज्ञानयोग", "summary": "Knowledge of the Absolute and the relative — matter and spirit"},
    8: {"title": "Akshara Brahma Yoga", "sanskrit": "अक्षरब्रह्मयोग", "summary": "The imperishable Brahman, the cycle of birth and death, and liberation"},
    9: {"title": "Raja Vidya Raja Guhya Yoga", "sanskrit": "राजविद्याराजगुह्ययोग", "summary": "The most secret knowledge — the sovereign science of devotion"},
    10: {"title": "Vibhuti Yoga", "sanskrit": "विभूतियोग", "summary": "The divine glories and manifestations of the Supreme"},
    11: {"title": "Vishwarupa Darshana Yoga", "sanskrit": "विश्वरूपदर्शनयोग", "summary": "The cosmic vision — Arjuna beholds the universal form of the Divine"},
    12: {"title": "Bhakti Yoga", "sanskrit": "भक्तियोग", "summary": "The path of devotion and the qualities of a true devotee"},
    13: {"title": "Kshetra Kshetrajna Vibhaga Yoga", "sanskrit": "क्षेत्रक्षेत्रज्ञविभागयोग", "summary": "The field and the knower of the field — body, soul, and nature"},
    14: {"title": "Gunatraya Vibhaga Yoga", "sanskrit": "गुणत्रयविभागयोग", "summary": "The three qualities of nature — Sattva, Rajas, and Tamas"},
    15: {"title": "Purushottama Yoga", "sanskrit": "पुरुषोत्तमयोग", "summary": "The Supreme Person — beyond the perishable and imperishable"},
    16: {"title": "Daivasura Sampad Vibhaga Yoga", "sanskrit": "दैवासुरसम्पद्विभागयोग", "summary": "The divine and demoniac natures — virtues and vices"},
    17: {"title": "Shraddhatraya Vibhaga Yoga", "sanskrit": "श्रद्धात्रयविभागयोग", "summary": "The three types of faith, food, sacrifice, austerity, and charity"},
    18: {"title": "Moksha Sanyasa Yoga", "sanskrit": "मोक्षसंन्यासयोग", "summary": "Renunciation and liberation — the final teaching and Arjuna's resolution"},
}


async def create_scripture() -> str:
    """Create the Bhagavad Gita scripture record."""
    # Check if already exists
    existing = await fetchrow("SELECT id FROM scriptures WHERE slug = 'bhagavad-gita'")
    if existing:
        logger.info("Scripture 'bhagavad-gita' already exists: %s", existing["id"])
        return existing["id"]

    scripture_id = generate_id("scp")
    await execute(
        """
        INSERT INTO scriptures (id, slug, name, sanskrit_name, category, language, period, description, is_canonical, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
        scripture_id,
        "bhagavad-gita",
        "Bhagavad Gita",
        "भगवद्गीता",
        "gita",
        "sanskrit",
        "~3000 BCE (traditional) / ~200 BCE (scholarly)",
        "The Song of God — 700 verses of Krishna's teachings to Arjuna on the battlefield of Kurukshetra.",
        True,
        json.dumps({
            "total_chapters": 18,
            "total_verses": 700,
            "tradition": "Prasthanatrayi",
            "source_api": API_BASE,
        }),
    )
    logger.info("Created scripture: %s (bhagavad-gita)", scripture_id)
    return scripture_id


async def create_book(scripture_id: str) -> str:
    """Create the single book record (Gita is one book)."""
    existing = await fetchrow("SELECT id FROM books WHERE scripture_id = $1", scripture_id)
    if existing:
        return existing["id"]

    book_id = generate_id("bok")
    await execute(
        """
        INSERT INTO books (id, scripture_id, name, sanskrit_name, position, description)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        book_id,
        scripture_id,
        "Bhagavad Gita",
        "भगवद्गीता",
        1,
        "The complete Bhagavad Gita (Bhishma Parva, Chapters 25-42 of Mahabharata)",
    )
    logger.info("Created book: %s", book_id)
    return book_id


async def create_chapters(scripture_id: str, book_id: str) -> dict[int, str]:
    """Create all 18 chapter records. Returns {chapter_number: chapter_id}."""
    chapter_ids: dict[int, str] = {}

    for num in range(1, 19):
        existing = await fetchrow(
            "SELECT id FROM chapters WHERE book_id = $1 AND chapter_number = $2",
            book_id, num,
        )
        if existing:
            chapter_ids[num] = existing["id"]
            continue

        meta = CHAPTER_META[num]
        chapter_id = generate_id("chp")
        await execute(
            """
            INSERT INTO chapters (id, book_id, scripture_id, chapter_number, title, sanskrit_title, summary)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            """,
            chapter_id, book_id, scripture_id, num,
            meta["title"], meta["sanskrit"], meta["summary"],
        )
        chapter_ids[num] = chapter_id

    logger.info("Created/verified %d chapters", len(chapter_ids))
    return chapter_ids


async def fetch_and_ingest_verses(
    scripture_id: str,
    chapter_ids: dict[int, str],
    client: httpx.AsyncClient,
):
    """Fetch all verses from the API and insert into PostgreSQL."""
    total_inserted = 0

    for ch_num in range(1, 19):
        chapter_id = chapter_ids[ch_num]

        # Check existing verse count
        existing_count = await fetchval(
            "SELECT COUNT(*) FROM verses WHERE chapter_id = $1", chapter_id
        )
        if existing_count and existing_count > 0:
            logger.info("  Ch %2d: %d verses already exist, skipping", ch_num, existing_count)
            total_inserted += existing_count
            continue

        # Fetch individual verses
        chapter_verse_count = 0
        max_verses = 100  # Safety limit

        for v_num in range(1, max_verses + 1):
            try:
                v_response = await client.get(f"{API_BASE}/slok/{ch_num}/{v_num}")
                if v_response.status_code == 404 or v_response.status_code == 400:
                    break  # No more verses in this chapter
                if v_response.status_code != 200:
                    continue

                verse_data = v_response.json()
            except Exception as e:
                logger.warning("    Verse %d.%d: error: %s", ch_num, v_num, e)
                continue

            canonical_ref = f"BG.{ch_num}.{v_num}"

            # Check if verse already exists
            existing = await fetchrow(
                "SELECT id FROM verses WHERE canonical_reference = $1", canonical_ref
            )
            if existing:
                chapter_verse_count += 1
                continue

            verse_id = generate_id("vrs")

            # Insert verse
            await execute(
                """
                INSERT INTO verses (id, scripture_id, book_id, chapter_id, verse_number, canonical_reference, metadata)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                """,
                verse_id, scripture_id, None, chapter_id, v_num, canonical_ref,
                json.dumps({"source": "vedicscriptures.github.io"}),
            )

            # Insert content variants
            # Sanskrit (slok field)
            slok = verse_data.get("slok", "")
            if slok:
                await execute(
                    """
                    INSERT INTO verse_contents (id, verse_id, content_type, content, source, language_code, is_primary)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    generate_id("vct"), verse_id, "sanskrit", slok.strip(),
                    "Original", "sa", True,
                )

            # Transliteration
            transliteration = verse_data.get("transliteration", "")
            if transliteration:
                await execute(
                    """
                    INSERT INTO verse_contents (id, verse_id, content_type, content, source, language_code, is_primary)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    generate_id("vct"), verse_id, "transliteration", transliteration.strip(),
                    "IAST", "sa-Latn", False,
                )

            # Word meanings
            word_meaning = verse_data.get("tej", {}).get("ht", "")
            if not word_meaning:
                for author_key in ["chinmay", "purohit", "san", "adi", "gambir", "siva"]:
                    author_data = verse_data.get(author_key, {})
                    if isinstance(author_data, dict):
                        word_meaning = author_data.get("et", "")
                        if word_meaning:
                            break

            # English translations (try multiple sources)
            translations_added = 0
            for author_key, author_name in [
                ("siva", "Swami Sivananda"),
                ("gambir", "Swami Gambirananda"),
                ("chinmay", "Swami Chinmayananda"),
                ("purohit", "Shri Purohit Swami"),
                ("san", "Dr. S. Sankaranarayan"),
                ("adi", "Swami Adidevananda"),
            ]:
                author_data = verse_data.get(author_key, {})
                if isinstance(author_data, dict):
                    en_text = author_data.get("et", "")
                    if en_text and en_text.strip():
                        is_primary = translations_added == 0
                        await execute(
                            """
                            INSERT INTO verse_contents (id, verse_id, content_type, content, source, language_code, is_primary)
                            VALUES ($1, $2, $3, $4, $5, $6, $7)
                            ON CONFLICT (verse_id, content_type, source, language_code) DO NOTHING
                            """,
                            generate_id("vct"), verse_id, "translation", en_text.strip(),
                            author_name, "en", is_primary,
                        )
                        translations_added += 1

            chapter_verse_count += 1

            # Rate limiting — be respectful to the API
            if v_num % 10 == 0:
                await asyncio.sleep(0.5)

        total_inserted += chapter_verse_count
        logger.info("  Ch %2d: %d verses ingested", ch_num, chapter_verse_count)

        # Small delay between chapters
        await asyncio.sleep(1.0)

    return total_inserted


async def main():
    """Run the full Bhagavad Gita ingestion pipeline."""
    logger.info("=" * 60)
    logger.info("VEDA — Bhagavad Gita Ingestion Pipeline")
    logger.info("=" * 60)
    logger.info("Source: %s", API_BASE)

    # Initialize database
    await init_postgres()

    try:
        # Step 1: Create scripture record
        scripture_id = await create_scripture()

        # Step 2: Create book record
        book_id = await create_book(scripture_id)

        # Step 3: Create 18 chapter records
        chapter_ids = await create_chapters(scripture_id, book_id)

        # Step 4: Fetch and ingest all verses
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            total = await fetch_and_ingest_verses(scripture_id, chapter_ids, client)

        logger.info("=" * 60)
        logger.info("[OK] Ingestion complete!")
        logger.info("   Scripture: Bhagavad Gita (%s)", scripture_id)
        logger.info("   Chapters: 18")
        logger.info("   Verses ingested: %d", total)
        logger.info("=" * 60)

    finally:
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
