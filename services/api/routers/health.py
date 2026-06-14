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
    Overall status is 'healthy' if all services are operational,
    'degraded' if some are down, 'unhealthy' if all are down.
    """
    services: dict[str, ServiceHealth] = {}

    # API itself is always operational if we reach here
    services["api"] = ServiceHealth(status="operational", version="0.2.0")

    # PostgreSQL
    try:
        pg_health = await postgres.check_health()
        services["database"] = ServiceHealth(**pg_health)
    except Exception as e:
        services["database"] = ServiceHealth(status="not_connected", error=str(e))

    # Neo4j
    try:
        neo_health = await neo4j_client.check_health()
        services["neo4j"] = ServiceHealth(**neo_health)
    except Exception as e:
        services["neo4j"] = ServiceHealth(status="not_connected", error=str(e))

    # Redis
    try:
        redis_health = await redis_client.check_health()
        services["redis"] = ServiceHealth(**redis_health)
    except Exception as e:
        services["redis"] = ServiceHealth(status="not_connected", error=str(e))

    # Qdrant
    try:
        qdrant_health = await qdrant_client.check_health()
        services["qdrant"] = ServiceHealth(**qdrant_health)
    except Exception as e:
        services["qdrant"] = ServiceHealth(status="not_connected", error=str(e))

    # OpenSearch
    try:
        os_health = await opensearch_client.check_health()
        services["opensearch"] = ServiceHealth(**os_health)
    except Exception as e:
        services["opensearch"] = ServiceHealth(status="not_connected", error=str(e))

    # Determine overall status
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
        },
    }
