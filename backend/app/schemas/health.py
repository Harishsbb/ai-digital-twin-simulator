from datetime import datetime
from pydantic import BaseModel, Field


class HealthCheckResponse(BaseModel):
    """Schema for API health status verification."""

    status: str = Field(default="healthy", description="Current operational state of the backend service")
    service: str = Field(..., description="Name of the service")
    version: str = Field(..., description="Service semantic version")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC timestamp of the health check")

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "healthy",
                "service": "AI Digital Twin Simulator",
                "version": "0.1.0",
                "timestamp": "2026-10-14T16:00:00Z",
            }
        }
    }
