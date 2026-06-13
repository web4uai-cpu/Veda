"""
VEDA — Scripture Router
=========================
REST endpoints for browsing scriptures, chapters, and verses.
All canonical data is read-only.

Endpoints:
    GET  /api/v1/scriptures                       — List all scriptures
    GET  /api/v1/scriptures/:id                    — Get scripture by ID
    GET  /api/v1/scriptures/:id/chapters           — List chapters
    GET  /api/v1/scriptures/:id/chapters/:num      — Get chapter by number
    GET  /api/v1/scriptures/:id/chapters/:num/verses — List verses in chapter
    GET  /api/v1/scriptures/slug/:slug             — Get scripture by slug
    GET  /api/v1/verses/:reference                 — Get verse by canonical reference (BG.2.47)
"""

from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, Query, HTTPException

from db import postgres
from core.errors import NotFoundError
from core.ulid import validate_id
from models.schemas import (
    ScriptureResponse,
    ScriptureListResponse,
    ChapterResponse,
    ChapterListResponse,
    VerseResponse,
    VerseListResponse,
    VerseContentResponse,
    VerseBriefResponse,
)

logger = logging.getLogger("veda.routers.scriptures")

router = APIRouter(prefix="/api/v1/scriptures", tags=["Scriptures"])


# =============================================================================
# SCRIPTURES
# =============================================================================


