import React, { useState } from 'react'
import {
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
} from 'lucide-react'
import { useAIPrediction } from '../../context/useAIPrediction'
import type { AnomalyPredictionResponse } from '../../types'

export const AIManualTestCard: React.FC = () => {
  const { predictManual } = useAIPrediction()

  // Form inputs
  const [temperature, setTemperature] = useState<number>(68.4)
  const [vibration, setVibration] = useState<number>(1.22)
  const [rpm, setRpm] = useState<number>(1488.2)

  // Test state
  const [result, setResult] = useState<AnomalyPredictionResponse | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleRunInference = async (customTemp?: number, customVib?: number, customRpm?: number) => {
    const t = customTemp ?? temperature
    const v = customVib ?? vibration
    const r = customRpm ?? rpm

    setLoading(true)
    setError(null)
    try {
      const resp = await predictManual({
        temperature: t,
        vibration: v,
        rpm: r,
        device_id: 'SIMOTICS-150KW-01',
      })
      setResult(resp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inference request failed')
    } finally {
      setLoading(false)
    }
  }

  const applyPreset = (t: number, v: number, r: number) => {
    setTemperature(t)
    setVibration(v)
    setRpm(r)
    handleRunInference(t, v, r)
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#10213D]">Interactive Inference Sandbox</h3>
            <span className="text-[10px] font-mono text-[#475569] font-semibold">
              POST /api/v1/ai/predict // MODEL TESTING HARNESS
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTemperature(68.4)
            setVibration(1.22)
            setRpm(1488.2)
            setResult(null)
            setError(null)
          }}
          className="flex items-center gap-1 px-2.5 py-1 text-xs text-[#64748B] hover:text-[#10213D] rounded-lg hover:bg-[#F8FAFC] cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Quick Verification Presets */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#10213D]">Quick Telemetry Presets:</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Preset 1: Normal Sample */}
          <button
            type="button"
            onClick={() => applyPreset(68.4, 1.22, 1488.2)}
            className="p-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#065F46] mb-1">
              <span>Nominal Baseline</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            </div>
            <div className="text-[11px] font-mono text-[#047857]">
              68.4°C / 1.22 mm/s / 1488 RPM
            </div>
          </button>

          {/* Preset 2: Overheat Fault */}
          <button
            type="button"
            onClick={() => applyPreset(118.0, 7.4, 1240.0)}
            className="p-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#991B1B] mb-1">
              <span>Severe Multi-Fault</span>
              <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
            </div>
            <div className="text-[11px] font-mono text-[#B91C1C]">
              118.0°C / 7.40 mm/s / 1240 RPM
            </div>
          </button>

          {/* Preset 3: Excessive Vibration Fault */}
          <button
            type="button"
            onClick={() => applyPreset(71.5, 8.8, 1482.0)}
            className="p-3 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] hover:bg-[#FEF3C7] text-left transition-all cursor-pointer shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#92400E] mb-1">
              <span>Excessive Vibration</span>
              <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <div className="text-[11px] font-mono text-[#B45309]">
              71.5°C / 8.80 mm/s / 1482 RPM
            </div>
          </button>
        </div>
      </div>

      {/* Manual Input Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Temp Input */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-1">
          <label htmlFor="input-temp" className="block text-xs font-semibold text-[#10213D]">
            Temperature (°C)
          </label>
          <input
            id="input-temp"
            type="number"
            step="0.1"
            min="-20"
            max="200"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-xs font-mono font-bold text-[#10213D] focus:border-[#1769FF] focus:outline-hidden"
          />
          <div className="text-[10px] text-[#64748B]">Range: -50°C to 300°C</div>
        </div>

        {/* Vibration Input */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-1">
          <label htmlFor="input-vib" className="block text-xs font-semibold text-[#10213D]">
            Vibration (mm/s RMS)
          </label>
          <input
            id="input-vib"
            type="number"
            step="0.05"
            min="0"
            max="50"
            value={vibration}
            onChange={(e) => setVibration(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-xs font-mono font-bold text-[#10213D] focus:border-[#1769FF] focus:outline-hidden"
          />
          <div className="text-[10px] text-[#64748B]">Range: 0.0 to 100.0 mm/s</div>
        </div>

        {/* RPM Input */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-1">
          <label htmlFor="input-rpm" className="block text-xs font-semibold text-[#10213D]">
            Shaft Speed (RPM)
          </label>
          <input
            id="input-rpm"
            type="number"
            step="1"
            min="0"
            max="5000"
            value={rpm}
            onChange={(e) => setRpm(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white text-xs font-mono font-bold text-[#10213D] focus:border-[#1769FF] focus:outline-hidden"
          />
          <div className="text-[10px] text-[#64748B]">Range: 0 to 10,000 RPM</div>
        </div>
      </div>

      {/* Run Inference Button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => handleRunInference()}
          disabled={loading}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0F54D6] text-white font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Model...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Execute AI Inference</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
          <span>Inference Error: {error}</span>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div
          className={`p-4 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
            result.is_anomaly
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
          }`}
        >
          <div className="flex items-center justify-between pb-2 border-b border-current/15">
            <div className="flex items-center gap-2 font-bold text-sm">
              {result.is_anomaly ? (
                <>
                  <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
                  <span>PREDICTION: ANOMALY (OUTLIER)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
                  <span>PREDICTION: NORMAL (INLIER)</span>
                </>
              )}
            </div>

            <div className="text-xs font-mono font-bold">
              Score: {result.anomaly_score >= 0 ? '+' : ''}
              {result.anomaly_score.toFixed(4)} (Raw: {result.prediction})
            </div>
          </div>

          <div className="text-xs leading-relaxed opacity-90">
            <strong className="block mb-0.5">Diagnostic Summary:</strong>
            {result.diagnostic_context.summary}
          </div>

          {result.diagnostic_context.deviations.length > 0 && (
            <div className="text-xs space-y-1">
              <span className="font-semibold block">Deviations:</span>
              <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
                {result.diagnostic_context.deviations.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
