import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Box,
  Brain,
  Home,
  Settings,
  X,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  {
    name: 'Overview',
    path: '/',
    icon: Home,
  },
  {
    name: 'Digital Twin',
    path: '/digital-twin',
    icon: Box,
  },
  {
    name: 'Sensor Monitoring',
    path: '/sensors',
    icon: Activity,
  },
  {
    name: 'AI Anomaly Detection',
    path: '/anomaly-detection',
    icon: Brain,
  },
  {
    name: 'Alerts',
    path: '/alerts',
    icon: AlertTriangle,
  },
  {
    name: 'Analytics',
    path: '/analytics',
    icon: BarChart2,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
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

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#090d16] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col">
          {/* Logo & Project Name */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <Box className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <div className="font-semibold text-slate-100 text-sm tracking-wide">
                  AI Digital Twin
                </div>
                <div className="text-xs text-slate-400">
                  Simulator
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[#132238] text-[#38bdf8] font-medium border border-blue-500/25 shadow-[0_0_20px_rgba(56,189,248,0.08)]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Promotional Industrial Card matching reference */}
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-gradient-to-b from-[#111726] to-[#0a0f1d] p-4 shadow-lg group">
            {/* Dark Factory Graphic Silhouette */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-[#0a101d] flex items-end justify-center">
              <svg
                viewBox="0 0 200 100"
                className="w-full h-full object-cover opacity-60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Night sky stars */}
                <circle cx="20" cy="20" r="1" fill="#38bdf8" />
                <circle cx="80" cy="15" r="1.5" fill="#94a3b8" />
                <circle cx="150" cy="25" r="1" fill="#38bdf8" />
                <circle cx="180" cy="10" r="1" fill="#94a3b8" />

                {/* Industrial Silos & Chimneys */}
                <rect x="25" y="30" width="16" height="70" fill="#1e293b" />
                <rect x="23" y="27" width="20" height="3" fill="#38bdf8" />
                <line x1="33" y1="27" x2="33" y2="15" stroke="#ef4444" strokeWidth="2" strokeDasharray="2 2" />

                <rect x="50" y="45" width="22" height="55" fill="#151f30" />
                <rect x="78" y="20" width="18" height="80" fill="#1e293b" />
                <rect x="76" y="17" width="22" height="3" fill="#38bdf8" />

                <rect x="105" y="55" width="35" height="45" fill="#0f172a" />
                {/* Window lights */}
                <rect x="110" y="60" width="4" height="4" fill="#38bdf8" opacity="0.8" />
                <rect x="118" y="60" width="4" height="4" fill="#38bdf8" opacity="0.8" />
                <rect x="126" y="60" width="4" height="4" fill="#38bdf8" opacity="0.8" />
                <rect x="110" y="70" width="4" height="4" fill="#38bdf8" opacity="0.8" />
                <rect x="118" y="70" width="4" height="4" fill="#38bdf8" opacity="0.8" />

                <rect x="145" y="35" width="18" height="65" fill="#1e293b" />
                <rect x="168" y="50" width="20" height="50" fill="#151f30" />
              </svg>
              {/* Subtle blue bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1424] via-transparent to-transparent" />
            </div>

            {/* Title */}
            <div className="font-semibold text-white text-xs leading-snug tracking-wide">
              Smarter<br />Machines<br />Safer Operations
            </div>

            {/* Slider Dots */}
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-5 h-1.5 rounded-full bg-blue-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
