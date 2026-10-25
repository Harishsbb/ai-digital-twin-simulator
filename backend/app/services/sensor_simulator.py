import asyncio
import logging
import math
import random
import time
from collections import deque
from datetime import datetime, timezone
from typing import Deque, List, Optional, Set
from fastapi import WebSocket, WebSocketDisconnect

from app.schemas.sensor import (
    SensorReading,
    SimulatorAction,
    SimulatorConfig,
    SimulatorControlRequest,
    SimulatorMode,
    SimulatorStateResponse,
)

logger = logging.getLogger(__name__)


class SensorDataSimulator:
    """Industrial Electric Motor Sensor Telemetry Simulation Engine.
    
    Generates realistic, physically-sound sensor telemetry (Temperature, Vibration, RPM)
    for a high-voltage induction motor with continuous mean-reverting stochastic dynamics
    in Normal mode, and progressive degradation patterns in Fault mode.
    """

    def __init__(self, config: Optional[SimulatorConfig] = None):
        self.config = config or SimulatorConfig()
        self.mode = SimulatorMode.NORMAL
        self.is_running = True
        self.sequence = 0
        self.start_time = time.time()
        self._task: Optional[asyncio.Task] = None
        self._lock = asyncio.Lock()

        # Physical state variables
        self._temperature = self.config.temp_baseline
        self._vibration = self.config.vib_baseline
        self._rpm = self.config.rpm_baseline

        # Fault progression tracker (0.0 to 1.0)
        self._fault_intensity = 0.0

        # Circular buffer for historical telemetry (500 items = ~4.1 minutes at 0.5s intervals)
        self._history: Deque[SensorReading] = deque(maxlen=500)

        # Active WebSocket subscribers
        self._active_connections: Set[WebSocket] = set()

        # Seed initial reading
        initial_reading = self._create_reading()
        self._history.append(initial_reading)

    def _create_reading(self) -> SensorReading:
        """Construct a validated snapshot reading packet."""
        return SensorReading(
            device_id=self.config.device_id,
            timestamp=datetime.now(timezone.utc),
            temperature=round(self._temperature, 2),
            vibration=round(self._vibration, 2),
            rpm=round(self._rpm, 1),
            mode=self.mode,
            is_running=self.is_running,
            sequence=self.sequence,
        )

    def step(self, dt: Optional[float] = None) -> SensorReading:
        """Advance the physics simulation by one time step."""
        delta = dt if dt is not None else self.config.update_interval_sec

        if not self.is_running:
            return self._create_reading()

        self.sequence += 1

        if self.mode == SimulatorMode.FAULT:
            # Advance fault degradation intensity smoothly towards 1.0
            self._fault_intensity = min(1.0, self._fault_intensity + (0.035 * delta))

            # Target values under full fault
            temp_target = self.config.temp_fault_target
            vib_target = self.config.vib_fault_target
            rpm_target = self.config.rpm_fault_target

            # 1. Temperature: Progressive thermal buildup with exponential lag
            thermal_rate = 1.2 * delta
            noise_temp = random.gauss(0, 0.15)
            self._temperature += ((temp_target - self._temperature) * 0.08 * delta) + (thermal_rate * self._fault_intensity) + noise_temp
            self._temperature = min(self._temperature, 145.0)

            # 2. Vibration: Bearing spall impacts & rotational unbalance with growing stochastic spikes
            vib_drift = (vib_target - self._vibration) * 0.15 * delta
            vib_burst = (random.random() ** 3) * 0.8 * self._fault_intensity
            noise_vib = random.gauss(0, 0.12 * (1.0 + self._fault_intensity))
            self._vibration += vib_drift + vib_burst + noise_vib
            self._vibration = max(0.2, min(self._vibration, 14.0))

            # 3. RPM: Slip degradation under load/thermal stress
            rpm_drift = (rpm_target - self._rpm) * 0.12 * delta
            noise_rpm = random.gauss(0, 4.5 * (1.0 + self._fault_intensity * 0.5))
            self._rpm += rpm_drift + noise_rpm
            self._rpm = max(800.0, min(self._rpm, 1520.0))

        else:
            # Normal Mode: Smooth mean-reverting Ornstein-Uhlenbeck process
            # Recede any lingering fault intensity back to 0.0
            if self._fault_intensity > 0:
                self._fault_intensity = max(0.0, self._fault_intensity - (0.08 * delta))

            # 1. Temperature: Thermal equilibrium around baseline with smooth drift
            theta_temp = 0.05
            sigma_temp = 0.06
            self._temperature += theta_temp * (self.config.temp_baseline - self._temperature) * delta + random.gauss(0, sigma_temp * math.sqrt(delta))
            self._temperature = max(self.config.temp_normal_min, min(self.config.temp_normal_max, self._temperature))

            # 2. Vibration: Mild harmonic ripple + Gaussian micro-noise (ISO Zone A)
            theta_vib = 0.25
            sigma_vib = 0.04
            harmonic = 0.05 * math.sin(time.time() * 2.5)
            self._vibration += theta_vib * (self.config.vib_baseline + harmonic - self._vibration) * delta + random.gauss(0, sigma_vib * math.sqrt(delta))
            self._vibration = max(self.config.vib_normal_min, min(self.config.vib_normal_max, self._vibration))

            # 3. RPM: Electrical line frequency (50 Hz / 1488 RPM) with subtle mechanical inertia flutter
            theta_rpm = 0.35
            sigma_rpm = 1.2
            self._rpm += theta_rpm * (self.config.rpm_baseline - self._rpm) * delta + random.gauss(0, sigma_rpm * math.sqrt(delta))
            self._rpm = max(self.config.rpm_normal_min, min(self.config.rpm_normal_max, self._rpm))

        reading = self._create_reading()
        self._history.append(reading)
        return reading

    def get_latest_reading(self) -> SensorReading:
        """Return the most recent telemetry packet."""
        if self._history:
            return self._history[-1]
        return self._create_reading()

    def get_history(self, limit: int = 50, seconds: Optional[int] = None) -> List[SensorReading]:
        """Return a chronological slice of historical telemetry readings, optionally filtered by recent seconds."""
        readings = list(self._history)
        if seconds is not None and seconds > 0:
            now = datetime.now(timezone.utc)
            readings = [r for r in readings if (now - r.timestamp).total_seconds() <= seconds]

        if not readings:
            return []

        effective_limit = max(1, min(limit, len(readings)))
        return readings[-effective_limit:]

    def get_state(self) -> SimulatorStateResponse:
        """Inspect the current operational state of the simulator."""
        return SimulatorStateResponse(
            device_id=self.config.device_id,
            is_running=self.is_running,
            mode=self.mode,
            sequence=self.sequence,
            uptime_seconds=round(time.time() - self.start_time, 1),
            connected_clients=len(self._active_connections),
            latest_reading=self.get_latest_reading(),
            config=self.config,
        )

    def apply_control(self, request: SimulatorControlRequest) -> SimulatorStateResponse:
        """Execute a control directive (start, pause, reset, toggle_mode, set_mode)."""
        action = request.action

        if action == SimulatorAction.START:
            self.is_running = True
            logger.info("Sensor simulator resumed.")

        elif action == SimulatorAction.PAUSE:
            self.is_running = False
            logger.info("Sensor simulator paused.")

        elif action == SimulatorAction.RESET:
            self._temperature = self.config.temp_baseline
            self._vibration = self.config.vib_baseline
            self._rpm = self.config.rpm_baseline
            self._fault_intensity = 0.0
            self.mode = SimulatorMode.NORMAL
            self.is_running = True
            self.sequence = 0
            self.start_time = time.time()
            self._history.clear()
            self._history.append(self._create_reading())
            logger.info("Sensor simulator reset to nominal baseline.")

        elif action == SimulatorAction.TOGGLE_MODE:
            self.mode = SimulatorMode.FAULT if self.mode == SimulatorMode.NORMAL else SimulatorMode.NORMAL
            logger.info(f"Sensor simulator mode toggled to: {self.mode}")

        elif action == SimulatorAction.SET_MODE:
            if request.mode:
                self.mode = request.mode
                logger.info(f"Sensor simulator mode set to: {self.mode}")

        return self.get_state()

    # =========================================================================
    # WebSocket Client Connection Management & Background Broadcasting
    # =========================================================================

    async def connect_client(self, websocket: WebSocket):
        """Register a new incoming WebSocket subscriber and send initial state."""
        await websocket.accept()
        self._active_connections.add(websocket)
        logger.info(f"WebSocket client connected. Active connections: {len(self._active_connections)}")

        # Send immediate initial reading on connect
        try:
            initial = self.get_latest_reading().model_dump(mode="json")
            await websocket.send_json(initial)
        except Exception as err:
            logger.warning(f"Failed to send initial packet to WebSocket client: {err}")

    def disconnect_client(self, websocket: WebSocket):
        """Remove a disconnected client from the active subscriber pool."""
        self._active_connections.discard(websocket)
        logger.info(f"WebSocket client disconnected. Active connections: {len(self._active_connections)}")

    async def broadcast(self, reading: SensorReading):
        """Publish a sensor reading to all registered WebSocket clients."""
        if not self._active_connections:
            return

        payload = reading.model_dump(mode="json")
        stale_clients = []

        for ws in self._active_connections:
            try:
                await ws.send_json(payload)
            except (WebSocketDisconnect, RuntimeError):
                stale_clients.append(ws)
            except Exception as err:
                logger.warning(f"Error streaming to WebSocket client: {err}")
                stale_clients.append(ws)

        for stale in stale_clients:
            self._active_connections.discard(stale)

    async def _run_loop(self):
        """Continuous background event loop ticker."""
        logger.info("Sensor simulator background ticker started.")
        while True:
            try:
                reading = self.step()
                await self.broadcast(reading)
                await asyncio.sleep(self.config.update_interval_sec)
            except asyncio.CancelledError:
                logger.info("Sensor simulator background ticker cancelled.")
                break
            except Exception as err:
                logger.error(f"Unexpected error in sensor simulator tick: {err}", exc_info=True)
                await asyncio.sleep(self.config.update_interval_sec)

    def start_background_task(self, loop: Optional[asyncio.AbstractEventLoop] = None):
        """Spawn the asynchronous background telemetry runner."""
        if self._task is None or self._task.done():
            self._task = asyncio.create_task(self._run_loop())
            logger.info("Sensor simulator background task spawned.")

    def stop_background_task(self):
        """Cancel and clean up the background telemetry runner."""
        if self._task and not self._task.done():
            self._task.cancel()
            self._task = None
            logger.info("Sensor simulator background task stopped.")


# Module-level singleton instance
_simulator_instance: Optional[SensorDataSimulator] = None


def get_sensor_simulator() -> SensorDataSimulator:
    """Dependency provider / singleton accessor for the sensor simulator."""
    global _simulator_instance
    if _simulator_instance is None:
        _simulator_instance = SensorDataSimulator()
    return _simulator_instance
