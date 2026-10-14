from pydantic import BaseModel, Field


class AppInfoResponse(BaseModel):
    """Schema for application metadata and stage verification."""

    app_name: str = Field(..., description="Name of the application")
    version: str = Field(..., description="Semantic version of the application")
    stage: str = Field(..., description="Current implementation stage")
    environment: str = Field(..., description="Active runtime environment")
    description: str = Field(..., description="Brief system description")

    model_config = {
        "json_schema_extra": {
            "example": {
                "app_name": "AI Digital Twin Simulator",
                "version": "0.1.0",
                "stage": "Step 1: Project Setup",
                "environment": "development",
                "description": "Industrial motor telemetry simulator and AI digital twin platform",
            }
        }
    }
