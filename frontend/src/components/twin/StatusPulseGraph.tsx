import React from 'react'
import type { TwinVisualStatus } from '../../types'

interface StatusPulseGraphProps {
  status: TwinVisualStatus
}

export const StatusPulseGraph: React.FC<StatusPulseGraphProps> = ({ status }) => {
  const strokeColor = {
    Normal: '#10b981', // Emerald
    Warning: '#f59e0b', // Amber
    Critical: '#ef4444', // Red
  }[status]

  return (
    <div className="w-24 sm:w-28 h-12 flex items-center justify-end">
      <svg
        viewBox="0 0 100 40"
        className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {status === 'Normal' && (
          <path
            d="M 0 20 L 25 20 L 32 12 L 40 28 L 48 4 L 56 36 L 64 20 L 100 20"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {status === 'Warning' && (
          <path
            d="M 0 20 L 20 20 L 28 8 L 36 32 L 44 2 L 52 38 L 60 14 L 68 26 L 100 20"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {status === 'Critical' && (
          <path
            d="M 0 20 L 15 20 L 22 2 L 30 38 L 38 0 L 46 40 L 54 4 L 62 36 L 70 12 L 78 28 L 100 20"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  )
}
