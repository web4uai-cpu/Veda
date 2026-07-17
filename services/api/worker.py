"""
VEDA — ARQ Background Worker
===============================
Processes queued jobs (PDF extraction, chunking, indexing) outside the
API request path so large uploads never block or time out HTTP requests.

Run:
    cd services/api
    arq worker.WorkerSettings

Requires the same environment (.env) as the API service.
"""

from __future__ import annotations

import logging

from arq.connections import RedisSettings

from config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)-24s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("veda.worker")


async def startup(ctx: dict) -> None:
    """Connect to the databases the upload pipeline needs."""
    from db.postgres import init_postgres
    from db.qdrant_client import init_qdrant
    from db.opensearch_client import init_opensearch

    await init_postgres()
    logger.info("[OK] PostgreSQL connected")

    # Indexing backends are optional — processing still persists chunks
    # and indexing can be re-triggered later.
    for name, init in (("Qdrant", init_qdrant), ("OpenSearch", init_opensearch)):
        try:
            await init()
            logger.info("[OK] %s connected", name)
        except Exception as e:
            logger.warning("[SKIP] %s not available: %s", name, e)


async def shutdown(ctx: dict) -> None:
    from db.postgres import close_postgres
    from db.qdrant_client import close_qdrant
    from db.opensearch_client import close_opensearch

    for close in (close_postgres, close_qdrant, close_opensearch):
        try:
            await close()
        except Exception:
            pass
    logger.info("Worker stopped")


async def process_upload_task(ctx: dict, upload_id: str) -> str:
    """Download, extract, chunk, and index an uploaded PDF."""
    from services.upload_service import process_upload

    logger.info("Processing upload %s", upload_id)
    result = await process_upload(upload_id)
    return result.get("status", "unknown")


class WorkerSettings:
    functions = [process_upload_task]
    on_startup = startup
    on_shutdown = shutdown
    redis_settings = RedisSettings.from_dsn(settings.redis_url)
    max_jobs = 4
    job_timeout = 600  # 10 min for very large PDFs
    keep_result = 3600
