import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from app.schemas.sensor import (
    SensorReading,
    SimulatorAction,
    SimulatorControlRequest,
    SimulatorMode,
    SimulatorStateResponse,
)
from app.services.sensor_simulator import SensorDataSimulator, get_sensor_simulator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/sensors", tags=["Sensors & Telemetry"])


@router.get(
    "/latest",
    response_model=SensorReading,
    summary="Get latest motor sensor reading",
    description="Retrieve the most recent synthetic telemetry packet (Temperature, Vibration, RPM, timestamp).",
)
async def get_latest_reading(
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
) -> SensorReading:
    """Retrieve point-in-time sensor values."""
    return simulator.get_latest_reading()


@router.get(
    "/state",
    response_model=SimulatorStateResponse,
    summary="Get simulator status and metadata",
    description="Inspect whether the simulator is running, active mode (normal/fault), sequence, uptime, and configuration.",
)
async def get_simulator_state(
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
) -> SimulatorStateResponse:
    """Inspect simulator state."""
    return simulator.get_state()


@router.get(
    "/history",
    response_model=List[SensorReading],
    summary="Get recent sensor readings history",
    description="Retrieve a chronological window of recent telemetry readings for charts and sparklines.",
)
async def get_sensor_history(
    limit: int = Query(default=50, ge=1, le=200, description="Number of recent data points to return"),
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
) -> List[SensorReading]:
    """Retrieve historical telemetry data points."""
    return simulator.get_history(limit=limit)


@router.post(
    "/control",
    response_model=SimulatorStateResponse,
    summary="Control sensor simulator runtime",
    description="Execute runtime commands: start, pause, reset, toggle_mode, or set_mode.",
)
async def control_simulator(
    request: SimulatorControlRequest,
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
) -> SimulatorStateResponse:
    """Apply start, pause, reset, or mode toggle commands to the simulator."""
    return simulator.apply_control(request)


@router.post(
    "/toggle-mode",
    response_model=SimulatorStateResponse,
    summary="Quick toggle between Normal and Fault mode",
    description="Convenience shortcut to toggle simulator between Normal and Fault modes.",
)
async def toggle_simulator_mode(
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
) -> SimulatorStateResponse:
    """Toggle between Normal and Fault modes."""
    return simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.TOGGLE_MODE))


# =============================================================================
# WebSocket Real-Time Telemetry Streaming Endpoint
# =============================================================================

@router.websocket("/ws")
@router.websocket("/stream")
async def websocket_sensor_stream(
    websocket: WebSocket,
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
):
    """Full-duplex WebSocket stream broadcasting continuous motor sensor readings.
    
    Connected clients receive real-time JSON packets. Clients may also send control
    messages such as `{"action": "toggle_mode"}` or `{"action": "pause"}`.
    """
    await simulator.connect_client(websocket)
    try:
        while True:
            # Listen for client control commands or keepalive pings
            data = await websocket.receive_json()
            if isinstance(data, dict) and "action" in data:
                try:
                    action = SimulatorAction(data["action"])
                    mode = SimulatorMode(data["mode"]) if "mode" in data and data["mode"] else None
                    req = SimulatorControlRequest(action=action, mode=mode)
                    updated_state = simulator.apply_control(req)
                    await websocket.send_json({
                        "type": "control_ack",
                        "state": updated_state.model_dump(mode="json"),
                    })
                except Exception as err:
                    await websocket.send_json({
                        "type": "error",
                        "message": f"Invalid control payload: {err}",
                    })
    except WebSocketDisconnect:
        simulator.disconnect_client(websocket)
    except Exception as err:
        logger.warning(f"WebSocket client session terminated: {err}")
        simulator.disconnect_client(websocket)