@router.get("", response_model=ScriptureListResponse)
async def list_scriptures(
    category: str | None = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """List all scriptures, optionally filtered by category."""
    offset = (page - 1) * per_page

    if category:
        rows = await postgres.fetch(
            """
            SELECT s.*, 
                   COALESCE(ch_count.cnt, 0) AS chapter_count,
                   COALESCE(v_count.cnt, 0) AS verse_count
            FROM scriptures s
            LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM chapters GROUP BY scripture_id) ch_count
                ON ch_count.scripture_id = s.id
            LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM verses GROUP BY scripture_id) v_count
                ON v_count.scripture_id = s.id
            WHERE s.category = $1
            ORDER BY s.name
            LIMIT $2 OFFSET $3
            """,
            category, per_page, offset,
        )
        total = await postgres.fetchval(
            "SELECT COUNT(*) FROM scriptures WHERE category = $1", category
        )
    else:
        rows = await postgres.fetch(
            """
            SELECT s.*, 
                   COALESCE(ch_count.cnt, 0) AS chapter_count,
                   COALESCE(v_count.cnt, 0) AS verse_count
            FROM scriptures s
            LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM chapters GROUP BY scripture_id) ch_count
                ON ch_count.scripture_id = s.id
            LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM verses GROUP BY scripture_id) v_count
                ON v_count.scripture_id = s.id
            ORDER BY s.name
            LIMIT $1 OFFSET $2
            """,
            per_page, offset,
        )
        total = await postgres.fetchval("SELECT COUNT(*) FROM scriptures")

    scriptures = [ScriptureResponse(**dict(r)) for r in rows]
    return ScriptureListResponse(
        scriptures=scriptures, total=total or 0, page=page, per_page=per_page
    )


@router.get("/slug/{slug}", response_model=ScriptureResponse)
async def get_scripture_by_slug(slug: str):
    """Get a scripture by its URL slug."""
    row = await postgres.fetchrow(
        """
        SELECT s.*, 
               COALESCE(ch_count.cnt, 0) AS chapter_count,
               COALESCE(v_count.cnt, 0) AS verse_count
        FROM scriptures s
        LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM chapters GROUP BY scripture_id) ch_count
            ON ch_count.scripture_id = s.id
        LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM verses GROUP BY scripture_id) v_count
            ON v_count.scripture_id = s.id
        WHERE s.slug = $1
        """,
        slug,
    )
    if not row:
        raise NotFoundError("Scripture", slug)
    return ScriptureResponse(**dict(row))


@router.get("/{scripture_id}", response_model=ScriptureResponse)
async def get_scripture(scripture_id: str):
    """Get a scripture by its ID."""
    validate_id(scripture_id, "scp")
    row = await postgres.fetchrow(
        """
        SELECT s.*, 
               COALESCE(ch_count.cnt, 0) AS chapter_count,
               COALESCE(v_count.cnt, 0) AS verse_count
        FROM scriptures s
        LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM chapters GROUP BY scripture_id) ch_count
            ON ch_count.scripture_id = s.id
        LEFT JOIN (SELECT scripture_id, COUNT(*) AS cnt FROM verses GROUP BY scripture_id) v_count
            ON v_count.scripture_id = s.id
        WHERE s.id = $1
        """,
        scripture_id,
    )
    if not row:
        raise NotFoundError("Scripture", scripture_id)
    return ScriptureResponse(**dict(row))


# =============================================================================
# CHAPTERS
# =============================================================================


@router.get("/{scripture_id}/chapters", response_model=ChapterListResponse)
async def list_chapters(scripture_id: str):
    """List all chapters for a scripture."""
    validate_id(scripture_id, "scp")

    # Verify scripture exists
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

    chapters = [ChapterResponse(**dict(r)) for r in rows]
    return ChapterListResponse(
        chapters=chapters,
        total=len(chapters),
        scripture_id=scripture_id,
        scripture_name=scripture["name"],
    )


@router.get("/{scripture_id}/chapters/{chapter_number}", response_model=ChapterResponse)
async def get_chapter(scripture_id: str, chapter_number: int):
    """Get a specific chapter by scripture ID and chapter number."""
    validate_id(scripture_id, "scp")

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
    return ChapterResponse(**dict(row))


# =============================================================================
# VERSES
# =============================================================================


@router.get(
    "/{scripture_id}/chapters/{chapter_number}/verses",
    response_model=VerseListResponse,
)
async def list_verses(
    scripture_id: str,
    chapter_number: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
):
    """List all verses in a chapter with their content variants."""
    validate_id(scripture_id, "scp")
    offset = (page - 1) * per_page

    # Get chapter
    chapter = await postgres.fetchrow(
        "SELECT id FROM chapters WHERE scripture_id = $1 AND chapter_number = $2",
        scripture_id, chapter_number,
    )
    if not chapter:
        raise NotFoundError("Chapter", f"{scripture_id}/ch.{chapter_number}")

    chapter_id = chapter["id"]

    # Get verses
    verse_rows = await postgres.fetch(
        """
        SELECT * FROM verses
        WHERE chapter_id = $1
        ORDER BY verse_number
        LIMIT $2 OFFSET $3
        """,
        chapter_id, per_page, offset,
    )

    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM verses WHERE chapter_id = $1", chapter_id
    )

    # Fetch all contents for these verses in one query
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

    # Group contents by verse_id
    contents_by_verse: dict[str, list[VerseContentResponse]] = {}
    for cr in content_rows:
        vid = cr["verse_id"]
        if vid not in contents_by_verse:
            contents_by_verse[vid] = []
        contents_by_verse[vid].append(VerseContentResponse(**dict(cr)))

    # Build response
    verses = []
    for vr in verse_rows:
        verse = VerseResponse(
            **dict(vr),
            contents=contents_by_verse.get(vr["id"], []),
        )
        verses.append(verse)

    return VerseListResponse(
        verses=verses,
        total=total or 0,
        chapter_id=chapter_id,
        scripture_id=scripture_id,
        page=page,
        per_page=per_page,
    )


# =============================================================================
# VERSE BY REFERENCE
# =============================================================================

verse_router = APIRouter(prefix="/api/v1/verses", tags=["Verses"])


@verse_router.get("/{reference}", response_model=VerseResponse)
async def get_verse_by_reference(reference: str):
    """
    Get a verse by its canonical reference (e.g., BG.2.47).
    Includes all content variants (Sanskrit, transliteration, translations).
    """
    # Normalize reference
    ref = reference.upper().strip()

    row = await postgres.fetchrow(
        "SELECT * FROM verses WHERE canonical_reference = $1", ref
    )
    if not row:
        raise NotFoundError("Verse", reference)

    # Fetch contents
    content_rows = await postgres.fetch(
        """
        SELECT * FROM verse_contents
        WHERE verse_id = $1
        ORDER BY content_type
        """,
        row["id"],
    )

    contents = [VerseContentResponse(**dict(cr)) for cr in content_rows]

    return VerseResponse(**dict(row), contents=contents)
