import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Box,
  LayoutDashboard,
  Settings,
  X,
  Radio,
} from 'lucide-react'
import type { NavItem } from '../types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems: NavItem[] = [
  {
    name: 'Overview',
    path: '/',
    icon: LayoutDashboard,
    description: 'System Status & Assets',
  },
  {
    name: 'Digital Twin',
    path: '/digital-twin',
    icon: Box,
    badge: 'Phase 3',
    description: '3D Motor Visualization',
  },
  {
    name: 'Sensor Monitoring',
    path: '/sensors',
    icon: Activity,
    badge: 'Phase 2',
    description: 'Real-time Telemetry Stream',
  },
  {
    name: 'AI Anomaly Detection',
    path: '/anomaly-detection',
    icon: BrainCircuit,
    badge: 'Phase 4',
    description: 'Predictive ML Engine',
  },
  {
    name: 'Alerts',
    path: '/alerts',
    icon: AlertTriangle,
    badge: 'Phase 2',
    description: 'Industrial Safety Thresholds',
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    badge: 'Phase 5',
    description: 'Telemetry Historian & Trends',
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    description: 'Simulator & Pipeline Config',
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/95 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header / Branding */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase font-semibold text-slate-200">
              Control Station
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Telemetry & Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-cyan-950/50 text-cyan-300 border-l-2 border-cyan-400 shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400 border border-slate-700/60">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer info panel */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>SYSTEM ARCHITECTURE</span>
              <span className="text-cyan-400">STAGE 1</span>
            </div>
            <div className="mt-1 text-slate-300 font-semibold truncate">
              Induction Motor Twin
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Simulated Telemetry Protocol: Standby
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
