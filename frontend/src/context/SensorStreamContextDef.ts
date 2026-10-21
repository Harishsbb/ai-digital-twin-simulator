import { createContext } from 'react'
import type {
  SensorReading,
  SimulatorAction,
  SimulatorMode,
  SimulatorStateResponse,
  TelemetryConnectionStatus,
} from '../types'

export interface SensorStreamContextValue {
  reading: SensorReading | null
  history: SensorReading[]
  simState: SimulatorStateResponse | null
  connectionStatus: TelemetryConnectionStatus
  lastReceivedAt: number | null
  error: string | null
  isSimulatorRunning: boolean
  currentMode: SimulatorMode
  controlSimulator: (action: SimulatorAction, mode?: SimulatorMode) => Promise<void>
  toggleMode: () => Promise<void>
  reconnect: () => void
}

export const SensorStreamContext = createContext<SensorStreamContextValue | null>(null)
