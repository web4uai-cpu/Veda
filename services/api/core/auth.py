"""
VEDA — Authentication Utilities
==================================
Admin authentication via API key header.
Full Supabase JWT validation will replace this in a later phase.
"""

from __future__ import annotations

import logging

from fastapi import Request

from config import settings
from core.errors import ForbiddenError

logger = logging.getLogger("veda.auth")


async def require_admin(request: Request) -> None:
    """Require admin access via X-Admin-Key header.

    Raises ForbiddenError if the key is missing, empty, or incorrect.
    """
    if not settings.admin_api_key:
        raise ForbiddenError("admin access", "Admin API key not configured on server")

    provided = request.headers.get("X-Admin-Key", "")
    if not provided or provided != settings.admin_api_key:
        raise ForbiddenError("admin access", "Invalid or missing X-Admin-Key header")
