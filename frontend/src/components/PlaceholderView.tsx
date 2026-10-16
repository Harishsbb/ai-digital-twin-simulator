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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl dark-panel shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {title}
              </h1>
              <StatusBadge label={phase} variant="info" pulse={false} size="sm" />
            </div>
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Specification / Planned Implementation Card */}
      <Card
        title="Subsystem Architecture & Capabilities"
        subtitle="Hardware abstraction layer and scheduled implementation capabilities"
        tag="SCHEDULED"
        icon={Icon}
        badge={<span className="text-xs font-mono text-blue-400 font-bold bg-blue-950/60 px-2 py-0.5 rounded-lg border border-blue-800/40">{phase}</span>}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            In accordance with the project milestone boundaries, this subsystem is currently staged in standby mode.
            Baseline infrastructure and communication bridges have been configured.
          </p>

          <div className="pt-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-3">
              PLANNED CAPABILITIES & INTERFACES:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/80 bg-[#0c121e]/80 text-xs text-slate-300 transition-colors hover:border-slate-700"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
