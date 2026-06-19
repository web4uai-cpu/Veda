"""
VEDA — Supabase Storage Client
==================================
Async client for Supabase Storage REST API using httpx.
Handles file upload, download, and deletion for the user-uploads bucket.
"""

from __future__ import annotations

import logging

import httpx

from config import settings

logger = logging.getLogger("veda.db.storage")

BUCKET = "user-uploads"


def _storage_url(path: str) -> str:
    """Build the full Supabase storage URL for a given object path."""
    base = settings.supabase_url.rstrip("/")
    return f"{base}/storage/v1/object/{BUCKET}/{path}"


def _auth_headers() -> dict[str, str]:
    """Return authorization headers for Supabase service-role access."""
    return {
        "Authorization": f"Bearer {settings.supabase_service_key}",
        "apikey": settings.supabase_service_key,
    }


async def upload_file(path: str, data: bytes, content_type: str) -> str:
    """Upload a file to Supabase Storage.

    Args:
        path: Object path within the bucket (e.g., "admin/doc123.pdf")
        data: File bytes
        content_type: MIME type (e.g., "application/pdf")

    Returns:
        The storage key (path) for later retrieval.
    """
    url = _storage_url(path)
    headers = {**_auth_headers(), "Content-Type": content_type}

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(url, content=data, headers=headers)
        if resp.status_code not in (200, 201):
            logger.error("Storage upload failed: %d %s", resp.status_code, resp.text[:200])
            raise RuntimeError(f"Storage upload failed: {resp.status_code}")

    logger.info("Uploaded %d bytes to %s/%s", len(data), BUCKET, path)
    return path


async def download_file(path: str) -> bytes:
    """Download a file from Supabase Storage.

    Args:
        path: Object path within the bucket.

    Returns:
        File bytes.
    """
    url = _storage_url(path)
    headers = _auth_headers()

    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            logger.error("Storage download failed: %d %s", resp.status_code, resp.text[:200])
            raise RuntimeError(f"Storage download failed: {resp.status_code}")

    return resp.content


async def delete_file(path: str) -> None:
    """Delete a file from Supabase Storage."""
    base = settings.supabase_url.rstrip("/")
    url = f"{base}/storage/v1/object/{BUCKET}"
    headers = _auth_headers()

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.request("DELETE", url, headers=headers, json={"prefixes": [path]})
        if resp.status_code not in (200, 204):
            logger.warning("Storage delete may have failed: %d", resp.status_code)

    logger.info("Deleted %s/%s", BUCKET, path)
