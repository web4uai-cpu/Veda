"""
VEDA — PostgreSQL Database Connection
========================================
Async connection pool for PostgreSQL (Railway).
Uses asyncpg for high-performance async queries.
Auth is handled at the API layer via Firebase Auth.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Any

import asyncpg

from config import settings

logger = logging.getLogger("veda.db.postgres")

# Module-level connection pool
_pool: asyncpg.Pool | None = None


async def init_postgres() -> asyncpg.Pool:
    """Initialize the PostgreSQL connection pool."""
    global _pool
    if _pool is not None:
        return _pool

    logger.info("Connecting to PostgreSQL at %s", settings.database_url.split("@")[-1])
    _pool = await asyncpg.create_pool(
        dsn=settings.database_url,
        min_size=2,
        max_size=10,
        command_timeout=30,
        statement_cache_size=100,
    )
    logger.info("PostgreSQL pool created (min=2, max=10)")
    return _pool


async def close_postgres():
    """Close the PostgreSQL connection pool."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("PostgreSQL pool closed")


def get_pool() -> asyncpg.Pool:
    """Get the current connection pool. Raises if not initialized."""
    if _pool is None:
        raise RuntimeError("PostgreSQL pool not initialized. Call init_postgres() first.")
    return _pool


@asynccontextmanager
async def get_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Acquire a connection from the pool."""
    pool = get_pool()
    async with pool.acquire() as conn:
        yield conn


async def execute(query: str, *args: Any) -> str:
    """Execute a query and return the status string."""
    async with get_connection() as conn:
        return await conn.execute(query, *args)


async def fetch(query: str, *args: Any) -> list[asyncpg.Record]:
    """Execute a query and return all rows."""
    async with get_connection() as conn:
        return await conn.fetch(query, *args)


async def fetchrow(query: str, *args: Any) -> asyncpg.Record | None:
    """Execute a query and return a single row."""
    async with get_connection() as conn:
        return await conn.fetchrow(query, *args)


async def fetchval(query: str, *args: Any) -> Any:
    """Execute a query and return a single value."""
    async with get_connection() as conn:
        return await conn.fetchval(query, *args)


async def check_health() -> dict[str, str]:
    """Check PostgreSQL connectivity. Returns status dict."""
    try:
        pool = get_pool()
        async with pool.acquire() as conn:
            version = await conn.fetchval("SELECT version()")
            count = await conn.fetchval("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'")
        return {
            "status": "operational",
            "version": version.split(",")[0] if version else "unknown",
            "tables": str(count),
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
