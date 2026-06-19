"""
VEDA — Scripture Router
=========================
Thin HTTP adapters for scripture, chapter, and verse endpoints.
Business logic lives in services/scripture_service.py.
"""

from __future__ import annotations

from fastapi import APIRouter, Query

from core.ulid import validate_id
from models.schemas import (
    ScriptureResponse,
    ScriptureListResponse,
    ChapterResponse,
    ChapterListResponse,
    VerseResponse,
    VerseListResponse,
    VerseContentResponse,
)
from services import scripture_service

router = APIRouter(prefix="/api/v1/scriptures", tags=["Scriptures"])


@router.get("", response_model=ScriptureListResponse)
async def list_scriptures(
    category: str | None = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """List all scriptures, optionally filtered by category."""
    rows, total = await scripture_service.list_scriptures(category, page, per_page)
    return ScriptureListResponse(
        scriptures=[ScriptureResponse(**r) for r in rows],
        total=total, page=page, per_page=per_page,
    )


@router.get("/slug/{slug}", response_model=ScriptureResponse)
async def get_scripture_by_slug(slug: str):
    """Get a scripture by its URL slug."""
    row = await scripture_service.get_scripture_by_slug(slug)
    return ScriptureResponse(**row)


@router.get("/{scripture_id}", response_model=ScriptureResponse)
async def get_scripture(scripture_id: str):
    """Get a scripture by its ID."""
    validate_id(scripture_id, "scp")
    row = await scripture_service.get_scripture_by_id(scripture_id)
    return ScriptureResponse(**row)


@router.get("/{scripture_id}/chapters", response_model=ChapterListResponse)
async def list_chapters(scripture_id: str):
    """List all chapters for a scripture."""
    validate_id(scripture_id, "scp")
    rows, scripture_name = await scripture_service.list_chapters(scripture_id)
    return ChapterListResponse(
        chapters=[ChapterResponse(**r) for r in rows],
        total=len(rows),
        scripture_id=scripture_id,
        scripture_name=scripture_name,
    )


@router.get("/{scripture_id}/chapters/{chapter_number}", response_model=ChapterResponse)
async def get_chapter(scripture_id: str, chapter_number: int):
    """Get a specific chapter by scripture ID and chapter number."""
    validate_id(scripture_id, "scp")
    row = await scripture_service.get_chapter(scripture_id, chapter_number)
    return ChapterResponse(**row)


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
    verse_rows, content_rows, chapter_id, total = await scripture_service.list_verses(
        scripture_id, chapter_number, page, per_page
    )

    contents_by_verse: dict[str, list[VerseContentResponse]] = {}
    for cr in content_rows:
        vid = cr["verse_id"]
        if vid not in contents_by_verse:
            contents_by_verse[vid] = []
        contents_by_verse[vid].append(VerseContentResponse(**cr))

    verses = [
        VerseResponse(**vr, contents=contents_by_verse.get(vr["id"], []))
        for vr in verse_rows
    ]
    return VerseListResponse(
        verses=verses, total=total, chapter_id=chapter_id,
        scripture_id=scripture_id, page=page, per_page=per_page,
    )


# Separate router for verse-by-reference (mounted at /api/v1/verses)
verse_router = APIRouter(prefix="/api/v1/verses", tags=["Verses"])


@verse_router.get("/{reference}", response_model=VerseResponse)
async def get_verse_by_reference(reference: str):
    """Get a verse by its canonical reference (e.g., BG.2.47)."""
    row, content_rows = await scripture_service.get_verse_by_reference(reference)
    contents = [VerseContentResponse(**cr) for cr in content_rows]
    return VerseResponse(**row, contents=contents)
