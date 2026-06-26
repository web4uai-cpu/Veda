"""
VEDA — Library Router
=======================
User library endpoints: bookmarks, notes, collections, uploads, reports.
All endpoints require Firebase JWT authentication via get_current_user.
"""

from __future__ import annotations

from fastapi import APIRouter, Query, Depends

from core.auth import get_current_user
from models.schemas import (
    BookmarkCreate, BookmarkResponse, BookmarkListResponse,
    NoteCreate, NoteUpdate, NoteResponse, NoteListResponse,
    CollectionCreate, CollectionUpdate, CollectionResponse, CollectionListResponse,
    CollectionItemAdd, CollectionItemResponse,
    UploadListResponse,
    ReportResponse, ReportListResponse,
)
from services import library_service

router = APIRouter(prefix="/api/v1/library", tags=["Library"])


# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

@router.get("/bookmarks", response_model=BookmarkListResponse)
async def list_bookmarks(user: dict = Depends(get_current_user)):
    rows, total = await library_service.list_bookmarks(user["uid"])
    return BookmarkListResponse(
        bookmarks=[BookmarkResponse(**r) for r in rows],
        total=total,
    )


@router.post("/bookmarks", response_model=BookmarkResponse, status_code=201)
async def create_bookmark(
    body: BookmarkCreate,
    user: dict = Depends(get_current_user),
):
    row = await library_service.create_bookmark(
        user["uid"], body.target_type, body.target_id,
    )
    return BookmarkResponse(**row)


@router.delete("/bookmarks/{bookmark_id}")
async def delete_bookmark(
    bookmark_id: str,
    user: dict = Depends(get_current_user),
):
    await library_service.delete_bookmark(user["uid"], bookmark_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

@router.get("/notes", response_model=NoteListResponse)
async def list_notes(
    search: str | None = Query(None, description="Search in title/content"),
    user: dict = Depends(get_current_user),
):
    rows, total = await library_service.list_notes(user["uid"], search)
    return NoteListResponse(
        notes=[NoteResponse(**r) for r in rows],
        total=total,
    )


@router.post("/notes", response_model=NoteResponse, status_code=201)
async def create_note(
    body: NoteCreate,
    user: dict = Depends(get_current_user),
):
    row = await library_service.create_note(
        user["uid"], body.title, body.content,
        body.target_type, body.target_id, body.tags,
    )
    return NoteResponse(**row)


@router.put("/notes/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    body: NoteUpdate,
    user: dict = Depends(get_current_user),
):
    row = await library_service.update_note(
        user["uid"], note_id,
        title=body.title, content=body.content, tags=body.tags,
    )
    return NoteResponse(**row)


@router.delete("/notes/{note_id}")
async def delete_note(
    note_id: str,
    user: dict = Depends(get_current_user),
):
    await library_service.delete_note(user["uid"], note_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Collections
# ---------------------------------------------------------------------------

@router.get("/collections", response_model=CollectionListResponse)
async def list_collections(user: dict = Depends(get_current_user)):
    rows, total = await library_service.list_collections(user["uid"])
    return CollectionListResponse(
        collections=[CollectionResponse(**r) for r in rows],
        total=total,
    )


@router.post("/collections", response_model=CollectionResponse, status_code=201)
async def create_collection(
    body: CollectionCreate,
    user: dict = Depends(get_current_user),
):
    row = await library_service.create_collection(
        user["uid"], body.name, body.description, body.is_public,
    )
    return CollectionResponse(**row)


@router.put("/collections/{collection_id}", response_model=CollectionResponse)
async def update_collection(
    collection_id: str,
    body: CollectionUpdate,
    user: dict = Depends(get_current_user),
):
    row = await library_service.update_collection(
        user["uid"], collection_id,
        name=body.name, description=body.description, is_public=body.is_public,
    )
    return CollectionResponse(**row)


@router.delete("/collections/{collection_id}")
async def delete_collection(
    collection_id: str,
    user: dict = Depends(get_current_user),
):
    await library_service.delete_collection(user["uid"], collection_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Collection Items
# ---------------------------------------------------------------------------

@router.post(
    "/collections/{collection_id}/items",
    response_model=CollectionItemResponse,
    status_code=201,
)
async def add_collection_item(
    collection_id: str,
    body: CollectionItemAdd,
    user: dict = Depends(get_current_user),
):
    row = await library_service.add_collection_item(
        user["uid"], collection_id, body.item_type, body.item_id,
    )
    return CollectionItemResponse(**row)


@router.delete("/collections/{collection_id}/items/{item_id}")
async def remove_collection_item(
    collection_id: str,
    item_id: str,
    user: dict = Depends(get_current_user),
):
    await library_service.remove_collection_item(user["uid"], collection_id, item_id)
    return {"ok": True}


# ---------------------------------------------------------------------------
# Uploads (user-facing, read-only)
# ---------------------------------------------------------------------------

@router.get("/uploads", response_model=UploadListResponse)
async def list_uploads(user: dict = Depends(get_current_user)):
    rows, total = await library_service.list_user_uploads(user["uid"])
    return UploadListResponse(uploads=rows, total=total)


# ---------------------------------------------------------------------------
# Reports (user-facing, read-only)
# ---------------------------------------------------------------------------

@router.get("/reports", response_model=ReportListResponse)
async def list_reports(user: dict = Depends(get_current_user)):
    rows, total = await library_service.list_user_reports(user["uid"])
    return ReportListResponse(
        reports=[ReportResponse(**r) for r in rows],
        total=total,
    )
