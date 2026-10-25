import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas.sensor import (
    SensorReading,
    SimulatorAction,
    SimulatorControlRequest,
    SimulatorMode,
)
from app.services.sensor_simulator import SensorDataSimulator, get_sensor_simulator


@pytest.fixture
def clean_simulator():
    """Provides a fresh isolated simulator instance for testing."""
    sim = SensorDataSimulator()
    sim.apply_control(SimulatorControlRequest(action=SimulatorAction.RESET))
    return sim


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    with TestClient(app) as test_client:
        yield test_client


# =============================================================================
# 1. Unit Tests for SensorDataSimulator Physics Engine
# =============================================================================

def test_simulator_initial_state(clean_simulator: SensorDataSimulator):
    """Verify initial baseline values and metadata."""
    reading = clean_simulator.get_latest_reading()
    assert reading.device_id == "SIMOTICS-150KW-01"
    assert reading.mode == SimulatorMode.NORMAL
    assert reading.is_running is True
    assert 58.0 <= reading.temperature <= 78.0
    assert 0.8 <= reading.vibration <= 1.9
    assert 1475.0 <= reading.rpm <= 1498.0


def test_normal_mode_continuity_and_boundedness(clean_simulator: SensorDataSimulator):
    """Verify that in normal mode, readings update continuously within realistic demo ranges without erratic jumps."""
    clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.RESET))
    
    prev_reading = clean_simulator.get_latest_reading()
    readings = []

    for _ in range(25):
        current_reading = clean_simulator.step(dt=0.5)
        readings.append(current_reading)

        # 1. Stay within realistic demo bounds
        assert 55.0 <= current_reading.temperature <= 80.0
        assert 0.7 <= current_reading.vibration <= 2.2
        assert 1470.0 <= current_reading.rpm <= 1505.0

        # 2. Avoid unrealistic leaps between consecutive ticks (thermal inertia & mechanical stability)
        temp_delta = abs(current_reading.temperature - prev_reading.temperature)
        vib_delta = abs(current_reading.vibration - prev_reading.vibration)
        rpm_delta = abs(current_reading.rpm - prev_reading.rpm)

        assert temp_delta < 2.0, f"Temperature jumped unrealistically by {temp_delta}°C"
        assert vib_delta < 1.0, f"Vibration jumped unrealistically by {vib_delta} mm/s"
        assert rpm_delta < 20.0, f"RPM jumped unrealistically by {rpm_delta} RPM"

        prev_reading = current_reading

    # Verify that values continuously vary (not frozen)
    temps = [r.temperature for r in readings]
    vibs = [r.vibration for r in readings]
    assert len(set(temps)) > 1, "Temperature failed to vary continuously"
    assert len(set(vibs)) > 1, "Vibration failed to vary continuously"


def test_fault_mode_simulation_patterns(clean_simulator: SensorDataSimulator):
    """Verify that Fault mode simulates increasing temp, increasing vibration, and decreasing RPM."""
    clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.RESET))
    clean_simulator.apply_control(
        SimulatorControlRequest(action=SimulatorAction.SET_MODE, mode=SimulatorMode.FAULT)
    )

    initial_reading = clean_simulator.get_latest_reading()

    # Step forward 40 intervals in fault mode
    for _ in range(40):
        clean_simulator.step(dt=0.5)

    fault_reading = clean_simulator.get_latest_reading()

    # In fault mode:
    # 1. Temperature should increase significantly above baseline
    assert fault_reading.temperature > initial_reading.temperature + 5.0, (
        f"Expected temperature rise: initial={initial_reading.temperature}, fault={fault_reading.temperature}"
    )

    # 2. Vibration should increase significantly above baseline
    assert fault_reading.vibration > initial_reading.vibration + 1.0, (
        f"Expected vibration rise: initial={initial_reading.vibration}, fault={fault_reading.vibration}"
    )

    # 3. RPM should slip and decrease below nominal baseline
    assert fault_reading.rpm < initial_reading.rpm - 15.0, (
        f"Expected RPM drop: initial={initial_reading.rpm}, fault={fault_reading.rpm}"
    )


def test_simulator_controls_start_pause_reset(clean_simulator: SensorDataSimulator):
    """Test start, pause, and reset controls."""
    # 1. Pause
    state = clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.PAUSE))
    assert state.is_running is False
    reading_paused_1 = clean_simulator.step()
    reading_paused_2 = clean_simulator.step()
    assert reading_paused_1.temperature == reading_paused_2.temperature
    assert reading_paused_1.sequence == reading_paused_2.sequence

    # 2. Start
    state = clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.START))
    assert state.is_running is True
    reading_resumed = clean_simulator.step()
    assert reading_resumed.sequence > reading_paused_2.sequence

    # 3. Reset
    state = clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.RESET))
    assert state.sequence == 0
    assert state.mode == SimulatorMode.NORMAL
    assert state.latest_reading.temperature == clean_simulator.config.temp_baseline
    assert state.latest_reading.vibration == clean_simulator.config.vib_baseline
    assert state.latest_reading.rpm == clean_simulator.config.rpm_baseline


