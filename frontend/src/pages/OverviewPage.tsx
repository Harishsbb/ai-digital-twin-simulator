import React, { useEffect, useState } from 'react'
import {
  CheckCircle2,
  Gauge,
  Layers,
  RefreshCw,
  Server,
  Terminal,
  Zap,
} from 'lucide-react'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { fetchBackendHealth, fetchBackendInfo, getApiBaseUrl } from '../services/api'
import type { BackendAppInfoResponse, BackendHealthResponse } from '../types'

interface SensorHotspot {
  id: string
  code: string
  name: string
  type: string
  location: string
  sampling: string
  spec: string
}

const SENSOR_HOTSPOTS: SensorHotspot[] = [
  {
    id: 'vib-de',
    code: 'VIB-DE-01',
    name: 'Drive-End Bearing Accelerometer',
    type: 'Piezoelectric IEPE Tri-axial',
    location: 'Shaft Extension Housing (DE)',
    sampling: '50 Hz (20ms) / 10 kHz FFT Burst',
    spec: 'ISO 10816-3 Zone A (<2.3 mm/s RMS)',
  },
  {
    id: 'vib-nde',
    code: 'VIB-NDE-01',
    name: 'Non-Drive-End Bearing Accelerometer',
    type: 'Piezoelectric IEPE Tri-axial',
    location: 'Rear End-Shield Housing (NDE)',
    sampling: '50 Hz (20ms) / 10 kHz FFT Burst',
    spec: 'ISO 10816-3 Zone A (<2.3 mm/s RMS)',
  },
  {
    id: 'tmp-stator',
    code: 'TMP-ST-UVW',
    name: 'Stator Winding Thermocouple Array',
    type: '3x PT100 RTD Class A 4-Wire',
    location: 'Phase U, V, W Slot Embedments',
    sampling: '10 Hz / Moving Average',
    spec: 'Class F Insulation Max 155°C (Trip @ 140°C)',
  },
  {
    id: 'pwr-hall',
    code: 'PWR-CT-01',
    name: '3-Phase Current & Voltage Transducer',
    type: 'Hall-Effect Closed Loop Transducer',
    location: 'Main Power Terminal Junction Box',
    sampling: '100 Hz / True RMS Calculation',
    spec: '400V AC Nominal / 270A Full Load',
  },
]

interface SimulationScenario {
  id: string
  name: string
  category: string
  description: string
  mathModel: string
  plannedImpact: string
}

const SCENARIOS: SimulationScenario[] = [
  {
    id: 'nominal',
    name: 'Nominal Baseline (Steady State)',
    category: 'Normal Operation',
    description: 'Motor operating at rated 1488 RPM under 85% mechanical load. Thermal equilibrium maintained by cooling fan.',
    mathModel: 'v(t) = A·sin(2π·f₀·t) + η(t), where f₀=24.8 Hz, η ~ N(0, 0.05²)',
    plannedImpact: 'Vibration RMS < 1.4 mm/s, Stator Temp ~ 72°C, Current balanced at 230A.',
  },
  {
    id: 'bearing-fault',
    name: 'Bearing Outer Race Defect (BPFO)',
    category: 'Mechanical Fault',
    description: 'Micro-spalling on outer raceway generating cyclic impact shocks each time rolling elements pass defect.',
    mathModel: 'f_BPFO = (n/2)·f_r·(1 - (d/D)·cos α) ≈ 107.4 Hz harmonic train with exponential decay',
    plannedImpact: 'High-frequency vibration bursts, crest factor > 5.2, ISO alert advisory trigger.',
  },
  {
    id: 'thermal-drift',
    name: 'Cooling Fin Blockage & Thermal Rise',
    category: 'Thermal Stress',
    description: 'Gradual airflow restriction across stator housing causing exponential temperature climb toward Class F limit.',
    mathModel: 'T_stator(t) = T_ambient + ΔT_max·(1 - e^(-t/τ_th)) + P_copper / G_cooling',
    plannedImpact: 'Stator Phase U/V/W temps climb to 138°C; triggers warning escalation within 12 min.',
  },
  {
    id: 'eccentricity',
    name: 'Dynamic Rotor Airgap Eccentricity',
    category: 'Electromechanical',
    description: 'Center of rotation differs from stator geometric center, causing unbalanced magnetic pull (UMP).',
    mathModel: 'Sidebands at f_side = f_supply ± f_r (50 Hz ± 24.8 Hz = 25.2 Hz & 74.8 Hz)',
    plannedImpact: 'Current spectrum sidebands visible in FFT; 2x rotational speed vibration spike.',
  },
]

