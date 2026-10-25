import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  ArrowRight,
  Sun,
  Globe,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { AuthLayout } from '../components/auth/AuthLayout'
import { DigitalTwinLogo } from '../components/auth/DigitalTwinLogo'

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
    general?: string
  }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Live password validation checks
  const hasMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const validate = (): boolean => {
    const newErrors: {
      name?: string
      email?: string
      password?: string
      confirmPassword?: string
      terms?: string
    } = {}

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      newErrors.name = 'Full name is required'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters'
    }

    if (!trimmedEmail) {
      newErrors.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (!hasMinLength || !hasLetter || !hasNumber) {
      newErrors.password =
        'Password must be at least 8 characters and contain both letters and numbers'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions to proceed'
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
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      navigate('/', { replace: true })
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to register. Please try again with a different email address.'
      setErrors({ general: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout pageType="register">
      {/* Floating Glassmorphic Registration Card */}
      <div className="bg-white/95 backdrop-blur-xl py-6 sm:py-7 px-6 sm:px-9 shadow-2xl shadow-cyan-950/25 rounded-[28px] border border-[#CCFBF1]/80 text-[#10213D] transition-all">
        {/* Card Header Utilities: Theme Icon & Language Selector */}
        <div className="flex items-center justify-end gap-2 mb-1.5">
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
        <div className="text-center mb-4">
          <DigitalTwinLogo theme="light" size="md" className="justify-center mx-auto mb-2.5" />
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[#10213D] tracking-tight">
            Create <span className="text-[#0D9488]">Account</span>
          </h2>
          <p className="font-sans font-normal mt-0.5 text-xs text-[#64748B]">
            Register to access your digital twin simulator
          </p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div
            role="alert"
            className="mb-3.5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-start gap-2.5 text-xs text-[#991B1B]"
          >
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="leading-relaxed font-medium">{errors.general}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {/* Full Name Field */}
          <div>
            <label
              htmlFor="register-name"
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                placeholder="Harish Bavah"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                  errors.name
                    ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                }`}
              />
            </div>
            {errors.name && (
              <p className="mt-1 font-sans text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="register-email"
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                placeholder="harish@example.com"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
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
              htmlFor="register-password"
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                }}
                placeholder="••••••••••••"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
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

          {/* Confirm Password Field */}
          <div>
            <label
              htmlFor="register-confirm-password"
              className="block font-sans font-semibold text-xs text-[#10213D] mb-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
                  }
                }}
                placeholder="••••••••••••"
                className={`w-full font-sans font-normal bg-[#F8FAFC] border rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                  errors.confirmPassword
                    ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                    : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#10213D] p-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 font-sans text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Password Validation Checklist */}
          <div className="p-2.5 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1 font-mono text-[10px] sm:text-[11px] font-medium">
            <div className="font-heading font-semibold text-[#0F766E] mb-0.5 text-[11px]">Password Requirements:</div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? 'text-[#0D9488]' : 'text-[#64748B]'
                }`}
              >
                {hasMinLength ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#CBD5E1]" />
                )}
                <span>8+ characters</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasLetter ? 'text-[#0D9488]' : 'text-[#64748B]'
                }`}
              >
                {hasLetter ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#CBD5E1]" />
                )}
                <span>At least 1 letter</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? 'text-[#0D9488]' : 'text-[#64748B]'
                }`}
              >
                {hasNumber ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#CBD5E1]" />
                )}
                <span>At least 1 number</span>
              </div>

              <div
                className={`flex items-center gap-1.5 ${
                  passwordsMatch ? 'text-[#0D9488]' : 'text-[#64748B]'
                }`}
              >
                {passwordsMatch ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#0D9488]" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-[#CBD5E1]" />
                )}
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="register-terms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
                }}
                className="mt-0.5 w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488] border-[#CBD5E1] accent-[#0D9488]"
              />
              <span className="font-sans text-xs text-[#475569] leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline cursor-pointer"
                >
                  Terms of Service
                </button>{' '}
                and Privacy Guidelines for simulator telemetry data.
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1 font-sans text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.terms}
              </p>
            )}
          </div>

          {/* Primary Teal Gradient Create Account Button */}
          <div className="pt-1.5">
            <button
              type="submit"
              id="register-submit-button"
              disabled={isSubmitting}
              className="w-full rounded-full py-3.5 px-6 font-sans font-semibold text-xs sm:text-sm text-white shadow-lg shadow-teal-900/25 bg-gradient-to-r from-[#0D9488] via-[#0F766E] to-[#0D9488] hover:from-[#0F766E] hover:to-[#115E59] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2 w-full font-sans">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 pl-2">
                    <ArrowRight className="w-4 h-4 text-[#99F6E4]" />
                    <span>Create Account</span>
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
        <div className="relative my-3.5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E2E8F0]" />
          </div>
          <div className="relative inline-block px-3 bg-white font-sans text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider">
            OR
          </div>
        </div>

        {/* Switch to Sign In */}
        <div className="text-center font-sans text-xs text-[#475569]">
          Already have an account?{' '}
          <Link
            to="/login"
            id="link-to-login"
            className="font-sans font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative max-h-[85vh] flex flex-col font-sans">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#10213D] rounded-lg transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>

            <h3 className="font-heading font-bold text-base text-[#10213D]">Terms of Service & Data Policy</h3>

            <div className="mt-3 overflow-y-auto pr-2 space-y-3 text-xs text-[#475569] leading-relaxed flex-1">
              <p>
                Welcome to the <strong>AI Digital Twin Simulator</strong> platform. By creating an
                account, you acknowledge and agree to the following operator guidelines:
              </p>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">1. Synthetic Telemetry Scope</div>
                <div>
                  All telemetry, sensor readings, and anomaly detection predictions are generated in
                  simulation mode for evaluation and research purposes.
                </div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">2. Account Security & JWT Handling</div>
                <div>
                  You are responsible for keeping your credentials confidential. Access tokens are
                  cryptographically signed using JWT standards and expire periodically.
                </div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">3. What-If Isolation</div>
                <div>
                  Simulation scenarios and What-If experiments created within your session are
                  isolated and do not overwrite production baseline models.
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true)
                  setShowTermsModal(false)
                }}
                className="px-4 py-2 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthLayout>
  )
}

export default RegisterPage
