"""Tests for the scripture router."""

from __future__ import annotations


async def test_list_scriptures_empty(app_client, mock_all_db):
    mock_all_db.pg.fetchval.return_value = 0
    mock_all_db.pg.fetch.return_value = []

    resp = await app_client.get("/api/v1/scriptures")
    assert resp.status_code == 200
    data = resp.json()
    assert data["scriptures"] == []
    assert data["total"] == 0


async def test_list_scriptures_with_data(app_client, mock_all_db, make_scripture_row):
    row = make_scripture_row()
    mock_all_db.pg.fetchval.return_value = 1
    mock_all_db.pg.fetch.return_value = [row]

    resp = await app_client.get("/api/v1/scriptures")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["scriptures"]) == 1
    assert data["scriptures"][0]["slug"] == "bhagavad-gita"
    assert data["scriptures"][0]["name"] == "Bhagavad Gita"
    assert data["total"] == 1


async def test_list_scriptures_filter_by_category(app_client, mock_all_db):
    mock_all_db.pg.fetchval.return_value = 0
    mock_all_db.pg.fetch.return_value = []

    resp = await app_client.get("/api/v1/scriptures?category=gita")
    assert resp.status_code == 200
    call_args = mock_all_db.pg.fetch.call_args
    assert "gita" in str(call_args)


async def test_get_scripture_by_slug_found(app_client, mock_all_db, make_scripture_row):
    mock_all_db.pg.fetchrow.return_value = make_scripture_row()

    resp = await app_client.get("/api/v1/scriptures/slug/bhagavad-gita")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == "bhagavad-gita"


async def test_get_scripture_by_slug_not_found(app_client, mock_all_db):
    mock_all_db.pg.fetchrow.return_value = None

    resp = await app_client.get("/api/v1/scriptures/slug/nonexistent")
    assert resp.status_code == 404


async def test_get_scripture_by_id_found(app_client, mock_all_db, make_scripture_row):
    mock_all_db.pg.fetchrow.return_value = make_scripture_row()

    resp = await app_client.get("/api/v1/scriptures/scp_01HX0000000000000000000001")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Bhagavad Gita"


async def test_get_scripture_by_id_not_found(app_client, mock_all_db):
    mock_all_db.pg.fetchrow.return_value = None

    resp = await app_client.get("/api/v1/scriptures/scp_01HX9999999999999999999999")
    assert resp.status_code == 404


async def test_list_chapters(app_client, mock_all_db, make_chapter_row):
    mock_all_db.pg.fetchrow.return_value = {"id": "scp_01HX0000000000000000000001", "name": "Bhagavad Gita"}
    mock_all_db.pg.fetch.return_value = [make_chapter_row()]

    resp = await app_client.get("/api/v1/scriptures/scp_01HX0000000000000000000001/chapters")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["chapters"]) == 1
    assert data["chapters"][0]["chapter_number"] == 1


async def test_get_verse_by_reference_found(
    app_client, mock_all_db, make_verse_row, make_verse_content_row
):
    verse = make_verse_row()
    content = make_verse_content_row()
    mock_all_db.pg.fetchrow.return_value = verse
    mock_all_db.pg.fetch.return_value = [content]

    resp = await app_client.get("/api/v1/verses/BG.2.47")
    assert resp.status_code == 200
    data = resp.json()
    assert data["canonical_reference"] == "BG.2.47"


async def test_get_verse_by_reference_not_found(app_client, mock_all_db):
    mock_all_db.pg.fetchrow.return_value = None

    resp = await app_client.get("/api/v1/verses/BG.99.99")
    assert resp.status_code == 404
