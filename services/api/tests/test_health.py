"""Tests for the health router."""

from __future__ import annotations


async def test_health_all_services_operational(app_client):
    resp = await app_client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"
    assert "api" in data["services"]
    assert "database" in data["services"]
    assert "neo4j" in data["services"]
    assert "redis" in data["services"]
    assert "qdrant" in data["services"]
    assert "opensearch" in data["services"]
    assert data["services"]["api"]["status"] == "operational"


async def test_health_degraded_when_neo4j_down(app_client, mock_all_db):
    mock_all_db.neo4j.check_health.side_effect = RuntimeError("connection refused")
    resp = await app_client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("degraded", "healthy")
    assert data["services"]["neo4j"]["status"] == "not_connected"


async def test_health_reports_version(app_client):
    resp = await app_client.get("/api/v1/health")
    data = resp.json()
    assert data["services"]["api"]["version"] == "0.2.0"


async def test_root_endpoint(app_client):
    resp = await app_client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "VEDA API"
    assert data["version"] == "0.2.0"
    assert "endpoints" in data
