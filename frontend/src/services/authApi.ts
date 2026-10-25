/**
 * Authentication API Service Client
 * 
 * Provides HTTP client functions for user registration, login, profile retrieval,
 * and session invalidation against the FastAPI backend.
 */

import type { AuthResponse, AuthUser, LoginCredentials, RegisterCredentials } from '../types'
import { getApiBaseUrl } from './api.ts'

export class AuthError extends Error {
  public status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

export function getAuthApiBaseUrl(): string {
  return `${getApiBaseUrl()}/api/v1/auth`
}

/**
 * Register a new user account.
 */
export async function registerApi(credentials: RegisterCredentials): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      name: credentials.name.trim(),
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  })

  if (!response.ok) {
    let detail = 'Registration failed. Please check your information.'
    try {
      const errData = await response.json()
      if (errData?.detail) {
        if (typeof errData.detail === 'string') {
          detail = errData.detail
        } else if (Array.isArray(errData.detail) && errData.detail[0]?.msg) {
          detail = errData.detail[0].msg
        }
      }
    } catch {
      // Fallback to HTTP status text
      detail = `Registration error (${response.status} ${response.statusText})`
    }
    throw new AuthError(detail, response.status)
  }

  return response.json()
}

/**
 * Sign in with email and password.
 */
export async function loginApi(credentials: LoginCredentials): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
      remember_me: credentials.rememberMe ?? true,
    }),
  })

  if (!response.ok) {
    let detail = 'Invalid email address or password.'
    try {
      const errData = await response.json()
      if (errData?.detail) {
        if (typeof errData.detail === 'string') {
          detail = errData.detail
        } else if (Array.isArray(errData.detail) && errData.detail[0]?.msg) {
          detail = errData.detail[0].msg
        }
      }
    } catch {
      detail = `Sign in error (${response.status} ${response.statusText})`
    }
    throw new AuthError(detail, response.status)
  }

  return response.json()
}

/**
 * Fetch the authenticated user's profile using bearer token.
 */
export async function fetchCurrentUserApi(token: string): Promise<AuthUser> {
  const baseUrl = getApiBaseUrl()
  const response = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    throw new AuthError('Session expired or invalid', response.status)
  }

  const data = await response.json()
  return {
    id: data.id,
    email: data.email,
    name: data.name,
    isActive: data.is_active,
    createdAt: data.created_at,
    lastLoginAt: data.last_login_at,
  }
}

/**
 * Sign out and invalidate session.
 */
export async function logoutApi(token?: string): Promise<{ message: string }> {
  const baseUrl = getApiBaseUrl()
  try {
    const headers: Record<string, string> = { 'Accept': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    const response = await fetch(`${baseUrl}/api/v1/auth/logout`, {
      method: 'POST',
      headers,
    })
    if (response.ok) {
      return response.json()
    }
  } catch {
    // Network or server error on logout is non-fatal
  }
  return { message: 'Signed out locally.' }
}
