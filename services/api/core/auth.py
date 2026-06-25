"""
VEDA — Authentication Utilities
==================================
Firebase JWT verification + admin API key authentication.
"""

from __future__ import annotations

import logging

import firebase_admin
from firebase_admin import auth as firebase_auth
from fastapi import Request

from config import settings
from core.errors import ForbiddenError

logger = logging.getLogger("veda.auth")


async def get_current_user(request: Request) -> dict:
    """Extract and verify Firebase ID token from Authorization header.

    Returns a dict with uid, email, and the full decoded token.
    Raises ForbiddenError if token is missing or invalid.
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise ForbiddenError("authentication", "Missing or invalid Authorization header")

    id_token = auth_header[7:]

    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except firebase_admin.exceptions.FirebaseError as e:
        logger.warning("Firebase token verification failed: %s", e)
        raise ForbiddenError("authentication", "Invalid or expired Firebase token")
    except Exception as e:
        logger.warning("Token verification error: %s", e)
        raise ForbiddenError("authentication", "Token verification failed")

    return {
        "uid": decoded["uid"],
        "email": decoded.get("email", ""),
        "token": decoded,
    }


async def require_admin(request: Request) -> None:
    """Require admin access via X-Admin-Key header.

    Raises ForbiddenError if the key is missing, empty, or incorrect.
    """
    if not settings.admin_api_key:
        raise ForbiddenError("admin access", "Admin API key not configured on server")

    provided = request.headers.get("X-Admin-Key", "")
    if not provided or provided != settings.admin_api_key:
        raise ForbiddenError("admin access", "Invalid or missing X-Admin-Key header")
