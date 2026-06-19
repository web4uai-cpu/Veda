"""
VEDA — Graph Service
=====================
Business logic for Neo4j knowledge graph queries.
All Cypher lives here; routers are thin HTTP adapters.
"""

from __future__ import annotations

from db.neo4j_client import read_query
from core.errors import NotFoundError


async def list_concepts(category: str | None, limit: int) -> list[dict]:
    if category:
        return await read_query(
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
    return await read_query(
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


async def get_concept(slug: str) -> dict:
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

    schools = await read_query(
        """
        MATCH (s:School)-[:SUPPORTS]->(c:Concept {slug: $slug})
        RETURN s.slug AS slug, s.name AS name, s.summary AS summary
        """,
        {"slug": slug},
    )

    persons = await read_query(
        """
        MATCH (p:Person)-[:TEACHES]->(:School)-[:SUPPORTS]->(c:Concept {slug: $slug})
        RETURN DISTINCT p.name AS name, p.type AS type, p.period AS period
        """,
        {"slug": slug},
    )

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
        "concept": concept_result[0],
        "related_concepts": related,
        "schools": schools,
        "persons": persons,
        "scripture_mentions": scriptures,
    }


async def get_related_concepts(slug: str, depth: int, limit: int) -> dict:
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


async def list_schools() -> list[dict]:
    return await read_query(
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


async def get_school(slug: str) -> dict:
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


async def list_persons(person_type: str | None) -> list[dict]:
    if person_type:
        return await read_query(
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
    return await read_query(
        """
        MATCH (p:Person)
        OPTIONAL MATCH (p)-[:TEACHES]->(s:School)
        RETURN p.id AS id, p.name AS name, p.sanskrit_name AS sanskrit_name,
               p.type AS type, p.period AS period, p.description AS description,
               collect(s.name) AS schools
        ORDER BY p.name
        """
    )


async def graph_stats() -> dict:
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


async def search_graph(query: str, node_type: str | None, limit: int) -> list[dict]:
    if node_type and node_type in ("Concept", "School", "Person"):
        return await read_query(
            f"""
            MATCH (n:{node_type})
            WHERE toLower(n.name) CONTAINS toLower($query)
               OR (n.sanskrit_name IS NOT NULL AND toLower(n.sanskrit_name) CONTAINS toLower($query))
            RETURN labels(n)[0] AS type, n.name AS name,
                   n.sanskrit_name AS sanskrit_name,
                   n.slug AS slug, n.summary AS summary
            LIMIT $limit
            """,
            {"query": query, "limit": limit},
        )
    return await read_query(
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
        {"query": query, "limit": limit},
    )
