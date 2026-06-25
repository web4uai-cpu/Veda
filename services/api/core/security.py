"""
VEDA — Security Hardening
============================
Security headers, input sanitization, and request guards.
"""

from __future__ import annotations

import logging
import re

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("veda.security")

DANGEROUS_PATTERNS = [
    re.compile(r"<script", re.IGNORECASE),
    re.compile(r"javascript:", re.IGNORECASE),
    re.compile(r"on\w+\s*=", re.IGNORECASE),
    re.compile(r"(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\b.*\b(FROM|INTO|TABLE|SET)\b)", re.IGNORECASE),
]

MAX_BODY_SIZE = 10 * 1024 * 1024  # 10 MB


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds standard security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        return response


class RequestGuardMiddleware(BaseHTTPMiddleware):
    """Guards against oversized payloads and basic injection patterns in query strings."""

    async def dispatch(self, request: Request, call_next):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={
                    "error": "PayloadTooLarge",
                    "code": "PAYLOAD_TOO_LARGE",
                    "message": f"Request body exceeds {MAX_BODY_SIZE // (1024 * 1024)}MB limit",
                },
            )

        query_string = str(request.url.query) if request.url.query else ""
        if query_string:
            for pattern in DANGEROUS_PATTERNS:
                if pattern.search(query_string):
                    logger.warning(
                        "Blocked suspicious query string: %s from %s",
                        query_string[:200],
                        request.client.host if request.client else "unknown",
                    )
                    return JSONResponse(
                        status_code=400,
                        content={
                            "error": "BadRequest",
                            "code": "SUSPICIOUS_INPUT",
                            "message": "Request contains potentially dangerous content",
                        },
                    )

        return await call_next(request)
