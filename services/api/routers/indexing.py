"""
VEDA — Admin Indexing Router
================================
Endpoints for triggering and monitoring corpus indexing.
All endpoints require admin authentication.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, BackgroundTasks, Query, Request

from core.auth import require_admin
from services.indexing_service import index_all, index_upload_chunks
from db.opensearch_client import get_client

router = APIRouter(prefix="/api/v1/admin/indexing", tags=["Admin Indexing"])
logger = logging.getLogger("veda.routers.indexing")


async def _index_all_logged() -> None:
    try:
        result = await index_all()
        logger.info("Background corpus indexing finished: %s", result)
    except Exception as e:
        logger.error("Background corpus indexing failed: %s", e)


@router.post("/corpus")
async def trigger_corpus_indexing(
    request: Request,
    background_tasks: BackgroundTasks,
    background: bool = Query(False, description="Run asynchronously (recommended with rate-limited embedding providers)"),
):
    """Trigger full corpus re-indexing (scriptures + uploads).

    With ?background=true the request returns immediately; poll
    GET /api/v1/admin/indexing/status for progress.
    """
    await require_admin(request)
    if background:
        background_tasks.add_task(_index_all_logged)
        return {"status": "started", "poll": "/api/v1/admin/indexing/status"}
    result = await index_all()
    return {"status": "completed", **result}


@router.get("/status")
async def indexing_status(request: Request):
    """Report vector/document counts per store."""
    await require_admin(request)

    status: dict = {}
    try:
        from db.qdrant_client import get_client as get_qdrant
        qdrant = get_qdrant()
        count = await qdrant.count(collection_name="scripture_chunks")
        status["qdrant_scripture_chunks"] = count.count
    except Exception as e:
        status["qdrant_scripture_chunks"] = f"error: {str(e)[:80]}"

    try:
        client = get_client()
        res = await client.count(index="veda-scriptures")
        status["opensearch_veda_scriptures"] = res.get("count", 0)
    except Exception as e:
        status["opensearch_veda_scriptures"] = f"error: {str(e)[:80]}"

    return status


@router.post("/uploads/{upload_id}")
async def trigger_upload_indexing(upload_id: str, request: Request):
    """Trigger indexing for a specific upload."""
    await require_admin(request)
    result = await index_upload_chunks(upload_id)
    return {"status": "completed", **result}


OPENSEARCH_INDEXES = {
    "veda-scriptures": {
        "settings": {
            "index": {"number_of_shards": 1, "number_of_replicas": 0},
            "analysis": {
                "analyzer": {
                    "veda_text": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": ["lowercase", "asciifolding"],
                    }
                }
            },
        },
        "mappings": {
            "properties": {
                "source_id": {"type": "keyword"},
                "scripture_id": {"type": "keyword"},
                "canonical_reference": {"type": "keyword"},
                "source_type": {"type": "keyword"},
                "language": {"type": "keyword"},
                "title": {"type": "text", "analyzer": "veda_text"},
                "content": {"type": "text", "analyzer": "veda_text"},
                "sanskrit": {"type": "text"},
                "created_at": {"type": "date"},
            }
        },
    },
    "veda-concepts": {
        "settings": {"index": {"number_of_shards": 1, "number_of_replicas": 0}},
        "mappings": {
            "properties": {
                "concept_id": {"type": "keyword"},
                "slug": {"type": "keyword"},
                "name": {"type": "text"},
                "sanskrit_name": {"type": "text"},
                "category": {"type": "keyword"},
                "summary": {"type": "text"},
            }
        },
    },
    "veda-commentaries": {
        "settings": {"index": {"number_of_shards": 1, "number_of_replicas": 0}},
        "mappings": {
            "properties": {
                "commentary_id": {"type": "keyword"},
                "verse_id": {"type": "keyword"},
                "canonical_reference": {"type": "keyword"},
                "author": {"type": "keyword"},
                "school": {"type": "keyword"},
                "content": {"type": "text"},
            }
        },
    },
    "veda-uploads": {
        "settings": {"index": {"number_of_shards": 1, "number_of_replicas": 0}},
        "mappings": {
            "properties": {
                "upload_id": {"type": "keyword"},
                "user_id": {"type": "keyword"},
                "filename": {"type": "text"},
                "file_type": {"type": "keyword"},
                "content": {"type": "text"},
                "created_at": {"type": "date"},
            }
        },
    },
}


@router.post("/opensearch/recreate-indexes")
async def recreate_opensearch_indexes(request: Request):
    """Delete and recreate all OpenSearch indexes with correct mappings."""
    await require_admin(request)
    client = get_client()
    results = {}
    for index_name, body in OPENSEARCH_INDEXES.items():
        exists = await client.indices.exists(index=index_name)
        if exists:
            await client.indices.delete(index=index_name)
        await client.indices.create(index=index_name, body=body)
        results[index_name] = "recreated" if exists else "created"
    return {"status": "completed", "indexes": results}
