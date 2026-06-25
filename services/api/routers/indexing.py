"""
VEDA — Admin Indexing Router
================================
Endpoints for triggering and monitoring corpus indexing.
All endpoints require admin authentication.
"""

from __future__ import annotations

from fastapi import APIRouter, Request

from core.auth import require_admin
from services.indexing_service import index_all, index_upload_chunks
from db.opensearch_client import get_client

router = APIRouter(prefix="/api/v1/admin/indexing", tags=["Admin Indexing"])


@router.post("/corpus")
async def trigger_corpus_indexing(request: Request):
    """Trigger full corpus re-indexing (scriptures + uploads)."""
    await require_admin(request)
    result = await index_all()
    return {"status": "completed", **result}


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
