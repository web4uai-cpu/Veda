"""
VEDA — Graph Router
=====================
REST endpoints for querying the Neo4j knowledge graph.
Provides concept exploration, relationship traversal, and graph statistics.

Endpoints:
    GET  /api/v1/graph/concepts              — List all concepts
    GET  /api/v1/graph/concepts/:slug        — Get concept with related nodes
    GET  /api/v1/graph/concepts/:slug/related — Get related concepts (depth traversal)
    GET  /api/v1/graph/schools               — List philosophical schools
    GET  /api/v1/graph/schools/:slug         — Get school with teachings
    GET  /api/v1/graph/persons               — List key persons
    GET  /api/v1/graph/stats                 — Graph statistics
    GET  /api/v1/graph/search                — Search graph nodes by name
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, Query

from db.neo4j_client import read_query
from core.errors import NotFoundError

logger = logging.getLogger("veda.routers.graph")

router = APIRouter(prefix="/api/v1/graph", tags=["Knowledge Graph"])


# =============================================================================
# CONCEPTS
# =============================================================================


@router.get("/concepts")
async def list_concepts(
    category: str | None = Query(None, description="Filter by category (metaphysics, ethics, yoga, etc.)"),
    limit: int = Query(50, ge=1, le=200),
):
    """List all concepts in the knowledge graph."""
    if category:
        results = await read_query(
            """
            MATCH (c:Concept {category: $category})
            OPTIONAL MATCH (c)-[r]-()
            RETURN c.id AS id, c.slug AS slug, c.name AS name,
                   c.sanskrit_name AS sanskrit_name, c.category AS category,
                   c.summary AS summary, count(r) AS connection_count
            ORDER BY connection_count DESC, c.name
            LIMIT $limit
            """,
            {"category": category, "limit": limit},
        )
    else:
        results = await read_query(
            """
            MATCH (c:Concept)
            OPTIONAL MATCH (c)-[r]-()
            RETURN c.id AS id, c.slug AS slug, c.name AS name,
                   c.sanskrit_name AS sanskrit_name, c.category AS category,
                   c.summary AS summary, count(r) AS connection_count
            ORDER BY connection_count DESC, c.name
            LIMIT $limit
            """,
            {"limit": limit},
        )

    return {"concepts": results, "total": len(results)}


@router.get("/concepts/{slug}")
async def get_concept(slug: str):
    """
    Get a concept by slug with its direct relationships.
    Returns the concept, related concepts, schools that support it,
    and persons who teach it.
    """
    # Get the concept
    concept_result = await read_query(
        """
        MATCH (c:Concept {slug: $slug})
        RETURN c.id AS id, c.slug AS slug, c.name AS name,
               c.sanskrit_name AS sanskrit_name, c.category AS category,
               c.summary AS summary
        """,
        {"slug": slug},
    )
    if not concept_result:
        raise NotFoundError("Concept", slug)

    concept = concept_result[0]

    # Get related concepts
    related = await read_query(
        """
        MATCH (c:Concept {slug: $slug})-[r:RELATED_TO|EXPLAINS]-(other:Concept)
        RETURN other.slug AS slug, other.name AS name,
               other.sanskrit_name AS sanskrit_name, other.category AS category,
               type(r) AS relationship, r.weight AS weight
        ORDER BY r.weight DESC
        """,
        {"slug": slug},
    )

    # Get schools supporting this concept
    schools = await read_query(
        """
        MATCH (s:School)-[:SUPPORTS]->(c:Concept {slug: $slug})
        RETURN s.slug AS slug, s.name AS name, s.summary AS summary
        """,
        {"slug": slug},
    )

    # Get persons teaching this concept
    persons = await read_query(
        """
        MATCH (p:Person)-[:TEACHES]->(:School)-[:SUPPORTS]->(c:Concept {slug: $slug})
        RETURN DISTINCT p.name AS name, p.type AS type, p.period AS period
        """,
        {"slug": slug},
    )

    # Get scriptures mentioning this concept (when graph is connected to verses)
    scriptures = await read_query(
        """
        MATCH (v:Verse)-[:MENTIONS]->(c:Concept {slug: $slug})
        MATCH (v)-[:PART_OF*]->(s:Scripture)
        RETURN DISTINCT s.name AS name, s.slug AS slug, count(v) AS mention_count
        ORDER BY mention_count DESC
        """,
        {"slug": slug},
    )

    return {
        "concept": concept,
        "related_concepts": related,
        "schools": schools,
        "persons": persons,
        "scripture_mentions": scriptures,
    }


@router.get("/concepts/{slug}/related")
async def get_related_concepts(
    slug: str,
    depth: int = Query(2, ge=1, le=5, description="Traversal depth (max 5 for research mode)"),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Get related concepts with configurable depth traversal.
    Depth 1 = direct connections, 2 = two hops, etc.
    Per ADR: max depth 2 (quick), 3 (scholar), 5 (research).
    """
    results = await read_query(
        f"""
        MATCH (start:Concept {{slug: $slug}})
        MATCH path = (start)-[:RELATED_TO|EXPLAINS*1..{depth}]-(other:Concept)
        WHERE other <> start
        WITH DISTINCT other, length(path) AS distance
        RETURN other.slug AS slug, other.name AS name,
               other.sanskrit_name AS sanskrit_name, other.category AS category,
               other.summary AS summary, distance
        ORDER BY distance, other.name
        LIMIT $limit
        """,
        {"slug": slug, "limit": limit},
    )

    return {"source": slug, "depth": depth, "related": results, "total": len(results)}


# =============================================================================
# SCHOOLS
# =============================================================================


