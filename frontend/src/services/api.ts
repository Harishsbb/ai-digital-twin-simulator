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

export async function fetchSensorHistory(limit = 50): Promise<SensorReading[]> {
  const response = await fetch(`${API_BASE_URL}/api/v1/sensors/history?limit=${limit}`, {
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
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  // Default to backend on port 8000
  const url = new URL(API_BASE_URL)
  return `${wsProtocol}//${url.host}/api/v1/sensors/ws`
}

import type {
  AIModelMetricsResponse,
  AIModelStatusResponse,
  AnomalyPredictionInput,
  AnomalyPredictionResponse,
} from '../types'

export async function fetchAIStatus(): Promise<AIModelStatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/status`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch AI status: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function predictAnomaly(
  input: AnomalyPredictionInput
): Promise<AnomalyPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(`Failed to run AI prediction: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchAILatest(): Promise<AnomalyPredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/latest`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch latest AI prediction: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchAIMetrics(): Promise<AIModelMetricsResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/ai/metrics`, {
    headers: {
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch AI metrics: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

