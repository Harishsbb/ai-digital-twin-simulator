import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  Box,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  Database,
  Download,
  Eye,
  HelpCircle,
  Info,
  Layers,
  Search,
  ShieldCheck,
  Sliders,
  Sparkles,
  Thermometer,
  X,
  Zap,
} from 'lucide-react'
import { Card } from '../components/Card'

interface SectionItem {
  id: string
  title: string
  shortTitle: string
  icon: React.ComponentType<{ className?: string }>
  badge: string
  keywords: string[]
}

const SECTIONS: SectionItem[] = [
  {
    id: 'quick-start',
    title: 'Quick Start Guide for Beginners',
    shortTitle: 'Quick Start',
    icon: Compass,
    badge: 'START HERE',
    keywords: ['start', 'beginner', 'guide', 'steps', 'overview', 'first time', 'how to use'],
  },
  {
    id: 'dashboard',
    title: '1. Dashboard & Live Sensor Telemetry',
    shortTitle: 'Dashboard',
    icon: Activity,
    badge: 'CORE TELEMETRY',
    keywords: ['dashboard', 'sensor', 'temperature', 'vibration', 'rpm', 'speed', 'readings', 'status', 'normal', 'warning', 'critical'],
  },
  {
    id: '3d-twin',
    title: '2. 3D Digital Twin Motor Viewer',
    shortTitle: '3D Digital Twin',
    icon: Box,
    badge: '3D VIEWER',
    keywords: ['3d', 'motor', 'twin', 'rotate', 'zoom', 'orbit', 'inspect', 'parts', 'stator', 'rotor', 'bearing', 'fault mode'],
  },
  {
    id: 'ai-anomaly',
    title: '3. AI Anomaly Detection Engine',
    shortTitle: 'AI Anomaly Detection',
    icon: Brain,
    badge: 'MACHINE LEARNING',
    keywords: ['ai', 'anomaly', 'detection', 'isolation forest', 'score', 'prediction', 'inlier', 'outlier', 'synthetic data', 'model'],
  },
  {
    id: 'alerts',
    title: '4. Alert Management & Operator Lifecycle',
    shortTitle: 'Alerts',
    icon: AlertTriangle,
    badge: 'ALERTS & SAFETY',
    keywords: ['alerts', 'critical', 'warning', 'high', 'medium', 'info', 'acknowledge', 'dismiss', 'bell', 'notification'],
  },
  {
    id: 'analytics',
    title: '5. Analytics Dashboard & CSV Export',
    shortTitle: 'Analytics',
    icon: BarChart2,
    badge: 'TIME SERIES',
    keywords: ['analytics', 'history', 'charts', 'graph', 'time filters', '30s', '1m', '2m', '5m', 'csv', 'export', 'download'],
  },
  {
    id: 'what-if',
    title: '6. Interactive What-If Simulation',
    shortTitle: 'What-If Simulation',
    icon: Sparkles,
    badge: 'EXPERIMENTATION',
    keywords: ['what-if', 'whatif', 'simulation', 'presets', 'sliders', 'counterfactual', 'hypothetical', 'comparison', 'isolation'],
  },
  {
    id: 'database',
    title: '7. Database Status & Cloud Persistence',
    shortTitle: 'Database Status',
    icon: Database,
    badge: 'SUPABASE POSTGRESQL',
    keywords: ['database', 'supabase', 'postgresql', 'persistence', 'pooler', 'connectivity', 'health', 'tables', 'offline fallback'],
  },
]

