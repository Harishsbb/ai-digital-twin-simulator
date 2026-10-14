import React, { useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Radio,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { fetchBackendHealth, fetchBackendInfo, getApiBaseUrl } from '../services/api'
import type { BackendAppInfoResponse, BackendHealthResponse } from '../types'

export const OverviewPage: React.FC = () => {
  const [healthData, setHealthData] = useState<BackendHealthResponse | null>(null)
  const [appInfo, setAppInfo] = useState<BackendAppInfoResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const loadBackendData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [h, info] = await Promise.all([
        fetchBackendHealth(),
        fetchBackendInfo(),
      ])
      setHealthData(h)
      setAppInfo(info)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to backend server'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const [h, info] = await Promise.all([
          fetchBackendHealth(),
          fetchBackendInfo(),
        ])
        if (active) {
          setHealthData(h)
          setAppInfo(info)
          setError(null)
        }
      } catch (err: unknown) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Failed to connect to backend server'
          setError(message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Title & System Stage Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold font-mono tracking-tight text-slate-100">
              System Overview & Infrastructure
            </h2>
            <StatusBadge label="PHASE 1 : SETUP" variant="info" pulse={false} />
          </div>
          <p className="text-sm text-slate-400">
            Industrial Machine Telemetry Baseline & Foundation Shell
          </p>
        </div>

        <button
          onClick={loadBackendData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-200 hover:bg-slate-800 hover:border-slate-600 transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh System Status</span>
        </button>
      </div>

      {/* Grid of Specification & Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: Monitored Machine Specifications */}
        <Card
          title="Monitored Asset Profile"
          subtitle="Target industrial equipment specifications"
          icon={Cpu}
          badge={<StatusBadge label="Standby" variant="neutral" pulse={false} />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Asset Identifier</span>
              <span className="text-cyan-400 font-semibold">MTR-IND-150KW-01</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Equipment Type</span>
              <span className="text-slate-200">HV Induction Motor</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Power Rating</span>
              <span className="text-slate-200">150 kW (200 HP)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Synchronous RPM</span>
              <span className="text-slate-200">1,500 RPM (50 Hz)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Rated Voltage / Current</span>
              <span className="text-slate-200">400 V / 270 A</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 font-sans">
              <span>Facility Zone: Bay 4 — Substation Primary Drive</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Backend API Integration & Live Health */}
        <Card
          title="Backend API Status"
          subtitle="FastAPI verification and system info"
          icon={Server}
          badge={
            loading ? (
              <StatusBadge label="Checking..." variant="neutral" pulse={true} />
            ) : healthData ? (
              <StatusBadge label="Online" variant="success" pulse={true} />
            ) : (
              <StatusBadge label="Disconnected" variant="error" pulse={false} />
            )
          }
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Base API URL</span>
              <span className="text-slate-300 truncate max-w-[170px]" title={getApiBaseUrl()}>
                {getApiBaseUrl()}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Service Status</span>
              <span className={healthData ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                {healthData ? healthData.status.toUpperCase() : 'OFFLINE'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">App Name</span>
              <span className="text-slate-200">{appInfo?.app_name || 'AI Digital Twin'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Build Version</span>
              <span className="text-slate-200">{appInfo?.version || '0.1.0'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Architecture Stage</span>
              <span className="text-cyan-400">{appInfo?.stage || 'Step 1: Project Setup'}</span>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-rose-300 font-sans">
                Notice: Backend server unreachable at {getApiBaseUrl()}. Please ensure FastAPI is running on port 8000.
              </div>
            )}
          </div>
        </Card>

        {/* Card 3: Telemetry Stream Pipeline Readiness */}
        <Card
          title="Telemetry Architecture"
          subtitle="Sensor bus & ingestion configuration"
          icon={Radio}
          badge={<StatusBadge label="Standby" variant="info" pulse={false} />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Pipeline State</span>
              <span className="text-amber-400">Standby (Phase 2 Prep)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Target Protocol</span>
              <span className="text-slate-200">WebSocket / REST</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Planned Sampling Rate</span>
              <span className="text-slate-200">50 Hz (20ms cycle)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Buffer Size</span>
              <span className="text-slate-200">2,000 points / channel</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Active Sensor Channels</span>
              <span className="text-cyan-400">6 channels planned</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans pt-1">
              Sensor simulation algorithms will be implemented in Step 2.
            </p>
          </div>
        </Card>

        {/* Card 4: AI Anomaly Engine Specifications */}
        <Card
          title="AI Diagnostics Engine"
          subtitle="Predictive maintenance ML pipeline"
          icon={ShieldCheck}
          badge={<StatusBadge label="Planned" variant="neutral" pulse={false} />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Model Architecture</span>
              <span className="text-slate-200">Autoencoder + Isolation Forest</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Target Features</span>
              <span className="text-slate-200">FFT Vibration + RMS Temp</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Inference Mode</span>
              <span className="text-slate-200">Edge Streaming (FastAPI)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Target Failure Modes</span>
              <span className="text-slate-200">Bearing Wear, Imbalance, Overheat</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans pt-1">
              Machine learning models and inference endpoints will be integrated in Phase 4.
            </p>
          </div>
        </Card>

        {/* Card 5: Sensor Subsystem Layout Overview */}
        <Card
          title="Planned Sensor Topology"
          subtitle="Physical sensing locations on motor body"
          icon={Activity}
          badge={<StatusBadge label="Standby" variant="neutral" pulse={false} />}
        >
          <div className="space-y-2.5 text-xs">
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Drive-End (DE) Bearing</span>
              <span className="text-[10px] font-mono text-cyan-400">Vibration (Tri-axial)</span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Non-Drive-End (NDE) Bearing</span>
              <span className="text-[10px] font-mono text-cyan-400">Vibration (Tri-axial)</span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Stator Windings (Phase U/V/W)</span>
              <span className="text-[10px] font-mono text-amber-400">PT100 Temperature</span>
            </div>
            <div className="p-2 rounded bg-slate-950/60 border border-slate-800/70 flex items-center justify-between">
              <span className="text-slate-300 font-medium">Power Terminal Box</span>
              <span className="text-[10px] font-mono text-emerald-400">Current & Voltage</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Live mathematical telemetry generation is disabled during Step 1.
            </p>
          </div>
        </Card>

        {/* Card 6: Interactive 3D Digital Twin Specs */}
        <Card
          title="3D Digital Twin Viewport"
          subtitle="Three.js / WebGL visualization layer"
          icon={Layers}
          badge={<StatusBadge label="Phase 3" variant="info" pulse={false} />}
        >
          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Renderer</span>
              <span className="text-slate-200">Three.js / React Three Fiber</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Asset Format</span>
              <span className="text-slate-200">GLTF / Procedural Motor Mesh</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Interaction</span>
              <span className="text-slate-200">OrbitControls, Heatmap Overlay</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Subsystem Inspection</span>
              <span className="text-cyan-400">Exploded View Support</span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans pt-1">
              Interactive 3D model and shader overlays will be added in Phase 3.
            </p>
          </div>
        </Card>
      </div>

      {/* Development Roadmap Card */}
      <Card
        title="Implementation Roadmap & Status"
        subtitle="Step-by-step development sequence for the AI Digital Twin Simulator"
        icon={Clock}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          <div className="p-3.5 rounded-lg border border-cyan-800/60 bg-cyan-950/30">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-mono font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>STEP 1</span>
            </div>
            <div className="text-xs font-medium text-slate-200">Project Setup</div>
            <div className="text-[11px] text-slate-400 mt-1">
              React + Vite + Tailwind shell, FastAPI backend, routing & health checks.
            </div>
            <div className="mt-2 text-[10px] font-mono text-cyan-300 font-semibold uppercase">
              Current Step
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 opacity-75">
            <div className="text-slate-400 text-xs font-mono font-semibold mb-1">STEP 2</div>
            <div className="text-xs font-medium text-slate-300">Sensor Simulation</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Motor telemetry physics, vibration/temperature generation & WebSockets.
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">Upcoming</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 opacity-75">
            <div className="text-slate-400 text-xs font-mono font-semibold mb-1">STEP 3</div>
            <div className="text-xs font-medium text-slate-300">3D Digital Twin</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Interactive 3D motor model, thermal heatmaps & component dissection.
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">Upcoming</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 opacity-75">
            <div className="text-slate-400 text-xs font-mono font-semibold mb-1">STEP 4</div>
            <div className="text-xs font-medium text-slate-300">AI Anomaly Engine</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Unsupervised ML models, drift detection & health index scoring.
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">Upcoming</div>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-900/40 opacity-75">
            <div className="text-slate-400 text-xs font-mono font-semibold mb-1">STEP 5</div>
            <div className="text-xs font-medium text-slate-300">Alerts & Analytics</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Threshold triggers, incident management & historical telemetry logs.
            </div>
            <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">Upcoming</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
