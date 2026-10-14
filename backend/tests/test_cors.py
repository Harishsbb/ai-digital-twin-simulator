from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_cors_allowed_origin():
    """Verify that requests from the allowed frontend origin receive CORS headers."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_disallowed_origin():
    """Verify that requests from unauthorized origins do not receive allow-origin header."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "http://malicious-site.example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.headers.get("access-control-allow-origin") != "http://malicious-site.example.com"
