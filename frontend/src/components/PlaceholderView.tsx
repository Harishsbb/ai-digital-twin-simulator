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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl mech-panel tech-bracket">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-white shrink-0 shadow-2xs">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-stone-900 font-mono tracking-wide uppercase">
                {title}
              </h2>
              <StatusBadge label={phase} variant="laser" pulse={false} size="sm" />
            </div>
            <p className="text-xs text-stone-500 mt-1 font-mono">{description}</p>
          </div>
        </div>
      </div>

      {/* Specification / Planned Implementation Card */}
      <Card
        title="Subsystem Architecture & Capabilities"
        subtitle="Hardware abstraction layer and scheduled implementation capabilities"
        tag="SCHEDULED"
        icon={Icon}
        badge={<span className="text-xs font-mono text-stone-800 font-bold bg-stone-100 px-2 py-0.5 rounded border border-stone-200">{phase}</span>}
        techBracket={true}
      >
        <div className="space-y-4 font-mono">
          <p className="text-xs text-stone-600 font-sans leading-relaxed">
            In accordance with the <strong>Step 1</strong> boundaries, this subsystem is currently staged in standby mode.
            Project scaffolding, routing paths, typed schemas, and communication bridges have been initialized.
          </p>

          <div className="pt-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold mb-3">
              PLANNED CAPABILITIES & INTERFACES:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-stone-200/90 bg-stone-50/70 text-xs text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1.5 shrink-0" />
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
