import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import init_db, save_audit, get_recent_audits

client = TestClient(app)


def test_health_check():
    """GET /health must return 200 with service details."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "snoopfish-backend"
    assert "environment" in data
    assert "tinyfish_configured" in data


def test_stream_post_validation():
    """POST /api/audit/stream must reject empty target_name."""
    # Missing target_name
    response = client.post("/api/audit/stream", json={})
    assert response.status_code == 422

    # Empty target_name string
    response = client.post("/api/audit/stream", json={"target_name": "   "})
    assert response.status_code == 422


def test_stream_get_validation():
    """GET /api/audit/stream must reject missing or empty target_name."""
    # Missing param
    response = client.get("/api/audit/stream")
    assert response.status_code == 422

    # Blank param
    response = client.get("/api/audit/stream?target_name=%20%20")
    assert response.status_code == 422


def test_get_audits_endpoint():
    """GET /api/audits must return audits list."""
    response = client.get("/api/audits")
    assert response.status_code == 200
    data = response.json()
    assert "audits" in data
    assert isinstance(data["audits"], list)


@pytest.mark.asyncio
async def test_db_persistence(tmp_path):
    """Test saving and retrieving audits from SQLite."""
    test_db = str(tmp_path / "test_snoopfish.db")
    await init_db(db_path=test_db)

    row_id = await save_audit(
        target_name="Apex Global Logistics",
        target_url="https://apex-globlogistics-track.live",
        score=25,
        risk_level="SEVERE_DANGER",
        report_dict={"summary": "Advance fee courier fraud"},
        db_path=test_db
    )
    assert row_id > 0

    audits = await get_recent_audits(limit=5, db_path=test_db)
    assert len(audits) == 1
    assert audits[0]["target_name"] == "Apex Global Logistics"
    assert audits[0]["score"] == 25
    assert audits[0]["risk_level"] == "SEVERE_DANGER"
    assert audits[0]["report"]["summary"] == "Advance fee courier fraud"


def test_demo_audit_stream_post():
    """POST /api/audit/stream with demo=true returns 200 SSE stream."""
    response = client.post(
        "/api/audit/stream",
        json={"target_name": "Apex Global Logistics", "demo": True}
    )
    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    text = response.text
    assert "event: status" in text
    assert "event: streaming_url" in text
    assert "event: result" in text
