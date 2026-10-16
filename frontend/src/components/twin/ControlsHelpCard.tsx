import React from 'react'
import { Info, Lightbulb, MousePointer, Move, ZoomIn, Smartphone } from 'lucide-react'

export const ControlsHelpCard: React.FC = () => {
  return (
    <div className="rounded-2xl dark-panel p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-wide">
          Controls & Navigation
        </h3>
        <button
          className="text-slate-500 hover:text-slate-300 transition-colors"
          title="Navigation Tips"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Gesture Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Rotate */}
        <div className="p-3 rounded-xl bg-[#0c121e]/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <MousePointer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Rotate</div>
            <div className="text-[10px] text-slate-400">Left click + drag</div>
          </div>
        </div>

        {/* Zoom */}
        <div className="p-3 rounded-xl bg-[#0c121e]/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <ZoomIn className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Zoom</div>
            <div className="text-[10px] text-slate-400">Scroll wheel</div>
          </div>
        </div>

        {/* Pan */}
        <div className="p-3 rounded-xl bg-[#0c121e]/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Move className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Pan</div>
            <div className="text-[10px] text-slate-400">Right click + drag</div>
          </div>
        </div>

        {/* Touch */}
        <div className="p-3 rounded-xl bg-[#0c121e]/80 border border-slate-800/80 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">Touch</div>
            <div className="text-[10px] text-slate-400">Use fingers on mobile</div>
          </div>
        </div>
      </div>

      {/* Tip Banner matching reference */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0c182b]/80 border border-blue-900/30 text-xs text-slate-300">
        <Lightbulb className="w-4 h-4 text-blue-400 shrink-0" />
        <p className="text-[11px] leading-relaxed text-slate-300">
          <strong className="text-blue-400 font-medium">Tip:</strong> Use mouse or touch to explore the 3D model. Try different angles to view details.
        </p>
      </div>
    </div>
  )
}
