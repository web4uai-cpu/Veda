"""
VEDA — Graph Router
=====================
Thin HTTP adapters for Neo4j knowledge graph endpoints.
Business logic lives in services/graph_service.py.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request

from core.auth import require_admin
from services import graph_service
from services.seed_graph import seed_concepts, seed_schools, seed_persons, seed_relationships

router = APIRouter(prefix="/api/v1/graph", tags=["Knowledge Graph"])


@router.get("/concepts")
async def list_concepts(
    category: str | None = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=200),
):
    """List all concepts in the knowledge graph."""
    results = await graph_service.list_concepts(category, limit)
    return {"concepts": results, "total": len(results)}


@router.get("/concepts/{slug}")
async def get_concept(slug: str):
    """Get a concept with its direct relationships."""
    return await graph_service.get_concept(slug)


@router.get("/concepts/{slug}/related")
async def get_related_concepts(
    slug: str,
    depth: int = Query(2, ge=1, le=5),
    limit: int = Query(20, ge=1, le=100),
):
    """Get related concepts with configurable depth traversal."""
    return await graph_service.get_related_concepts(slug, depth, limit)


@router.get("/schools")
async def list_schools(
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List philosophical schools (paginated)."""
    results = await graph_service.list_schools(limit, offset)
    return {"schools": results, "total": len(results), "limit": limit, "offset": offset}


@router.get("/schools/{slug}")
async def get_school(slug: str):
    """Get a philosophical school with its supported concepts and teachers."""
    return await graph_service.get_school(slug)


@router.get("/persons")
async def list_persons(
    person_type: str | None = Query(None, description="Filter by type"),
    limit: int = Query(100, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """List key persons in the knowledge graph (paginated)."""
    results = await graph_service.list_persons(person_type, limit, offset)
    return {"persons": results, "total": len(results), "limit": limit, "offset": offset}


@router.get("/stats")
async def stats():
    """Get knowledge graph statistics."""
    return await graph_service.graph_stats()


@router.get("/search")
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    node_type: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    """Search graph nodes by name."""
    results = await graph_service.search_graph(q, node_type, limit)
    return {"query": q, "results": results, "total": len(results)}


@router.post("/seed", dependencies=[Depends(require_admin)])
async def seed_graph(request: Request):
    """Seed the knowledge graph with core ontology data. Requires X-Admin-Key."""
    await seed_concepts()
    await seed_schools()
    await seed_persons()
    await seed_relationships()
    stats = await graph_service.graph_stats()
    return {"status": "seeded", "stats": stats}
