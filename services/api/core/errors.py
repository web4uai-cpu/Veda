"""
VEDA — Core Error Handling
============================
Standardized error types and exception handlers for the API.
All errors follow the VEDA error envelope format from API_SPEC.md:

    {
        "error": "NotFound",
        "code": "SCRIPTURE_NOT_FOUND",
        "message": "Scripture 'scp_xxx' not found",
        "correlation_id": "req_01HXYZ..."
    }
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True)
class VedaError(Exception):
    """Base error class for all VEDA API errors."""

    error: str
    code: str
    message: str
    status_code: int = 500
    details: dict[str, Any] | None = None

    def to_dict(self, correlation_id: str | None = None) -> dict[str, Any]:
        result = {
            "error": self.error,
            "code": self.code,
            "message": self.message,
        }
        if correlation_id:
            result["correlation_id"] = correlation_id
        if self.details:
            result["details"] = self.details
        return result


# --- Common Error Types ---


class NotFoundError(VedaError):
    """Resource not found (HTTP 404)."""

    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            error="NotFound",
            code=f"{resource.upper()}_NOT_FOUND",
            message=f"{resource} '{resource_id}' not found",
            status_code=404,
        )


class ValidationError(VedaError):
    """Request validation failed (HTTP 422)."""

    def __init__(self, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            error="ValidationError",
            code="VALIDATION_FAILED",
            message=message,
            status_code=422,
            details=details,
        )


class ConflictError(VedaError):
    """Resource already exists (HTTP 409)."""

    def __init__(self, resource: str, identifier: str):
        super().__init__(
            error="Conflict",
            code=f"{resource.upper()}_ALREADY_EXISTS",
            message=f"{resource} '{identifier}' already exists",
            status_code=409,
        )


class ServiceUnavailableError(VedaError):
    """External service unavailable (HTTP 503)."""

    def __init__(self, service: str, reason: str = ""):
        msg = f"Service '{service}' is unavailable"
        if reason:
            msg += f": {reason}"
        super().__init__(
            error="ServiceUnavailable",
            code=f"{service.upper()}_UNAVAILABLE",
            message=msg,
            status_code=503,
        )


class UnauthorizedError(VedaError):
    """Missing or invalid credentials (HTTP 401)."""

    def __init__(self, message: str = "Authentication required"):
        super().__init__(
            error="Unauthorized",
            code="AUTHENTICATION_REQUIRED",
            message=message,
            status_code=401,
        )


class ForbiddenError(VedaError):
    """Permission denied (HTTP 403)."""

    def __init__(self, action: str, resource: str = ""):
        msg = f"Permission denied: {action}"
        if resource:
            msg += f" on '{resource}'"
        super().__init__(
            error="Forbidden",
            code="PERMISSION_DENIED",
            message=msg,
            status_code=403,
        )


class RateLimitError(VedaError):
    """Rate limit exceeded (HTTP 429)."""

    def __init__(self, limit: int, window: str, retry_after: int = 60):
        super().__init__(
            error="RateLimitExceeded",
            code="RATE_LIMIT_EXCEEDED",
            message=f"Rate limit exceeded: {limit} requests per {window}. Retry after {retry_after}s.",
            status_code=429,
            details={"limit": limit, "window": window, "retry_after": retry_after},
        )


class CanonicalViolationError(VedaError):
    """Attempt to modify canonical (read-only) data (HTTP 403)."""

    def __init__(self, resource: str, resource_id: str):
        super().__init__(
            error="CanonicalViolation",
            code="CANONICAL_DATA_IMMUTABLE",
            message=f"Cannot modify canonical {resource} '{resource_id}'. Canonical data is read-only.",
            status_code=403,
        )
