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

// 3D Digital Twin Visualizer Types (Step 2)
export type TwinVisualStatus = 'Normal' | 'Warning' | 'Critical'

export interface TwinViewOptions {
  autoRotate: boolean
  wireframe: boolean
  showSensors: boolean
  explodedView: boolean
  rotationSpeed: number
}

export interface TwinComponentInfo {
  id: string
  name: string
  code: string
  description: string
  status: TwinVisualStatus
  nominalSpec: string
}
