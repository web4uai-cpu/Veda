"""
VEDA — Health Router
=====================
Enhanced health check with actual database connectivity probing.
"""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Request

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


@router.get("/api/v1/health/metrics")
async def health_metrics():
    """Internal metrics snapshot — request counts, latencies, agent usage."""
    from core.observability import get_metrics_snapshot
    return get_metrics_snapshot()


@router.post("/api/v1/admin/migrate")
async def run_migrations(request: Request):
    """Run database migrations. Requires X-Admin-Key header."""
    from core.auth import require_admin
    await require_admin(request)

    from services.run_migrations import main as do_migrate
    await do_migrate()
    return {"status": "ok", "message": "Migrations applied"}


@router.post("/api/v1/admin/ingest-gita")
async def ingest_gita(request: Request):
    """Ingest Bhagavad Gita from API. Requires X-Admin-Key header."""
    from core.auth import require_admin
    await require_admin(request)

    from services.ingest_gita import main as do_ingest
    await do_ingest()
    return {"status": "ok", "message": "Gita ingestion complete"}


@router.get("/")
async def root():
    """Root endpoint — API information and navigation."""
    return {
        "name": "VEDA API",
        "description": "Knowledge Operating System for Sanatan Dharma",
        "version": "0.2.0",
        "phase": "10 — Production Hardening",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/v1/health",
            "metrics": "/api/v1/health/metrics",
            "scriptures": "/api/v1/scriptures",
            "search": "POST /api/v1/search",
            "ask": "POST /api/v1/ask",
            "research": "POST /api/v1/research",
            "agents_query": "POST /api/v1/agents/query",
            "agents_list": "/api/v1/agents/list",
            "graph_search": "/api/v1/graph/search?q={query}",
            "citation_validate": "POST /api/v1/citations/validate",
            "corpus_status": "/api/v1/corpus/status",
        },
    }
