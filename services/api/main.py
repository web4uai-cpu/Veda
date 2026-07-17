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
from core.rate_limit import RateLimitMiddleware
from core.security import SecurityHeadersMiddleware, RequestGuardMiddleware
from routers.health import router as health_router
from routers.scriptures import router as scripture_router, verse_router
from routers.graph import router as graph_router
from routers.search import router as search_router
from routers.citations import router as citations_router
from routers.corpus import router as corpus_router
from routers.uploads import router as upload_router
from routers.indexing import router as indexing_router
from routers.ask import router as ask_router
from routers.research import router as research_router
from routers.agents import router as agents_router
from routers.library import router as library_router

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
    logger.info("VEDA API v0.3.0 starting")
    logger.info("=" * 60)

    # --- Environment audit ---
    prod_problems = settings.validate_production()
    if prod_problems:
        for problem in prod_problems:
            logger.critical("PRODUCTION MISCONFIGURATION: %s", problem)
        raise RuntimeError(
            "Refusing to start in production with insecure configuration: "
            + "; ".join(prod_problems)
        )

    if not settings.openrouter_api_key:
        logger.warning("OPENROUTER_API_KEY not set — LLM answers disabled")
    if not settings.openai_api_key:
        logger.warning("OPENAI_API_KEY not set — vector indexing disabled")
    if not settings.admin_api_key:
        logger.warning("ADMIN_API_KEY not set — admin endpoints unprotected")
    if not settings.firebase_service_account_json and not settings.firebase_service_account_path:
        logger.warning("Firebase credentials not set — uploads disabled")

    # --- Startup ---
    from db.postgres import init_postgres, close_postgres
    from db.neo4j_client import init_neo4j, close_neo4j
    from db.redis_client import init_redis, close_redis
    from db.qdrant_client import init_qdrant, close_qdrant
    from db.opensearch_client import init_opensearch, close_opensearch

    # PostgreSQL
    try:
        await init_postgres()
        logger.info("[OK] PostgreSQL connected")
    except Exception as e:
        logger.warning("[SKIP] PostgreSQL not available: %s", e)

    # Neo4j
    try:
        await init_neo4j()
        logger.info("[OK] Neo4j connected")
    except Exception as e:
        logger.warning("[SKIP] Neo4j not available: %s", e)

    # Redis
    try:
        await init_redis()
        logger.info("[OK] Redis connected")
    except Exception as e:
        logger.warning("[SKIP] Redis not available: %s", e)

    # Qdrant
    try:
        await init_qdrant()
        logger.info("[OK] Qdrant connected")
    except Exception as e:
        logger.warning("[SKIP] Qdrant not available: %s", e)

    # OpenSearch
    try:
        await init_opensearch()
        logger.info("[OK] OpenSearch connected")
    except Exception as e:
        logger.warning("[SKIP] OpenSearch not available: %s", e)

    logger.info("VEDA API ready at http://localhost:8000")
    logger.info("Docs at http://localhost:8000/docs")

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
    version="0.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# --- Middleware (order matters: last added = first executed) ---

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID", "X-Response-Time"],
)

app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestGuardMiddleware)
app.add_middleware(CorrelationIdMiddleware)

# --- Routers ---

app.include_router(health_router)
app.include_router(scripture_router)
app.include_router(verse_router)
app.include_router(graph_router)
app.include_router(search_router)
app.include_router(citations_router)
app.include_router(corpus_router)
app.include_router(upload_router)
app.include_router(indexing_router)
app.include_router(ask_router)
app.include_router(research_router)
app.include_router(agents_router)
app.include_router(library_router)
