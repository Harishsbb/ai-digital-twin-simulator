import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.db.models import (
    AIPredictionModel,
    AlertRecordModel,
    SensorReadingModel,
    WhatIfExperimentModel,
)
from app.db.session import get_session_factory
from app.schemas.ai import AnomalyPredictionResponse
from app.schemas.sensor import SensorReading

logger = logging.getLogger(__name__)


class SensorRepository:
    """Repository handling database operations for sensor readings."""

    @staticmethod
    def save_reading(db: Session, reading: SensorReading) -> SensorReadingModel:
        model = SensorReadingModel(
            device_id=reading.device_id,
            timestamp=reading.timestamp,
            temperature=reading.temperature,
            vibration=reading.vibration,
            rpm=reading.rpm,
            mode=reading.mode.value if hasattr(reading.mode, "value") else str(reading.mode),
            is_running=reading.is_running,
            sequence=reading.sequence,
        )
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_latest(db: Session, device_id: str) -> Optional[SensorReadingModel]:
        return (
            db.query(SensorReadingModel)
            .filter(SensorReadingModel.device_id == device_id)
            .order_by(desc(SensorReadingModel.timestamp))
            .first()
        )

    @staticmethod
    def get_history(
        db: Session,
        device_id: str,
        limit: int = 100,
        start_time: Optional[datetime] = None,
    ) -> List[SensorReadingModel]:
        query = db.query(SensorReadingModel).filter(SensorReadingModel.device_id == device_id)
        if start_time:
            query = query.filter(SensorReadingModel.timestamp >= start_time)
        return query.order_by(desc(SensorReadingModel.timestamp)).limit(limit).all()


class AIPredictionRepository:
    """Repository handling database operations for Isolation Forest predictions."""

    @staticmethod
    def save_prediction(
        db: Session,
        prediction: AnomalyPredictionResponse,
        source: str = "live_simulator_stream",
    ) -> AIPredictionModel:
        features_dict = (
            prediction.features_evaluated.model_dump()
            if hasattr(prediction.features_evaluated, "model_dump")
            else dict(prediction.features_evaluated)
        )
        diag_dict = (
            prediction.diagnostic_context.model_dump()
            if hasattr(prediction.diagnostic_context, "model_dump")
            else (dict(prediction.diagnostic_context) if prediction.diagnostic_context else None)
        )

        model = AIPredictionModel(
            device_id=prediction.device_id,
            timestamp=prediction.timestamp,
            is_anomaly=prediction.is_anomaly,
            prediction=prediction.prediction,
            anomaly_score=prediction.anomaly_score,
            model_name=prediction.model_name,
            model_version=prediction.model_version,
            source=source,
            features_evaluated=features_dict,
            diagnostic_context=diag_dict,
        )
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_recent(
        db: Session,
        device_id: str,
        limit: int = 50,
        anomalies_only: bool = False,
    ) -> List[AIPredictionModel]:
        query = db.query(AIPredictionModel).filter(AIPredictionModel.device_id == device_id)
        if anomalies_only:
            query = query.filter(AIPredictionModel.is_anomaly.is_(True))
        return query.order_by(desc(AIPredictionModel.timestamp)).limit(limit).all()


