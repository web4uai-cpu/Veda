"""
VEDA — Rate Limiting
=======================
Redis-backed sliding window rate limiter.
Configurable per-endpoint category with graceful fallback when Redis is unavailable.
"""

from __future__ import annotations

import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

logger = logging.getLogger("veda.rate_limit")

RATE_LIMITS: dict[str, tuple[int, int]] = {
    "search": (30, 60),
    "ask": (10, 60),
    "agents": (10, 60),
    "research": (10, 60),
    "scriptures": (100, 60),
    "default": (60, 60),
}

PATH_CATEGORY: list[tuple[str, str]] = [
    ("/api/v1/search", "search"),
    ("/api/v1/ask", "ask"),
    ("/api/v1/agents/", "agents"),
    ("/api/v1/research", "research"),
    ("/api/v1/scriptures", "scriptures"),
    ("/api/v1/graph", "scriptures"),
    ("/api/v1/citations", "scriptures"),
]


def _classify_path(path: str) -> str:
    for prefix, category in PATH_CATEGORY:
        if path.startswith(prefix):
            return category
    return "default"


def _get_client_id(request: Request) -> str:
    from config import settings

    # Only trust X-Forwarded-For when explicitly enabled (behind a proxy that
    # strips/sets it, e.g. Railway/Vercel). Otherwise it is client-spoofable
    # and would allow trivial rate-limit bypass.
    if settings.trust_proxy_headers:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # Rightmost hop is the one appended by the trusted proxy.
            return forwarded.split(",")[-1].strip()
    if request.client:
        return request.client.host
    return "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Sliding window rate limiter backed by Redis sorted sets."""

    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS" or request.url.path in ("/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        if request.url.path == "/api/v1/health":
            return await call_next(request)

        category = _classify_path(request.url.path)
        max_requests, window_seconds = RATE_LIMITS[category]
        client_id = _get_client_id(request)
        key = f"veda:ratelimit:{category}:{client_id}"

        allowed = True
        remaining = max_requests
        try:
            from db.redis_client import get_client
            redis = get_client()
            now = time.time()
            window_start = now - window_seconds

            pipe = redis.pipeline()
            pipe.zremrangebyscore(key, 0, window_start)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, window_seconds + 1)
            results = await pipe.execute()

            count = results[2]
            remaining = max(0, max_requests - count)
            if count > max_requests:
                allowed = False
        except Exception as e:
            # Fail open so Redis outages don't take down the API, but never
            # silently — this disables rate limiting for the request.
            logger.warning("Rate limiter unavailable (failing open): %s", e)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "RateLimitExceeded",
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": f"Rate limit exceeded: {max_requests} requests per {window_seconds}s",
                    "correlation_id": getattr(request.state, "correlation_id", None),
                },
                headers={
                    "Retry-After": str(window_seconds),
                    "X-RateLimit-Limit": str(max_requests),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
