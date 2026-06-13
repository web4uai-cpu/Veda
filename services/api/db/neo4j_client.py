"""
VEDA — Neo4j Knowledge Graph Connection
==========================================
Async driver for Neo4j knowledge graph queries.
"""

from __future__ import annotations

import logging
from typing import Any

from neo4j import AsyncGraphDatabase, AsyncDriver

from config import settings

logger = logging.getLogger("veda.db.neo4j")

_driver: AsyncDriver | None = None


async def init_neo4j() -> AsyncDriver:
    """Initialize the Neo4j async driver."""
    global _driver
    if _driver is not None:
        return _driver

    logger.info("Connecting to Neo4j at %s", settings.neo4j_uri)
    _driver = AsyncGraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
        max_connection_pool_size=10,
    )
    # Verify connectivity
    await _driver.verify_connectivity()
    logger.info("Neo4j driver connected")
    return _driver


async def close_neo4j():
    """Close the Neo4j driver."""
    global _driver
    if _driver:
        await _driver.close()
        _driver = None
        logger.info("Neo4j driver closed")


def get_driver() -> AsyncDriver:
    """Get the current Neo4j driver."""
    if _driver is None:
        raise RuntimeError("Neo4j driver not initialized. Call init_neo4j() first.")
    return _driver


async def read_query(cypher: str, parameters: dict[str, Any] | None = None) -> list[dict]:
    """Execute a read-only Cypher query and return results as dicts."""
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(cypher, parameters or {})
        records = await result.data()
        return records


async def write_query(cypher: str, parameters: dict[str, Any] | None = None) -> list[dict]:
    """Execute a write Cypher query and return results as dicts."""
    driver = get_driver()
    async with driver.session() as session:
        result = await session.run(cypher, parameters or {})
        records = await result.data()
        return records


async def check_health() -> dict[str, str]:
    """Check Neo4j connectivity."""
    try:
        driver = get_driver()
        async with driver.session() as session:
            result = await session.run("RETURN 1 AS ok")
            record = await result.single()
            node_count = await session.run("MATCH (n) RETURN count(n) AS total")
            count_record = await node_count.single()
        return {
            "status": "operational",
            "nodes": str(count_record["total"]) if count_record else "0",
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
