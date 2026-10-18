from datetime import datetime, timezone
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field


class SimulatorMode(str, Enum):
    NORMAL = "normal"
    FAULT = "fault"


class SimulatorAction(str, Enum):
    START = "start"
    PAUSE = "pause"
    RESET = "reset"
    TOGGLE_MODE = "toggle_mode"
    SET_MODE = "set_mode"


class SensorReading(BaseModel):
    """Point-in-time multi-channel sensor telemetry packet."""
    device_id: str = Field(
        default="SIMOTICS-150KW-01",
        description="Unique industrial equipment asset identifier",
        examples=["SIMOTICS-150KW-01"],
    )
    timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        description="ISO 8601 UTC timestamp of telemetry capture",
    )
    temperature: float = Field(
        ...,
        description="Stator winding temperature in degrees Celsius (°C)",
        examples=[68.4],
    )
    vibration: float = Field(
        ...,
        description="Drive-end bearing overall vibration velocity in mm/s RMS (ISO 10816)",
        examples=[1.24],
    )
    rpm: float = Field(
        ...,
        description="Shaft rotational speed in revolutions per minute (RPM)",
        examples=[1488.2],
    )
    mode: SimulatorMode = Field(
        default=SimulatorMode.NORMAL,
        description="Current simulator operating scenario: normal vs fault",
    )
    is_running: bool = Field(
        default=True,
        description="Whether the simulator background ticker is actively generating readings",
    )
    sequence: int = Field(
        default=0,
        description="Monotonically increasing packet sequence counter",
    )


class SimulatorConfig(BaseModel):
    """Configurable physical limits and baseline operating parameters for simulation."""
    device_id: str = "SIMOTICS-150KW-01"
    update_interval_sec: float = Field(default=0.5, ge=0.05, le=5.0)

    # Normal Operating Bounds (Siemens Simotics 150 kW 4-pole 50Hz Induction Motor)
    temp_baseline: float = 68.0
    temp_normal_min: float = 58.0
    temp_normal_max: float = 78.0

    vib_baseline: float = 1.2
    vib_normal_min: float = 0.8
    vib_normal_max: float = 1.9

    rpm_baseline: float = 1488.0
    rpm_normal_min: float = 1478.0
    rpm_normal_max: float = 1496.0

    # Fault Degradation Targets (Simulates bearing defect, airflow fin blockage, and rotor slip)
    temp_fault_target: float = 118.0
    vib_fault_target: float = 7.4
    rpm_fault_target: float = 1240.0


class SimulatorControlRequest(BaseModel):
    """Control payload for adjusting simulator runtime state."""
    action: SimulatorAction = Field(
        ...,
        description="Control verb: start, pause, reset, toggle_mode, set_mode",
    )
    mode: Optional[SimulatorMode] = Field(
        default=None,
        description="Target operating mode when action is 'set_mode'",
    )


class SimulatorStateResponse(BaseModel):
    """System status and inspection response for the simulator subsystem."""
    device_id: str
    is_running: bool
    mode: SimulatorMode
    sequence: int
    uptime_seconds: float
    connected_clients: int
    latest_reading: SensorReading
    config: SimulatorConfig
