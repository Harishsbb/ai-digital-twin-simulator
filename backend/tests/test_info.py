from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_app_info_status_code():
    """Verify that GET /api/v1/info returns HTTP 200."""
    response = client.get("/api/v1/info")
    assert response.status_code == 200


def test_app_info_payload():
    """Verify that GET /api/v1/info returns app name, version, and implementation stage."""
    response = client.get("/api/v1/info")
    data = response.json()

    assert data["app_name"] == "AI Digital Twin Simulator"
    assert data["version"] == "0.1.0"
    assert "Step 1" in data["stage"]
    assert "environment" in data
    assert "description" in data
