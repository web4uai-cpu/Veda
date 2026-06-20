"""
VEDA — Ask Router
====================
LLM-powered question answering grounded in citation-verified evidence.
Every answer is traceable to source evidence packets.
"""

from __future__ import annotations

import time

from fastapi import APIRouter

from models.schemas import (
    AskRequest,
    AskResponse,
    SearchRequest,
)
from services.search_service import search_evidence
from services.rlm_service import generate_answer
from services.citation_service import resolve_scripture_citation_by_reference

router = APIRouter(prefix="/api/v1", tags=["Ask VEDA"])


@router.post("/ask", response_model=AskResponse)
async def ask_veda(request: AskRequest):
    """Ask VEDA a question and receive an evidence-grounded answer.

    Flow:
      1. Hybrid search retrieves citation-verified evidence
      2. LLM generates answer constrained to evidence
      3. Cited references are validated against the canonical corpus
      4. Response includes answer + citations + raw evidence
    """
    started = time.perf_counter()
    warnings: list[str] = []

    search_req = SearchRequest(
        query=request.query,
        mode=request.mode,
        limit=15 if request.mode == "scholar" else 10,
    )
    search_result = await search_evidence(search_req)
    warnings.extend(search_result.warnings)

    rlm_result = await generate_answer(
        query=request.query,
        evidence=search_result.results,
        mode=request.mode,
    )

    verified_citations = []
    for ref in rlm_result.cited_references:
        citation = await resolve_scripture_citation_by_reference(ref)
        if citation:
            verified_citations.append(citation)
        else:
            warnings.append(f"LLM cited [{ref}] but it could not be verified")

    avg_confidence = 0.0
    if verified_citations:
        avg_confidence = sum(c.confidence for c in verified_citations) / len(verified_citations)
    elif search_result.results:
        avg_confidence = sum(
            ep.citation.confidence for ep in search_result.results if ep.citation
        ) / max(len(search_result.results), 1)

    elapsed = (time.perf_counter() - started) * 1000

    return AskResponse(
        query=request.query,
        answer=rlm_result.answer,
        citations=verified_citations,
        evidence=search_result.results if request.include_evidence else [],
        confidence=round(avg_confidence, 4),
        model_used=rlm_result.model_used,
        query_time_ms=round(elapsed, 2),
        warnings=warnings,
    )
