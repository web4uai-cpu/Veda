"""
VEDA — Research Router
=========================
Structured research reports with multi-source synthesis.
Uses deep search mode and detailed LLM output.
"""

from __future__ import annotations

import time

from fastapi import APIRouter

from models.schemas import (
    ResearchRequest,
    ResearchResponse,
    SearchRequest,
)
from services.search_service import search_evidence
from services.rlm_service import generate_research_report
from services.citation_service import resolve_scripture_citation_by_reference

router = APIRouter(prefix="/api/v1", tags=["Research"])


@router.post("/research", response_model=ResearchResponse)
async def research(request: ResearchRequest):
    """Generate a structured research report grounded in evidence.

    Uses research-depth search and detailed LLM synthesis.
    """
    started = time.perf_counter()
    warnings: list[str] = []

    mode = "research" if request.depth == "deep" else "scholar"
    search_req = SearchRequest(
        query=request.query,
        mode=mode,
        limit=20,
    )
    search_result = await search_evidence(search_req)
    warnings.extend(search_result.warnings)

    rlm_result = await generate_research_report(
        query=request.query,
        evidence=search_result.results,
    )

    verified_citations = []
    for ref in rlm_result.cited_references:
        citation = await resolve_scripture_citation_by_reference(ref)
        if citation:
            verified_citations.append(citation)
        else:
            warnings.append(f"Report cited [{ref}] but it could not be verified")

    avg_confidence = 0.0
    if verified_citations:
        avg_confidence = sum(c.confidence for c in verified_citations) / len(verified_citations)

    elapsed = (time.perf_counter() - started) * 1000

    return ResearchResponse(
        query=request.query,
        report=rlm_result.answer,
        citations=verified_citations,
        evidence=search_result.results if request.include_evidence else [],
        confidence=round(avg_confidence, 4),
        model_used=rlm_result.model_used,
        query_time_ms=round(elapsed, 2),
        warnings=warnings,
    )
