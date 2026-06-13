"""
VEDA — Qdrant Collection Initialization
==========================================
Creates the 4 vector collections required by SEARCH_ARCHITECTURE.md.
Run once against a fresh Qdrant instance.

Usage:
    python -m infrastructure.qdrant.init_collections
"""

import asyncio
from qdrant_client import AsyncQdrantClient
from qdrant_client.models import Distance, VectorParams, PayloadSchemaType

QDRANT_URL = "http://localhost:6333"
EMBEDDING_DIM = 3072  # OpenAI text-embedding-3-large

COLLECTIONS = {
    "scripture_chunks": {
        "description": "Verse-level chunks from canonical scriptures",
        "payload_indexes": {
            "source_type": PayloadSchemaType.KEYWORD,
            "scripture_id": PayloadSchemaType.KEYWORD,
            "canonical_reference": PayloadSchemaType.KEYWORD,
            "language": PayloadSchemaType.KEYWORD,
        },
    },
    "commentary_chunks": {
        "description": "Commentary text chunks from traditional commentators",
        "payload_indexes": {
            "source_type": PayloadSchemaType.KEYWORD,
            "commentary_id": PayloadSchemaType.KEYWORD,
            "author": PayloadSchemaType.KEYWORD,
            "school": PayloadSchemaType.KEYWORD,
        },
    },
    "upload_chunks": {
        "description": "User-uploaded document chunks (separated from canonical)",
        "payload_indexes": {
            "user_id": PayloadSchemaType.KEYWORD,
            "upload_id": PayloadSchemaType.KEYWORD,
            "file_type": PayloadSchemaType.KEYWORD,
        },
    },
    "research_chunks": {
        "description": "Research report and analysis chunks",
        "payload_indexes": {
            "report_id": PayloadSchemaType.KEYWORD,
            "user_id": PayloadSchemaType.KEYWORD,
        },
    },
}


async def init_collections():
    """Create all Qdrant collections with proper vector config and payload indexes."""
    client = AsyncQdrantClient(url=QDRANT_URL)

    for name, config in COLLECTIONS.items():
        # Check if collection exists
        collections = await client.get_collections()
        existing = [c.name for c in collections.collections]

        if name in existing:
            print(f"  ⏭️  Collection '{name}' already exists, skipping")
            continue

        # Create collection
        await client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(
                size=EMBEDDING_DIM,
                distance=Distance.COSINE,
            ),
        )
        print(f"  ✅ Created collection '{name}' ({EMBEDDING_DIM}-dim, cosine)")

        # Create payload indexes for filtering
        for field_name, field_type in config["payload_indexes"].items():
            await client.create_payload_index(
                collection_name=name,
                field_name=field_name,
                field_schema=field_type,
            )
        print(f"     Indexed {len(config['payload_indexes'])} payload fields")

    await client.close()
    print("\n✅ All Qdrant collections initialized")


if __name__ == "__main__":
    print("🔧 Initializing Qdrant collections...")
    asyncio.run(init_collections())
