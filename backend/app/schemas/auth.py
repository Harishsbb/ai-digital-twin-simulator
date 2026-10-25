"""Pydantic schemas for User Authentication and Account Management."""

import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class RegisterRequest(BaseModel):
    """Payload for user account creation."""

    name: str = Field(..., min_length=2, max_length=120, description="Full Name of the operator")
    email: str = Field(..., min_length=5, max_length=255, description="Unique account email address")
    password: str = Field(..., min_length=8, max_length=128, description="Account password (min 8 characters)")

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, value: str) -> str:
        cleaned = value.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format.")
        return cleaned

    @field_validator("name")
    @classmethod
    def validate_name_not_empty(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return cleaned

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[a-zA-Z]", value):
            raise ValueError("Password must contain at least one letter.")
        if not re.search(r"\d", value):
            raise ValueError("Password must contain at least one number.")
        return value


class LoginRequest(BaseModel):
    """Payload for authentication sign in."""

    email: str = Field(..., description="Registered account email address")
    password: str = Field(..., min_length=1, description="Account password")
    remember_me: bool = Field(default=True, description="Extend session lifetime")

    model_config = ConfigDict(str_strip_whitespace=True)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    """Public user profile response strictly omitting sensitive password hashes."""

    id: str
    email: str
    name: str
    is_active: bool = True
    created_at: Optional[str] = None
    last_login_at: Optional[str] = None


class AuthResponse(BaseModel):
    """Authentication response payload containing access token and user info."""

    token: str
    token_type: str = "bearer"
    user: UserResponse


class MessageResponse(BaseModel):
    """Simple status/confirmation response."""

    message: str
