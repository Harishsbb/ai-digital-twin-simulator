import React from 'react'
import { Info, RotateCw, ZoomIn, Move, Smartphone } from 'lucide-react'

export const ControlsHelpCard: React.FC = () => {
  return (
    <div className="rounded-2xl dark-panel p-6 shadow-xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wide">
          Interaction Guide
        </h3>
        <button
          type="button"
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Interaction Guide"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Gesture Tiles (Matching Reference Image) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mt-3">
        {/* Rotate */}
        <div className="p-2.5 rounded-xl bg-[#0b121e]/80 border border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <RotateCw className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Rotate</div>
            <div className="text-[10px] text-slate-400">Left click + drag</div>
          </div>
        </div>

        {/* Zoom */}
        <div className="p-2.5 rounded-xl bg-[#0b121e]/80 border border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Zoom</div>
            <div className="text-[10px] text-slate-400">Scroll wheel</div>
          </div>
        </div>

        {/* Pan */}
        <div className="p-2.5 rounded-xl bg-[#0b121e]/80 border border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Move className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Pan</div>
            <div className="text-[10px] text-slate-400">Right click + drag</div>
          </div>
        </div>

        {/* Touch */}
        <div className="p-2.5 rounded-xl bg-[#0b121e]/80 border border-white/5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Touch</div>
            <div className="text-[10px] text-slate-400">Use fingers on mobile</div>
          </div>
        </div>
      </div>
    </div>
  )
}
