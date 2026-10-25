import React, { useCallback, useEffect, useState } from 'react'
import type { AuthUser, LoginCredentials, RegisterCredentials } from '../types'
import { fetchCurrentUserApi, loginApi, logoutApi, registerApi } from '../services/authApi'
import { AuthContext, type AuthContextValue } from './AuthContextDef'

const TOKEN_KEY = 'adt_auth_token'
const USER_KEY = 'adt_auth_user'

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null
  } catch {
    return null
  }
}

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeSession(token: string, user: AuthUser, rememberMe = true) {
  try {
    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
    } else {
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
  } catch {
    // Ignore storage quota or disabled storage errors
  }
}

function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
  } catch {
    // Ignore
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(getStoredToken)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser)
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(getStoredToken()))

  // Verify session on initial load if token exists
  useEffect(() => {
    const existingToken = getStoredToken()
    if (!existingToken) {
      return
    }

    let isCancelled = false

    fetchCurrentUserApi(existingToken)
      .then((verifiedUser) => {
        if (!isCancelled) {
          setUser(verifiedUser)
          setToken(existingToken)
        }
      })
      .catch(() => {
        if (!isCancelled) {
          // Token expired or invalid; clear stale session
          clearSession()
          setToken(null)
          setUser(null)
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [])

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await loginApi(credentials)
      const mappedUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        isActive: response.user.is_active,
        createdAt: response.user.created_at,
        lastLoginAt: response.user.last_login_at,
      }
      setToken(response.token)
      setUser(mappedUser)
      storeSession(response.token, mappedUser, credentials.rememberMe ?? true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setIsLoading(true)
    try {
      const response = await registerApi(credentials)
      const mappedUser: AuthUser = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        isActive: response.user.is_active,
        createdAt: response.user.created_at,
        lastLoginAt: response.user.last_login_at,
      }
      setToken(response.token)
      setUser(mappedUser)
      storeSession(response.token, mappedUser, true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    const currentToken = token
    clearSession()
    setToken(null)
    setUser(null)
    if (currentToken) {
      await logoutApi(currentToken).catch(() => {})
    }
  }, [token])

  const contextValue: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}
