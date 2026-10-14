from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_status_code():
    """Verify that GET /api/health returns HTTP 200."""
    response = client.get("/api/health")
    assert response.status_code == 200


def test_health_check_payload():
    """Verify that GET /api/health returns valid schema with healthy status and metadata."""
    response = client.get("/api/health")
    data = response.json()

    assert data["status"] == "healthy"
    assert "service" in data
    assert "version" in data
    assert "timestamp" in data
    assert isinstance(data["service"], str)
    assert len(data["service"]) > 0
