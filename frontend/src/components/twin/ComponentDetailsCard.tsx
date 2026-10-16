import React, { useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Layers,
  Thermometer,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react'
import type { MotorComponentMetadata, TwinVisualStatus } from '../../types'
import { MOTOR_COMPONENTS } from '../../data/motorComponents'

interface ComponentDetailsCardProps {
  component: MotorComponentMetadata
  onSelectComponent: (componentId: string) => void
  machineStatus: TwinVisualStatus
}

export const ComponentDetailsCard: React.FC<ComponentDetailsCardProps> = ({
  component,
  onSelectComponent,
  machineStatus,
}) => {
  const [showComponentList, setShowComponentList] = useState(false)

  const currentIndex = MOTOR_COMPONENTS.findIndex((c) => c.id === component.id)
  const prevComponent =
    MOTOR_COMPONENTS[(currentIndex - 1 + MOTOR_COMPONENTS.length) % MOTOR_COMPONENTS.length]
  const nextComponent =
    MOTOR_COMPONENTS[(currentIndex + 1) % MOTOR_COMPONENTS.length]

  const getStatusBadge = () => {
    switch (machineStatus) {
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" />
            Warning
          </span>
        )
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertOctagon className="w-3 h-3" />
            Critical
          </span>
        )
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" />
            Normal
          </span>
        )
    }
  }

  return (
    <div className="dark-panel rounded-2xl p-6 flex flex-col justify-between shadow-xl border border-white/5 relative overflow-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* ========================================================= */}
        {/* 1. HEADER WITH COMPONENT LIST TOGGLE                      */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Component Details
            </h2>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick List Toggle */}
            <button
              type="button"
              onClick={() => setShowComponentList(!showComponentList)}
              className={`p-1.5 rounded-lg border transition-all ${
                showComponentList
                  ? 'bg-blue-600/20 border-blue-400 text-blue-300'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600'
              }`}
              title="Browse all 14 motor components"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Menu button */}
            <button
              type="button"
              onClick={() => setShowComponentList(!showComponentList)}
              className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPONENT LIST DROPDOWN (Optional Quick Selector)         */}
        {/* ========================================================= */}
        {showComponentList && (
          <div className="my-3 p-3 rounded-xl bg-[#090e17] border border-blue-500/20 max-h-56 overflow-y-auto space-y-1 shadow-2xl animate-in fade-in duration-150">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1">
              Select Component ({MOTOR_COMPONENTS.length})
            </div>
            {MOTOR_COMPONENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectComponent(item.id)
                  setShowComponentList(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                  item.id === component.id
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-400/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[10px] text-slate-400">{item.shortName}</span>
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. COMPONENT PREVIEW IMAGE CARD                           */}
        {/* ========================================================= */}
        <div className="my-4 relative rounded-xl overflow-hidden border border-white/10 bg-[#0a0f19] aspect-video flex items-center justify-center group shadow-inner">
          {component.previewImage ? (
            <img
              src={component.previewImage}
              alt={component.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
              <Cpu className="w-10 h-10 text-blue-400/50" />
              <span className="text-xs">{component.name}</span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d17]/80 via-transparent to-transparent pointer-events-none" />

          {/* Quick cycle left/right buttons inside preview */}
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onSelectComponent(prevComponent.id)}
              className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-black/80 transition-all cursor-pointer"
              title={`Previous: ${prevComponent.name}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-[11px] font-semibold text-slate-300 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
              {currentIndex + 1} / {MOTOR_COMPONENTS.length}
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent(nextComponent.id)}
              className="p-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white hover:bg-black/80 transition-all cursor-pointer"
              title={`Next: ${nextComponent.name}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. COMPONENT TITLE & SUBTITLE                             */}
        {/* ========================================================= */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>{component.name}</span>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            {component.subtitle}
          </p>
        </div>

        {/* ========================================================= */}
        {/* 4. METADATA SPECIFICATION TABLE                           */}
        {/* ========================================================= */}
        <div className="space-y-2.5 text-xs">
          {/* Function */}
          <div className="flex items-start justify-between py-1.5 border-b border-white/5 gap-3">
            <span className="text-slate-400 font-medium shrink-0">Function</span>
            <span className="text-slate-200 text-right leading-relaxed font-normal">
              {component.functionDesc}
            </span>
          </div>

          {/* Material */}
          <div className="flex items-center justify-between py-1.5 border-b border-white/5 gap-3">
            <span className="text-slate-400 font-medium shrink-0">Material</span>
            <span className="text-slate-200 text-right font-medium text-blue-200">
              {component.material}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-1.5 border-b border-white/5 gap-3">
            <span className="text-slate-400 font-medium shrink-0">Status</span>
            <div>{getStatusBadge()}</div>
          </div>

          {/* Temperature Rating */}
          <div className="flex items-center justify-between py-1.5 border-b border-white/5 gap-3">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" />
              Temperature
            </span>
            <span className="text-slate-200 text-right font-mono text-[11px]">
              {component.temperatureRating}
            </span>
          </div>

          {/* Notes */}
          <div className="flex items-start justify-between py-1.5 border-b border-white/5 gap-3">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Notes
            </span>
            <span className="text-slate-300 text-right text-[11px] leading-relaxed">
              {component.notes}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. BOTTOM FAST COMPONENT JUMP CHIPS                       */}
      {/* ========================================================= */}
      <div className="mt-5 pt-3 border-t border-white/5">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Quick Jump
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['stator-core', 'rotor', 'drive-shaft', 'front-end-shield', 'de-bearing', 'terminal-box'].map(
            (id) => {
              const item = MOTOR_COMPONENTS.find((c) => c.id === id)
              if (!item) return null
              const isSelected = item.id === component.id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectComponent(id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  {item.shortName}
                </button>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}
