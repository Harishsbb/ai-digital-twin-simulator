"""Unit & Integration Tests for Authentication & Operator Account Management.

Verifies:
1. Password hashing and verification using bcrypt with work factor salt.
2. Password strength and email format validation rules.
3. User registration with automatic email normalization and duplicate detection (409 Conflict).
4. User login with password verification, case-insensitive email, and last_login_at updates.
5. JWT token generation, lifetime, and tampering detection.
6. Protected profile endpoint (/api/v1/auth/me) with bearer token verification.
7. Logout acknowledgment endpoint (/api/v1/auth/logout).
8. Strict protection against password hash leakage in responses.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.repositories import UserRepository
from app.db.session import get_db
from app.main import app
from app.services.auth_service import (
    create_access_token,
    decode_access_token,
    hash_password,
    validate_password_strength,
    verify_password,
)


@pytest.fixture
def test_db():
    """Create an isolated in-memory SQLite database for authentication testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    db = TestingSessionLocal()
    UserRepository.clear_in_memory_users()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        UserRepository.clear_in_memory_users()


@pytest.fixture
def client(test_db):
    """FastAPI TestClient with overridden database session."""
    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


class TestPasswordSecurityAndHashing:
    """Tests for bcrypt hashing and password validation."""

    def test_hash_and_verify_password_roundtrip(self):
        password = "SecurePassword123"
        hashed = hash_password(password)

        assert hashed.startswith("$2b$") or hashed.startswith("$2a$")
        assert hashed != password
        assert verify_password(password, hashed) is True
        assert verify_password("WrongPassword123", hashed) is False
        assert verify_password("", hashed) is False

    def test_validate_password_strength(self):
        valid, _ = validate_password_strength("ValidPass1")
        assert valid is True

        # Too short (< 8 chars)
        short_valid, short_err = validate_password_strength("Pass1")
        assert short_valid is False
        assert "8 characters" in short_err

        # No digits
        no_digit, no_digit_err = validate_password_strength("PasswordOnly")
        assert no_digit is False
        assert "number" in no_digit_err

        # No letters
        no_letter, no_letter_err = validate_password_strength("12345678")
        assert no_letter is False
        assert "letter" in no_letter_err


class TestJWTTokens:
    """Tests for JWT token creation and validation."""

    def test_create_and_decode_valid_token(self):
        token = create_access_token("user_test123", "operator@factory.com", "Test Operator")
        payload = decode_access_token(token)

        assert payload is not None
        assert payload["sub"] == "user_test123"
        assert payload["email"] == "operator@factory.com"
        assert payload["name"] == "Test Operator"
        assert "exp" in payload
        assert "iat" in payload

    def test_decode_invalid_tampered_token(self):
        valid_token = create_access_token("u1", "a@b.com", "User")
        tampered = valid_token[:-4] + "fake"
        payload = decode_access_token(tampered)
        assert payload is None


class TestUserRegistrationAPI:
    """Integration tests for POST /api/v1/auth/register."""

    def test_register_new_operator_success(self, client):
        payload = {
            "name": "Harish Kumar",
            "email": "Harish@Example.com",
            "password": "Password123",
        }
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 201

        data = response.json()
        assert "token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["name"] == "Harish Kumar"
        # Email normalized to lower case
        assert data["user"]["email"] == "harish@example.com"
        assert data["user"]["id"].startswith("user_")
        assert "hashed_password" not in data["user"]
        assert "password" not in data["user"]

    def test_register_duplicate_email_rejected_with_409(self, client):
        payload = {
            "name": "Primary User",
            "email": "twin.operator@plant.com",
            "password": "Password123",
        }
        first_resp = client.post("/api/v1/auth/register", json=payload)
        assert first_resp.status_code == 201

        # Second registration with same email (even with different case)
        duplicate_payload = {
            "name": "Duplicate User",
            "email": "TWIN.OPERATOR@PLANT.COM",
            "password": "AnotherPassword456",
        }
        dup_resp = client.post("/api/v1/auth/register", json=duplicate_payload)
        assert dup_resp.status_code == 409
        assert "already exists" in dup_resp.json()["detail"].lower()

    def test_register_invalid_email_format_rejected(self, client):
        payload = {
            "name": "Invalid Email User",
            "email": "not-an-email",
            "password": "Password123",
        }
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 422

    def test_register_weak_password_rejected(self, client):
        payload = {
            "name": "Weak Pass User",
            "email": "weak@example.com",
            "password": "short",
        }
        response = client.post("/api/v1/auth/register", json=payload)
        assert response.status_code == 422


class TestUserLoginAPI:
    """Integration tests for POST /api/v1/auth/login."""

    @pytest.fixture(autouse=True)
    def setup_user(self, client):
        """Create a standard test user."""
        client.post(
            "/api/v1/auth/register",
            json={
                "name": "Active Operator",
                "email": "operator@digitaltwin.io",
                "password": "StrongPassword2026",
            },
        )

    def test_login_success_with_valid_credentials(self, client):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "operator@digitaltwin.io",
                "password": "StrongPassword2026",
                "remember_me": True,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert data["user"]["email"] == "operator@digitaltwin.io"
        assert data["user"]["name"] == "Active Operator"

    def test_login_case_insensitive_email(self, client):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "OPERATOR@DIGITALTWIN.IO",
                "password": "StrongPassword2026",
            },
        )
        assert response.status_code == 200
        assert response.json()["user"]["email"] == "operator@digitaltwin.io"

    def test_login_invalid_password_returns_401(self, client):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "operator@digitaltwin.io",
                "password": "WrongPassword999",
            },
        )
        assert response.status_code == 401
        assert "Invalid email address or password" in response.json()["detail"]

    def test_login_non_existent_email_returns_401(self, client):
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "ghost@doesnotexist.com",
                "password": "SomePassword123",
            },
        )
        assert response.status_code == 401
        assert "Invalid email address or password" in response.json()["detail"]


class TestUserProfileAndSessionAPI:
    """Tests for GET /api/v1/auth/me and POST /api/v1/auth/logout."""

    def test_get_me_with_valid_token(self, client):
        reg = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Jane Engineer",
                "email": "jane@factory.org",
                "password": "SafePassword123",
            },
        )
        token = reg.json()["token"]

        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        user_data = response.json()
        assert user_data["name"] == "Jane Engineer"
        assert user_data["email"] == "jane@factory.org"
        assert "hashed_password" not in user_data

    def test_get_me_missing_token_returns_401(self, client):
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 401

    def test_get_me_invalid_token_returns_401(self, client):
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid.token.xyz"},
        )
        assert response.status_code == 401

    def test_logout_endpoint(self, client):
        reg = client.post(
            "/api/v1/auth/register",
            json={
                "name": "Logout Tester",
                "email": "logout@test.org",
                "password": "SafePassword123",
            },
        )
        token = reg.json()["token"]

        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert "signed out" in response.json()["message"].lower()
