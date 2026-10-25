import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  X,
  Info,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  // Redirect destination after login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address (e.g. name@company.com)'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      await login({
        email: email.trim(),
        password,
        rememberMe,
      })
      navigate(from, { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please verify your credentials and try again.'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
      return
    }
    setForgotSent(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#E6FFFA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white shadow-lg shadow-teal-700/20 mb-3">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213D] tracking-tight">
          AI Digital Twin Simulator
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#475569]">
          Sign in to access real-time motor telemetry and AI anomaly detection
        </p>
      </div>

      {/* Main Login Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-teal-900/5 rounded-2xl border border-[#CCFBF1]">
          {/* General Error Banner */}
          {errors.general && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#991B1B]"
            >
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errors.general}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold text-[#10213D] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="operator@digitaltwin.ai"
                  className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                    errors.email
                      ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-[#10213D]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email)
                    setForgotSent(false)
                    setShowForgotModal(true)
                  }}
                  className="text-xs font-medium text-[#0D9488] hover:text-[#0F766E] hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  placeholder="••••••••"
                  className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                    errors.password
                      ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#10213D] p-1 rounded-md"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488] border-[#CBD5E1] accent-[#0D9488]"
                />
                <span className="text-xs text-[#475569] font-medium">Remember this session</span>
              </label>

              <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                JWT Protected
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="login-submit-button"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-700/20 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Info Box */}
          <div className="mt-5 p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-start gap-2.5 text-[11px] text-[#0F766E]">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[#0D9488]" />
            <div>
              <span className="font-semibold">Operator Access:</span> First-time user? Click Create
              Account below to register a secure profile with synthetic telemetry access.
            </div>
          </div>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-[#475569] pt-4 border-t border-[#F1F5F9]">
            Don't have an account?{' '}
            <Link
              to="/register"
              id="link-to-register"
              className="font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#CCFBF1] relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#10213D] rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#10213D]">Reset Your Password</h3>
            <p className="text-xs text-[#475569] mt-1 mb-4 leading-relaxed">
              Enter the email address associated with your Digital Twin account. We will simulate sending a password reset verification link.
            </p>

            {forgotSent ? (
              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-start gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
                <div>
                  <p className="font-semibold">Reset Link Dispatched</p>
                  <p className="mt-0.5 text-[11px] text-[#047857]">
                    Check <span className="font-bold">{forgotEmail}</span> for password reset instructions.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="operator@digitaltwin.ai"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#10213D] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                />
                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-2 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#10213D]"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginPage
