import React, { useEffect, useState } from 'react'
import {
  Thermometer,
  Activity,
  Gauge,
  Zap,
} from 'lucide-react'

export type TelemetryCardType = 'temperature' | 'vibration' | 'rpm' | 'current'

interface FloatingTelemetryCardProps {
  type: TelemetryCardType
  className?: string
  style?: React.CSSProperties
}

export const FloatingTelemetryCard: React.FC<FloatingTelemetryCardProps> = ({
  type,
  className = '',
  style,
}) => {
  // Simulate subtle real-time micro-fluctuations
  const [val, setVal] = useState(() => {
    switch (type) {
      case 'temperature':
        return 72.4
      case 'vibration':
        return 2.1
      case 'rpm':
        return 1488
      case 'current':
        return 265
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setVal(() => {
        switch (type) {
          case 'temperature':
            return +(72.4 + (Math.random() * 0.4 - 0.2)).toFixed(1)
          case 'vibration':
            return +(2.1 + (Math.random() * 0.16 - 0.08)).toFixed(1)
          case 'rpm':
            return Math.round(1488 + (Math.random() * 6 - 3))
          case 'current':
            return Math.round(265 + (Math.random() * 4 - 2))
        }
      })
    }, 2800)

    return () => clearInterval(interval)
  }, [type])

  if (type === 'temperature') {
    return (
      <div
        style={style}
        className={`select-none p-2.5 sm:p-3 rounded-2xl bg-[#081324]/90 backdrop-blur-xl border border-[#14B8A6]/40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] text-white min-w-[155px] sm:min-w-[180px] transition-all duration-300 hover:border-[#14B8A6] ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#0D9488]/30 to-[#06B6D4]/30 border border-[#14B8A6]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <Thermometer className="w-3.5 h-3.5 text-[#2DD4BF]" />
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] font-medium text-[#94A3B8] tracking-wider uppercase">
              Temperature
            </div>
          </div>
          <span className="font-sans inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#064E3B]/90 border border-[#10B981]/50 text-[9px] font-semibold text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Normal
          </span>
        </div>

        <div className="font-mono font-medium text-sm sm:text-base text-white tracking-tight flex items-baseline gap-1 leading-none mb-1">
          <span>{val.toFixed(1)}</span>
          <span className="text-[11px] font-normal text-[#5EEAD4]">°C</span>
        </div>

        {/* Mini Temperature Sparkline */}
        <div className="h-1.5 w-full opacity-70">
          <svg viewBox="0 0 100 6" className="w-full h-full stroke-[#2DD4BF]" fill="none">
            <path
              d="M0 3 Q 20 1, 40 3 T 70 2 T 100 3"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  if (type === 'vibration') {
    return (
      <div
        style={style}
        className={`select-none p-2.5 sm:p-3 rounded-2xl bg-[#081324]/90 backdrop-blur-xl border border-[#14B8A6]/40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] text-white min-w-[155px] sm:min-w-[185px] transition-all duration-300 hover:border-[#14B8A6] ${className}`}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#0D9488]/30 to-[#06B6D4]/30 border border-[#14B8A6]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
              <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" />
            </div>
            <div className="font-sans text-[9px] sm:text-[10px] font-medium text-[#94A3B8] tracking-wider uppercase">
              Vibration (RMS)
            </div>
          </div>
          <span className="font-sans inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#064E3B]/90 border border-[#10B981]/50 text-[9px] font-semibold text-[#34D399]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            Normal
          </span>
        </div>

        <div className="font-mono font-medium text-sm sm:text-base text-white tracking-tight flex items-baseline gap-1 leading-none mb-1">
          <span>{val.toFixed(1)}</span>
          <span className="text-[11px] font-normal text-[#5EEAD4]">mm/s</span>
        </div>

        {/* Mini Harmonic Waveform Graphic */}
        <div className="h-2 w-full opacity-80">
          <svg viewBox="0 0 100 8" className="w-full h-full stroke-[#2DD4BF]" fill="none">
            <path
              d="M0 4 Q 10 0, 20 4 T 40 4 T 60 4 T 80 4 T 100 4"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  if (type === 'rpm') {
    return (
      <div
        style={style}
        className={`select-none p-2.5 sm:p-3 rounded-2xl bg-[#081324]/90 backdrop-blur-xl border border-[#14B8A6]/40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] text-white min-w-[145px] sm:min-w-[165px] transition-all duration-300 hover:border-[#14B8A6] ${className}`}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#0D9488]/30 to-[#06B6D4]/30 border border-[#14B8A6]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
            <Gauge className="w-4 h-4 text-[#2DD4BF]" />
          </div>
          <div>
            <div className="font-sans text-[9px] sm:text-[10px] font-medium text-[#94A3B8] tracking-wider uppercase">
              Motor Speed
            </div>
            <div className="font-mono font-medium text-sm sm:text-base text-white tracking-tight flex items-baseline gap-1 leading-none mt-0.5">
              <span>{Math.round(val)}</span>
              <span className="text-[11px] font-normal text-[#5EEAD4]">RPM</span>
            </div>
          </div>
        </div>
        <div className="h-1.5 w-full opacity-70">
          <svg viewBox="0 0 100 6" className="w-full h-full stroke-[#2DD4BF]" fill="none">
            <path
              d="M0 3 Q 25 1, 50 3 T 100 3"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    )
  }

  // Current
  return (
    <div
      style={style}
      className={`select-none p-2.5 sm:p-3 rounded-2xl bg-[#081324]/90 backdrop-blur-xl border border-[#14B8A6]/40 shadow-[0_8px_24px_rgba(0,0,0,0.55)] text-white min-w-[145px] sm:min-w-[165px] transition-all duration-300 hover:border-[#14B8A6] ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-[#0D9488]/30 to-[#06B6D4]/30 border border-[#14B8A6]/40 flex items-center justify-center text-[#2DD4BF] shrink-0">
          <Zap className="w-4 h-4 text-[#2DD4BF]" />
        </div>
        <div>
          <div className="font-sans text-[9px] sm:text-[10px] font-medium text-[#94A3B8] tracking-wider uppercase">
            Current (Live)
          </div>
          <div className="font-mono font-medium text-sm sm:text-base text-white tracking-tight flex items-baseline gap-1 leading-none mt-0.5">
            <span>{Math.round(val)}</span>
            <span className="text-[11px] font-normal text-[#5EEAD4]">A</span>
          </div>
        </div>
      </div>
      <div className="h-1.5 w-full opacity-70">
        <svg viewBox="0 0 100 6" className="w-full h-full stroke-[#2DD4BF]" fill="none">
          <path
            d="M0 3 Q 15 0, 30 3 T 60 3 T 90 3 L 100 3"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

export default FloatingTelemetryCard
