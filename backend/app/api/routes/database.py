import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.repositories import AlertRepository, WhatIfRepository
from app.db.session import check_db_connection, get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/db", tags=["Database & Persistence"])


class DatabaseHealthResponse(BaseModel):
    """Database connectivity and session pooler status."""

    status: str = Field(..., description="Operational status: 'connected', 'disconnected', or 'not_configured'")
    connected: bool = Field(..., description="True if a live ping query succeeded")
    database_type: str = Field(default="Supabase PostgreSQL (Session Pooler)")
    host: str = Field(...)
    port: int = Field(...)
    database: str = Field(...)
    masked_url: str = Field(...)
    latency_ms: Optional[float] = Field(default=None)
    tables_registered: List[str] = Field(
        default_factory=lambda: [
            "sensor_readings",
            "ai_predictions",
            "alert_records",
            "whatif_experiments",
        ]
    )
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error: Optional[str] = Field(default=None)


class AlertCreateInput(BaseModel):
    id: str
    episode_id: str
    device_id: str = "SIMOTICS-150KW-01"
    alert_type: str = "ANOMALY_DETECTED"
    severity: str = "warning"
    title: str
    message: str
    status: str = "active"
    anomaly_score: Optional[float] = None
    sensor_snapshot: Dict[str, Any] = Field(default_factory=dict)


class AlertAcknowledgeInput(BaseModel):
    acknowledged_by: Optional[str] = "operator"


class WhatIfExperimentCreateInput(BaseModel):
    id: str
    name: str
    temperature: float
    vibration: float
    rpm: float
    is_anomaly: bool
    prediction: int
    anomaly_score: float
    baseline_snapshot: Optional[Dict[str, Any]] = None


@router.get(
    "/health",
    response_model=DatabaseHealthResponse,
    summary="Check Supabase PostgreSQL Database Connectivity",
    description="Inspect connection pool liveness and ping latency to the Supabase PostgreSQL session pooler.",
)
async def get_database_health(settings: Settings = Depends(get_settings)) -> DatabaseHealthResponse:
    """Perform a ping against the database and report health metrics."""
    res = check_db_connection()
    return DatabaseHealthResponse(
        status=res["status"],
        connected=res["connected"],
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
        masked_url=res["database_url"],
        latency_ms=res["latency_ms"],
        error=res["error"],
    )


# =============================================================================
# Alert Persistence Endpoints
# =============================================================================

@router.get("/alerts", summary="Get stored alert records")
async def get_stored_alerts(
    device_id: Optional[str] = None,
    alert_status: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, ge=1, le=200),
    db: Optional[Session] = Depends(get_db),
):
    """Retrieve historical alert records from database if connected."""
    if db is None:
        return {"alerts": [], "persisted": False, "message": "Database not configured; running in in-memory mode"}
    alerts = AlertRepository.get_alerts(db, device_id=device_id, status=alert_status, limit=limit)
    return {"alerts": [a.to_dict() for a in alerts], "persisted": True}


@router.post("/alerts", status_code=status.HTTP_201_CREATED, summary="Persist an operational alert")
async def create_alert_record(
    payload: AlertCreateInput,
    db: Optional[Session] = Depends(get_db),
):
    """Store a newly dispatched real-time alert record."""
    if db is None:
        return {"persisted": False, "message": "Database not configured; alert stored in frontend state only"}
    alert = AlertRepository.save_alert(db, payload.model_dump())
    return {"alert": alert.to_dict(), "persisted": True}


@router.patch("/alerts/{alert_id}/acknowledge", summary="Acknowledge an alert")
async def acknowledge_alert(
    alert_id: str,
    payload: Optional[AlertAcknowledgeInput] = None,
    db: Optional[Session] = Depends(get_db),
):
    """Mark an alert record as acknowledged."""
    if db is None:
        return {"persisted": False, "message": "Database not configured"}
    ack_by = payload.acknowledged_by if payload else "operator"
    alert = AlertRepository.acknowledge_alert(db, alert_id=alert_id, acknowledged_by=ack_by)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"alert": alert.to_dict(), "persisted": True}


@router.patch("/alerts/{alert_id}/dismiss", summary="Dismiss an alert")
async def dismiss_alert(
    alert_id: str,
    db: Optional[Session] = Depends(get_db),
):
    """Mark an alert record as dismissed."""
    if db is None:
        return {"persisted": False, "message": "Database not configured"}
    alert = AlertRepository.dismiss_alert(db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return {"alert": alert.to_dict(), "persisted": True}


# =============================================================================
# What-If Experiment Persistence Endpoints
# =============================================================================

@router.get("/whatif/experiments", summary="Get stored What-If experiments")
async def get_stored_whatif_experiments(
    limit: int = Query(20, ge=1, le=100),
    db: Optional[Session] = Depends(get_db),
):
    """Retrieve saved What-If simulation experiments."""
    if db is None:
        return {"experiments": [], "persisted": False, "message": "Database not configured; running in in-memory mode"}
    exps = WhatIfRepository.get_experiments(db, limit=limit)
    return {"experiments": [e.to_dict() for e in exps], "persisted": True}


@router.post("/whatif/experiments", status_code=status.HTTP_201_CREATED, summary="Persist a What-If experiment")
async def create_whatif_experiment(
    payload: WhatIfExperimentCreateInput,
    db: Optional[Session] = Depends(get_db),
):
    """Store an evaluated What-If simulation experiment record."""
    if db is None:
        return {"persisted": False, "message": "Database not configured; experiment stored in session state"}
    exp = WhatIfRepository.save_experiment(db, payload.model_dump())
    return {"experiment": exp.to_dict(), "persisted": True}


@router.delete("/whatif/experiments/{exp_id}", summary="Delete a What-If experiment")
async def delete_whatif_experiment(
    exp_id: str,
    db: Optional[Session] = Depends(get_db),
):
    """Delete a stored What-If simulation experiment."""
    if db is None:
        return {"persisted": False, "message": "Database not configured"}
    deleted = WhatIfRepository.delete_experiment(db, exp_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Experiment {exp_id} not found")
    return {"deleted": True, "persisted": True}
