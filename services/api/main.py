"""
VEDA API Gateway — FastAPI Application
========================================
The central API gateway for the VEDA Knowledge Operating System.

Architecture Layer: Layer 2 — API Gateway (per SYSTEM_ARCHITECTURE.md)
Phase: 2 — Data Layer

Lifecycle:
    startup  → connect to PostgreSQL, Neo4j, Redis
    shutdown → close all connections gracefully

Middleware:
    1. CORS
    2. Correlation ID injection
    3. Request logging with duration
    4. Error handler (VedaError → JSON)
"""

from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from core.middleware import (
    CorrelationIdMiddleware,
    RequestLoggingMiddleware,
    ErrorHandlerMiddleware,
)
from routers.health import router as health_router
from routers.scriptures import router as scripture_router, verse_router
from routers.graph import router as graph_router

# =============================================================================
# LOGGING
# =============================================================================

logging.basicConfig(
    level=logging.DEBUG if settings.debug else logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)-24s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)

logger = logging.getLogger("veda.api")


# =============================================================================
# LIFESPAN (startup/shutdown)
# =============================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Connects to databases on startup, closes on shutdown.
    Gracefully handles missing services (logs warning, continues).
    """
    logger.info("=" * 60)
    logger.info("VEDA API v0.2.0 starting — Phase 2: Data Layer")
    logger.info("=" * 60)

    # --- Startup ---
    from db.postgres import init_postgres, close_postgres
    from db.neo4j_client import init_neo4j, close_neo4j
    from db.redis_client import init_redis, close_redis
    from db.qdrant_client import init_qdrant, close_qdrant
    from db.opensearch_client import init_opensearch, close_opensearch

    # PostgreSQL
    try:
        await init_postgres()
        logger.info("✅  PostgreSQL connected")
    except Exception as e:
        logger.warning("⚠️  PostgreSQL not available: %s", e)

    # Neo4j
    try:
        await init_neo4j()
        logger.info("✅  Neo4j connected")
    except Exception as e:
        logger.warning("⚠️  Neo4j not available: %s", e)

    # Redis
    try:
        await init_redis()
        logger.info("✅  Redis connected")
    except Exception as e:
        logger.warning("⚠️  Redis not available: %s", e)

    # Qdrant
    try:
        await init_qdrant()
        logger.info("✅  Qdrant connected")
    except Exception as e:
        logger.warning("⚠️  Qdrant not available: %s", e)

    # OpenSearch
    try:
        await init_opensearch()
        logger.info("✅  OpenSearch connected")
    except Exception as e:
        logger.warning("⚠️  OpenSearch not available: %s", e)

    logger.info("🚀  VEDA API ready at http://localhost:8000")
    logger.info("📖  Docs at http://localhost:8000/docs")

    yield

    # --- Shutdown ---
    logger.info("Shutting down VEDA API...")

    try:
        await close_postgres()
    except Exception:
        pass
    try:
        await close_neo4j()
    except Exception:
        pass
    try:
        await close_redis()
    except Exception:
        pass
    try:
        await close_qdrant()
    except Exception:
        pass
    try:
        await close_opensearch()
    except Exception:
        pass

    logger.info("VEDA API stopped")


# =============================================================================
# APP
# =============================================================================

app = FastAPI(
    title="VEDA API",
    description="Knowledge Operating System for Sanatan Dharma — REST API Gateway",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- Middleware (order matters: last added = first executed) ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "X-Response-Time"],
)

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# --- Routers ---

app.include_router(health_router)
app.include_router(scripture_router)
app.include_router(verse_router)
app.include_router(graph_router)
