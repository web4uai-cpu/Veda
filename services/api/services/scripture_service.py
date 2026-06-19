"""
VEDA — Scripture Service
==========================
Business logic for scripture, chapter, and verse queries.
All SQL lives here; routers are thin HTTP adapters.
"""

from __future__ import annotations

from db import postgres
from core.errors import NotFoundError
from services.cache_service import (
    get_cached, set_cached, scripture_list_key, TTL_SCRIPTURE_LIST,
)


_SCRIPTURE_SELECT = """
    SELECT s.*,
           COALESCE(ch_count.cnt, 0) AS chapter_count,
           COALESCE(v_count.cnt, 0) AS verse_count
    FROM scriptures s
    LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM chapters GROUP BY scripture_id) ch_count
        ON ch_count.scripture_id = s.id
    LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM verses GROUP BY scripture_id) v_count
        ON v_count.scripture_id = s.id
"""


async def list_scriptures(
    category: str | None, page: int, per_page: int
) -> tuple[list[dict], int]:
    key = scripture_list_key(category, page, per_page)
    cached = await get_cached(key)
    if cached is not None:
        return cached["rows"], cached["total"]

    offset = (page - 1) * per_page

    if category:
        rows = await postgres.fetch(
            f"{_SCRIPTURE_SELECT} WHERE s.category = $1 ORDER BY s.name LIMIT $2 OFFSET $3",
            category, per_page, offset,
        )
        total = await postgres.fetchval(
            "SELECT COUNT(*) FROM scriptures WHERE category = $1", category
        )
    else:
        rows = await postgres.fetch(
            f"{_SCRIPTURE_SELECT} ORDER BY s.name LIMIT $1 OFFSET $2",
            per_page, offset,
        )
        total = await postgres.fetchval("SELECT COUNT(*) FROM scriptures")

    result_rows = [dict(r) for r in rows]
    total_count = total or 0
    await set_cached(key, {"rows": result_rows, "total": total_count}, ttl=TTL_SCRIPTURE_LIST)
    return result_rows, total_count


async def get_scripture_by_slug(slug: str) -> dict:
    row = await postgres.fetchrow(
        f"{_SCRIPTURE_SELECT} WHERE s.slug = $1", slug
    )
    if not row:
        raise NotFoundError("Scripture", slug)
    return dict(row)


async def get_scripture_by_id(scripture_id: str) -> dict:
    row = await postgres.fetchrow(
        f"{_SCRIPTURE_SELECT} WHERE s.id = $1", scripture_id
    )
    if not row:
        raise NotFoundError("Scripture", scripture_id)
    return dict(row)


async def list_chapters(scripture_id: str) -> tuple[list[dict], str]:
    scripture = await postgres.fetchrow(
        "SELECT id, name FROM scriptures WHERE id = $1", scripture_id
    )
    if not scripture:
        raise NotFoundError("Scripture", scripture_id)

    rows = await postgres.fetch(
        """
        SELECT c.*,
               COALESCE(v_count.cnt, 0) AS verse_count
        FROM chapters c
        LEFT JOIN (SELECT chapter_id, COUNT(*) AS cnt FROM verses GROUP BY chapter_id) v_count
            ON v_count.chapter_id = c.id
        WHERE c.scripture_id = $1
        ORDER BY c.chapter_number
        """,
        scripture_id,
    )
    return [dict(r) for r in rows], scripture["name"]


async def get_chapter(scripture_id: str, chapter_number: int) -> dict:
    row = await postgres.fetchrow(
        """
        SELECT c.*,
               COALESCE(v_count.cnt, 0) AS verse_count
        FROM chapters c
        LEFT JOIN (SELECT chapter_id, COUNT(*) AS cnt FROM verses GROUP BY chapter_id) v_count
            ON v_count.chapter_id = c.id
        WHERE c.scripture_id = $1 AND c.chapter_number = $2
        """,
        scripture_id, chapter_number,
    )
    if not row:
        raise NotFoundError("Chapter", f"{scripture_id}/ch.{chapter_number}")
    return dict(row)


async def list_verses(
    scripture_id: str, chapter_number: int, page: int, per_page: int
) -> tuple[list[dict], list[dict], str, int]:
    """Returns (verse_rows, content_rows, chapter_id, total)."""
    chapter = await postgres.fetchrow(
        "SELECT id FROM chapters WHERE scripture_id = $1 AND chapter_number = $2",
        scripture_id, chapter_number,
    )
    if not chapter:
        raise NotFoundError("Chapter", f"{scripture_id}/ch.{chapter_number}")

    chapter_id = chapter["id"]
    offset = (page - 1) * per_page

    verse_rows = await postgres.fetch(
        "SELECT * FROM verses WHERE chapter_id = $1 ORDER BY verse_number LIMIT $2 OFFSET $3",
        chapter_id, per_page, offset,
    )
    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM verses WHERE chapter_id = $1", chapter_id
    )

    verse_ids = [r["id"] for r in verse_rows]
    if verse_ids:
        content_rows = await postgres.fetch(
            """
            SELECT * FROM verse_contents
            WHERE verse_id = ANY($1::text[])
            ORDER BY verse_id, content_type
            """,
            verse_ids,
        )
    else:
        content_rows = []

    return (
        [dict(r) for r in verse_rows],
        [dict(r) for r in content_rows],
        chapter_id,
        total or 0,
    )


async def get_verse_by_reference(reference: str) -> tuple[dict, list[dict]]:
    ref = reference.upper().strip()
    row = await postgres.fetchrow(
        "SELECT * FROM verses WHERE canonical_reference = $1", ref
    )
    if not row:
        raise NotFoundError("Verse", reference)

    content_rows = await postgres.fetch(
        "SELECT * FROM verse_contents WHERE verse_id = $1 ORDER BY content_type",
        row["id"],
    )
    return dict(row), [dict(cr) for cr in content_rows]