export const OverviewPage: React.FC = () => {
  const [healthData, setHealthData] = useState<BackendHealthResponse | null>(null)
  const [appInfo, setAppInfo] = useState<BackendAppInfoResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedHotspot, setSelectedHotspot] = useState<SensorHotspot>(SENSOR_HOTSPOTS[0])
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(SCENARIOS[0])

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
      {/* Top Header / System Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
              FACILITY // PLANT NORTH - BAY 04
            </span>
            <span className="text-[#475569] font-mono text-xs font-semibold">COORDINATES // 41.8781° N, 87.6298° W</span>
          </div>
          <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
            Asset Supervisor & Machine Architecture
          </h1>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Target Machine: Siemens Simotics GP 150 kW High-Voltage Induction Motor (3-Phase, 4-Pole)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBackendData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF2FF] hover:bg-[#D9E8FF] border border-[#BFDBFE] text-xs font-semibold text-[#1769FF] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#1769FF]' : ''}`} />
            <span>Verify API Handshake</span>
          </button>
        </div>
      </div>

      {/* Primary Asset Blueprint & Nameplate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Motor Blueprint (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Interactive Motor Blueprint & Sensor Map"
            subtitle="Click or tap any probe marker to inspect telemetry specifications"
            tag="CAD DRAFTING"
            icon={Layers}
            badge={<StatusBadge label="SCHEMATIC 2D" variant="laser" pulse={false} size="sm" />}
          >
            {/* Vector Blueprint Visualizer on Dark Technical Sheet */}
            <div className="relative rounded-xl bg-[#0B1528] border border-[#1E293B] p-4 overflow-hidden shadow-inner">
              {/* Technical drafting grid inside blueprint */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Technical SVG Motor Blueprint */}
              <div className="relative z-10 py-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 600 240"
                  className="w-full max-w-xl h-auto"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Shaft line */}
                  <rect x="20" y="110" width="560" height="20" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" />
                  
                  {/* Motor Frame / Stator Casing */}
                  <rect x="150" y="40" width="300" height="160" rx="8" fill="#131e2e" stroke="#38bdf8" strokeWidth="2" />
                  
                  {/* Cooling Fins on Stator */}
                  {[170, 195, 220, 245, 270, 295, 320, 345, 370, 395, 420].map((x) => (
                    <line key={x} x1={x} y1="32" x2={x} y2="40" stroke="#38bdf8" strokeWidth="2" />
                  ))}
                  {[170, 195, 220, 245, 270, 295, 320, 345, 370, 395, 420].map((x) => (
                    <line key={x} x1={x} y1="200" x2={x} y2="208" stroke="#38bdf8" strokeWidth="2" />
                  ))}

                  {/* Stator Core Windings */}
                  <rect x="180" y="60" width="240" height="120" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                  <path d="M 190 70 L 410 70 M 190 170 L 410 170" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Drive-End (DE) Bearing Housing */}
                  <rect x="120" y="75" width="30" height="90" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="135" cy="120" r="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Non-Drive-End (NDE) Bearing Housing */}
                  <rect x="450" y="75" width="30" height="90" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <circle cx="465" cy="120" r="12" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />

                  {/* Power Terminal Junction Box */}
                  <rect x="250" y="10" width="100" height="30" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="2" />
                  <text x="268" y="28" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold">PWR TERM</text>

                  {/* Cooling Fan Shroud (NDE Side) */}
                  <path d="M 480 55 L 530 75 L 530 165 L 480 185 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
                  <text x="495" y="124" fill="#94a3b8" fontSize="9" fontFamily="monospace">FAN</text>

                  {/* Drive Shaft Keyway */}
                  <rect x="40" y="105" width="40" height="6" fill="#38bdf8" />
                  <text x="45" y="145" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">OUTPUT SHAFT</text>

                  {/* Interactive Hotspot 1: VIB-DE-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[0])}
                  >
                    <circle cx="135" cy="50" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="135" cy="50" r="4" fill="#ffffff" className="animate-ping" />
                    <text x="127" y="54" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">DE</text>
                  </g>

                  {/* Interactive Hotspot 2: VIB-NDE-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[1])}
                  >
                    <circle cx="465" cy="50" r="14" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <circle cx="465" cy="50" r="4" fill="#ffffff" className="animate-ping" />
                    <text x="454" y="54" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">NDE</text>
                  </g>

                  {/* Interactive Hotspot 3: TMP-ST-UVW */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[2])}
                  >
                    <circle cx="300" cy="120" r="16" fill="#b45309" stroke="#f59e0b" strokeWidth="2" />
                    <text x="290" y="124" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">TMP</text>
                  </g>

                  {/* Interactive Hotspot 4: PWR-CT-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[3])}
                  >
                    <circle cx="230" cy="25" r="14" fill="#047857" stroke="#10b981" strokeWidth="2" />
                    <text x="221" y="29" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">PWR</text>
                  </g>
                </svg>
              </div>

              {/* Bottom probe selector pill bar */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-slate-300 text-[11px] font-bold">ACTIVE PROBE SELECTION:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SENSOR_HOTSPOTS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspot(h)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
                        selectedHotspot.id === h.id
                          ? 'bg-[#1769FF] text-white border-[#1769FF] font-bold shadow-xs'
                          : 'bg-[#132238] text-slate-300 border-slate-700 hover:text-white hover:bg-[#1E3A5F]'
                      }`}
                    >
                      {h.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Hotspot Detailed Specs Panel */}
            <div className="mt-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] font-mono text-xs space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="text-[#1769FF] font-bold">{selectedHotspot.code}</span>
                  <span className="text-[#10213D] font-bold">{selectedHotspot.name}</span>
                </div>
                <StatusBadge label="PROBE READY" variant="success" pulse={false} size="sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-[#475569] font-semibold">Transducer:</span>{' '}
                  <span className="text-[#10213D] font-bold">{selectedHotspot.type}</span>
                </div>
                <div>
                  <span className="text-[#475569] font-semibold">Location:</span>{' '}
                  <span className="text-[#10213D] font-bold">{selectedHotspot.location}</span>
                </div>
                <div>
                  <span className="text-[#475569] font-semibold">Sampling Rate:</span>{' '}
                  <span className="text-[#10213D] font-bold">{selectedHotspot.sampling}</span>
                </div>
                <div>
                  <span className="text-[#475569] font-semibold">Threshold:</span>{' '}
                  <span className="text-[#B45309] font-bold">{selectedHotspot.spec}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Physical Rating Nameplate (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Machine Nameplate */}
          <div className="relative rounded-2xl bg-white border border-[#DFE7F3] p-6 shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div>
                <h2 className="text-xs tracking-wider uppercase font-bold text-[#1769FF]">
                  EQUIPMENT NAMEPLATE // RATING DATA
                </h2>
                <p className="text-[11px] text-[#475569] font-medium mt-0.5">
                  SIEMENS SIMOTICS GP 1LE1 HIGH EFFICIENCY MOTOR
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
                IE3 PREMIUM
              </span>
            </div>

            <div className="font-sans text-xs space-y-3">
              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-[#F1F5F9]">
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">RATED POWER</div>
                  <div className="text-[#10213D] font-bold text-sm mt-0.5">150 kW (200 HP)</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">FRAME SIZE</div>
                  <div className="text-[#10213D] font-bold text-sm mt-0.5">315 M (Cast Iron)</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pb-2.5 border-b border-[#F1F5F9] text-[11px]">
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">VOLTAGE</div>
                  <div className="text-[#0F172A] font-bold mt-0.5">400 V Δ / 690 V Y</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">CURRENT</div>
                  <div className="text-[#0F172A] font-bold mt-0.5">265 A / 153 A</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">FREQUENCY</div>
                  <div className="text-[#0F172A] font-bold mt-0.5">50 Hz</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pb-2.5 border-b border-[#F1F5F9] text-[11px]">
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">SPEED (RPM)</div>
                  <div className="text-[#1769FF] font-bold mt-0.5">1488 RPM</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">COS φ (PF)</div>
                  <div className="text-[#0F172A] font-bold mt-0.5">0.88</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">EFFICIENCY</div>
                  <div className="text-[#059669] font-bold mt-0.5">96.2 %</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-[11px] pt-1">
                <div>
                  <span className="text-[#475569] font-bold">ENCLOSURE:</span>{' '}
                  <span className="text-[#0F172A] font-semibold">IP55 / IC411 TEFC</span>
                </div>
                <div>
                  <span className="text-[#475569] font-bold">MASS:</span>{' '}
                  <span className="text-[#0F172A] font-semibold">1,140 kg</span>
                </div>
                <div>
                  <span className="text-[#475569] font-bold">INSULATION:</span>{' '}
                  <span className="text-[#0F172A] font-semibold">Class 155 (F)</span>
                </div>
                <div>
                  <span className="text-[#475569] font-bold">SERIAL NO:</span>{' '}
                  <span className="text-[#1769FF] font-mono font-bold">SN-9042-DE-2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Backend API Telemetry Health Card */}
          <Card
            title="Backend Telemetry Bridge"
            subtitle="FastAPI verification and handshake telemetry"
            tag="REST LINK"
            icon={Server}
            badge={
              loading ? (
                <StatusBadge label="PINGING" variant="neutral" pulse={true} size="sm" />
              ) : healthData ? (
                <StatusBadge label="LINK ACTIVE" variant="success" pulse={true} size="sm" />
              ) : (
                <StatusBadge label="OFFLINE" variant="error" pulse={false} size="sm" />
              )
            }
          >
            <div className="font-sans text-xs space-y-2.5">
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#475569] font-medium">API Host URL</span>
                <span className="text-[#10213D] font-mono font-bold truncate max-w-[190px]" title={getApiBaseUrl()}>
                  {getApiBaseUrl()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#475569] font-medium">Service Status</span>
                <span className={healthData ? 'text-[#059669] font-bold' : 'text-[#DC2626] font-bold'}>
                  {healthData ? healthData.status.toUpperCase() : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#475569] font-medium">Build Version</span>
                <span className="text-[#10213D] font-mono font-bold">{appInfo?.version || '0.1.0'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
                <span className="text-[#475569] font-medium">Architecture Stage</span>
                <span className="text-[#1769FF] font-bold">{appInfo?.stage || 'Step 2: 3D Twin'}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-[#475569]">
                <span className="font-medium">CORS Restriction:</span>
                <span className="text-[#059669] font-mono font-bold">http://localhost:5173 only</span>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium mt-2">
                  Notice: Backend API is unreachable at {getApiBaseUrl()}. Please ensure Uvicorn is running.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Interactive Simulation Physics Scenario Previewer */}
      <Card
        title="Telemetry Simulation Engine // Scenario Physics Preview"
        subtitle="Select a target operating scenario to inspect its mathematical disturbance model for Step 2"
        tag="PHYSICS MATRIX"
        icon={Gauge}
        badge={<StatusBadge label="INTERACTIVE PRESET" variant="info" pulse={false} size="sm" />}
      >
        <div className="space-y-4">
          {/* Scenario Buttons Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedScenario.id === s.id
                    ? 'bg-[#EAF2FF] border-[#1769FF] shadow-xs ring-1 ring-[#1769FF]/30'
                    : 'bg-white border-[#DFE7F3] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#475569] font-bold uppercase tracking-wider">{s.category}</span>
                  {selectedScenario.id === s.id && (
                    <span className="w-2 h-2 rounded-full bg-[#1769FF]" />
                  )}
                </div>
                <div
                  className={`text-xs ${
                    selectedScenario.id === s.id ? 'font-bold text-[#10213D]' : 'font-semibold text-[#334155]'
                  }`}
                >
                  {s.name}
                </div>
              </button>
            ))}
          </div>

          {/* Active Scenario Detail Box */}
          <div className="p-5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-4 h-4 text-[#1769FF]" />
                <span className="text-xs font-bold text-[#10213D] uppercase tracking-wide">
                  {selectedScenario.name}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white text-[#475569] border border-[#DFE7F3] font-semibold">
                SCENARIO ID: {selectedScenario.id.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-[#334155] leading-relaxed font-medium">
              {selectedScenario.description}
            </p>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-[#DFE7F3] shadow-2xs">
                <div className="text-[10px] text-[#1769FF] font-bold mb-1 uppercase tracking-wider">MATHEMATICAL MODEL:</div>
                <div className="text-[#0F172A] text-[11px] font-mono font-semibold">{selectedScenario.mathModel}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-[#DFE7F3] shadow-2xs">
                <div className="text-[10px] text-[#D97706] font-bold mb-1 uppercase tracking-wider">PLANNED TELEMETRY IMPACT:</div>
                <div className="text-[#0F172A] text-[11px] font-mono font-semibold">{selectedScenario.plannedImpact}</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Development Roadmap */}
      <Card
        title="Architecture Sequencing & Roadmap"
        subtitle="Standardized full-stack development phases for the AI Digital Twin Simulator"
        tag="ROADMAP"
        icon={Zap}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          <div className="p-4 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#065F46] mb-1">
              <span>STEP 01</span>
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <div className="text-xs font-bold text-[#10213D]">Project Setup</div>
            <p className="text-[11px] text-[#475569] mt-1 font-medium">
              React + Vite + Tailwind shell, FastAPI backend, routing & health checks.
            </p>
            <div className="mt-2 text-[10px] font-bold text-[#059669] uppercase">
              COMPLETED
            </div>
          </div>

          <div className="p-4 rounded-xl border-2 border-[#1769FF] bg-[#EAF2FF]/60 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-[#1769FF] mb-1">
              <span>STEP 02</span>
              <span className="w-2 h-2 rounded-full bg-[#1769FF] animate-ping" />
            </div>
            <div className="text-xs font-bold text-[#10213D]">3D Digital Twin</div>
            <p className="text-[11px] text-[#334155] mt-1 font-medium">
              Interactive 3D motor model, OrbitControls, exploded view & status inspection.
            </p>
            <div className="mt-2 text-[10px] font-bold text-[#1769FF] uppercase">
              ACTIVE STAGE
            </div>
          </div>

          <div className="p-4 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
            <div className="text-xs font-bold text-[#64748B] mb-1">STEP 03</div>
            <div className="text-xs font-bold text-[#334155]">Sensor Simulation</div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Motor telemetry physics, vibration/temperature generation & WebSockets.
            </p>
            <div className="mt-2 text-[10px] font-bold text-[#94A3B8] uppercase">UPCOMING</div>
          </div>

          <div className="p-4 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
            <div className="text-xs font-bold text-[#64748B] mb-1">STEP 04</div>
            <div className="text-xs font-bold text-[#334155]">AI Anomaly Engine</div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Unsupervised ML models, drift detection & health index scoring.
            </p>
            <div className="mt-2 text-[10px] font-bold text-[#94A3B8] uppercase">UPCOMING</div>
          </div>

          <div className="p-4 rounded-xl border border-[#DFE7F3] bg-[#F8FAFC]">
            <div className="text-xs font-bold text-[#64748B] mb-1">STEP 05</div>
            <div className="text-xs font-bold text-[#334155]">Alerts & Analytics</div>
            <p className="text-[11px] text-[#64748B] mt-1">
              Threshold triggers, incident management & historical telemetry logs.
            </p>
            <div className="mt-2 text-[10px] font-bold text-[#94A3B8] uppercase">UPCOMING</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
