"""
VEDA — OpenSearch Index Initialization
=======================================
Creates keyword-search indexes used by the retrieval layer.

Usage:
    python -m infrastructure.opensearch.init_indexes
"""

from __future__ import annotations

import asyncio

from opensearchpy import AsyncOpenSearch

OPENSEARCH_URL = "http://localhost:9200"

INDEXES = {
    "veda-scriptures": {
        "settings": {
            "index": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
            },
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


async def init_indexes() -> None:
    client = AsyncOpenSearch(
        hosts=[{"host": "localhost", "port": 9200}],
        http_compress=True,
        use_ssl=False,
        verify_certs=False,
        ssl_show_warn=False,
    )
    try:
        for index_name, body in INDEXES.items():
            exists = await client.indices.exists(index=index_name)
            if exists:
                print(f"  - Index '{index_name}' already exists, skipping")
                continue
            await client.indices.create(index=index_name, body=body)
            print(f"  + Created index '{index_name}'")
    finally:
        await client.close()

    print("\nOpenSearch indexes initialized")


if __name__ == "__main__":
    print("Initializing OpenSearch indexes...")
    asyncio.run(init_indexes())
