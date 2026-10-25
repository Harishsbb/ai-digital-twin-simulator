import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  X,
  ArrowRight,
  Sun,
  Globe,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { AuthLayout } from '../components/auth/AuthLayout'
import { DigitalTwinLogo } from '../components/auth/DigitalTwinLogo'

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
      newErrors.email = 'Please enter a valid email address (e.g. harish@example.com)'
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
    <AuthLayout pageType="login">
      {/* Floating Glassmorphic Authentication Card */}
      <div className="bg-white/95 backdrop-blur-xl py-7 sm:py-8 px-6 sm:px-9 shadow-2xl shadow-cyan-950/25 rounded-[28px] border border-[#CCFBF1]/80 text-[#10213D] transition-all">
        {/* Card Header Utilities: Theme Icon & Language Selector */}
        <div className="flex items-center justify-end gap-2 mb-2">
          <button
            type="button"
            className="w-7 h-7 rounded-full border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            title="Light Theme Active"
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#E2E8F0] text-[11px] font-sans font-medium text-[#475569] hover:bg-[#F8FAFC] cursor-pointer shadow-2xs">
            <Globe className="w-3 h-3 text-[#64748B]" />
            <span>English</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </div>
        </div>

        {/* Brand Logo in Card Header */}
        <div className="text-center mb-5">
          <DigitalTwinLogo theme="light" size="md" className="justify-center mx-auto mb-3" />
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#10213D] tracking-tight">
            Welcome <span className="text-[#0D9488]">Back</span>
          </h2>
          <p className="font-sans font-normal mt-1 text-xs text-[#64748B]">
            Login to access your digital twin simulator
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#991B1B]"
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
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="harish@example.com"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-3.5 py-3 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                  errors.email
                    ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 font-sans text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="login-password"
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="••••••••••••"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                  errors.password
                    ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#10213D] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 font-sans text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488] border-[#CBD5E1] accent-[#0D9488]"
              />
              <span className="font-sans text-xs text-[#475569] font-medium">Remember me</span>
              <span className="sr-only">Remember this session</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotEmail(email)
                setForgotSent(false)
                setShowForgotModal(true)
              }}
              className="font-sans text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Primary Teal Gradient Sign In Button */}
          <div className="pt-2">
            <button
              type="submit"
              id="login-submit-button"
              disabled={isSubmitting}
              className="w-full rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-white shadow-lg shadow-teal-900/25 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#0D9488] hover:from-[#0F766E] hover:to-[#115E59] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 w-full font-sans">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 pl-2">
                    <ArrowRight className="w-4 h-4 text-[#99F6E4]" />
                    <span>Sign In</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </>
              )}
            </button>
          </div>
        </form>

        {/* OR Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative inline-block px-3 bg-white font-sans text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            OR
          </div>
        </div>

        {/* Switch to Register */}
        <div className="text-center font-sans text-xs text-[#475569]">
          Don't have an account?{' '}
          <Link
            to="/register"
            id="link-to-register"
            className="font-sans font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-[#CCFBF1] relative">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#10213D] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center mb-3">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="font-heading font-bold text-base text-[#10213D]">Reset Your Password</h3>
            <p className="font-sans font-normal text-xs text-[#475569] mt-1 mb-4 leading-relaxed">
              Enter the email address associated with your Digital Twin account. We will simulate sending a password reset verification link.
            </p>

            {forgotSent ? (
              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-start gap-2 mb-4 font-sans">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981] mt-0.5" />
                <div>
                  <p className="font-semibold">Reset Link Dispatched</p>
                  <p className="mt-0.5 text-[11px] text-[#047857]">
                    Check <span className="font-bold">{forgotEmail}</span> for password reset instructions.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 font-sans">
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="harish@example.com"
                  required
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2 text-xs text-[#10213D] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Send Reset Link
                </button>
              </form>
            )}

            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full mt-2 py-1.5 font-sans text-xs font-medium text-[#64748B] hover:text-[#10213D] cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

export default LoginPage
