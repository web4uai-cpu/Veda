"""
VEDA API Gateway — FastAPI Application
========================================
The central API gateway for the VEDA Knowledge Operating System.

Architecture Layer: Layer 2 — API Gateway (per SYSTEM_ARCHITECTURE.md)
Responsibilities: Authentication, Routing, Rate Limiting, Logging, Metrics

Endpoints:
  /api/v1/health     — Health check
  /api/v1/search     — Hybrid search (Phase 6)
  /api/v1/chat       — Ask VEDA / Chat (Phase 9)
  /api/v1/graph      — Knowledge graph (Phase 3)
  /api/v1/upload     — Document upload (Phase 5)
  /api/v1/research   — Research reports (Phase 9)
  /api/v1/scriptures — Scripture browsing (Phase 4)
"""

from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="VEDA API",
    description="Knowledge Operating System for Sanatan Dharma",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — Allow web app and mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "http://localhost:3001",  # Admin dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health")
async def health_check():
    """
    Health check endpoint.
    Returns platform status and service readiness.
    """
    return {
        "status": "healthy",
        "platform": "VEDA",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "operational",
            "database": "not_connected",
            "neo4j": "not_connected",
            "qdrant": "not_connected",
            "opensearch": "not_connected",
            "redis": "not_connected",
        },
        "phase": "0 — Foundation",
    }


@app.get("/")
async def root():
    """Root endpoint — API information."""
    return {
        "name": "VEDA API",
        "description": "Knowledge Operating System for Sanatan Dharma",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
