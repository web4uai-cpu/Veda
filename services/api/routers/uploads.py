"""
VEDA — Admin Upload Router
===============================
Endpoints for admin PDF upload, processing, and chunk retrieval.
All endpoints require X-Admin-Key header authentication.
"""

from __future__ import annotations

from fastapi import APIRouter, File, Form, Query, Request, UploadFile

from core.auth import require_admin
from core.errors import NotFoundError, ValidationError
from services import upload_service

router = APIRouter(prefix="/api/v1/admin/uploads", tags=["Admin Uploads"])

ADMIN_USER_ID = "usr_admin"


@router.post("", status_code=201)
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    title: str = Form(None),
    scripture_id: str = Form(None),
    language: str = Form("en"),
):
    """Upload a PDF for processing."""
    await require_admin(request)

    try:
        result = await upload_service.create_upload(
            user_id=ADMIN_USER_ID,
            file=file,
            title=title,
            scripture_id=scripture_id,
            language=language,
        )
    except ValueError as e:
        raise ValidationError(str(e))

    return result


@router.get("")
async def list_uploads(
    request: Request,
    status: str | None = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """List all uploads with optional status filter."""
    await require_admin(request)

    uploads, total = await upload_service.list_uploads(status, page, per_page)
    return {
        "uploads": uploads,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@router.get("/{upload_id}")
async def get_upload(upload_id: str, request: Request):
    """Get upload details."""
    await require_admin(request)

    try:
        return await upload_service.get_upload(upload_id)
    except ValueError:
        raise NotFoundError("Upload", upload_id)


@router.post("/{upload_id}/process")
async def trigger_processing(upload_id: str, request: Request):
    """Trigger PDF text extraction and chunking."""
    await require_admin(request)

    try:
        return await upload_service.process_upload(upload_id)
    except ValueError as e:
        if "not found" in str(e).lower():
            raise NotFoundError("Upload", upload_id)
        raise ValidationError(str(e))


@router.get("/{upload_id}/chunks")
async def get_upload_chunks(upload_id: str, request: Request):
    """Get extracted text chunks for an upload."""
    await require_admin(request)

    try:
        await upload_service.get_upload(upload_id)
    except ValueError:
        raise NotFoundError("Upload", upload_id)

    chunks = await upload_service.get_upload_chunks(upload_id)
    return {"upload_id": upload_id, "chunks": chunks, "total": len(chunks)}


@router.delete("/{upload_id}", status_code=204)
async def delete_upload(upload_id: str, request: Request):
    """Delete an upload and its chunks."""
    await require_admin(request)

    try:
        await upload_service.delete_upload(upload_id)
    except ValueError:
        raise NotFoundError("Upload", upload_id)
