import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { StatusBadge } from './StatusBadge'

interface PlaceholderViewProps {
  title: string
  phase: string
  icon: LucideIcon
  description: string
  plannedFeatures: string[]
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  phase,
  icon: Icon,
  description,
  plannedFeatures,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl mech-panel border-slate-800 tech-bracket">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-cyan-400 shrink-0 shadow-inner">
            <Icon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide uppercase">
                {title}
              </h2>
              <StatusBadge label={phase} variant="laser" pulse={false} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-1 font-mono">{description}</p>
          </div>
        </div>
      </div>

      {/* Specification / Planned Implementation Card */}
      <Card
        title="Subsystem Architecture & Capabilities"
        subtitle="Hardware abstraction layer and scheduled implementation capabilities"
        tag="SCHEDULED"
        icon={Icon}
        badge={<span className="text-xs font-mono text-cyan-400 font-bold">{phase}</span>}
        techBracket={true}
      >
        <div className="space-y-4 font-mono">
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            In accordance with the <strong>Step 1</strong> boundaries, this subsystem is currently staged in standby mode.
            Project scaffolding, routing paths, typed schemas, and communication bridges have been initialized.
          </p>

          <div className="pt-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
              PLANNED CAPABILITIES & INTERFACES:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-800/80 bg-[#06080e] text-xs text-slate-300 transition-colors hover:border-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="font-sans text-xs">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
