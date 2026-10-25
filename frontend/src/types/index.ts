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

// Step 6: Live 3D Twin Telemetry Types
export type TelemetryConnectionStatus = 'Connected' | 'Disconnected' | 'Stale Data'

export interface LiveMotorTelemetry {
  rpm: number
  vibration: number
  temperature: number
  isRunning: boolean
  mode: SimulatorMode
  timestamp: string
}

// ============================================================================
// Step 7: AI Anomaly Detection Types
// ============================================================================
export interface DiagnosticContext {
  summary: string
  deviations: string[]
  inlier_status: string
}

export interface AnomalyPredictionInput {
  temperature: number
  vibration: number
  rpm: number
  device_id?: string
  timestamp?: string
}

export interface AnomalyPredictionResponse {
  device_id: string
  timestamp: string
  is_anomaly: boolean
  prediction: number // 1 for inlier, -1 for anomaly
  anomaly_score: number
  model_name: string
  model_version: string
  source: string
  features_evaluated: {
    temperature: number
    vibration: number
    rpm: number
  }
  diagnostic_context: DiagnosticContext
}

export interface AIModelStatusResponse {
  model_loaded: boolean
  status: 'ready' | 'not_loaded' | 'degraded'
  model_name: string
  model_version: string
  algorithm: string
  features: string[]
  feature_units: Record<string, string>
  training_sample_count?: number
  contamination?: number
  trained_at?: string
}

export interface AIModelMetricsResponse {
  model_name: string
  model_version: string
  evaluation_summary: {
    evaluation_sample_count: number
    normal_sample_count: number
    fault_sample_count: number
    confusion_matrix: {
      true_negatives: number
      false_positives: number
      false_negatives: number
      true_positives: number
    }
    accuracy: number
    precision: number
    recall: number
    f1_score: number
    false_positive_rate: number
    scenario_breakdown: Record<string, {
      sample_count: number
      detection_rate?: number
      inlier_retention_rate?: number
      mean_anomaly_score: number
      detected_anomaly_count?: number
      false_positive_count?: number
    }>
    disclaimer: string
  }
  disclaimer: string
}// ============================================================================
// Step 9: Real-Time AI Alert System Types
// ============================================================================
export * from './alert'
