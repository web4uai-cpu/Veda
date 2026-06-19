"""
VEDA — Upload Service
========================
Business logic for admin PDF uploads: storage, extraction, chunking.
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import UploadFile

from core.ulid import generate_id
from db.postgres import execute, fetch, fetchrow, fetchval
from db.supabase_storage import upload_file, download_file, delete_file
from services.pdf_service import extract_text_from_pdf, chunk_text

logger = logging.getLogger("veda.services.upload")

ALLOWED_TYPES = {"application/pdf"}
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100 MB


async def create_upload(
    user_id: str,
    file: UploadFile,
    title: str | None,
    scripture_id: str | None,
    language: str,
) -> dict[str, Any]:
    """Store uploaded file and create a DB record.

    Returns the created upload record as a dict.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise ValueError(f"Unsupported file type: {file.content_type}. Only PDF is supported.")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise ValueError(f"File too large: {len(data)} bytes (max {MAX_FILE_SIZE})")

    upload_id = generate_id("upl")
    storage_path = f"admin/{upload_id}/{file.filename}"

    await upload_file(storage_path, data, file.content_type or "application/pdf")

    await execute(
        """
        INSERT INTO user_uploads (id, user_id, filename, file_type, storage_key,
                                  status, title, scripture_id, language, size_bytes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
        upload_id,
        user_id,
        file.filename,
        "pdf",
        storage_path,
        "pending",
        title or file.filename,
        scripture_id,
        language,
        len(data),
    )

    logger.info("Created upload %s (%s, %d bytes)", upload_id, file.filename, len(data))
    return await get_upload(upload_id)


async def list_uploads(
    status: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> tuple[list[dict], int]:
    """List uploads with optional status filter and pagination."""
    offset = (page - 1) * per_page

    if status:
        rows = await fetch(
            """
            SELECT u.*, (SELECT COUNT(*) FROM upload_chunks c WHERE c.upload_id = u.id) AS chunk_count
            FROM user_uploads u WHERE u.status = $1
            ORDER BY u.uploaded_at DESC LIMIT $2 OFFSET $3
            """,
            status, per_page, offset,
        )
        total = await fetchval(
            "SELECT COUNT(*) FROM user_uploads WHERE status = $1", status
        )
    else:
        rows = await fetch(
            """
            SELECT u.*, (SELECT COUNT(*) FROM upload_chunks c WHERE c.upload_id = u.id) AS chunk_count
            FROM user_uploads u
            ORDER BY u.uploaded_at DESC LIMIT $1 OFFSET $2
            """,
            per_page, offset,
        )
        total = await fetchval("SELECT COUNT(*) FROM user_uploads")

    return [dict(r) for r in rows], total or 0


async def get_upload(upload_id: str) -> dict[str, Any]:
    """Get a single upload with chunk count."""
    row = await fetchrow(
        """
        SELECT u.*, (SELECT COUNT(*) FROM upload_chunks c WHERE c.upload_id = u.id) AS chunk_count
        FROM user_uploads u WHERE u.id = $1
        """,
        upload_id,
    )
    if not row:
        raise ValueError(f"Upload '{upload_id}' not found")
    return dict(row)


async def process_upload(upload_id: str) -> dict[str, Any]:
    """Download PDF, extract text, chunk, and persist chunks.

    Updates upload status to 'completed' or 'failed'.
    """
    upload = await get_upload(upload_id)

    if upload["status"] == "completed":
        logger.info("Upload %s already processed, skipping", upload_id)
        return upload

    await execute(
        "UPDATE user_uploads SET status = 'processing' WHERE id = $1",
        upload_id,
    )

    try:
        pdf_bytes = await download_file(upload["storage_key"])
        pages = extract_text_from_pdf(pdf_bytes)
        chunks = chunk_text(pages)

        if not chunks:
            raise ValueError("No text could be extracted from the PDF")

        for chunk in chunks:
            chunk_id = generate_id("chk")
            await execute(
                """
                INSERT INTO upload_chunks (id, upload_id, chunk_index, content, page_start, page_end)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (upload_id, chunk_index) DO UPDATE SET content = $4
                """,
                chunk_id,
                upload_id,
                chunk["chunk_index"],
                chunk["content"],
                chunk["page_start"],
                chunk["page_end"],
            )

        await execute(
            "UPDATE user_uploads SET status = 'completed' WHERE id = $1",
            upload_id,
        )
        logger.info("Processed upload %s: %d chunks", upload_id, len(chunks))

    except Exception as e:
        await execute(
            "UPDATE user_uploads SET status = 'failed', error_message = $2 WHERE id = $1",
            upload_id,
            str(e)[:500],
        )
        logger.error("Upload %s processing failed: %s", upload_id, e)
        raise

    return await get_upload(upload_id)


async def get_upload_chunks(upload_id: str) -> list[dict]:
    """Get all chunks for an upload, ordered by chunk_index."""
    rows = await fetch(
        """
        SELECT id, upload_id, chunk_index, content, page_start, page_end, metadata, created_at
        FROM upload_chunks WHERE upload_id = $1 ORDER BY chunk_index
        """,
        upload_id,
    )
    return [dict(r) for r in rows]


async def delete_upload(upload_id: str) -> None:
    """Delete an upload, its chunks, and the stored file."""
    upload = await get_upload(upload_id)

    try:
        await delete_file(upload["storage_key"])
    except Exception as e:
        logger.warning("Failed to delete storage file: %s", e)

    await execute("DELETE FROM upload_chunks WHERE upload_id = $1", upload_id)
    await execute("DELETE FROM user_uploads WHERE id = $1", upload_id)
    logger.info("Deleted upload %s", upload_id)