export const UserManualPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('quick-start')

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return SECTIONS
    return SECTIONS.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.shortTitle.toLowerCase().includes(q) ||
        sec.keywords.some((k) => k.includes(q))
    )
  }, [searchQuery])

  const scrollToSection = (id: string) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & NAVIGATION BAR                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#EAF2FF] via-[#F4F7FC]/50 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0F54D6] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(23,105,255,0.25)] shrink-0 mt-1">
            <BookOpen className="w-7 h-7" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
                DOCUMENTATION & GUIDE
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] font-bold">
                BEGINNER FRIENDLY • VER 1.0
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10213D] tracking-tight">
              User Manual & Operator Guide
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] mt-1 font-medium max-w-2xl">
              Learn how to navigate the 3D motor digital twin, inspect live sensor metrics, understand AI anomaly predictions, manage alerts, and run What-If simulations.
            </p>
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            to="/"
            id="back-to-dashboard-btn"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1769FF] text-white text-xs font-bold hover:bg-[#0F54D6] shadow-[0_4px_12px_rgba(23,105,255,0.25)] hover:shadow-[0_6px_16px_rgba(23,105,255,0.35)] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEARCH & QUICK TOPIC NAVIGATION                        */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-[#DFE7F3] shadow-xs">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search manual (e.g. vibration, alerts, csv)..."
            className="w-full bg-[#F8FAFC] border border-[#DFE7F3] rounded-xl pl-10 pr-9 py-2 text-xs text-[#10213D] placeholder-[#64748B] focus:outline-none focus:border-[#1769FF] focus:bg-white focus:ring-2 focus:ring-[#1769FF]/10 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick jump pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 md:pb-0 scrollbar-none">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-[#1769FF] text-white shadow-xs'
                  : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#10213D]'
              }`}
            >
              {sec.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* Notice if search yields no results */}
      {filteredSections.length === 0 && (
        <Card className="text-center py-12">
          <HelpCircle className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#10213D]">No matching topics found</h3>
          <p className="text-xs text-[#64748B] mt-1">
            Try searching for terms like &quot;vibration&quot;, &quot;temperature&quot;, &quot;alert&quot;, &quot;csv&quot;, &quot;zoom&quot;, or &quot;database&quot;.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] text-xs font-bold hover:bg-[#BFDBFE] transition-colors"
          >
            Clear Search
          </button>
        </Card>
      )}

      {/* ========================================================= */}
      {/* SECTION: QUICK START GUIDE FOR BEGINNERS                  */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'quick-start')) && (
        <section id="quick-start" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Compass className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">Quick Start Guide for First-Time Users</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              4 EASY STEPS
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#475569] font-medium leading-relaxed">
            Welcome to the <strong>AI Digital Twin Simulator</strong>! Follow these four simple steps to get familiar with the application in under two minutes:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE7F3] shadow-xs hover:border-[#1769FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#1769FF] font-black text-sm flex items-center justify-center mb-3">
                  1
                </div>
                <h3 className="text-sm font-bold text-[#10213D]">Check Live Telemetry</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Start on the <strong>Dashboard</strong>. Review the three main gauges: Temperature, Vibration, and Motor Speed (RPM).
                </p>
              </div>
              <Link
                to="/"
                className="mt-4 text-xs font-bold text-[#1769FF] flex items-center gap-1 hover:underline"
              >
                Go to Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE7F3] shadow-xs hover:border-[#1769FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#1769FF] font-black text-sm flex items-center justify-center mb-3">
                  2
                </div>
                <h3 className="text-sm font-bold text-[#10213D]">Inspect the 3D Motor</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Open the <strong>3D Digital Twin</strong> page. Click and drag your mouse to rotate the motor in 360°, and scroll to zoom in on parts.
                </p>
              </div>
              <Link
                to="/digital-twin"
                className="mt-4 text-xs font-bold text-[#1769FF] flex items-center gap-1 hover:underline"
              >
                Open 3D Motor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE7F3] shadow-xs hover:border-[#1769FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#1769FF] font-black text-sm flex items-center justify-center mb-3">
                  3
                </div>
                <h3 className="text-sm font-bold text-[#10213D]">Observe Fault Mode</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Click the <strong>Toggle Mode</strong> button in the header. Watch the motor heat up (glowing red), shake faster, and trigger AI alerts.
                </p>
              </div>
              <span className="mt-4 text-xs font-semibold text-[#059669] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Easy to test
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#DFE7F3] shadow-xs hover:border-[#1769FF]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#1769FF] font-black text-sm flex items-center justify-center mb-3">
                  4
                </div>
                <h3 className="text-sm font-bold text-[#10213D]">Try What-If Testing</h3>
                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                  Visit <strong>What-If Simulation</strong>. Pick a preset like &quot;Thermal Runaway&quot; to test hypothetical AI predictions safely.
                </p>
              </div>
              <Link
                to="/what-if"
                className="mt-4 text-xs font-bold text-[#1769FF] flex items-center gap-1 hover:underline"
              >
                Try What-If <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 1: DASHBOARD & SENSORS                            */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'dashboard')) && (
        <section id="dashboard" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Activity className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">1. Dashboard & Live Sensor Telemetry</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              REAL-TIME MONITORING
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">Overview of the Dashboard</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              The <strong>Dashboard</strong> serves as your industrial digital twin cockpit. It connects to the live WebSocket stream to broadcast simulated sensor readings every 500 milliseconds.
            </p>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1769FF] mt-2">
              Understanding the 3 Primary Sensor Readings:
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Temperature Card */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="flex items-center gap-2 text-[#EA580C] font-bold text-xs mb-1.5">
                  <Thermometer className="w-4 h-4" />
                  <span>Stator Temperature (°C)</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Measures the thermal temperature of the stator copper windings.
                </p>
                <div className="mt-3 text-[11px] space-y-1 font-medium">
                  <div className="text-[#065F46]">• <strong>Normal:</strong> 58.0°C to 74.0°C</div>
                  <div className="text-[#B45309]">• <strong>Warning:</strong> 75.0°C to 90.0°C</div>
                  <div className="text-[#991B1B]">• <strong>Critical:</strong> &gt; 90.0°C (Risk of winding insulation breakdown)</div>
                </div>
              </div>

              {/* Vibration Card */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="flex items-center gap-2 text-[#7C3AED] font-bold text-xs mb-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Bearing Vibration (mm/s RMS)</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Measures overall drive-end bearing vibration velocity based on <strong>ISO 10816</strong> standards.
                </p>
                <div className="mt-3 text-[11px] space-y-1 font-medium">
                  <div className="text-[#065F46]">• <strong>Normal (Zone A/B):</strong> 0.8 to 1.8 mm/s</div>
                  <div className="text-[#B45309]">• <strong>Warning (Zone C):</strong> 1.8 to 4.5 mm/s (Mechanical unbalance)</div>
                  <div className="text-[#991B1B]">• <strong>Critical (Zone D):</strong> &gt; 4.5 mm/s (Severe damage hazard)</div>
                </div>
              </div>

              {/* RPM Card */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs mb-1.5">
                  <Activity className="w-4 h-4" />
                  <span>Motor Speed (RPM)</span>
                </div>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Measures the rotational speed of the motor shaft in revolutions per minute.
                </p>
                <div className="mt-3 text-[11px] space-y-1 font-medium">
                  <div className="text-[#065F46]">• <strong>Nominal 4-Pole:</strong> ~1,488 RPM (50Hz grid with slip)</div>
                  <div className="text-[#B45309]">• <strong>Slowing / Drag:</strong> 1,350 to 1,420 RPM</div>
                  <div className="text-[#991B1B]">• <strong>Critical Drop:</strong> &lt; 1,300 RPM (Mechanical stall/overload)</div>
                </div>
              </div>
            </div>

            {/* Overall Machine Statuses */}
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] mt-3">
              <h5 className="text-xs font-bold text-[#1E40AF] flex items-center gap-1.5">
                <Info className="w-4 h-4" /> Overall Machine Health States
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-xs text-[#1E3A8A]">
                <div><span className="font-bold text-[#059669]">● Normal:</span> All 3 sensors within baseline parameters.</div>
                <div><span className="font-bold text-[#D97706]">● Warning:</span> One parameter has entered warning levels.</div>
                <div><span className="font-bold text-[#DC2626]">● Critical:</span> At least one parameter exceeds safety boundaries.</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 2: 3D DIGITAL TWIN MOTOR VIEWER                   */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === '3d-twin')) && (
        <section id="3d-twin" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Box className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">2. 3D Digital Twin Motor Viewer</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              THREE.JS / WEBGL
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">How to Control and Inspect the 3D Model</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              The 3D motor viewer simulates a high-voltage industrial induction motor in real-time. It synchronizes mechanical shaft rotation and physical materials with the live sensor data.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold text-xs mb-2">
                  <Eye className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#10213D]">Rotate (Orbit)</h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Click and hold the <strong>left mouse button</strong> anywhere on the 3D viewport, then drag to spin the camera in 360 degrees.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold text-xs mb-2">
                  <Sliders className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#10213D]">Zoom (In & Out)</h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Scroll your <strong>mouse wheel</strong> up or down (or pinch on touch screens) to zoom in on bearings, windings, and fan blades.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-8 h-8 rounded-lg bg-[#EAF2FF] text-[#1769FF] flex items-center justify-center font-bold text-xs mb-2">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[#10213D]">Inspect Components</h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Click on parts such as the <strong>Rotor Core</strong>, <strong>Stator Housing</strong>, or <strong>Drive Bearings</strong> to open component details.
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1769FF] pt-2">
              Normal vs. Fault Conditions in 3D:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <span className="text-xs font-bold text-[#065F46] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Normal Operating State
                </span>
                <ul className="mt-2 text-xs text-[#065F46] space-y-1 list-disc list-inside">
                  <li>Metallic grey-blue stator finish.</li>
                  <li>Smooth shaft rotation at nominal 1,488 RPM.</li>
                  <li>Subtle, whisper-quiet mechanical baseline vibration.</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <span className="text-xs font-bold text-[#991B1B] flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4" /> Fault Mode (Degradation)
                </span>
                <ul className="mt-2 text-xs text-[#991B1B] space-y-1 list-disc list-inside">
                  <li>Stator glows amber (&gt;75°C) and changes to <strong>radiant alert red</strong> (&gt;100°C).</li>
                  <li>Bearing oscillation displacement shakes vigorously.</li>
                  <li>Motor shaft rotational velocity slows down noticeably.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 3: AI ANOMALY DETECTION ENGINE                    */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'ai-anomaly')) && (
        <section id="ai-anomaly" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Brain className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">3. AI Anomaly Detection Engine</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              SCIKIT-LEARN ISOLATION FOREST
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">What is Anomaly Detection in Simple English?</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Think of the AI model as an automated expert inspector watching your motor around the clock. The AI uses an algorithm called <strong>Isolation Forest</strong>. It learned what the motor looks like when running under normal conditions ($6,000$ training samples).
            </p>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Instead of looking at just one number, it evaluates <strong>Temperature, Vibration, and RPM simultaneously</strong>. If temperature rises while RPM drops and vibration shakes erratically, the AI immediately flags this pattern as an <strong>Outlier (Anomaly)</strong> before machine failure occurs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#059669]" /> Anomaly Score Interpretation
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  The decision function produces continuous scores:
                </p>
                <div className="mt-2 text-xs font-mono space-y-1">
                  <div className="text-[#059669]">Score &gt; 0.00: <strong>Nominal Inlier (Healthy)</strong></div>
                  <div className="text-[#DC2626]">Score &lt; 0.00: <strong>Anomaly Outlier (Fault detected)</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#1769FF]" /> Where to View AI Predictions
                </h4>
                <ul className="mt-2 text-xs text-[#64748B] space-y-1 list-disc list-inside">
                  <li><strong>Dashboard:</strong> Top AI Status Card shows live outlier flags.</li>
                  <li><strong>AI Center:</strong> Full score gauge, diagnostic deviations, and metrics.</li>
                  <li><strong>Header:</strong> Pill shows System Online & AI Model status.</li>
                </ul>
              </div>
            </div>

            {/* Synthetic Data Disclaimer Callout */}
            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#92400E]">Important Notice: Synthetic Data Only</h5>
                <p className="text-xs text-[#B45309] mt-0.5 leading-relaxed">
                  This simulator generates sensor telemetry using physics-informed mathematical models. The Isolation Forest model is trained and benchmarked on synthetic evaluation data. It is intended for software simulation and training purposes; it does not connect to physical factory machinery and does not represent certified industrial hardware performance.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 4: ALERT MANAGEMENT                               */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'alerts')) && (
        <section id="alerts" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <AlertTriangle className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">4. Alert Management & Operator Lifecycle</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              REAL-TIME SAFETY
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">Alert Severity Levels</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              When an anomaly or extreme threshold breach is detected, the system dispatches an alert. Alerts are categorized into three operational severity tiers:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
                <div className="flex items-center gap-1.5 text-[#991B1B] font-bold text-xs">
                  <AlertOctagon className="w-4 h-4" /> Critical Severity
                </div>
                <p className="text-xs text-[#991B1B] mt-1 leading-snug">
                  Temperature &gt; 90°C or vibration &gt; 4.5 mm/s. Indicates an active machine risk requiring immediate inspection.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                <div className="flex items-center gap-1.5 text-[#92400E] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" /> High / Warning Severity
                </div>
                <p className="text-xs text-[#92400E] mt-1 leading-snug">
                  Elevated heat (75°C to 90°C) or vibration (1.8 to 4.5 mm/s). Early warning before structural damage occurs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="flex items-center gap-1.5 text-[#1E40AF] font-bold text-xs">
                  <Info className="w-4 h-4" /> Medium / Info Severity
                </div>
                <p className="text-xs text-[#1E40AF] mt-1 leading-snug">
                  System events, simulator mode changes, motor pause/resume, or operator resets.
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1769FF] pt-2">
              How to Manage Active Alerts (Step-by-Step):
            </h4>

            <div className="space-y-3">
              {/* Step 1: Acknowledge */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                    Acknowledge an Alert (Checkmark icon <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />)
                  </h5>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Click the <strong>Acknowledge</strong> button on any active alert. This records that an operator has reviewed the warning. The alert stays in history with an amber &quot;Acknowledged&quot; status and silences active audio alerts.
                  </p>
                </div>
              </div>

              {/* Step 2: Dismiss */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                    Dismiss an Alert (Cross icon <X className="w-3.5 h-3.5 text-[#64748B]" />)
                  </h5>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Click <strong>Dismiss</strong> to close the alert card. The alert is moved into the &quot;Dismissed&quot; archive tab. Dismissing an alert does <em>not</em> delete telemetry or alter the underlying AI model scores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: ANALYTICS & SENSOR HISTORY                     */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'analytics')) && (
        <section id="analytics" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <BarChart2 className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">5. Analytics Dashboard & CSV Export</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              HISTORICAL TELEMETRY
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">How to View Charts and Export Data</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              The <strong>Analytics Dashboard</strong> maintains a circular buffer of sensor readings over time. It lets maintenance engineers analyze multi-channel trends and download raw telemetry.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#1769FF]" /> Time Range Filters
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Use the time interval buttons at the top right of the chart:
                </p>
                <div className="mt-2 text-xs text-[#475569] space-y-1">
                  <div>• <strong>30s:</strong> Last 30 seconds of high-frequency telemetry.</div>
                  <div>• <strong>1m / 2m / 5m:</strong> Short-term trend windows.</div>
                  <div>• <strong>All:</strong> Entire buffered history buffer.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#1769FF]" /> Exporting to CSV
                </h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Click the <strong>Export CSV</strong> button in the top right corner. The browser will immediately generate and download an RFC-compliant CSV file with:
                </p>
                <div className="mt-2 text-[11px] font-mono text-[#475569] space-y-0.5 bg-white p-2 rounded border border-[#DFE7F3]">
                  <div>Sequence, Timestamp, Temp (°C), Vibration (mm/s), RPM</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 6: WHAT-IF SIMULATION                             */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'what-if')) && (
        <section id="what-if" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Sparkles className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">6. Interactive What-If Simulation</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              COUNTERFACTUAL TESTING
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">Simulate Custom Scenarios Without Risk</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              What-If simulation lets you test counterfactual operating states on the Isolation Forest AI model without risking physical equipment or modifying the live simulator telemetry.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#10213D]">Choose a Preset or Custom Values</h4>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Click any of the <strong>7 Quick Presets</strong> (e.g., <em>Nominal Baseline</em>, <em>Thermal Runaway</em>, <em>Bearing Friction</em>, <em>Electrical Overload</em>) or drag the sliders to set exact custom Temperature (20°C–140°C), Vibration (0–14 mm/s), and RPM (600–1800).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#10213D]">Run AI Prediction</h4>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Click <strong>Run What-If Prediction</strong>. The model computes the outlier status, decision score, and diagnostic deviations in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <div className="w-6 h-6 rounded-full bg-[#1769FF] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#10213D]">Compare with Live Baseline</h4>
                  <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">
                    Review the side-by-side comparison card. It shows the mathematical delta (Δ) between your hypothetical scenario and the live running motor.
                  </p>
                </div>
              </div>
            </div>

            {/* Strict Isolation Notice */}
            <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-[#1E40AF]">Strict Isolation Guarantee</h5>
                <p className="text-xs text-[#1E3A8A] mt-0.5 leading-relaxed">
                  What-If experiments are strictly mathematical queries. They <strong>never alter live sensor readings</strong>, <strong>never trigger operational alerts</strong>, and <strong>never disturb the 3D motor viewer</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* SECTION 7: DATABASE CONNECTIVITY & STATUS                 */}
      {/* ========================================================= */}
      {(searchQuery === '' || filteredSections.some((s) => s.id === 'database')) && (
        <section id="database" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#DFE7F3]">
            <Database className="w-5 h-5 text-[#1769FF]" />
            <h2 className="text-xl font-bold text-[#10213D]">7. Database Status & Cloud Persistence</h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EAF2FF] text-[#1769FF]">
              SUPABASE POSTGRESQL
            </span>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#DFE7F3] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#10213D]">How Database Persistence Works</h3>
            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              The AI Digital Twin Simulator integrates with <strong>Supabase PostgreSQL</strong> using an enterprise connection session pooler on port 5432. Telemetry and predictions are written asynchronously in the background so the real-time WebSocket stream is never delayed.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D]">How to Check Database Connectivity</h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  The backend provides an automated health probe at <code>/api/v1/db/health</code>. You can verify:
                </p>
                <div className="mt-2 text-xs text-[#475569] space-y-1">
                  <div>• <strong>Status:</strong> <code>connected</code> or <code>disconnected</code></div>
                  <div>• <strong>Host:</strong> Supabase Pooler (`aws-0-ap-northeast-2.pooler.supabase.com`)</div>
                  <div>• <strong>Latency:</strong> Round-trip query ping time in milliseconds.</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
                <h4 className="text-xs font-bold text-[#10213D]">Registered Database Tables</h4>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Managed via Alembic database migrations:
                </p>
                <div className="mt-2 text-xs font-mono text-[#475569] space-y-1">
                  <div>1. <code>sensor_readings</code> (Historical telemetry)</div>
                  <div>2. <code>ai_predictions</code> (Inference outputs & scores)</div>
                  <div>3. <code>alert_records</code> (Operational safety alerts)</div>
                  <div>4. <code>whatif_experiments</code> (Saved counterfactuals)</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span className="text-xs font-bold text-[#065F46] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Seamless Offline Fallback
              </span>
              <p className="text-xs text-[#065F46] mt-1 leading-relaxed">
                If the cloud Supabase database is unreachable, the simulator automatically continues running in in-memory mode. The live 3D viewer, WebSocket updates, and AI predictions continue operating smoothly without interruption.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* BOTTOM FOOTER NAVIGATION                                  */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-[#10213D]">Ready to monitor the Digital Twin?</h4>
          <p className="text-xs text-[#64748B] mt-0.5">
            Return to the main overview dashboard or open the interactive 3D viewer.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/digital-twin"
            className="px-4 py-2 rounded-xl bg-[#F1F5F9] text-[#10213D] text-xs font-bold hover:bg-[#E2E8F0] transition-colors"
          >
            Open 3D Motor
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-[#1769FF] text-white text-xs font-bold hover:bg-[#0F54D6] shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default UserManualPage
