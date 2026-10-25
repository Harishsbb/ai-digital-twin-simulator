"""Authentication Service for AI Digital Twin Simulator.

Handles secure password hashing using bcrypt, JWT token signing/verification,
and password validation rules.
"""

from datetime import datetime, timedelta, timezone
import re
from typing import Any, Dict, Optional
import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    """Hash plaintext password using bcrypt with work factor salt."""
    if not password:
        raise ValueError("Password cannot be empty.")
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def validate_password_strength(password: str) -> tuple[bool, Optional[str]]:
    """Validate password meets minimum complexity requirements:
    - At least 8 characters
    - Contains at least one letter and at least one digit
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[a-zA-Z]", password):
        return False, "Password must contain at least one letter."
    if not re.search(r"\d", password):
        return False, "Password must contain at least one number."
    return True, None


def create_access_token(
    user_id: str,
    email: str,
    name: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Generate a signed HMAC-SHA256 JWT access token."""
    settings = get_settings()
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_expire_minutes)

    payload: Dict[str, Any] = {
        "sub": user_id,
        "email": email.strip().lower(),
        "name": name.strip(),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }

    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify an access token. Returns payload or None if invalid/expired."""
    settings = get_settings()
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except (jwt.PyJWTError, Exception):
        return None