def test_toggle_mode_control(clean_simulator: SensorDataSimulator):
    """Verify toggling between normal and fault modes."""
    assert clean_simulator.mode == SimulatorMode.NORMAL
    state = clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.TOGGLE_MODE))
    assert state.mode == SimulatorMode.FAULT
    state = clean_simulator.apply_control(SimulatorControlRequest(action=SimulatorAction.TOGGLE_MODE))
    assert state.mode == SimulatorMode.NORMAL


# =============================================================================
# 2. Integration Tests for REST and WebSocket Endpoints
# =============================================================================

def test_api_get_latest_sensor_reading(client: TestClient):
    """Test GET /api/v1/sensors/latest."""
    response = client.get("/api/v1/sensors/latest")
    assert response.status_code == 200
    data = response.json()
    assert "device_id" in data
    assert "timestamp" in data
    assert "temperature" in data
    assert "vibration" in data
    assert "rpm" in data
    assert "mode" in data
    assert data["device_id"] == "SIMOTICS-150KW-01"


def test_api_get_simulator_state(client: TestClient):
    """Test GET /api/v1/sensors/state."""
    response = client.get("/api/v1/sensors/state")
    assert response.status_code == 200
    data = response.json()
    assert data["is_running"] is True
    assert data["mode"] in ["normal", "fault"]
    assert "config" in data
    assert "latest_reading" in data


def test_api_get_sensor_history(client: TestClient):
    """Test GET /api/v1/sensors/history."""
    response = client.get("/api/v1/sensors/history?limit=10")
    assert response.status_code == 200
    history = response.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert "temperature" in history[0]

    # Test seconds parameter
    res_sec = client.get("/api/v1/sensors/history?seconds=60&limit=50")
    assert res_sec.status_code == 200
    assert isinstance(res_sec.json(), list)

    # Test boundary limits
    res_large = client.get("/api/v1/sensors/history?limit=500")
    assert res_large.status_code == 200

    # Test invalid limit (0 or negative)
    res_invalid_limit = client.get("/api/v1/sensors/history?limit=0")
    assert res_invalid_limit.status_code == 422

    # Test invalid seconds (0 or negative)
    res_invalid_sec = client.get("/api/v1/sensors/history?seconds=0")
    assert res_invalid_sec.status_code == 422


def test_api_control_simulator_actions(client: TestClient):
    """Test POST /api/v1/sensors/control with pause, start, and reset."""
    # Pause
    res = client.post("/api/v1/sensors/control", json={"action": "pause"})
    assert res.status_code == 200
    assert res.json()["is_running"] is False

    # Start
    res = client.post("/api/v1/sensors/control", json={"action": "start"})
    assert res.status_code == 200
    assert res.json()["is_running"] is True

    # Toggle mode
    res = client.post("/api/v1/sensors/toggle-mode")
    assert res.status_code == 200
    assert res.json()["mode"] in ["normal", "fault"]


def test_websocket_sensor_stream(client: TestClient):
    """Test WebSocket /api/v1/sensors/ws real-time telemetry streaming and control."""
    with client.websocket_connect("/api/v1/sensors/ws") as websocket:
        # Receive initial telemetry packet
        packet = websocket.receive_json()
        assert "temperature" in packet
        assert "vibration" in packet
        assert "rpm" in packet
        assert "device_id" in packet

        # Send control action over WebSocket
        websocket.send_json({"action": "pause"})
        ack = websocket.receive_json()
        assert ack.get("type") == "control_ack"
        assert ack["state"]["is_running"] is False

        # Resume via WebSocket
        websocket.send_json({"action": "start"})
        ack2 = websocket.receive_json()
        assert ack2.get("type") == "control_ack"
        assert ack2["state"]["is_running"] is True


def test_websocket_invalid_control_error_handling(client: TestClient):
    """Test that sending an invalid control action over WebSocket returns error message."""
    with client.websocket_connect("/api/v1/sensors/ws") as websocket:
        _ = websocket.receive_json()
        websocket.send_json({"action": "invalid_unsupported_action"})
        err_msg = websocket.receive_json()
        assert err_msg.get("type") == "error"
        assert "Invalid control payload" in err_msg.get("message", "")


def test_websocket_disconnect_cleanup(client: TestClient):
    """Verify disconnecting WebSocket client cleanly decrements active connections in simulator."""
    sim = get_sensor_simulator()
    initial_conn_count = len(sim._active_connections)
    with client.websocket_connect("/api/v1/sensors/ws"):
        assert len(sim._active_connections) == initial_conn_count + 1
    # After exiting context manager, client is disconnected
    assert len(sim._active_connections) == initial_conn_count


def test_api_control_invalid_action_rejected(client: TestClient):
    """Verify POST /api/v1/sensors/control with invalid action returns 422 Unprocessable Entity."""
    res = client.post("/api/v1/sensors/control", json={"action": "explode_motor"})
    assert res.status_code == 422

