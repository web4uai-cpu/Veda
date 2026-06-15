"""
VEDA — Search Router
=====================
Hybrid evidence search endpoints.

Search returns citation-ready evidence packets. Reasoning and agents consume
these packets later; this router does not generate answers.
"""

from __future__ import annotations

from fastapi import APIRouter

from models.schemas import SearchRequest, SearchResponse
from services.search_service import search_evidence

router = APIRouter(prefix="/api/v1/search", tags=["Search"])


@router.post("", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Run evidence-first search across the currently available backends."""
    return await search_evidence(request)
