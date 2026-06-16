"""
VEDA — Citation Router
=======================
Trust-layer endpoints for resolving and validating citations before reasoning.
"""

from __future__ import annotations

from fastapi import APIRouter, Request

from models.schemas import (
    CitationResolveRequest,
    CitationResolveResponse,
    CitationValidateRequest,
    CitationValidateResponse,
)
from services.citation_service import (
    persist_citation,
    resolve_scripture_citation_by_reference,
    validate_citation,
)

router = APIRouter(prefix="/api/v1/citations", tags=["Citations"])


@router.post("/resolve", response_model=CitationResolveResponse)
async def resolve_citation(request: CitationResolveRequest):
    """Resolve a canonical reference such as BG.2.47."""
    citation = await resolve_scripture_citation_by_reference(
        request.reference,
        retrieval_score=request.retrieval_score,
        graph_score=request.graph_score,
    )
    if not citation:
        return CitationResolveResponse(
            resolved=False,
            message=f"Reference '{request.reference}' was not found in the canonical corpus.",
        )

    await persist_citation(citation)
    return CitationResolveResponse(resolved=True, citation=citation)


@router.post("/validate", response_model=CitationValidateResponse)
async def validate_citation_endpoint(
    payload: CitationValidateRequest,
    request: Request,
):
    """Validate that a citation is real and suitable for use as evidence."""
    correlation_id = getattr(request.state, "correlation_id", None)
    return await validate_citation(payload, correlation_id=correlation_id)
