import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  AlertCircle,
  Loader2,
  Cpu,
  CheckCircle2,
  XCircle,
  X,
  FileText,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'

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
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-[#F8FAFC] to-[#E6FFFA] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white shadow-lg shadow-teal-700/20 mb-3">
          <Cpu className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213D] tracking-tight">
          Create Operator Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#475569]">
          Join the AI Digital Twin Simulator platform to monitor and evaluate motor health
        </p>
      </div>

      {/* Main Register Card */}
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
            {/* Full Name Field */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold text-[#10213D] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                    errors.name
                      ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-semibold text-[#10213D] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="harish@digitaltwin.ai"
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
              <label
                htmlFor="register-password"
                className="block text-xs font-semibold text-[#10213D] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-semibold text-[#10213D] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                  placeholder="••••••••"
                  className={`w-full bg-[#F8FAFC] border rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-[#10213D] placeholder-[#94A3B8] transition-all focus:outline-none focus:bg-white ${
                    errors.confirmPassword
                      ? 'border-[#EF4444] focus:ring-2 focus:ring-[#EF4444]/20'
                      : 'border-[#E2E8F0] focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/15'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#10213D] p-1 rounded-md"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Validation Checklist */}
            <div className="p-3 rounded-xl bg-[#F0FDFA] border border-[#CCFBF1] space-y-1.5 text-[11px]">
              <div className="font-semibold text-[#0F766E] mb-1">Password Requirements:</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div
                  className={`flex items-center gap-1.5 ${
                    hasMinLength ? 'text-[#0D9488] font-medium' : 'text-[#64748B]'
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
                    hasLetter ? 'text-[#0D9488] font-medium' : 'text-[#64748B]'
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
                    hasNumber ? 'text-[#0D9488] font-medium' : 'text-[#64748B]'
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
                    passwordsMatch ? 'text-[#0D9488] font-medium' : 'text-[#64748B]'
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
                <span className="text-xs text-[#475569] leading-relaxed">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-semibold text-[#0D9488] hover:text-[#0F766E] hover:underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and Privacy Guidelines for simulator telemetry data.
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-[11px] text-[#EF4444] font-medium flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                id="register-submit-button"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs sm:text-sm shadow-md shadow-teal-700/20 focus:outline-none focus:ring-2 focus:ring-[#0D9488]/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Sign In */}
          <div className="mt-6 text-center text-xs text-[#475569] pt-4 border-t border-[#F1F5F9]">
            Already have an account?{' '}
            <Link
              to="/login"
              id="link-to-login"
              className="font-bold text-[#0D9488] hover:text-[#0F766E] hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#CCFBF1] relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 p-1 text-[#94A3B8] hover:text-[#10213D] rounded-lg transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] text-[#0D9488] flex items-center justify-center mb-3">
              <FileText className="w-5 h-5" />
            </div>

            <h3 className="text-base font-bold text-[#10213D]">Terms of Service & Data Policy</h3>

            <div className="mt-3 overflow-y-auto pr-2 space-y-3 text-xs text-[#475569] leading-relaxed flex-1">
              <p>
                Welcome to the <strong>AI Digital Twin Simulator</strong> platform. By creating an account, you acknowledge and agree to the following operator guidelines:
              </p>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">1. Synthetic Telemetry Scope</div>
                <div>All telemetry, sensor readings, and anomaly detection predictions are generated in simulation mode for evaluation and research purposes. No physical industrial equipment is connected.</div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">2. Account Security & JWT Handling</div>
                <div>You are responsible for keeping your credentials confidential. Access tokens are cryptographically signed using JWT standards and expire periodically.</div>
              </div>
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-1.5">
                <div className="font-semibold text-[#10213D]">3. What-If Isolation</div>
                <div>Simulation scenarios and What-If experiments created within your session are isolated and do not overwrite production baseline models.</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAcceptTerms(true)
                  setShowTermsModal(false)
                }}
                className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Accept & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterPage
