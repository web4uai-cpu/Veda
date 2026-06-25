"""
VEDA — Firebase Cloud Storage Client
========================================
Async-compatible client for Firebase Cloud Storage.
Handles file upload, download, and deletion for the user-uploads bucket.
"""

from __future__ import annotations

import json
import logging
import os

import firebase_admin
from firebase_admin import credentials, storage as fb_storage

from config import settings

logger = logging.getLogger("veda.db.storage")

_app: firebase_admin.App | None = None


def _ensure_firebase() -> None:
    """Initialize Firebase Admin SDK if not already initialized."""
    global _app
    if _app is not None:
        return

    cred_json = settings.firebase_service_account_json
    cred_path = settings.firebase_service_account_path

    if cred_json:
        cred = credentials.Certificate(json.loads(cred_json))
    elif cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        logger.warning("No Firebase credentials configured — storage operations will fail")
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred, {
        "storageBucket": settings.firebase_storage_bucket,
    })


def _get_bucket():
    _ensure_firebase()
    return fb_storage.bucket()


async def upload_file(path: str, data: bytes, content_type: str) -> str:
    """Upload a file to Firebase Cloud Storage.

    Args:
        path: Object path within the bucket (e.g., "admin/doc123.pdf")
        data: File bytes
        content_type: MIME type (e.g., "application/pdf")

    Returns:
        The storage key (path) for later retrieval.
    """
    bucket = _get_bucket()
    blob = bucket.blob(path)
    blob.upload_from_string(data, content_type=content_type)

    logger.info("Uploaded %d bytes to %s", len(data), path)
    return path


async def download_file(path: str) -> bytes:
    """Download a file from Firebase Cloud Storage.

    Args:
        path: Object path within the bucket.

    Returns:
        File bytes.
    """
    bucket = _get_bucket()
    blob = bucket.blob(path)

    if not blob.exists():
        raise RuntimeError(f"Storage download failed: blob '{path}' not found")

    data = blob.download_as_bytes()
    return data


async def delete_file(path: str) -> None:
    """Delete a file from Firebase Cloud Storage."""
    bucket = _get_bucket()
    blob = bucket.blob(path)

    try:
        blob.delete()
    except Exception:
        logger.warning("Storage delete may have failed for %s", path)

    logger.info("Deleted %s", path)
