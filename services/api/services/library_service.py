"""
VEDA — Library Service
========================
Business logic for user library: bookmarks, notes, collections, uploads, reports.
All SQL lives here; the router is a thin HTTP adapter.
"""

from __future__ import annotations

import json

from db import postgres
from core.ulid import generate_id
from core.errors import NotFoundError, ConflictError


# ---------------------------------------------------------------------------
# Bookmarks
# ---------------------------------------------------------------------------

async def list_bookmarks(
    user_id: str, page: int = 1, per_page: int = 50,
) -> tuple[list[dict], int]:
    rows = await postgres.fetch(
        """
        SELECT * FROM bookmarks WHERE user_id = $1
        ORDER BY created_at DESC LIMIT $2 OFFSET $3
        """,
        user_id, per_page, (page - 1) * per_page,
    )
    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM bookmarks WHERE user_id = $1", user_id,
    )
    return [dict(r) for r in rows], total or 0


async def create_bookmark(user_id: str, target_type: str, target_id: str) -> dict:
    bookmark_id = generate_id("bmk")
    try:
        row = await postgres.fetchrow(
            """
            INSERT INTO bookmarks (id, user_id, target_type, target_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            bookmark_id, user_id, target_type, target_id,
        )
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise ConflictError("Bookmark", f"{target_type}/{target_id}")
        raise
    return dict(row)


async def delete_bookmark(user_id: str, bookmark_id: str) -> None:
    result = await postgres.execute(
        "DELETE FROM bookmarks WHERE id = $1 AND user_id = $2",
        bookmark_id, user_id,
    )
    if result == "DELETE 0":
        raise NotFoundError("Bookmark", bookmark_id)


# ---------------------------------------------------------------------------
# Notes
# ---------------------------------------------------------------------------

async def list_notes(
    user_id: str, search: str | None = None, page: int = 1, per_page: int = 50,
) -> tuple[list[dict], int]:
    offset = (page - 1) * per_page
    if search:
        q = f"%{search}%"
        rows = await postgres.fetch(
            """
            SELECT * FROM notes
            WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2)
            ORDER BY updated_at DESC LIMIT $3 OFFSET $4
            """,
            user_id, q, per_page, offset,
        )
        total = await postgres.fetchval(
            "SELECT COUNT(*) FROM notes WHERE user_id = $1 AND (title ILIKE $2 OR content ILIKE $2)",
            user_id, q,
        )
    else:
        rows = await postgres.fetch(
            "SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT $2 OFFSET $3",
            user_id, per_page, offset,
        )
        total = await postgres.fetchval(
            "SELECT COUNT(*) FROM notes WHERE user_id = $1", user_id,
        )
    return [_fix_tags(dict(r)) for r in rows], total or 0


async def create_note(
    user_id: str, title: str, content: str,
    target_type: str | None, target_id: str | None,
    tags: list[str],
) -> dict:
    note_id = generate_id("nts")
    row = await postgres.fetchrow(
        """
        INSERT INTO notes (id, user_id, title, content, target_type, target_id, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        """,
        note_id, user_id, title, content, target_type, target_id, tags,
    )
    return _fix_tags(dict(row))


async def update_note(user_id: str, note_id: str, **updates: object) -> dict:
    # Build dynamic SET clause for non-None fields
    fields = []
    values: list[object] = []
    idx = 1

    for key in ("title", "content", "tags"):
        val = updates.get(key)
        if val is not None:
            idx += 1
            fields.append(f"{key} = ${idx}")
            values.append(val)

    if not fields:
        raise NotFoundError("Note", note_id)

    idx += 1
    fields.append(f"updated_at = NOW()")

    query = f"""
        UPDATE notes SET {', '.join(fields)}
        WHERE id = $1 AND user_id = ${idx}
        RETURNING *
    """
    values = [note_id, *values, user_id]
    row = await postgres.fetchrow(query, *values)
    if not row:
        raise NotFoundError("Note", note_id)
    return _fix_tags(dict(row))


async def delete_note(user_id: str, note_id: str) -> None:
    result = await postgres.execute(
        "DELETE FROM notes WHERE id = $1 AND user_id = $2",
        note_id, user_id,
    )
    if result == "DELETE 0":
        raise NotFoundError("Note", note_id)


def _fix_tags(row: dict) -> dict:
    if row.get("tags") is None:
        row["tags"] = []
    return row


# ---------------------------------------------------------------------------
# Collections
# ---------------------------------------------------------------------------

async def list_collections(
    user_id: str, page: int = 1, per_page: int = 50,
) -> tuple[list[dict], int]:
    rows = await postgres.fetch(
        """
        SELECT c.*,
               COALESCE(ci.cnt, 0) AS item_count
        FROM collections c
        LEFT JOIN (
            SELECT collection_id, COUNT(*) AS cnt
            FROM collection_items
            GROUP BY collection_id
        ) ci ON ci.collection_id = c.id
        WHERE c.user_id = $1
        ORDER BY c.created_at DESC
        LIMIT $2 OFFSET $3
        """,
        user_id, per_page, (page - 1) * per_page,
    )
    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM collections WHERE user_id = $1", user_id,
    )
    collections = [dict(r) for r in rows]

    # Fetch items for all page collections in one query (avoids N+1).
    if collections:
        col_ids = [c["id"] for c in collections]
        item_rows = await postgres.fetch(
            """
            SELECT * FROM collection_items
            WHERE collection_id = ANY($1::text[])
            ORDER BY added_at DESC
            """,
            col_ids,
        )
        items_by_col: dict[str, list[dict]] = {cid: [] for cid in col_ids}
        for item in item_rows:
            items_by_col[item["collection_id"]].append(dict(item))
        for col in collections:
            col["items"] = items_by_col.get(col["id"], [])

    return collections, total or 0


async def create_collection(
    user_id: str, name: str, description: str | None, is_public: bool,
) -> dict:
    col_id = generate_id("col")
    row = await postgres.fetchrow(
        """
        INSERT INTO collections (id, user_id, name, description, is_public)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        """,
        col_id, user_id, name, description, is_public,
    )
    col = dict(row)
    col["item_count"] = 0
    col["items"] = []
    return col


async def update_collection(user_id: str, collection_id: str, **updates: object) -> dict:
    fields = []
    values: list[object] = []
    idx = 1

    for key in ("name", "description", "is_public"):
        val = updates.get(key)
        if val is not None:
            idx += 1
            fields.append(f"{key} = ${idx}")
            values.append(val)

    if not fields:
        raise NotFoundError("Collection", collection_id)

    query = f"""
        UPDATE collections SET {', '.join(fields)}
        WHERE id = $1 AND user_id = ${idx + 1}
        RETURNING *
    """
    values = [collection_id, *values, user_id]
    row = await postgres.fetchrow(query, *values)
    if not row:
        raise NotFoundError("Collection", collection_id)

    col = dict(row)
    item_count = await postgres.fetchval(
        "SELECT COUNT(*) FROM collection_items WHERE collection_id = $1",
        collection_id,
    )
    col["item_count"] = item_count or 0
    items = await postgres.fetch(
        "SELECT * FROM collection_items WHERE collection_id = $1 ORDER BY added_at DESC",
        collection_id,
    )
    col["items"] = [dict(i) for i in items]
    return col


async def delete_collection(user_id: str, collection_id: str) -> None:
    result = await postgres.execute(
        "DELETE FROM collections WHERE id = $1 AND user_id = $2",
        collection_id, user_id,
    )
    if result == "DELETE 0":
        raise NotFoundError("Collection", collection_id)


# ---------------------------------------------------------------------------
# Collection Items
# ---------------------------------------------------------------------------

async def add_collection_item(
    user_id: str, collection_id: str, item_type: str, item_id: str,
) -> dict:
    # Verify ownership
    owner = await postgres.fetchval(
        "SELECT user_id FROM collections WHERE id = $1", collection_id,
    )
    if owner != user_id:
        raise NotFoundError("Collection", collection_id)

    cli_id = generate_id("cli")
    try:
        row = await postgres.fetchrow(
            """
            INSERT INTO collection_items (id, collection_id, item_type, item_id)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            """,
            cli_id, collection_id, item_type, item_id,
        )
    except Exception as e:
        if "unique" in str(e).lower() or "duplicate" in str(e).lower():
            raise ConflictError("CollectionItem", f"{item_type}/{item_id}")
        raise
    return dict(row)


async def remove_collection_item(
    user_id: str, collection_id: str, item_id: str,
) -> None:
    # Verify ownership
    owner = await postgres.fetchval(
        "SELECT user_id FROM collections WHERE id = $1", collection_id,
    )
    if owner != user_id:
        raise NotFoundError("Collection", collection_id)

    result = await postgres.execute(
        "DELETE FROM collection_items WHERE id = $1 AND collection_id = $2",
        item_id, collection_id,
    )
    if result == "DELETE 0":
        raise NotFoundError("CollectionItem", item_id)


# ---------------------------------------------------------------------------
# Uploads (user-facing, read-only)
# ---------------------------------------------------------------------------

async def list_user_uploads(
    user_id: str, page: int = 1, per_page: int = 50,
) -> tuple[list[dict], int]:
    rows = await postgres.fetch(
        """
        SELECT u.*,
               COALESCE(ch.cnt, 0) AS chunk_count
        FROM user_uploads u
        LEFT JOIN (
            SELECT upload_id, COUNT(*) AS cnt
            FROM upload_chunks
            GROUP BY upload_id
        ) ch ON ch.upload_id = u.id
        WHERE u.user_id = $1
        ORDER BY u.uploaded_at DESC
        LIMIT $2 OFFSET $3
        """,
        user_id, per_page, (page - 1) * per_page,
    )
    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM user_uploads WHERE user_id = $1", user_id,
    )
    return [_fix_metadata(dict(r)) for r in rows], total or 0


# ---------------------------------------------------------------------------
# Research Reports (user-facing, read-only)
# ---------------------------------------------------------------------------

async def list_user_reports(
    user_id: str, page: int = 1, per_page: int = 50,
) -> tuple[list[dict], int]:
    rows = await postgres.fetch(
        """
        SELECT * FROM research_reports
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
        """,
        user_id, per_page, (page - 1) * per_page,
    )
    total = await postgres.fetchval(
        "SELECT COUNT(*) FROM research_reports WHERE user_id = $1", user_id,
    )
    return [_fix_metadata(dict(r)) for r in rows], total or 0


def _fix_metadata(row: dict) -> dict:
    m = row.get("metadata")
    if isinstance(m, str):
        try:
            row["metadata"] = json.loads(m)
        except (json.JSONDecodeError, TypeError):
            row["metadata"] = {}
    elif m is None:
        row["metadata"] = {}
    return row
