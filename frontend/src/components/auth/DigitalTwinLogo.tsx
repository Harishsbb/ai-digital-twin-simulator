import React from 'react'

interface DigitalTwinLogoProps {
  theme?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showText?: boolean
}

export const DigitalTwinLogo: React.FC<DigitalTwinLogoProps> = ({
  theme = 'light',
  size = 'md',
  className = '',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }

  const titleSizes = {
    sm: 'text-xs',
    md: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
  }

  const subSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }

  const isDark = theme === 'dark'

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* 3D Geometric Isometric Cube Logo with Cyan/Teal Gradient Accents */}
      <div className={`relative ${iconSizes[size]} shrink-0 drop-shadow-[0_4px_12px_rgba(13,148,136,0.35)]`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="cubeTop" x1="24" y1="4" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#14B8A6" />
              <stop offset="1" stopColor="#0D9488" />
            </linearGradient>
            <linearGradient id="cubeLeft" x1="6" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0D9488" />
              <stop offset="1" stopColor="#0F766E" />
            </linearGradient>
            <linearGradient id="cubeRight" x1="42" y1="14" x2="24" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06B6D4" />
              <stop offset="1" stopColor="#0E7490" />
            </linearGradient>
            <linearGradient id="glowLine" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#5EEAD4" />
              <stop offset="1" stopColor="#22D3EE" />
            </linearGradient>
          </defs>

          {/* Top Diamond Face */}
          <path
            d="M24 4L41.32 14V14.1L24 24.1L6.68 14.1V14L24 4Z"
            fill="url(#cubeTop)"
            stroke="#99F6E4"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Left Parallelogram Face */}
          <path
            d="M6.68 14.1L24 24.1V44L6.68 34V14.1Z"
            fill="url(#cubeLeft)"
            stroke="#5EEAD4"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Right Parallelogram Face */}
          <path
            d="M24 24.1L41.32 14.1V34L24 44V24.1Z"
            fill="url(#cubeRight)"
            stroke="#67E8F9"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Circuit Core Node */}
          <circle cx="24" cy="24.1" r="3.2" fill="#FFFFFF" />
          <circle cx="24" cy="24.1" r="5" stroke="#CCFBF1" strokeWidth="1" strokeDasharray="2 2" />

          {/* Tech Nodes on Faces */}
          <circle cx="15.5" cy="19.1" r="1.5" fill="#CCFBF1" />
          <circle cx="32.5" cy="19.1" r="1.5" fill="#CCFBF1" />
          <circle cx="15.5" cy="29.1" r="1.5" fill="#99F6E4" />
          <circle cx="32.5" cy="29.1" r="1.5" fill="#67E8F9" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-heading font-bold tracking-tight ${titleSizes[size]} ${
                isDark ? 'text-white' : 'text-[#10213D]'
              }`}
            >
              AI Digital Twin
            </span>
            {isDark && <span className="text-[#2DD4BF]/60 text-xs font-mono font-light hidden sm:inline">───</span>}
          </div>
          <span
            className={`font-sans font-medium tracking-wide mt-0.5 ${subSizes[size]} ${
              isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
            }`}
          >
            Simulator
          </span>
        </div>
      )}
    </div>
  )
}

export default DigitalTwinLogo
