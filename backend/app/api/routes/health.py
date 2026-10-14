from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from app.core.config import Settings, get_settings
from app.schemas.health import HealthCheckResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse, summary="System Health Verification")
async def get_health(settings: Settings = Depends(get_settings)) -> HealthCheckResponse:
    """Return backend operational status confirming service availability."""
    return HealthCheckResponse(
        status="healthy",
        service=settings.app_name,
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
    )
