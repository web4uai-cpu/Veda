"""
VEDA — OpenSearch Full-Text Search Connection
=================================================
Async client for OpenSearch 2.x text search.
Used for scripture full-text search, transliteration lookup,
and commentary indexing.

Indexes (planned):
    - scriptures      (verses + chapters)
    - concepts        (concept descriptions)
    - commentaries    (commentary text)
"""

from __future__ import annotations

import logging
from typing import Any
from urllib.parse import urlparse

from opensearchpy import AsyncOpenSearch

from config import settings

logger = logging.getLogger("veda.db.opensearch")

_client: AsyncOpenSearch | None = None


async def init_opensearch() -> AsyncOpenSearch:
    """Initialize the OpenSearch async client."""
    global _client
    if _client is not None:
        return _client

    parsed = urlparse(settings.opensearch_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or 9200
    scheme = parsed.scheme or "http"

    logger.info("Connecting to OpenSearch at %s:%d", host, port)
    _client = AsyncOpenSearch(
        hosts=[{"host": host, "port": port}],
        http_compress=True,
        use_ssl=(scheme == "https"),
        verify_certs=False,  # Local dev — no TLS verification
        ssl_show_warn=False,
        timeout=5,
    )

    # Verify connectivity
    info = await _client.info()
    version = info.get("version", {}).get("number", "unknown")
    logger.info("OpenSearch connected (v%s)", version)
    return _client


async def close_opensearch():
    """Close the OpenSearch client."""
    global _client
    if _client:
        await _client.close()
        _client = None
        logger.info("OpenSearch client closed")


def get_client() -> AsyncOpenSearch:
    """Get the current OpenSearch client. Raises if not initialized."""
    if _client is None:
        raise RuntimeError(
            "OpenSearch client not initialized. Call init_opensearch() first."
        )
    return _client


async def search(
    index: str,
    query: dict[str, Any],
    size: int = 20,
    from_: int = 0,
    highlight: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Execute a search query against an OpenSearch index.

    Args:
        index: Index name
        query: OpenSearch query DSL body
        size: Max results to return
        from_: Offset for pagination
        highlight: Optional highlight configuration

    Returns:
        OpenSearch search response dict
    """
    client = get_client()
    body: dict[str, Any] = {
        "query": query,
        "size": size,
        "from": from_,
    }
    if highlight:
        body["highlight"] = highlight

    return await client.search(index=index, body=body)


async def index_document(
    index: str,
    doc_id: str,
    document: dict[str, Any],
) -> dict[str, Any]:
    """
    Index a document into OpenSearch.

    Args:
        index: Target index name
        doc_id: Document ID
        document: Document body

    Returns:
        Index response
    """
    client = get_client()
    return await client.index(index=index, id=doc_id, body=document)


async def bulk_index(
    index: str,
    documents: list[dict[str, Any]],
) -> dict[str, Any]:
    """
    Bulk index documents. Each doc must have an 'id' key.

    Args:
        index: Target index name
        documents: List of dicts with 'id' and other fields

    Returns:
        Bulk response
    """
    client = get_client()
    actions = []
    for doc in documents:
        doc_id = doc.pop("id", None)
        actions.append({"index": {"_index": index, "_id": doc_id}})
        actions.append(doc)

    return await client.bulk(body=actions)


async def check_health() -> dict[str, str]:
    """Check OpenSearch connectivity. Returns status dict."""
    try:
        client = get_client()
        health = await client.cluster.health()
        indices = await client.cat.indices(format="json")
        return {
            "status": "operational",
            "cluster_status": health.get("status", "unknown"),
            "indices": str(len(indices) if isinstance(indices, list) else 0),
            "version": "opensearch",
        }
    except Exception as e:
        return {"status": "error", "error": str(e)}
