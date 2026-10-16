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
          className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Control Station Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#fcfbf8] border-r border-stone-200/90 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Control Station ID */}
        <div className="h-16 px-5 border-b border-stone-200/90 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-stone-900 flex items-center justify-center text-white shadow-2xs">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
            </div>
            <div>
              <div className="font-mono text-xs tracking-wider uppercase font-bold text-stone-900 flex items-center gap-1.5">
                <span>RACK-01</span>
                <span className="text-[10px] text-emerald-700 font-semibold font-mono bg-emerald-50 px-1 rounded border border-emerald-200">
                  LIVE
                </span>
              </div>
              <p className="text-[9px] text-stone-500 font-mono tracking-tight">
                TWIN MONITORING BUS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 flex items-center justify-between text-[10px] font-mono tracking-wider text-stone-400 font-bold">
                <span>{sec.title}</span>
                <span className="text-stone-300 text-[9px]">{sec.code}</span>
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
                            ? 'bg-stone-900 text-white shadow-2xs font-semibold'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/90'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 shrink-0">
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
        <div className="p-3 border-t border-stone-200/90 bg-stone-50/60 space-y-2">
          <div className="p-2.5 rounded-lg border border-stone-200/90 bg-white shadow-2xs font-mono text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-stone-500">
              <span className="flex items-center gap-1.5 font-medium">
                <Terminal className="w-3 h-3 text-stone-700" />
                <span>TELEMETRY PROTOCOL</span>
              </span>
              <span className="text-emerald-700 font-bold">READY</span>
            </div>
            <div className="flex items-center justify-between text-stone-900 font-semibold text-xs">
              <span>OPC-UA / MQTT Bus</span>
              <span className="text-stone-500 text-[10px]">50 Hz</span>
            </div>
            <div className="w-full bg-stone-100 h-1 rounded-full overflow-hidden">
              <div className="bg-stone-900 h-full w-2/5 rounded-full" />
            </div>
            <div className="flex items-center justify-between text-[9px] text-stone-400 pt-0.5">
              <span>BUFFER // STANDBY</span>
              <span>STAGE 1 SETUP</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
