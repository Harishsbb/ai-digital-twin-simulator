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


def test_cors_vercel_production_and_preview_origin():
    """Verify that requests from Vercel production and preview domains receive CORS headers."""
    response = client.options(
        "/api/health",
        headers={
            "Origin": "https://ai-digital-twin-simulator.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://ai-digital-twin-simulator.vercel.app"

    preview_response = client.options(
        "/api/health",
        headers={
            "Origin": "https://ai-digital-twin-git-step14-user.vercel.app",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert preview_response.status_code == 200
    assert preview_response.headers.get("access-control-allow-origin") == "https://ai-digital-twin-git-step14-user.vercel.app"
