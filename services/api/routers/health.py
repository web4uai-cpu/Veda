"""
VEDA — Health Router
=====================
Enhanced health check with actual database connectivity probing.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from db import postgres, neo4j_client, redis_client
from db import qdrant_client, opensearch_client
from models.schemas import HealthResponse, ServiceHealth

router = APIRouter(tags=["Health"])


@router.get("/api/v1/health", response_model=HealthResponse)
async def health_check():
    """
    Comprehensive health check.
    Probes all connected services and reports their status.
    Uses asyncio.wait_for to cap each probe at 3 seconds so the
    endpoint responds quickly even when databases are unreachable.
    """
    import asyncio

    services: dict[str, ServiceHealth] = {}
    services["api"] = ServiceHealth(status="operational", version="0.2.0")

    async def _probe(name: str, check_fn):
        try:
            result = await asyncio.wait_for(check_fn(), timeout=3.0)
            services[name] = ServiceHealth(**result)
        except Exception as e:
            services[name] = ServiceHealth(status="not_connected", error=str(e)[:100])

    await asyncio.gather(
        _probe("database", postgres.check_health),
        _probe("neo4j", neo4j_client.check_health),
        _probe("redis", redis_client.check_health),
        _probe("qdrant", qdrant_client.check_health),
        _probe("opensearch", opensearch_client.check_health),
    )

    statuses = [s.status for s in services.values()]
    operational_count = sum(1 for s in statuses if s == "operational")

    if operational_count == len(statuses):
        overall = "healthy"
    elif operational_count > 1:
        overall = "degraded"
    else:
        overall = "unhealthy"

    return HealthResponse(
        status=overall,
        timestamp=datetime.now(timezone.utc),
        services=services,
    )


@router.get("/")
async def root():
    """Root endpoint — API information and navigation."""
    return {
        "name": "VEDA API",
        "description": "Knowledge Operating System for Sanatan Dharma",
        "version": "0.2.0",
        "phase": "2 — Data Layer",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/v1/health",
            "scriptures": "/api/v1/scriptures",
            "verses": "/api/v1/verses/{reference}",
            "graph_concepts": "/api/v1/graph/concepts",
            "graph_schools": "/api/v1/graph/schools",
            "graph_persons": "/api/v1/graph/persons",
            "graph_search": "/api/v1/graph/search?q={query}",
            "graph_stats": "/api/v1/graph/stats",
            "search": "POST /api/v1/search",
            "citation_resolve": "POST /api/v1/citations/resolve",
            "citation_validate": "POST /api/v1/citations/validate",
            "corpus_status": "/api/v1/corpus/status",
        },
    }
