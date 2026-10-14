from fastapi import APIRouter, Depends
from app.core.config import Settings, get_settings
from app.schemas.info import AppInfoResponse

router = APIRouter(prefix="/v1", tags=["System Information"])


@router.get("/info", response_model=AppInfoResponse, summary="Application Information")
async def get_app_info(settings: Settings = Depends(get_settings)) -> AppInfoResponse:
    """Return application name, semantic version, current stage, and environment."""
    return AppInfoResponse(
        app_name=settings.app_name,
        version=settings.app_version,
        stage=settings.app_stage,
        environment=settings.environment,
        description="Industrial machine digital twin simulator with sensor telemetry and AI anomaly detection.",
    )
