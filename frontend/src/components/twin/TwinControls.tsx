import React from 'react'
import {
  RotateCcw,
  Play,
  Pause,
  Box,
  Layers,
} from 'lucide-react'
import type { TwinViewOptions, TwinVisualStatus } from '../../types'

interface TwinControlsProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  onChangeStatus: (status: TwinVisualStatus) => void
  onOptionsChange: (updater: (prev: TwinViewOptions) => TwinViewOptions) => void
  onResetCamera: () => void
}

export const TwinControls: React.FC<TwinControlsProps> = ({
  status,
  options,
  onChangeStatus,
  onOptionsChange,
  onResetCamera,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-white border border-stone-200/90 shadow-2xs">
      {/* Left: View Manipulation Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
        <button
          onClick={onResetCamera}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors font-medium border border-stone-200"
          title="Reset Camera View to Default Isometric Angle"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Camera</span>
        </button>

        <button
          onClick={() =>
            onOptionsChange((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium border ${
            options.autoRotate
              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
          }`}
          title="Toggle 360-degree Auto-Rotation"
        >
          {options.autoRotate ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
          <span>{options.autoRotate ? 'Pause Rotation' : 'Auto Rotate'}</span>
        </button>

        <button
          onClick={() =>
            onOptionsChange((prev) => ({ ...prev, explodedView: !prev.explodedView }))
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium border ${
            options.explodedView
              ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
          }`}
          title="Toggle Exploded Component Dissection View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{options.explodedView ? 'Collapse View' : 'Exploded View'}</span>
        </button>

        <button
          onClick={() =>
            onOptionsChange((prev) => ({ ...prev, wireframe: !prev.wireframe }))
          }
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium border ${
            options.wireframe
              ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
          }`}
          title="Toggle Mesh Wireframe Mode"
        >
          <Box className="w-3.5 h-3.5" />
          <span>Wireframe</span>
        </button>
      </div>

      {/* Right: Manual Status Switcher (Testing Controls) */}
      <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 font-mono text-xs">
        <span className="text-stone-400 text-[11px] font-semibold hidden md:inline">
          TEST STATUS:
        </span>
        <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-100">
          {(['Normal', 'Warning', 'Critical'] as TwinVisualStatus[]).map((s) => {
            const active = status === s
            const activeColor = {
              Normal: 'bg-emerald-600 text-white',
              Warning: 'bg-amber-600 text-white',
              Critical: 'bg-rose-600 text-white',
            }[s]

            return (
              <button
                key={s}
                onClick={() => onChangeStatus(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  active
                    ? `${activeColor} shadow-2xs font-bold`
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
