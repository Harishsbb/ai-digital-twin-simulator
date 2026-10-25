"""Initial schema for AI Digital Twin Simulator (Step 12).

Creates tables:
1. sensor_readings
2. ai_predictions
3. alert_records
4. whatif_experiments

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-10-25 10:40:00.000000
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. sensor_readings table
    op.create_table(
        "sensor_readings",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.String(length=64), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("vibration", sa.Float(), nullable=False),
        sa.Column("rpm", sa.Float(), nullable=False),
        sa.Column("mode", sa.String(length=32), nullable=False, server_default="normal"),
        sa.Column("is_running", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("sequence", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_sensor_readings_device_id", "sensor_readings", ["device_id"], unique=False)
    op.create_index("ix_sensor_readings_timestamp", "sensor_readings", ["timestamp"], unique=False)
    op.create_index("ix_sensor_readings_sequence", "sensor_readings", ["sequence"], unique=False)
    op.create_index("ix_sensor_readings_device_time", "sensor_readings", ["device_id", "timestamp"], unique=False)
    op.create_index("ix_sensor_readings_seq_device", "sensor_readings", ["device_id", "sequence"], unique=False)

    # 2. ai_predictions table
    op.create_table(
        "ai_predictions",
        sa.Column("id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("device_id", sa.String(length=64), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_anomaly", sa.Boolean(), nullable=False),
        sa.Column("prediction", sa.Integer(), nullable=False),
        sa.Column("anomaly_score", sa.Float(), nullable=False),
        sa.Column("model_name", sa.String(length=64), nullable=False),
        sa.Column("model_version", sa.String(length=32), nullable=False),
        sa.Column("source", sa.String(length=64), nullable=False),
        sa.Column("features_evaluated", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("diagnostic_context", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_predictions_device_id", "ai_predictions", ["device_id"], unique=False)
    op.create_index("ix_ai_predictions_timestamp", "ai_predictions", ["timestamp"], unique=False)
    op.create_index("ix_ai_predictions_is_anomaly", "ai_predictions", ["is_anomaly"], unique=False)
    op.create_index("ix_ai_predictions_source", "ai_predictions", ["source"], unique=False)
    op.create_index("ix_ai_predictions_device_anomaly", "ai_predictions", ["device_id", "is_anomaly", "timestamp"], unique=False)

    # 3. alert_records table
    op.create_table(
        "alert_records",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("episode_id", sa.String(length=64), nullable=False),
        sa.Column("device_id", sa.String(length=64), nullable=False),
        sa.Column("alert_type", sa.String(length=64), nullable=False),
        sa.Column("severity", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="active"),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("acknowledged_by", sa.String(length=128), nullable=True),
        sa.Column("dismissed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("anomaly_score", sa.Float(), nullable=True),
        sa.Column("sensor_snapshot", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_alert_records_episode_id", "alert_records", ["episode_id"], unique=False)
    op.create_index("ix_alert_records_device_id", "alert_records", ["device_id"], unique=False)
    op.create_index("ix_alert_records_severity", "alert_records", ["severity"], unique=False)
    op.create_index("ix_alert_records_status", "alert_records", ["status"], unique=False)
    op.create_index("ix_alert_records_timestamp", "alert_records", ["timestamp"], unique=False)
    op.create_index("ix_alert_records_status_time", "alert_records", ["status", "timestamp"], unique=False)
    op.create_index("ix_alert_records_device_status", "alert_records", ["device_id", "status"], unique=False)

    # 4. whatif_experiments table
    op.create_table(
        "whatif_experiments",
        sa.Column("id", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("temperature", sa.Float(), nullable=False),
        sa.Column("vibration", sa.Float(), nullable=False),
        sa.Column("rpm", sa.Float(), nullable=False),
        sa.Column("is_anomaly", sa.Boolean(), nullable=False),
        sa.Column("prediction", sa.Integer(), nullable=False),
        sa.Column("anomaly_score", sa.Float(), nullable=False),
        sa.Column("baseline_snapshot", sa.JSON().with_variant(postgresql.JSONB(), "postgresql"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_whatif_experiments_timestamp", "whatif_experiments", ["timestamp"], unique=False)
    op.create_index("ix_whatif_experiments_is_anomaly", "whatif_experiments", ["is_anomaly"], unique=False)


def downgrade() -> None:
    op.drop_table("whatif_experiments")
    op.drop_table("alert_records")
    op.drop_table("ai_predictions")
    op.drop_table("sensor_readings")
