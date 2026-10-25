import React, { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { Cpu } from 'lucide-react'

interface AuthShowcaseMotorProps {
  className?: string
}

export const AuthShowcaseMotor: React.FC<AuthShowcaseMotorProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageCardRef = useRef<HTMLDivElement>(null)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)

  // 3D Mouse Parallax & Tilt Effect
  useEffect(() => {
    const card = imageCardRef.current
    if (!card) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = e.clientX - rect.left // x pos within card
      const y = e.clientY - rect.top // y pos within card

      const centerX = rect.width / 2
      const centerY = rect.height / 2

      const rotateX = ((y - centerY) / centerY) * -7 // Max 7 deg tilt
      const rotateY = ((x - centerX) / centerX) * 7 // Max 7 deg tilt

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        ease: 'power2.out',
        duration: 0.6,
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    const parent = containerRef.current
    if (parent) {
      parent.addEventListener('mousemove', handleMouseMove)
      parent.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      if (parent) {
        parent.removeEventListener('mousemove', handleMouseMove)
        parent.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: 1200 }}
    >
      {/* Interactive 3D Tilted Showcase Vessel */}
      <div
        ref={imageCardRef}
        className="relative w-full h-full max-h-[380px] rounded-3xl overflow-hidden border border-[#14B8A6]/40 shadow-[0_12px_45px_rgba(0,0,0,0.65)] shadow-cyan-950/40 bg-[#050E1C] group transition-all duration-300"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Photorealistic 3D Digital Twin Motor Render */}
        <img
          src="/motor_digital_twin_hero.jpg"
          alt="3D Industrial Electric Motor Digital Twin Visualizer"
          className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Cinematic Vignette & Ambient Color Grading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020713]/90 via-transparent to-[#020713]/30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020713]/50 via-transparent to-[#020713]/50 pointer-events-none" />

        {/* Holographic Glowing Scanline Beam */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
          <div className="w-full h-24 bg-gradient-to-b from-transparent via-[#00F0FF]/30 to-transparent -translate-y-full animate-[scan_6s_ease-in-out_infinite]" />
        </div>

        {/* Ambient Pedestal Cyan Base Glow */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-[#00F0FF]/20 blur-xl rounded-full pointer-events-none" />

        {/* Top-Right Technical HUD Badge */}
        <div className="absolute top-3 right-4 px-2.5 py-1 rounded-full bg-[#050E1C]/85 border border-[#14B8A6]/40 text-[10px] font-mono text-[#5EEAD4] backdrop-blur-md flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="tracking-wider">TWIN STATUS: ACTIVE</span>
        </div>

        {/* Bottom Technical Asset Spec Tag */}
        <div className="absolute bottom-3 left-4 px-3 py-1 rounded-xl bg-[#030914]/85 border border-white/10 text-[10px] font-mono text-[#94A3B8] backdrop-blur-md flex items-center gap-2 shadow-md">
          <Cpu className="w-3.5 h-3.5 text-[#2DD4BF]" />
          <span className="text-white font-mono font-medium">3-PHASE AC INDUCTION</span>
          <span className="text-white/30">•</span>
          <span className="text-[#5EEAD4] font-mono font-medium">EFFICIENCY: 98.7%</span>
        </div>

        {/* ========================================================================= */}
        {/* Interactive Holographic Telemetry Inspection Hotspots                     */}
        {/* ========================================================================= */}

        {/* Hotspot 1: Shaft Rotation Node */}
        <div
          className="absolute top-[52%] left-[26%] z-20"
          onMouseEnter={() => setActiveHotspot('shaft')}
          onMouseLeave={() => setActiveHotspot(null)}
        >
          <div className="relative cursor-pointer group/pin">
            <span className="absolute -inset-1.5 rounded-full bg-[#00F0FF]/30 animate-ping" />
            <div className="w-4 h-4 rounded-full bg-[#030E1F] border-2 border-[#00F0FF] flex items-center justify-center text-[#00F0FF] shadow-[0_0_12px_#00F0FF]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Tooltip */}
            {activeHotspot === 'shaft' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#050E1C]/95 border border-[#00F0FF]/50 text-[10px] text-white whitespace-nowrap shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                <div className="font-heading font-semibold text-[#00F0FF]">Drive Shaft & Keyway</div>
                <div className="font-mono font-medium text-[9px] text-[#94A3B8]">1488 RPM • Synchronous Rotation</div>
              </div>
            )}
          </div>
        </div>

        {/* Hotspot 2: Wireframe Digital Twin Stator Core */}
        <div
          className="absolute top-[48%] left-[64%] z-20"
          onMouseEnter={() => setActiveHotspot('core')}
          onMouseLeave={() => setActiveHotspot(null)}
        >
          <div className="relative cursor-pointer group/pin">
            <span className="absolute -inset-1.5 rounded-full bg-[#2DD4BF]/30 animate-ping" />
            <div className="w-4 h-4 rounded-full bg-[#030E1F] border-2 border-[#2DD4BF] flex items-center justify-center text-[#2DD4BF] shadow-[0_0_12px_#2DD4BF]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Tooltip */}
            {activeHotspot === 'core' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#050E1C]/95 border border-[#2DD4BF]/50 text-[10px] text-white whitespace-nowrap shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                <div className="font-heading font-semibold text-[#2DD4BF]">Holographic Digital Twin</div>
                <div className="font-mono font-medium text-[9px] text-[#94A3B8]">Real-time Telemetry Flux Mesh</div>
              </div>
            )}
          </div>
        </div>

        {/* Hotspot 3: Terminal Junction Box */}
        <div
          className="absolute top-[22%] left-[44%] z-20"
          onMouseEnter={() => setActiveHotspot('terminal')}
          onMouseLeave={() => setActiveHotspot(null)}
        >
          <div className="relative cursor-pointer group/pin">
            <span className="absolute -inset-1.5 rounded-full bg-[#38BDF8]/30 animate-ping" />
            <div className="w-4 h-4 rounded-full bg-[#030E1F] border-2 border-[#38BDF8] flex items-center justify-center text-[#38BDF8] shadow-[0_0_12px_#38BDF8]">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {/* Tooltip */}
            {activeHotspot === 'terminal' && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-[#050E1C]/95 border border-[#38BDF8]/50 text-[10px] text-white whitespace-nowrap shadow-xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
                <div className="font-heading font-semibold text-[#38BDF8]">Terminal Enclosure</div>
                <div className="font-mono font-medium text-[9px] text-[#94A3B8]">IP55 Protected • 400V Supply</div>
              </div>
            )}
          </div>
        </div>

        {/* Tech Corner Decorative Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#14B8A6]/60 pointer-events-none" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#14B8A6]/60 pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#14B8A6]/60 pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#14B8A6]/60 pointer-events-none" />
      </div>
    </div>
  )
}

export default AuthShowcaseMotor
