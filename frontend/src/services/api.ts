import type { BackendAppInfoResponse, BackendHealthResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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
