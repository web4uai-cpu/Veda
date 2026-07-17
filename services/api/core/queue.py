"""
VEDA — Job Queue (ARQ + Redis)
=================================
Enqueue helpers for background jobs processed by the ARQ worker
(services/api/worker.py, run with: arq worker.WorkerSettings).

Falls back gracefully: enqueue functions return False when the queue is
unavailable (Redis down, arq not installed) so callers can degrade to
in-process FastAPI BackgroundTasks.
"""

from __future__ import annotations

import logging

from config import settings

logger = logging.getLogger("veda.queue")

_pool = None


async def _get_pool():
    global _pool
    if _pool is None:
        from arq import create_pool
        from arq.connections import RedisSettings

        _pool = await create_pool(RedisSettings.from_dsn(settings.redis_url))
    return _pool


async def enqueue_process_upload(upload_id: str) -> bool:
    """Queue PDF extraction/chunking/indexing for the ARQ worker.

    Returns True if the job was enqueued, False if the queue is
    unavailable (caller should fall back to BackgroundTasks).
    """
    try:
        pool = await _get_pool()
        await pool.enqueue_job("process_upload_task", upload_id)
        logger.info("Enqueued process_upload job for %s", upload_id)
        return True
    except Exception as e:
        logger.warning("Job queue unavailable (%s) — falling back to in-process task", e)
        return False


async def close_queue() -> None:
    global _pool
    if _pool is not None:
        try:
            await _pool.close()
        except Exception:
            pass
        _pool = None
