from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import api_router
from app.core.config import get_settings
from app.services.sensor_simulator import get_sensor_simulator

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager handling background telemetry generation on startup and shutdown."""
    simulator = get_sensor_simulator()
    simulator.start_background_task()
    yield
    simulator.stop_background_task()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for AI Digital Twin Simulator - Industrial Machine Telemetry & Predictive Monitoring",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure CORS restricted strictly to the local Vite development origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
)

# Register API routes under /api
app.include_router(api_router, prefix="/api")


@app.get("/", tags=["Root"])
async def root():
    """Root entrypoint providing general service metadata and documentation links."""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "stage": "Step 12: Supabase PostgreSQL Database Integration",
        "status": "online",
        "docs_url": "/docs",
        "health_check": "/api/health",
        "db_health": "/api/v1/db/health",
        "app_info": "/api/v1/info",
        "sensors_latest": "/api/v1/sensors/latest",
        "sensors_ws": "/api/v1/sensors/ws",
        "ai_status": "/api/v1/ai/status",
        "ai_latest": "/api/v1/ai/latest",
        "ai_metrics": "/api/v1/ai/metrics",
        "db_alerts": "/api/v1/db/alerts",
        "db_whatif_experiments": "/api/v1/db/whatif/experiments",
    }



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.environment == "development",
    )
