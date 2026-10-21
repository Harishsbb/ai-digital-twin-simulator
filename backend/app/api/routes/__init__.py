from fastapi import APIRouter
from app.api.routes.health import router as health_router
from app.api.routes.info import router as info_router
from app.api.routes.sensors import router as sensors_router
from app.api.routes.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(info_router)
api_router.include_router(sensors_router)
api_router.include_router(ai_router)

__all__ = ["api_router"]

