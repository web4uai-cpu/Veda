"""
VEDA — Corpus Indexing CLI
==============================
Generates embeddings and indexes all canonical verses + upload chunks
into Qdrant (vector search) and OpenSearch (full-text search).

Usage:
    cd services/api
    python -m services.index_corpus
"""

from __future__ import annotations

import asyncio
import logging
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.postgres import init_postgres, close_postgres
from db.qdrant_client import init_qdrant, close_qdrant
from db.opensearch_client import init_opensearch, close_opensearch
from services.indexing_service import index_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
    stream=sys.stdout,
)
logger = logging.getLogger("veda.index_corpus")


async def main():
    logger.info("=" * 60)
    logger.info("VEDA — Corpus Indexing Pipeline")
    logger.info("=" * 60)

    await init_postgres()
    await init_qdrant()
    await init_opensearch()

    try:
        result = await index_all()

        logger.info("")
        logger.info("=" * 60)
        logger.info("Indexing complete!")
        logger.info("  Scriptures: %s", result["scriptures"])
        logger.info("  Uploads:    %s", result["uploads"])
        logger.info("=" * 60)
    finally:
        await close_opensearch()
        await close_qdrant()
        await close_postgres()


if __name__ == "__main__":
    asyncio.run(main())
