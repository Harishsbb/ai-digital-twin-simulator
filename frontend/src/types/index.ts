import type { LucideIcon } from 'lucide-react'

export interface BackendHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy'
  service: string
  timestamp: string
  version?: string
}

export interface BackendAppInfoResponse {
  app_name: string
  version: string
  stage: string
  environment: string
  description?: string
}

export interface NavItem {
  name: string
  path: string
  icon: LucideIcon
  badge?: string
  description: string
}

export type MachineStatus = 'Operational' | 'Standby' | 'Maintenance' | 'Offline'

export interface MachineMetadata {
  id: string
  name: string
  model: string
  manufacturer: string
  powerRating: string
  ratedVoltage: string
  ratedRPM: string
  status: MachineStatus
  facilityLocation: string
}

// 3D Digital Twin Visualizer Types (Step 2 & 3D Exploded View)
export type TwinVisualStatus = 'Normal' | 'Warning' | 'Critical'

export type TwinViewMode = 'assembled' | 'exploded' | 'xray' | 'section'

export interface TwinViewOptions {
  autoRotate: boolean
  wireframe: boolean
  showSensors: boolean
  explodedView: boolean
  viewMode: TwinViewMode
  showLabels: boolean
  rotationSpeed: number
}

export interface MotorComponentMetadata {
  id: string
  name: string
  shortName: string
  subtitle: string
  functionDesc: string
  material: string
  status: TwinVisualStatus
  temperatureRating: string
  notes: string
  anchorPosition: [number, number, number]
  labelOffset: [number, number, number]
  orderIndex: number
  previewImage?: string
}

export interface TwinComponentInfo {
  id: string
  name: string
  code: string
  description: string
  status: TwinVisualStatus
  nominalSpec: string
}

// ============================================================================
// Step 5: Sensor Data Simulator Types
// ============================================================================
export type SimulatorMode = 'normal' | 'fault'

export type SimulatorAction = 'start' | 'pause' | 'reset' | 'toggle_mode' | 'set_mode'

export interface SensorReading {
  device_id: string
  timestamp: string
  temperature: number
  vibration: number
  rpm: number
  mode: SimulatorMode
  is_running: boolean
  sequence: number
}

export interface SimulatorConfig {
  device_id: string
  update_interval_sec: number
  temp_baseline: number
  temp_normal_min: number
  temp_normal_max: number
  vib_baseline: number
  vib_normal_min: number
  vib_normal_max: number
  rpm_baseline: number
  rpm_normal_min: number
  rpm_normal_max: number
  temp_fault_target: number
  vib_fault_target: number
  rpm_fault_target: number
}

export interface SimulatorStateResponse {
  device_id: string
  is_running: boolean
  mode: SimulatorMode
  sequence: number
  uptime_seconds: number
  connected_clients: number
  latest_reading: SensorReading
  config: SimulatorConfig
}

