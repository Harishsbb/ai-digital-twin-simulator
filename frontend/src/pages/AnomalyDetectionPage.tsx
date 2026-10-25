import React from 'react'
import {
  AlertOctagon,
  Brain,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react'
import {
  AIInsightsPanel,
  AIManualTestCard,
  AIMetricsCard,
  AIModelStatusCard,
  AIPredictionCard,
  AIStatusBadge,
} from '../components/ai'
import { useSensorStream } from '../context/useSensorStream'

export const AnomalyDetectionPage: React.FC = () => {
  const { currentMode, toggleMode, controlSimulator } = useSensorStream()

  const isFaultMode = currentMode === 'fault'

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & TELEMETRY STREAM CONTROL BANNER           */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0F54D6] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(23,105,255,0.25)] shrink-0 mt-0.5">
            <Brain className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
                STEP 08 // AI PREDICTIONS FRONTEND
              </span>
              <span className="text-[#475569] font-mono text-xs font-semibold">
                MODEL // Isolation Forest (scikit-learn)
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
              AI Anomaly Detection Center
            </h1>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              Real-time multi-dimensional outlier scoring on continuous induction motor telemetry (temperature, vibration, RPM).
            </p>
          </div>
        </div>

        {/* Right Actions: AI Status Badge & Fault Injection Harness */}
        <div className="flex flex-wrap items-center gap-3">
          <AIStatusBadge showScore={true} />

          {/* Toggle Simulator Normal vs Fault Mode */}
          <button
            type="button"
            onClick={() => toggleMode()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isFaultMode
                ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] ring-2 ring-[#EF4444]/20'
                : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
            }`}
            title="Toggle simulator mode to test AI detection of anomalies"
          >
            {isFaultMode ? (
              <>
                <AlertOctagon className="w-4 h-4 text-[#EF4444] animate-bounce" />
                <span>FAULT MODE (Active)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>NORMAL MODE</span>
              </>
            )}
          </button>

          {/* Reset Baseline */}
          <button
            type="button"
            onClick={() => controlSimulator('reset')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#475569] hover:text-[#10213D] transition-all shadow-xs cursor-pointer"
            title="Reset telemetry stream to pristine nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. PRIMARY INFERENCE ROW: LIVE CARD & INSIGHTS PANEL      */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (6 cols): Live Inference & Anomaly Score */}
        <div className="lg:col-span-6 flex flex-col">
          <AIPredictionCard />
        </div>

        {/* Right (6 cols): Diagnostic Context & Baseline Deviations */}
        <div className="lg:col-span-6 flex flex-col">
          <AIInsightsPanel />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SECONDARY ROW: MODEL SPECIFICATION & MANUAL SANDBOX    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (6 cols): Model Status Card */}
        <div className="lg:col-span-6 flex flex-col">
          <AIModelStatusCard />
        </div>

        {/* Right (6 cols): Interactive Sandbox (POST /predict) */}
        <div className="lg:col-span-6 flex flex-col">
          <AIManualTestCard />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. EVALUATION BENCHMARKS & SYNTHETIC DATA DISCLAIMER      */}
      {/* ========================================================= */}
      <div>
        <AIMetricsCard />
      </div>
    </div>
  )
}
