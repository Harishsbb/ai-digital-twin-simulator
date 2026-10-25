import type { BackendAppInfoResponse, BackendHealthResponse } from '../types'

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 'http://localhost:8000'


export interface ApiResult<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export async function fetchBackendHealth(): Promise<BackendHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Health check failed with status: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export interface DatabaseHealthResponse {
  status: string
  connected: boolean
  database_type: string
  host: string
  port: number
  database: string
  masked_url: string
  latency_ms: number | null
  tables_registered: string[]
  timestamp: string
  error: string | null
}

export async function fetchDatabaseHealth(): Promise<DatabaseHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/db/health`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Database health check failed with status: ${response.status} ${response.statusText}`)
  }
  return response.json()
}


export async function fetchBackendInfo(): Promise<BackendAppInfoResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/info`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  
  if (!response.ok) {
    throw new Error(`Info request failed with status: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}

export function getApiBaseUrl(): string {
  return API_BASE_URL
}

import type {
  SensorReading,
  SimulatorAction,
  SimulatorMode,
  SimulatorStateResponse,
} from '../types'

export async function fetchLatestSensorReading(): Promise<SensorReading> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sensors/latest`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch latest sensor reading: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchSimulatorState(): Promise<SimulatorStateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sensors/state`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch simulator state: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchSensorHistory(limit = 100, seconds?: number): Promise<SensorReading[]> {
  const params = new URLSearchParams()
  params.append('limit', String(limit))
  if (seconds !== undefined && seconds > 0) {
    params.append('seconds', String(seconds))
  }
  const response = await fetch(`${API_BASE_URL}/api/v1/sensors/history?${params.toString()}`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch sensor history: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function controlSimulator(
  action: SimulatorAction,
  mode?: SimulatorMode
): Promise<SimulatorStateResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sensors/control`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ action, mode }),
  })
  if (!response.ok) {
    throw new Error(`Failed to execute simulator control (${action}): ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export function getSensorWebSocketUrl(): string {
  const url = new URL(API_BASE_URL)
  const isSecure = url.protocol === 'https:' || (typeof window !== 'undefined' && window.location?.protocol === 'https:')
  const wsProtocol = isSecure ? 'wss:' : 'ws:'
  return `${wsProtocol}//${url.host}/api/v1/sensors/ws`
}

export {
  AIError,
  fetchAIMetrics,
  fetchAILatest,
  fetchAIStatus,
  interpretAnomalyScore,
  predictAnomaly,
} from './aiApi.ts'
export type { RequestOptions } from './aiApi.ts'


