import React from 'react'
import { MousePointer, Move, ZoomIn, Smartphone } from 'lucide-react'

export const ControlHelpPanel: React.FC = () => {
  return (
    <div className="p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs font-mono text-xs">
      <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500 mb-2.5 flex items-center justify-between">
        <span>3D VIEWPORT NAVIGATION GUIDE</span>
        <span className="text-stone-400">DESKTOP & TOUCH</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-stone-700">
          <div className="p-1.5 rounded bg-stone-100 border border-stone-200 text-stone-900 shrink-0">
            <MousePointer className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-stone-900">Left Click + Drag</div>
            <div className="text-stone-500 text-[10px]">Orbit / Rotate</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-700">
          <div className="p-1.5 rounded bg-stone-100 border border-stone-200 text-stone-900 shrink-0">
            <Move className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-stone-900">Right Click + Drag</div>
            <div className="text-stone-500 text-[10px]">Pan Camera</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-700">
          <div className="p-1.5 rounded bg-stone-100 border border-stone-200 text-stone-900 shrink-0">
            <ZoomIn className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-stone-900">Scroll Wheel</div>
            <div className="text-stone-500 text-[10px]">Zoom In / Out</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-stone-700">
          <div className="p-1.5 rounded bg-stone-100 border border-stone-200 text-stone-900 shrink-0">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-stone-900">Touch Gestures</div>
            <div className="text-stone-500 text-[10px]">1-Finger Rotate, Pinch Zoom</div>
          </div>
        </div>
      </div>
    </div>
  )
}
