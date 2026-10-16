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
      {/* Editorial Header / System Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-xl mech-panel">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold tracking-wider">
              FACILITY // PLANT NORTH - BAY 04
            </span>
            <span className="text-stone-400 font-mono text-xs">COORDINATES // 41.8781° N, 87.6298° W</span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-stone-900 uppercase">
            Asset Supervisor & Machine Architecture
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Target Machine: Siemens Simotics GP 150 kW High-Voltage Induction Motor (3-Phase, 4-Pole)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadBackendData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-stone-900 border border-stone-800 text-xs font-mono text-white hover:bg-stone-800 transition-all shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Verify API Handshake</span>
          </button>
        </div>
      </div>

      {/* Primary Asset Blueprint & Nameplate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Architectural Technical Motor Blueprint (7 cols) */}
        <div className="lg:col-span-7">
          <Card
            title="Interactive Motor Blueprint & Sensor Map"
            subtitle="Click or tap any probe marker to inspect telemetry specifications"
            tag="CAD DRAFTING"
            icon={Layers}
            badge={<StatusBadge label="SCHEMATIC 2D" variant="laser" pulse={false} size="sm" />}
            techBracket={true}
          >
            {/* Vector Blueprint Visualizer on Engineering Vellum */}
            <div className="relative rounded-lg bg-[#f5f4ef] border border-stone-300 p-4 overflow-hidden shadow-inner">
              {/* Technical drafting grid inside blueprint */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:20px_20px]" />

              {/* Technical SVG Motor Blueprint */}
              <div className="relative z-10 py-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 600 240"
                  className="w-full max-w-xl h-auto"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Shaft line */}
                  <rect x="20" y="110" width="560" height="20" rx="3" fill="#e7e5df" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 3" />
                  
                  {/* Motor Frame / Stator Casing */}
                  <rect x="150" y="40" width="300" height="160" rx="8" fill="#eae8df" stroke="#1c1917" strokeWidth="2" />
                  
                  {/* Cooling Fins on Stator */}
                  {[170, 195, 220, 245, 270, 295, 320, 345, 370, 395, 420].map((x) => (
                    <line key={x} x1={x} y1="32" x2={x} y2="40" stroke="#1c1917" strokeWidth="2" />
                  ))}
                  {[170, 195, 220, 245, 270, 295, 320, 345, 370, 395, 420].map((x) => (
                    <line key={x} x1={x} y1="200" x2={x} y2="208" stroke="#1c1917" strokeWidth="2" />
                  ))}

                  {/* Stator Core Windings */}
                  <rect x="180" y="60" width="240" height="120" rx="4" fill="#dfdcd2" stroke="#57534e" strokeWidth="1.5" />
                  <path d="M 190 70 L 410 70 M 190 170 L 410 170" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" />

                  {/* Drive-End (DE) Bearing Housing */}
                  <rect x="120" y="75" width="30" height="90" rx="4" fill="#d6d3c9" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="135" cy="120" r="12" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

                  {/* Non-Drive-End (NDE) Bearing Housing */}
                  <rect x="450" y="75" width="30" height="90" rx="4" fill="#d6d3c9" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="465" cy="120" r="12" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />

                  {/* Power Terminal Junction Box */}
                  <rect x="250" y="10" width="100" height="30" rx="3" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
                  <text x="268" y="28" fill="#059669" fontSize="10" fontFamily="monospace" fontWeight="bold">PWR TERM</text>

                  {/* Cooling Fan Shroud (NDE Side) */}
                  <path d="M 480 55 L 530 75 L 530 165 L 480 185 Z" fill="#e7e5df" stroke="#57534e" strokeWidth="1.5" />
                  <text x="495" y="124" fill="#57534e" fontSize="9" fontFamily="monospace">FAN</text>

                  {/* Drive Shaft Keyway */}
                  <rect x="40" y="105" width="40" height="6" fill="#0284c7" />
                  <text x="45" y="145" fill="#0284c7" fontSize="10" fontFamily="monospace" fontWeight="bold">OUTPUT SHAFT</text>

                  {/* Interactive Hotspot 1: VIB-DE-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[0])}
                  >
                    <circle cx="135" cy="50" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="135" cy="50" r="4" fill="#ffffff" className="animate-ping" />
                    <text x="127" y="54" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">DE</text>
                  </g>

                  {/* Interactive Hotspot 2: VIB-NDE-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[1])}
                  >
                    <circle cx="465" cy="50" r="14" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
                    <circle cx="465" cy="50" r="4" fill="#ffffff" className="animate-ping" />
                    <text x="454" y="54" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">NDE</text>
                  </g>

                  {/* Interactive Hotspot 3: TMP-ST-UVW */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[2])}
                  >
                    <circle cx="300" cy="120" r="16" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
                    <text x="290" y="124" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">TMP</text>
                  </g>

                  {/* Interactive Hotspot 4: PWR-CT-01 */}
                  <g
                    className="cursor-pointer transition-transform hover:scale-110"
                    onClick={() => setSelectedHotspot(SENSOR_HOTSPOTS[3])}
                  >
                    <circle cx="230" cy="25" r="14" fill="#059669" stroke="#ffffff" strokeWidth="2" />
                    <text x="221" y="29" fill="#ffffff" fontSize="9" fontFamily="monospace" fontWeight="bold">PWR</text>
                  </g>
                </svg>
              </div>

              {/* Bottom probe selector pill bar */}
              <div className="pt-3 border-t border-stone-300 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-stone-600 text-[11px] font-semibold">ACTIVE PROBE SELECTION:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SENSOR_HOTSPOTS.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspot(h)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono border transition-all ${
                        selectedHotspot.id === h.id
                          ? 'bg-stone-900 text-white border-stone-900 font-semibold shadow-xs'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {h.code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Selected Hotspot Detailed Specs Panel */}
            <div className="mt-4 p-4 rounded-lg bg-stone-50 border border-stone-200/90 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <span className="text-stone-900 font-bold">{selectedHotspot.code}</span>
                  <span className="text-stone-700 font-semibold">{selectedHotspot.name}</span>
                </div>
                <StatusBadge label="PROBE READY" variant="success" pulse={false} size="sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-stone-500">Transducer:</span>{' '}
                  <span className="text-stone-800 font-medium">{selectedHotspot.type}</span>
                </div>
                <div>
                  <span className="text-stone-500">Location:</span>{' '}
                  <span className="text-stone-800 font-medium">{selectedHotspot.location}</span>
                </div>
                <div>
                  <span className="text-stone-500">Sampling Rate:</span>{' '}
                  <span className="text-stone-800 font-medium">{selectedHotspot.sampling}</span>
                </div>
                <div>
                  <span className="text-stone-500">Threshold:</span>{' '}
                  <span className="text-amber-800 font-semibold">{selectedHotspot.spec}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Physical Rating Nameplate (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Machine Nameplate */}
          <div className="relative rounded-xl border border-stone-300 bg-gradient-to-br from-stone-50 via-white to-stone-100 p-5 shadow-2xs tech-bracket">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-3">
              <div>
                <h3 className="font-mono text-xs tracking-wider uppercase font-extrabold text-stone-900">
                  EQUIPMENT NAMEPLATE // RATING DATA
                </h3>
                <p className="font-mono text-[10px] text-stone-500">
                  SIEMENS SIMOTICS GP 1LE1 HIGH EFFICIENCY MOTOR
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
                IE3 PREMIUM
              </span>
            </div>

            <div className="font-mono text-xs space-y-2.5">
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-stone-200">
                <div>
                  <div className="text-[10px] text-stone-500">RATED POWER</div>
                  <div className="text-stone-900 font-bold text-sm">150 kW (200 HP)</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">FRAME SIZE</div>
                  <div className="text-stone-900 font-bold text-sm">315 M (Cast Iron)</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-stone-200 text-[11px]">
                <div>
                  <div className="text-[10px] text-stone-500">VOLTAGE</div>
                  <div className="text-stone-800 font-semibold">400 V Δ / 690 V Y</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">CURRENT</div>
                  <div className="text-stone-800 font-semibold">265 A / 153 A</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">FREQUENCY</div>
                  <div className="text-stone-800 font-semibold">50 Hz</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pb-2 border-b border-stone-200 text-[11px]">
                <div>
                  <div className="text-[10px] text-stone-500">SPEED (RPM)</div>
                  <div className="text-stone-900 font-bold">1488 RPM</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">COS φ (PF)</div>
                  <div className="text-stone-800 font-semibold">0.88</div>
                </div>
                <div>
                  <div className="text-[10px] text-stone-500">EFFICIENCY</div>
                  <div className="text-emerald-700 font-bold">96.2 %</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-stone-500">ENCLOSURE:</span>{' '}
                  <span className="text-stone-800 font-medium">IP55 / IC411 TEFC</span>
                </div>
                <div>
                  <span className="text-stone-500">MASS:</span>{' '}
                  <span className="text-stone-800 font-medium">1,140 kg</span>
                </div>
                <div>
                  <span className="text-stone-500">INSULATION:</span>{' '}
                  <span className="text-stone-800 font-medium">Class 155 (F)</span>
                </div>
                <div>
                  <span className="text-stone-500">SERIAL NO:</span>{' '}
                  <span className="text-stone-900 font-semibold">SN-9042-DE-2026</span>
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
            <div className="font-mono text-xs space-y-2">
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">API Host URL</span>
                <span className="text-stone-900 font-semibold truncate max-w-[190px]" title={getApiBaseUrl()}>
                  {getApiBaseUrl()}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Service Status</span>
                <span className={healthData ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                  {healthData ? healthData.status.toUpperCase() : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Build Version</span>
                <span className="text-stone-800">{appInfo?.version || '0.1.0'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Architecture Stage</span>
                <span className="text-stone-900 font-semibold">{appInfo?.stage || 'Step 1: Setup'}</span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[11px] text-stone-500">
                <span>CORS Restriction:</span>
                <span className="text-emerald-700 font-medium">http://localhost:5173 only</span>
              </div>

              {error && (
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-sans mt-2">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s)}
                className={`p-3 rounded-lg border text-left transition-all font-mono ${
                  selectedScenario.id === s.id
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] ${selectedScenario.id === s.id ? 'text-stone-400' : 'text-stone-500'}`}>
                    {s.category}
                  </span>
                  {selectedScenario.id === s.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    selectedScenario.id === s.id ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  {s.name}
                </div>
              </button>
            ))}
          </div>

          {/* Active Scenario Detail Box */}
          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 font-mono space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold text-stone-900 uppercase">
                  {selectedScenario.name}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200 font-semibold">
                SCENARIO ID: {selectedScenario.id.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-stone-600 font-sans leading-relaxed">
              {selectedScenario.description}
            </p>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-white border border-stone-200 shadow-2xs">
                <div className="text-[10px] text-stone-500 font-bold mb-1 uppercase tracking-wider">MATHEMATICAL MODEL:</div>
                <div className="text-stone-800 text-[11px] font-mono">{selectedScenario.mathModel}</div>
              </div>
              <div className="p-3 rounded bg-white border border-stone-200 shadow-2xs">
                <div className="text-[10px] text-amber-700 font-bold mb-1 uppercase tracking-wider">PLANNED TELEMETRY IMPACT:</div>
                <div className="text-stone-800 text-[11px] font-mono">{selectedScenario.plannedImpact}</div>
              </div>
            </div>

            <div className="pt-1 text-[11px] text-stone-400 font-sans">
              * Note: Synthetic mathematical generators and live WebSocket broadcasts will be activated in Step 2.
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
          <div className="p-3.5 rounded-lg border border-stone-900 bg-stone-900 text-white font-mono shadow-2xs">
            <div className="flex items-center justify-between text-xs font-bold text-stone-200 mb-1">
              <span>STEP 01</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs font-bold text-white">Project Setup</div>
            <p className="text-[11px] text-stone-300 font-sans mt-1">
              React + Vite + Tailwind shell, FastAPI backend, routing & health checks.
            </p>
            <div className="mt-2 text-[10px] font-bold text-emerald-300 uppercase">
              ACTIVE STAGE
            </div>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-white font-mono text-stone-800">
            <div className="text-xs font-bold text-stone-400 mb-1">STEP 02</div>
            <div className="text-xs font-bold text-stone-900">Sensor Simulation</div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Motor telemetry physics, vibration/temperature generation & WebSockets.
            </p>
            <div className="mt-2 text-[10px] text-stone-400 uppercase">UPCOMING</div>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-white font-mono text-stone-800">
            <div className="text-xs font-bold text-stone-400 mb-1">STEP 03</div>
            <div className="text-xs font-bold text-stone-900">3D Digital Twin</div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Interactive 3D motor model, thermal heatmaps & component dissection.
            </p>
            <div className="mt-2 text-[10px] text-stone-400 uppercase">UPCOMING</div>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-white font-mono text-stone-800">
            <div className="text-xs font-bold text-stone-400 mb-1">STEP 04</div>
            <div className="text-xs font-bold text-stone-900">AI Anomaly Engine</div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Unsupervised ML models, drift detection & health index scoring.
            </p>
            <div className="mt-2 text-[10px] text-stone-400 uppercase">UPCOMING</div>
          </div>

          <div className="p-3.5 rounded-lg border border-stone-200 bg-white font-mono text-stone-800">
            <div className="text-xs font-bold text-stone-400 mb-1">STEP 05</div>
            <div className="text-xs font-bold text-stone-900">Alerts & Analytics</div>
            <p className="text-[11px] text-stone-500 font-sans mt-1">
              Threshold triggers, incident management & historical telemetry logs.
            </p>
            <div className="mt-2 text-[10px] text-stone-400 uppercase">UPCOMING</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