@router.get("/schools")
async def list_schools():
    """List all philosophical schools."""
    results = await read_query(
        """
        MATCH (s:School)
        OPTIONAL MATCH (s)-[:SUPPORTS]->(c:Concept)
        WITH s, count(c) AS concept_count
        OPTIONAL MATCH (p:Person)-[:TEACHES]->(s)
        RETURN s.id AS id, s.slug AS slug, s.name AS name,
               s.sanskrit_name AS sanskrit_name, s.summary AS summary,
               concept_count, collect(p.name) AS teachers
        ORDER BY concept_count DESC
        """
    )
    return {"schools": results, "total": len(results)}


@router.get("/schools/{slug}")
async def get_school(slug: str):
    """Get a philosophical school with its supported concepts and teachers."""
    school = await read_query(
        """
        MATCH (s:School {slug: $slug})
        RETURN s.id AS id, s.slug AS slug, s.name AS name,
               s.sanskrit_name AS sanskrit_name, s.summary AS summary
        """,
        {"slug": slug},
    )
    if not school:
        raise NotFoundError("School", slug)

    concepts = await read_query(
        """
        MATCH (s:School {slug: $slug})-[:SUPPORTS]->(c:Concept)
        RETURN c.slug AS slug, c.name AS name, c.sanskrit_name AS sanskrit_name,
               c.category AS category, c.summary AS summary
        ORDER BY c.name
        """,
        {"slug": slug},
    )

    teachers = await read_query(
        """
        MATCH (p:Person)-[:TEACHES]->(s:School {slug: $slug})
        RETURN p.name AS name, p.sanskrit_name AS sanskrit_name,
               p.type AS type, p.period AS period, p.description AS description
        """,
        {"slug": slug},
    )

    # Get contrasting schools
    contrasts = await read_query(
        """
        MATCH (s:School {slug: $slug})-[:CONTRADICTS]-(other:School)
        RETURN other.slug AS slug, other.name AS name, other.summary AS summary
        """,
        {"slug": slug},
    )

    return {
        "school": school[0],
        "supported_concepts": concepts,
        "teachers": teachers,
        "contrasting_schools": contrasts,
    }


# =============================================================================
# PERSONS
# =============================================================================


@router.get("/persons")
async def list_persons(
    person_type: str | None = Query(None, description="Filter by type (rishi, acharya, saint, king)"),
):
    """List key persons in the knowledge graph."""
    if person_type:
        results = await read_query(
            """
            MATCH (p:Person {type: $type})
            OPTIONAL MATCH (p)-[:TEACHES]->(s:School)
            RETURN p.id AS id, p.name AS name, p.sanskrit_name AS sanskrit_name,
                   p.type AS type, p.period AS period, p.description AS description,
                   collect(s.name) AS schools
            ORDER BY p.name
            """,
            {"type": person_type},
        )
    else:
        results = await read_query(
            """
            MATCH (p:Person)
            OPTIONAL MATCH (p)-[:TEACHES]->(s:School)
            RETURN p.id AS id, p.name AS name, p.sanskrit_name AS sanskrit_name,
                   p.type AS type, p.period AS period, p.description AS description,
                   collect(s.name) AS schools
            ORDER BY p.name
            """
        )

    return {"persons": results, "total": len(results)}


# =============================================================================
# GRAPH STATS & SEARCH
# =============================================================================


@router.get("/stats")
async def graph_stats():
    """Get knowledge graph statistics."""
    node_counts = await read_query(
        """
        MATCH (n)
        WITH labels(n)[0] AS label, count(*) AS count
        RETURN label, count ORDER BY count DESC
        """
    )

    rel_counts = await read_query(
        """
        MATCH ()-[r]->()
        WITH type(r) AS type, count(*) AS count
        RETURN type, count ORDER BY count DESC
        """
    )

    total_nodes = sum(r["count"] for r in node_counts) if node_counts else 0
    total_rels = sum(r["count"] for r in rel_counts) if rel_counts else 0

    return {
        "total_nodes": total_nodes,
        "total_relationships": total_rels,
        "nodes_by_label": {r["label"]: r["count"] for r in node_counts},
        "relationships_by_type": {r["type"]: r["count"] for r in rel_counts},
    }


@router.get("/search")
async def search_graph(
    q: str = Query(..., min_length=2, description="Search query"),
    node_type: str | None = Query(None, description="Filter by node type (Concept, School, Person)"),
    limit: int = Query(20, ge=1, le=100),
):
    """Search graph nodes by name (case-insensitive contains match)."""
    if node_type and node_type in ("Concept", "School", "Person"):
        results = await read_query(
            f"""
            MATCH (n:{node_type})
            WHERE toLower(n.name) CONTAINS toLower($query)
               OR (n.sanskrit_name IS NOT NULL AND toLower(n.sanskrit_name) CONTAINS toLower($query))
            RETURN labels(n)[0] AS type, n.name AS name,
                   n.sanskrit_name AS sanskrit_name,
                   n.slug AS slug, n.summary AS summary
            LIMIT $limit
            """,
            {"query": q, "limit": limit},
        )
    else:
        results = await read_query(
            """
            MATCH (n)
            WHERE (n:Concept OR n:School OR n:Person)
              AND (toLower(n.name) CONTAINS toLower($query)
                   OR (n.sanskrit_name IS NOT NULL AND toLower(n.sanskrit_name) CONTAINS toLower($query)))
            RETURN labels(n)[0] AS type, n.name AS name,
                   n.sanskrit_name AS sanskrit_name,
                   n.slug AS slug, n.summary AS summary
            LIMIT $limit
            """,
            {"query": q, "limit": limit},
        )

    return {"query": q, "results": results, "total": len(results)}
