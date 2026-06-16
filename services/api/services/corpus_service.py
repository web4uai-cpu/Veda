"""
VEDA — Corpus Readiness Service
=================================
Reports whether canonical scripture data is complete enough for search,
citations, and future reasoning.
"""

from __future__ import annotations

from db import postgres
from models.schemas import CorpusStatusResponse, ScriptureCorpusStatus


async def get_corpus_status() -> CorpusStatusResponse:
    """Return corpus completeness metrics across canonical scriptures."""
    rows = await postgres.fetch(
        """
        SELECT s.id AS scripture_id,
               s.slug,
               s.name,
               COUNT(DISTINCT c.id) AS chapter_count,
               COUNT(DISTINCT v.id) AS verse_count,
               COUNT(vc.id) AS content_count,
               COUNT(DISTINCT CASE WHEN vc.content_type = 'sanskrit' THEN v.id END) AS sanskrit_count,
               COUNT(DISTINCT CASE WHEN vc.content_type = 'transliteration' THEN v.id END) AS transliteration_count,
               COUNT(DISTINCT CASE WHEN vc.content_type = 'translation' THEN v.id END) AS translation_count
        FROM scriptures s
        LEFT JOIN chapters c ON c.scripture_id = s.id
        LEFT JOIN verses v ON v.scripture_id = s.id
        LEFT JOIN verse_contents vc ON vc.verse_id = v.id
        WHERE s.is_canonical = true
        GROUP BY s.id, s.slug, s.name
        ORDER BY s.name
        """
    )

    scriptures: list[ScriptureCorpusStatus] = []
    blockers: list[str] = []

    total_chapters = 0
    total_verses = 0
    total_contents = 0

    for row in rows:
        verse_count = int(row["verse_count"] or 0)
        sanskrit_count = int(row["sanskrit_count"] or 0)
        translation_count = int(row["translation_count"] or 0)
        missing_sanskrit = max(verse_count - sanskrit_count, 0)
        missing_translation = max(verse_count - translation_count, 0)
        ready_for_search = verse_count > 0 and translation_count > 0
        ready_for_citation = verse_count > 0 and missing_translation == 0

        if not ready_for_search:
            blockers.append(f"{row['name']} has no searchable translations.")
        if missing_sanskrit:
            blockers.append(f"{row['name']} is missing Sanskrit for {missing_sanskrit} verses.")
        if missing_translation:
            blockers.append(f"{row['name']} is missing translations for {missing_translation} verses.")

        total_chapters += int(row["chapter_count"] or 0)
        total_verses += verse_count
        total_contents += int(row["content_count"] or 0)

        scriptures.append(
            ScriptureCorpusStatus(
                scripture_id=row["scripture_id"],
                slug=row["slug"],
                name=row["name"],
                chapter_count=int(row["chapter_count"] or 0),
                verse_count=verse_count,
                content_count=int(row["content_count"] or 0),
                sanskrit_count=sanskrit_count,
                transliteration_count=int(row["transliteration_count"] or 0),
                translation_count=translation_count,
                missing_sanskrit=missing_sanskrit,
                missing_translation=missing_translation,
                ready_for_search=ready_for_search,
                ready_for_citation=ready_for_citation,
            )
        )

    if not scriptures or total_verses == 0:
        status = "empty"
    elif blockers:
        status = "partial"
    else:
        status = "ready"

    return CorpusStatusResponse(
        status=status,
        scriptures=scriptures,
        totals={
            "scriptures": len(scriptures),
            "chapters": total_chapters,
            "verses": total_verses,
            "contents": total_contents,
        },
        blockers=blockers,
    )
