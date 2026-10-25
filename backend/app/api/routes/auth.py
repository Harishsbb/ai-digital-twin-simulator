"""Authentication API Endpoints for Operator Registration, Login, and Session Verification."""

from datetime import timedelta
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.db.models import UserModel
from app.db.repositories import UserRepository
from app.db.session import get_db
from app.schemas.auth import (
    AuthResponse,
    LoginRequest,
    MessageResponse,
    RegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/auth", tags=["Authentication & User Accounts"])
security = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Optional[Session] = Depends(get_db),
) -> UserModel:
    """Dependency validating bearer token and retrieving the active user."""
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(credentials.credentials)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired or token is invalid. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    user = UserRepository.get_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    return user


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
def register(
    payload: RegisterRequest,
    db: Optional[Session] = Depends(get_db),
) -> AuthResponse:
    """Create a new operator account with hashed credentials and issue a session token."""
    existing_user = UserRepository.get_by_email(db, payload.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    hashed_pw = hash_password(payload.password)
    user = UserRepository.create_user(
        db=db,
        email=payload.email,
        full_name=payload.name,
        hashed_password=hashed_pw,
    )

    token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.full_name,
        expires_delta=timedelta(days=7),
    )

    logger.info(f"Registered new operator: {user.email} (id={user.id})")

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        ),
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Sign in to user account",
)
def login(
    payload: LoginRequest,
    db: Optional[Session] = Depends(get_db),
) -> AuthResponse:
    """Verify credentials and issue a session access token."""
    user = UserRepository.get_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email address or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    # Record login timestamp
    UserRepository.update_last_login(db, user.id)

    expires_delta = timedelta(days=7) if payload.remember_me else timedelta(days=1)
    token = create_access_token(
        user_id=user.id,
        email=user.email,
        name=user.full_name,
        expires_delta=expires_delta,
    )

    logger.info(f"Successful login for operator: {user.email}")

    return AuthResponse(
        token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.full_name,
            is_active=user.is_active,
            created_at=user.created_at.isoformat() if user.created_at else None,
            last_login_at=user.last_login_at.isoformat() if user.last_login_at else None,
        ),
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Retrieve current authenticated operator profile",
)
def get_me(current_user: UserModel = Depends(get_current_user)) -> UserResponse:
    """Verify session validity and return public operator profile data."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.full_name,
        is_active=current_user.is_active,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
        last_login_at=current_user.last_login_at.isoformat() if current_user.last_login_at else None,
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Sign out current operator",
)
def logout(current_user: Optional[UserModel] = Depends(get_current_user)) -> MessageResponse:
    """Acknowledge session sign-out."""
    return MessageResponse(message="Successfully signed out.")
