"""
VEDA — Corpus Router
=====================
Readiness endpoints for canonical scripture data.
"""

from __future__ import annotations

from fastapi import APIRouter

from models.schemas import CorpusStatusResponse
from services.corpus_service import get_corpus_status

router = APIRouter(prefix="/api/v1/corpus", tags=["Corpus"])


@router.get("/status", response_model=CorpusStatusResponse)
async def corpus_status():
    """Report whether canonical data is ready for search and citations."""
    return await get_corpus_status()
