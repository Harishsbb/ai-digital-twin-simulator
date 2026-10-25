/**
 * Authentication System Frontend Tests
 * 
 * Verifies:
 * 1. Auth API Client methods (login, register, me, logout, error handling).
 * 2. Login Page UI contract, validation, show/hide password, and remember me.
 * 3. Register Page UI contract, live password checklist, terms modal, and match confirmation.
 * 4. Route protection and dashboard security routing.
 * 5. Header user profile menu and Sign Out workflow.
 */

import { describe, it, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import {
  loginApi,
  registerApi,
  fetchCurrentUserApi,
  logoutApi,
  AuthError,
  getAuthApiBaseUrl,
} from '../services/authApi.ts'

describe('Authentication Frontend Suite', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    // Reset fetch mock before each test
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // ==========================================
  // 1. Auth API Client Tests
  // ==========================================
  describe('Auth API Client', () => {
    it('getAuthApiBaseUrl returns valid configured base URL', () => {
      const url = getAuthApiBaseUrl()
      assert.strictEqual(typeof url, 'string')
      assert.ok(url.includes('/api/v1/auth'))
    })

    it('loginApi successfully posts credentials and returns AuthResponse', async () => {
      const mockResponse = {
        token: 'mock.jwt.token',
        token_type: 'Bearer',
        user: {
          id: 'user-uuid-1',
          email: 'test@digitaltwin.ai',
          name: 'Test Operator',
          is_active: true,
          created_at: '2026-10-25T12:00:00Z',
          last_login_at: '2026-10-25T12:00:00Z',
        },
      }

      globalThis.fetch = async (url, init) => {
        assert.ok(String(url).endsWith('/login'))
        assert.strictEqual(init?.method, 'POST')
        const body = JSON.parse(init?.body as string)
        assert.strictEqual(body.email, 'test@digitaltwin.ai')
        assert.strictEqual(body.password, 'ValidPass123!')

        return new Response(JSON.stringify(mockResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const res = await loginApi({
        email: 'test@digitaltwin.ai',
        password: 'ValidPass123!',
      })

      assert.strictEqual(res.token, 'mock.jwt.token')
      assert.strictEqual(res.user.email, 'test@digitaltwin.ai')
      assert.strictEqual(res.user.name, 'Test Operator')
    })

    it('loginApi throws AuthError with 401 on invalid credentials', async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ detail: 'Invalid email or password' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }

      await assert.rejects(
        async () => {
          await loginApi({ email: 'bad@user.com', password: 'wrong' })
        },
        (err: unknown) => {
          assert.ok(err instanceof AuthError)
          assert.strictEqual(err.status, 401)
          assert.strictEqual(err.message, 'Invalid email or password')
          return true
        }
      )
    })

    it('registerApi successfully creates user and returns token', async () => {
      const mockResponse = {
        token: 'new.user.jwt',
        token_type: 'Bearer',
        user: {
          id: 'user-uuid-2',
          email: 'new@digitaltwin.ai',
          name: 'New Operator',
          is_active: true,
          created_at: '2026-10-25T12:00:00Z',
        },
      }

      globalThis.fetch = async (url, init) => {
        assert.ok(String(url).endsWith('/register'))
        assert.strictEqual(init?.method, 'POST')
        const body = JSON.parse(init?.body as string)
        assert.strictEqual(body.name, 'New Operator')
        assert.strictEqual(body.email, 'new@digitaltwin.ai')

        return new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const res = await registerApi({
        name: 'New Operator',
        email: 'new@digitaltwin.ai',
        password: 'SafePassword123!',
      })

      assert.strictEqual(res.token, 'new.user.jwt')
      assert.strictEqual(res.user.name, 'New Operator')
    })

    it('registerApi throws AuthError with 409 when email already exists', async () => {
      globalThis.fetch = async () => {
        return new Response(
          JSON.stringify({ detail: 'An account with this email address already exists' }),
          { status: 409, headers: { 'Content-Type': 'application/json' } }
        )
      }

      await assert.rejects(
        async () => {
          await registerApi({
            name: 'Duplicate',
            email: 'existing@digitaltwin.ai',
            password: 'SafePassword123!',
          })
        },
        (err: unknown) => {
          assert.ok(err instanceof AuthError)
          assert.strictEqual(err.status, 409)
          assert.ok(err.message.includes('already exists'))
          return true
        }
      )
    })

    it('fetchCurrentUserApi attaches Bearer token header', async () => {
      const mockUser = {
        id: 'user-uuid-3',
        email: 'current@digitaltwin.ai',
        name: 'Current Operator',
        is_active: true,
        created_at: '2026-10-25T12:00:00Z',
      }

      globalThis.fetch = async (url, init) => {
        assert.ok(String(url).endsWith('/me'))
        const headers = init?.headers as Record<string, string>
        assert.strictEqual(headers['Authorization'], 'Bearer sample-token-abc')

        return new Response(JSON.stringify(mockUser), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const user = await fetchCurrentUserApi('sample-token-abc')
      assert.strictEqual(user.id, 'user-uuid-3')
      assert.strictEqual(user.name, 'Current Operator')
    })

    it('logoutApi calls auth logout endpoint', async () => {
      let called = false
      globalThis.fetch = async (url, init) => {
        assert.ok(String(url).endsWith('/logout'))
        assert.strictEqual(init?.method, 'POST')
        called = true
        return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      await logoutApi('sample-token-xyz')
      assert.strictEqual(called, true)
    })
  })

  // ==========================================
  // 2. Login Page UI Contract & Validation
  // ==========================================
  describe('Login Page Implementation', () => {
    const loginFilePath = path.resolve('src/pages/LoginPage.tsx')
    const loginContent = fs.readFileSync(loginFilePath, 'utf-8')

    it('implements required email and password input elements', () => {
      assert.ok(loginContent.includes('id="login-email"'), 'Must have email input id')
      assert.ok(loginContent.includes('id="login-password"'), 'Must have password input id')
      assert.ok(loginContent.includes('id="login-submit-button"'), 'Must have submit button id')
    })

    it('includes show/hide password toggle controls with accessible labels', () => {
      assert.ok(loginContent.includes('showPassword'), 'Must support showPassword state')
      assert.ok(loginContent.includes('EyeOff'), 'Must render EyeOff icon')
      assert.ok(loginContent.includes('aria-label='), 'Must have accessibility label for toggle')
    })

    it('implements Remember Me checkbox option', () => {
      assert.ok(loginContent.includes('rememberMe'), 'Must support rememberMe state')
      assert.ok(loginContent.includes('Remember this session'), 'Must display remember me label')
    })

    it('includes Forgot Password link and reset instructions modal', () => {
      assert.ok(loginContent.includes('Forgot password?'), 'Must have forgot password button')
      assert.ok(loginContent.includes('showForgotModal'), 'Must support forgot password modal')
      assert.ok(loginContent.includes('Reset Your Password'), 'Modal must have clear heading')
    })

    it('provides navigation link to /register page', () => {
      assert.ok(loginContent.includes('to="/register"'), 'Must link to /register')
      assert.ok(loginContent.includes('Create Account'), 'Must have Create Account link')
    })

    it('applies curated teal and white aesthetic palette', () => {
      assert.ok(loginContent.includes('#0D9488'), 'Must use primary teal (#0D9488)')
      assert.ok(loginContent.includes('#0F766E'), 'Must use deep teal accent (#0F766E)')
      assert.ok(loginContent.includes('#CCFBF1'), 'Must use soft teal border (#CCFBF1)')
      assert.ok(loginContent.includes('#10213D'), 'Must use navy text (#10213D)')
    })
  })

  // ==========================================
  // 3. Register Page UI Contract & Validation
  // ==========================================
  describe('Register Page Implementation', () => {
    const registerFilePath = path.resolve('src/pages/RegisterPage.tsx')
    const registerContent = fs.readFileSync(registerFilePath, 'utf-8')

    it('implements Full Name, Email, Password, and Confirm Password fields', () => {
      assert.ok(registerContent.includes('id="register-name"'), 'Must have name input')
      assert.ok(registerContent.includes('id="register-email"'), 'Must have email input')
      assert.ok(registerContent.includes('id="register-password"'), 'Must have password input')
      assert.ok(registerContent.includes('id="register-confirm-password"'), 'Must have confirm password input')
      assert.ok(registerContent.includes('id="register-submit-button"'), 'Must have register button')
    })

    it('implements show/hide toggles for both password and confirm password', () => {
      assert.ok(registerContent.includes('showPassword'), 'Must support showPassword state')
      assert.ok(registerContent.includes('showConfirmPassword'), 'Must support showConfirmPassword state')
    })

    it('features live visual password requirements checklist', () => {
      assert.ok(registerContent.includes('hasMinLength'), 'Must track minimum length check')
      assert.ok(registerContent.includes('hasLetter'), 'Must track letter requirement')
      assert.ok(registerContent.includes('hasNumber'), 'Must track numeric requirement')
      assert.ok(registerContent.includes('passwordsMatch'), 'Must track password matching')
      assert.ok(registerContent.includes('8+ characters'), 'Must display 8+ characters rule')
      assert.ok(registerContent.includes('Passwords match'), 'Must display passwords match rule')
    })

    it('enforces Terms and Conditions agreement checkbox with modal details', () => {
      assert.ok(registerContent.includes('id="register-terms"'), 'Must have terms checkbox')
      assert.ok(registerContent.includes('showTermsModal'), 'Must support terms modal dialog')
      assert.ok(registerContent.includes('Terms of Service'), 'Must reference Terms of Service')
    })

    it('provides navigation link back to /login page', () => {
      assert.ok(registerContent.includes('to="/login"'), 'Must link to /login')
      assert.ok(registerContent.includes('Sign In'), 'Must display Sign In link')
    })
  })

  // ==========================================
  // 4. Routing & Route Protection Security
  // ==========================================
  describe('Routing Architecture & Security', () => {
    const routesFilePath = path.resolve('src/routes/index.tsx')
    const routesContent = fs.readFileSync(routesFilePath, 'utf-8')
    const protectedRoutePath = path.resolve('src/components/auth/ProtectedRoute.tsx')
    const protectedRouteContent = fs.readFileSync(protectedRoutePath, 'utf-8')

    it('registers public /login and /register routes outside of ProtectedRoute', () => {
      assert.ok(routesContent.includes('path="/login" element={<LoginPage />}'), 'Must register /login')
      assert.ok(routesContent.includes('path="/register" element={<RegisterPage />}'), 'Must register /register')
    })

    it('wraps dashboard routes in ProtectedRoute', () => {
      assert.ok(routesContent.includes('<Route element={<ProtectedRoute />}>'), 'Must protect dashboard routes')
    })

    it('ProtectedRoute redirects unauthenticated visitors to /login preserving target destination', () => {
      assert.ok(protectedRouteContent.includes('to="/login"'), 'Must redirect to /login')
      assert.ok(protectedRouteContent.includes('state={{ from: location }}'), 'Must preserve redirect destination')
      assert.ok(protectedRouteContent.includes('isAuthenticated'), 'Must check isAuthenticated')
    })

    it('preserves all existing application routes', () => {
      const routesToCheck = [
        '/',
        '/digital-twin',
        '/sensors',
        '/anomaly-detection',
        '/alerts',
        '/analytics',
        '/what-if',
        '/user-manual',
        '/settings',
      ]
      for (const route of routesToCheck) {
        assert.ok(routesContent.includes(`path="${route}"`), `Must preserve route: ${route}`)
      }
    })
  })

  // ==========================================
  // 5. Header User Profile & Sign Out
  // ==========================================
  describe('Header User Profile & Logout Integration', () => {
    const headerFilePath = path.resolve('src/components/Header.tsx')
    const headerContent = fs.readFileSync(headerFilePath, 'utf-8')

    it('includes interactive user profile dropdown trigger', () => {
      assert.ok(headerContent.includes('id="user-profile-menu-button"'), 'Header must have profile trigger id')
      assert.ok(headerContent.includes('profileOpen'), 'Must manage dropdown open state')
    })

    it('integrates with useAuth to render dynamic operator name and initial avatar', () => {
      assert.ok(headerContent.includes('useAuth'), 'Must consume useAuth hook')
      assert.ok(headerContent.includes('displayName'), 'Must calculate display name')
      assert.ok(headerContent.includes('initial'), 'Must compute avatar initial')
    })

    it('provides functional Sign Out button that triggers logout', () => {
      assert.ok(headerContent.includes('id="header-logout-button"'), 'Must have logout button id')
      assert.ok(headerContent.includes('handleLogout'), 'Must have handleLogout function')
      assert.ok(headerContent.includes('await logout()'), 'Must call logout action')
      assert.ok(headerContent.includes("navigate('/login')"), 'Must navigate to /login after logout')
    })
  })
})
