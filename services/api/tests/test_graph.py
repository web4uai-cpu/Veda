"""Tests for the graph router."""

from __future__ import annotations


async def test_list_concepts(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = [
        {
            "id": "cpt_01HX0000000000000000000010",
            "slug": "dharma",
            "name": "Dharma",
            "sanskrit_name": "धर्म",
            "category": "ethics",
            "summary": "Cosmic order and duty",
            "connection_count": 5,
        }
    ]

    resp = await app_client.get("/api/v1/graph/concepts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["concepts"][0]["slug"] == "dharma"


async def test_list_concepts_empty(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = []

    resp = await app_client.get("/api/v1/graph/concepts")
    assert resp.status_code == 200
    data = resp.json()
    assert data["concepts"] == []
    assert data["total"] == 0


async def test_get_concept_found(app_client, mock_all_db):
    concept = {
        "id": "cpt_01HX0000000000000000000010",
        "slug": "dharma",
        "name": "Dharma",
        "sanskrit_name": "धर्म",
        "category": "ethics",
        "summary": "Cosmic order and duty",
    }
    related = [{"slug": "karma", "name": "Karma", "sanskrit_name": None, "category": "ethics", "relationship": "RELATED_TO", "weight": 0.9}]
    schools = [{"slug": "advaita", "name": "Advaita Vedanta", "summary": "Non-dualism"}]
    persons = [{"name": "Shankaracharya", "type": "acharya", "period": "8th century"}]
    scripture_mentions = [{"name": "Bhagavad Gita", "slug": "bhagavad-gita", "mention_count": 42}]

    mock_all_db.neo4j.read_query.side_effect = [
        [concept],
        related,
        schools,
        persons,
        scripture_mentions,
    ]

    resp = await app_client.get("/api/v1/graph/concepts/dharma")
    assert resp.status_code == 200
    data = resp.json()
    assert data["concept"]["slug"] == "dharma"
    assert len(data["related_concepts"]) == 1
    assert len(data["schools"]) == 1


async def test_get_concept_not_found(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = []

    resp = await app_client.get("/api/v1/graph/concepts/nonexistent")
    assert resp.status_code == 404


async def test_list_schools(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = [
        {"id": "sch_01HX", "slug": "advaita", "name": "Advaita Vedanta",
         "sanskrit_name": None, "summary": "Non-dualism",
         "concept_count": 10, "teachers": ["Shankaracharya"]},
    ]

    resp = await app_client.get("/api/v1/graph/schools")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["schools"][0]["slug"] == "advaita"


async def test_list_persons(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = [
        {"id": "prs_01HX", "name": "Shankaracharya", "sanskrit_name": None,
         "type": "acharya", "period": "8th century",
         "description": "Founder of Advaita", "schools": ["Advaita Vedanta"]},
    ]

    resp = await app_client.get("/api/v1/graph/persons")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["persons"][0]["name"] == "Shankaracharya"


async def test_graph_stats(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.side_effect = [
        [{"label": "Concept", "count": 21}, {"label": "School", "count": 8}],
        [{"type": "RELATED_TO", "count": 15}],
    ]

    resp = await app_client.get("/api/v1/graph/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_nodes"] == 29
    assert data["total_relationships"] == 15
    assert "Concept" in data["nodes_by_label"]


async def test_graph_search(app_client, mock_all_db):
    mock_all_db.neo4j.read_query.return_value = [
        {"type": "Concept", "name": "Dharma", "sanskrit_name": "धर्म",
         "slug": "dharma", "summary": "Cosmic order"},
    ]

    resp = await app_client.get("/api/v1/graph/search?q=dharma")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["results"][0]["slug"] == "dharma"


async def test_graph_search_requires_query(app_client, mock_all_db):
    resp = await app_client.get("/api/v1/graph/search")
    assert resp.status_code == 422
