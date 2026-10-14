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
  Terminal,
} from 'lucide-react'
import type { NavItem } from '../types'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSection {
  title: string
  code: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: 'SUPERVISORY',
    code: 'SEC-01',
    items: [
      {
        name: 'Overview',
        path: '/',
        icon: LayoutDashboard,
        description: 'Plant asset profile and infrastructure status',
      },
      {
        name: 'Digital Twin',
        path: '/digital-twin',
        icon: Box,
        badge: 'PHASE 3',
        description: '3D spatial WebGL motor viewport',
      },
      {
        name: 'Sensor Monitoring',
        path: '/sensors',
        icon: Activity,
        badge: 'PHASE 2',
        description: 'High-frequency telemetry streams',
      },
    ],
  },
  {
    title: 'ANALYTICS & AI',
    code: 'SEC-02',
    items: [
      {
        name: 'AI Anomaly Detection',
        path: '/anomaly-detection',
        icon: BrainCircuit,
        badge: 'PHASE 4',
        description: 'Predictive ML fault diagnosis',
      },
      {
        name: 'Alerts',
        path: '/alerts',
        icon: AlertTriangle,
        badge: 'PHASE 2',
        description: 'ISO 10816 vibration limits & triggers',
      },
      {
        name: 'Analytics',
        path: '/analytics',
        icon: BarChart3,
        badge: 'PHASE 5',
        description: 'Telemetry historian and degradation metrics',
      },
    ],
  },
  {
    title: 'SYSTEM',
    code: 'SEC-03',
    items: [
      {
        name: 'Settings',
        path: '/settings',
        icon: Settings,
        badge: 'PHASE 1',
        description: 'Simulator physics and API bindings',
      },
    ],
  },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Control Station Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#080b12] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Control Station ID */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <div className="font-mono text-xs tracking-wider uppercase font-bold text-slate-100 flex items-center gap-1.5">
                <span>RACK-01</span>
                <span className="text-[10px] text-cyan-400 font-semibold font-mono">
                  [LIVE]
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-mono tracking-tight">
                TWIN MONITORING BUS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1.5 flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 font-semibold">
                <span>{sec.title}</span>
                <span className="text-slate-400 text-[9px]">{sec.code}</span>
              </div>
              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono transition-all ${
                          isActive
                            ? 'bg-cyan-950/40 text-cyan-300 border-l-2 border-cyan-400 shadow-sm font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Lower Telemetry & Hardware Rack Status */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2">
          <div className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/40 font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" />
                <span>TELEMETRY PROTOCOL</span>
              </span>
              <span className="text-emerald-400 font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-slate-300 font-semibold text-xs">
              <span>OPC-UA / MQTT Bus</span>
              <span className="text-cyan-400 text-[10px]">50 Hz</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full w-2/5 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-0.5">
              <span>BUFFER // STANDBY</span>
              <span>STAGE 1 SETUP</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
