"""
VEDA — Admin Indexing Router
================================
Endpoints for triggering and monitoring corpus indexing.
All endpoints require admin authentication.
"""

from __future__ import annotations

from fastapi import APIRouter, Request

from core.auth import require_admin
from services.indexing_service import index_all, index_upload_chunks

router = APIRouter(prefix="/api/v1/admin/indexing", tags=["Admin Indexing"])


@router.post("/corpus")
async def trigger_corpus_indexing(request: Request):
    """Trigger full corpus re-indexing (scriptures + uploads)."""
    await require_admin(request)
    result = await index_all()
    return {"status": "completed", **result}


@router.post("/uploads/{upload_id}")
async def trigger_upload_indexing(upload_id: str, request: Request):
    """Trigger indexing for a specific upload."""
    await require_admin(request)
    result = await index_upload_chunks(upload_id)
    return {"status": "completed", **result}
