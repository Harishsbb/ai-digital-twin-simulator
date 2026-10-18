import React from 'react'
import { Info, RotateCw, ZoomIn, Move, Smartphone } from 'lucide-react'

export const ControlsHelpCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(16,33,61,0.04)] border border-[#DFE7F3] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#10213D] tracking-tight">
          Interaction Guide
        </h3>
        <button
          type="button"
          className="text-[#94A3B8] hover:text-[#10213D] transition-colors cursor-pointer"
          title="Interaction Guide"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Gesture Tiles (Matching Reference Image) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 mt-4">
        {/* Rotate */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
            <RotateCw className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#10213D]">Rotate</div>
            <div className="text-[10px] text-[#64748B]">Left click + drag</div>
          </div>
        </div>

        {/* Zoom */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#10213D]">Zoom</div>
            <div className="text-[10px] text-[#64748B]">Scroll wheel</div>
          </div>
        </div>

        {/* Pan */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
            <Move className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#10213D]">Pan</div>
            <div className="text-[10px] text-[#64748B]">Right click + drag</div>
          </div>
        </div>

        {/* Touch */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#10213D]">Touch</div>
            <div className="text-[10px] text-[#64748B]">Use fingers on mobile</div>
          </div>
        </div>
      </div>
    </div>
  )
}