class AlertRepository:
    """Repository handling real alert storage and operator acknowledgments."""

    @staticmethod
    def save_alert(db: Session, alert_data: Dict[str, Any]) -> AlertRecordModel:
        model = AlertRecordModel(
            id=alert_data["id"],
            episode_id=alert_data["episode_id"],
            device_id=alert_data.get("device_id", "SIMOTICS-150KW-01"),
            alert_type=alert_data.get("alert_type", "ANOMALY_DETECTED"),
            severity=alert_data.get("severity", "warning"),
            title=alert_data["title"],
            message=alert_data["message"],
            status=alert_data.get("status", "active"),
            timestamp=alert_data.get("timestamp", datetime.utcnow()),
            anomaly_score=alert_data.get("anomaly_score"),
            sensor_snapshot=alert_data.get("sensor_snapshot", {}),
        )
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_alerts(
        db: Session,
        device_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
    ) -> List[AlertRecordModel]:
        query = db.query(AlertRecordModel)
        if device_id:
            query = query.filter(AlertRecordModel.device_id == device_id)
        if status:
            query = query.filter(AlertRecordModel.status == status)
        return query.order_by(desc(AlertRecordModel.timestamp)).limit(limit).all()

    @staticmethod
    def acknowledge_alert(
        db: Session,
        alert_id: str,
        acknowledged_by: Optional[str] = None,
    ) -> Optional[AlertRecordModel]:
        alert = db.query(AlertRecordModel).filter(AlertRecordModel.id == alert_id).first()
        if alert:
            alert.status = "acknowledged"
            alert.acknowledged_at = datetime.utcnow()
            alert.acknowledged_by = acknowledged_by or "operator"
            db.commit()
            db.refresh(alert)
        return alert

    @staticmethod
    def dismiss_alert(db: Session, alert_id: str) -> Optional[AlertRecordModel]:
        alert = db.query(AlertRecordModel).filter(AlertRecordModel.id == alert_id).first()
        if alert:
            alert.status = "dismissed"
            alert.dismissed_at = datetime.utcnow()
            db.commit()
            db.refresh(alert)
        return alert


class WhatIfRepository:
    """Repository handling What-If simulation experiment persistence."""

    @staticmethod
    def save_experiment(db: Session, exp_data: Dict[str, Any]) -> WhatIfExperimentModel:
        model = WhatIfExperimentModel(
            id=exp_data["id"],
            name=exp_data.get("name", "Hypothetical Scenario"),
            timestamp=exp_data.get("timestamp", datetime.utcnow()),
            temperature=exp_data["temperature"],
            vibration=exp_data["vibration"],
            rpm=exp_data["rpm"],
            is_anomaly=exp_data["is_anomaly"],
            prediction=exp_data["prediction"],
            anomaly_score=exp_data["anomaly_score"],
            baseline_snapshot=exp_data.get("baseline_snapshot"),
        )
        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_experiments(db: Session, limit: int = 20) -> List[WhatIfExperimentModel]:
        return (
            db.query(WhatIfExperimentModel)
            .order_by(desc(WhatIfExperimentModel.timestamp))
            .limit(limit)
            .all()
        )

    @staticmethod
    def delete_experiment(db: Session, exp_id: str) -> bool:
        exp = db.query(WhatIfExperimentModel).filter(WhatIfExperimentModel.id == exp_id).first()
        if exp:
            db.delete(exp)
            db.commit()
            return True
        return False


# =============================================================================
# Non-Blocking Background Persistence Manager
# =============================================================================

class AsyncPersistenceManager:
    """Dispatches database writes to background executor tasks to prevent blocking

    the real-time WebSocket telemetry stream.
    """

    @staticmethod
    def _sync_save_reading(reading: SensorReading):
        factory = get_session_factory()
        if factory is None:
            return
        db = factory()
        try:
            SensorRepository.save_reading(db, reading)
        except Exception as err:
            logger.warning(f"Background persistence of sensor reading failed: {err}")
        finally:
            db.close()

    @staticmethod
    def _sync_save_prediction(prediction: AnomalyPredictionResponse, source: str):
        factory = get_session_factory()
        if factory is None:
            return
        db = factory()
        try:
            AIPredictionRepository.save_prediction(db, prediction, source=source)
        except Exception as err:
            logger.warning(f"Background persistence of AI prediction failed: {err}")
        finally:
            db.close()

    @classmethod
    def schedule_reading_persistence(cls, reading: SensorReading):
        """Schedule non-blocking write of a sensor reading."""
        try:
            loop = asyncio.get_running_loop()
            loop.run_in_executor(None, cls._sync_save_reading, reading)
        except RuntimeError:
            # Fallback if called outside active event loop
            pass

    @classmethod
    def schedule_prediction_persistence(cls, prediction: AnomalyPredictionResponse, source: str):
        """Schedule non-blocking write of an AI anomaly prediction."""
        try:
            loop = asyncio.get_running_loop()
            loop.run_in_executor(None, cls._sync_save_prediction, prediction, source)
        except RuntimeError:
            pass
