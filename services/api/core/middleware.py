"""
VEDA — Middleware Stack
========================
Request/response middleware for correlation IDs, logging, timing, and error handling.
"""

from __future__ import annotations

import time
import logging
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from core.errors import VedaError

logger = logging.getLogger("veda.api")


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """
    Injects a unique correlation_id into every request.
    The correlation_id is:
      1. Read from the X-Correlation-ID header (if provided by client)
      2. Or generated as a new UUID
      3. Set on request.state for downstream use
      4. Returned in the X-Correlation-ID response header
    """

    async def dispatch(self, request: Request, call_next):
        correlation_id = request.headers.get(
            "x-correlation-id", f"req_{uuid.uuid4().hex[:16]}"
        )
        request.state.correlation_id = correlation_id

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Logs every request with method, path, status, and duration.
    Uses structured fields for observability.
    """

    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        correlation_id = getattr(request.state, "correlation_id", "unknown")

        # Skip noisy health check logs
        if request.url.path != "/api/v1/health":
            logger.info(
                "request",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": round(duration_ms, 2),
                    "correlation_id": correlation_id,
                },
            )

        response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"
        return response


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """
    Catches VedaError exceptions and converts them to structured JSON responses.
    Unhandled exceptions return a generic 500 with correlation_id.
    """

    async def dispatch(self, request: Request, call_next):
        try:
            return await call_next(request)
        except VedaError as exc:
            correlation_id = getattr(request.state, "correlation_id", None)
            return JSONResponse(
                status_code=exc.status_code,
                content=exc.to_dict(correlation_id=correlation_id),
            )
        except Exception as exc:
            correlation_id = getattr(request.state, "correlation_id", None)
            logger.exception(
                "unhandled_error",
                extra={"correlation_id": correlation_id, "error": str(exc)},
            )
            return JSONResponse(
                status_code=500,
                content={
                    "error": "InternalServerError",
                    "code": "INTERNAL_ERROR",
                    "message": "An unexpected error occurred",
                    "correlation_id": correlation_id,
                },
            )
