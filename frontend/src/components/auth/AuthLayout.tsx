import React, { useEffect, useRef } from 'react'
import {
  BarChart3,
  Brain,
  Sliders,
  ShieldCheck,
  Database,
  Cpu,
  TrendingUp,
} from 'lucide-react'
import gsap from 'gsap'
import { DigitalTwinLogo } from './DigitalTwinLogo'
import { AuthShowcaseMotor } from './AuthShowcaseMotor'
import { FloatingTelemetryCard } from './FloatingTelemetryCard'

interface AuthLayoutProps {
  children: React.ReactNode
  pageType?: 'login' | 'register'
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, pageType = 'login' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const motorStageRef = useRef<HTMLDivElement>(null)
  const formWrapperRef = useRef<HTMLDivElement>(null)
  const bottomFooterRef = useRef<HTMLDivElement>(null)

  // GSAP Entrance & Floating Micro-Animations
  useEffect(() => {
    // Check for user reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // Simple instant opacity reveal for accessibility
        gsap.set([headlineRef.current, subtitleRef.current, featuresRef.current, formWrapperRef.current], {
          opacity: 1,
        })
        return
      }

      // Master Entrance Timeline
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // 1. Headline & Subtitle fade + upward slide
      if (headlineRef.current) {
        tl.from(headlineRef.current, {
          y: 24,
          opacity: 0,
          duration: 0.8,
        })
      }

      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            y: 16,
            opacity: 0,
            duration: 0.6,
          },
          '-=0.5'
        )
      }

      // 2. Feature Cards Stagger In
      if (featuresRef.current) {
        const featureItems = featuresRef.current.children
        tl.from(
          featureItems,
          {
            scale: 0.94,
            y: 14,
            opacity: 0,
            duration: 0.5,
            stagger: 0.06,
          },
          '-=0.4'
        )
      }

      // 3. 3D Motor Stage Reveal
      if (motorStageRef.current) {
        tl.from(
          motorStageRef.current,
          {
            opacity: 0,
            scale: 0.97,
            duration: 0.9,
            ease: 'power2.out',
          },
          '-=0.4'
        )
      }

      // 4. Form Card Reveal with upward elevation
      if (formWrapperRef.current) {
        tl.from(
          formWrapperRef.current,
          {
            y: 24,
            opacity: 0,
            duration: 0.8,
            ease: 'back.out(1.2)',
          },
          '-=0.6'
        )
      }

      // 5. Continuous Floating Telemetry Cards (subtle sinusoidal yoyo)
      if (motorStageRef.current) {
        const cards = motorStageRef.current.querySelectorAll('.floating-card')
        cards.forEach((card, i) => {
          gsap.to(card, {
            y: i % 2 === 0 ? '-=6' : '+=6',
            duration: 2.6 + i * 0.4,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          })
        })
      }
    }, containerRef)

    // Parallax Effect on Mouse Move
    const handleMouseMove = (e: MouseEvent) => {
      if (prefersReducedMotion || !containerRef.current) return

      const { innerWidth, innerHeight } = window
      const xNorm = (e.clientX / innerWidth - 0.5) * 2 // -1 to 1
      const yNorm = (e.clientY / innerHeight - 0.5) * 2 // -1 to 1

      // Subtle parallax shifts
      if (motorStageRef.current) {
        gsap.to(motorStageRef.current, {
          x: xNorm * 10,
          y: yNorm * 6,
          duration: 1.2,
          ease: 'power2.out',
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      ctx.revert()
    }
  }, [pageType])

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full relative overflow-x-hidden bg-[#040B17] flex flex-col lg:flex-row text-white font-sans selection:bg-[#0D9488] selection:text-white lg:h-screen lg:max-h-screen lg:overflow-hidden"
    >
      {/* ========================================================================= */}
      {/* High-Tech Industrial Laboratory Background Layer                          */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/auth_showcase_bg.jpg"
          alt="AI Digital Twin Smart Industrial Facility"
          className="w-full h-full object-cover object-center scale-105 opacity-80"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/95 via-[#040F22]/85 to-[#020610]/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020610] via-transparent to-[#020610]/50" />

        {/* Ambient Cyan Floor Glow */}
        <div className="absolute bottom-0 left-[15%] w-[500px] h-[280px] bg-[#00F0FF]/15 rounded-full blur-[130px]" />
        <div className="absolute top-[15%] left-[5%] w-[400px] h-[350px] bg-[#0D9488]/15 rounded-full blur-[140px]" />
      </div>

      {/* ========================================================================= */}
      {/* Left Panel: Industrial Digital Twin Showcase                              */}
      {/* ========================================================================= */}
      <div className="lg:w-[58%] xl:w-[62%] relative flex flex-col justify-between p-4 sm:p-6 lg:p-7 xl:p-9 z-10 h-full overflow-y-auto lg:overflow-visible">
        {/* Top Header & Taglines */}
        <div>
          {/* Logo & Category Banner */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <DigitalTwinLogo theme="dark" size="md" />
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#081526]/85 border border-[#14B8A6]/35 text-[10px] font-mono font-medium text-[#5EEAD4] backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
              <span>SYNTHETIC TELEMETRY ENGINE</span>
            </div>
          </div>

          {/* Subtitle Tracking Label */}
          <div className="font-mono font-medium text-[10px] sm:text-[11px] tracking-[0.22em] text-[#2DD4BF] uppercase mb-1.5 flex items-center gap-2">
            <span>REAL MACHINES • REAL DATA • SMARTER DECISIONS</span>
            <span className="w-8 h-[1px] bg-[#2DD4BF]/50" />
          </div>

          {/* Main Hero Headline (Manrope Font, weights 600-700) */}
          <h1
            ref={headlineRef}
            className="font-heading font-bold text-xl sm:text-3xl xl:text-4xl 2xl:text-5xl text-white tracking-tight leading-[1.12] max-w-2xl"
          >
            Bringing Real Machines to a{' '}
            <span className="bg-gradient-to-r from-[#00F0FF] via-[#2DD4BF] to-[#14B8A6] bg-clip-text text-transparent">
              Smarter Tomorrow
            </span>
          </h1>

          {/* Description (Inter Font, weight 400) */}
          <p
            ref={subtitleRef}
            className="font-sans font-normal mt-1 sm:mt-1.5 text-xs sm:text-[13px] text-[#CBD5E1] max-w-xl leading-relaxed"
          >
            Simulate, monitor and predict machine performance with AI-powered digital twin
            technology.
          </p>

          {/* 4 Feature Highlight Cards */}
          <div
            ref={featuresRef}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-2.5 sm:mt-3 max-w-2xl"
          >
            {/* Card 1 */}
            <div className="p-2 rounded-xl bg-[#081426]/85 backdrop-blur-md border border-[#14B8A6]/25 flex flex-col items-center text-center group hover:border-[#14B8A6] transition-colors shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF] mb-1 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-3 h-3" />
              </div>
              <span className="font-heading font-semibold text-[10px] sm:text-[11px] text-white">Real-time</span>
              <span className="font-sans font-normal text-[9px] text-[#94A3B8]">Monitoring</span>
            </div>

            {/* Card 2 */}
            <div className="p-2 rounded-xl bg-[#081426]/85 backdrop-blur-md border border-[#14B8A6]/25 flex flex-col items-center text-center group hover:border-[#14B8A6] transition-colors shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF] mb-1 group-hover:scale-110 transition-transform">
                <Brain className="w-3 h-3" />
              </div>
              <span className="font-heading font-semibold text-[10px] sm:text-[11px] text-white">AI Anomaly</span>
              <span className="font-sans font-normal text-[9px] text-[#94A3B8]">Detection</span>
            </div>

            {/* Card 3 */}
            <div className="p-2 rounded-xl bg-[#081426]/85 backdrop-blur-md border border-[#14B8A6]/25 flex flex-col items-center text-center group hover:border-[#14B8A6] transition-colors shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF] mb-1 group-hover:scale-110 transition-transform">
                <Sliders className="w-3 h-3" />
              </div>
              <span className="font-heading font-semibold text-[10px] sm:text-[11px] text-white">What-If</span>
              <span className="font-sans font-normal text-[9px] text-[#94A3B8]">Simulation</span>
            </div>

            {/* Card 4 */}
            <div className="p-2 rounded-xl bg-[#081426]/85 backdrop-blur-md border border-[#14B8A6]/25 flex flex-col items-center text-center group hover:border-[#14B8A6] transition-colors shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF] mb-1 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-3 h-3" />
              </div>
              <span className="font-heading font-semibold text-[10px] sm:text-[11px] text-white">Safer</span>
              <span className="font-sans font-normal text-[9px] text-[#94A3B8]">Operations</span>
            </div>
          </div>
        </div>

        {/* Center 3D Photorealistic Motor Stage & Framed Floating Telemetry Cards */}
        <div
          ref={motorStageRef}
          className="relative h-[250px] sm:h-[290px] xl:h-[330px] 2xl:h-[370px] w-full max-w-[580px] mx-auto my-2 sm:my-3 flex items-center justify-center"
        >
          {/* Photorealistic 3D Digital Twin Motor Showcase */}
          <div className="w-full h-full relative z-0">
            <AuthShowcaseMotor />
          </div>

          {/* Floating Telemetry Cards Overlay (Framed outside corners) */}
          <div className="absolute inset-0 pointer-events-none z-10">
            {/* Top-Left: Temperature */}
            <div className="absolute -top-3.5 -left-2 sm:-left-4 floating-card pointer-events-auto">
              <FloatingTelemetryCard type="temperature" />
            </div>

            {/* Top-Right: Vibration */}
            <div className="absolute -top-3.5 -right-2 sm:-right-4 floating-card pointer-events-auto">
              <FloatingTelemetryCard type="vibration" />
            </div>

            {/* Bottom-Left: Motor Speed */}
            <div className="absolute -bottom-3.5 -left-2 sm:-left-4 floating-card pointer-events-auto">
              <FloatingTelemetryCard type="rpm" />
            </div>

            {/* Bottom-Right: Current */}
            <div className="absolute -bottom-3.5 -right-2 sm:-right-4 floating-card pointer-events-auto">
              <FloatingTelemetryCard type="current" />
            </div>
          </div>
        </div>

        {/* Bottom Showcase Footer */}
        <div
          ref={bottomFooterRef}
          className="pt-2 sm:pt-3 border-t border-white/10 flex flex-wrap items-center gap-3 sm:gap-5 text-[11px] font-sans font-normal text-[#CBD5E1]"
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Realistic Simulation Data</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Explore Machine Behavior</span>
          </div>
          <span className="text-white/20 hidden sm:inline">•</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#2DD4BF]" />
            <span>Make Safer, Smarter Decisions</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Right Panel: Floating Authentication Card Container                       */}
      {/* ========================================================================= */}
      <div
        ref={formWrapperRef}
        className="lg:w-[42%] xl:w-[38%] flex items-center justify-center p-4 sm:p-6 lg:p-8 z-20 h-full overflow-y-auto"
      >
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  )
}

export default AuthLayout
