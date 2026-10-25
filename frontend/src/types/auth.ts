/**
 * Authentication and User Account Types
 */

export interface AuthUser {
  id: string
  email: string
  name: string
  isActive?: boolean
  createdAt?: string | null
  lastLoginAt?: string | null
}

export interface AuthResponse {
  token: string
  token_type: string
  user: {
    id: string
    email: string
    name: string
    is_active?: boolean
    created_at?: string | null
    last_login_at?: string | null
  }
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}
