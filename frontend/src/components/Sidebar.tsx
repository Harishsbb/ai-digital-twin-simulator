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
import { useAlerts } from '../context/useAlerts'

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
  const { counts } = useAlerts()
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-[#DFE7F3] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation Links */}
        <div className="flex flex-col">
          {/* Logo & Project Name */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#DFE7F3]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-sm">
                <Box className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-[#10213D] text-sm tracking-tight">
                  AI Digital Twin
                </div>
                <div className="text-xs text-[#475569] font-medium">
                  Simulator
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-[#475569] hover:text-[#10213D] hover:bg-[#F1F5F9]"
              title="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                      isActive
                        ? 'bg-[#EAF2FF] text-[#1769FF] font-semibold shadow-xs'
                        : 'text-[#334155] hover:text-[#10213D] hover:bg-[#F1F5F9]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#1769FF] rounded-r-full" />
                      )}
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#1769FF]' : 'text-[#475569]'}`} />
                      <span>{item.name}</span>
                      {item.path === '/alerts' && counts.unacknowledged > 0 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444] text-white shadow-xs">
                          {counts.unacknowledged > 99 ? '99+' : counts.unacknowledged}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>
        </div>

        {/* Bottom Promotional Industrial Card matching reference */}
        <div className="p-4">
          <div className="relative rounded-2xl overflow-hidden border border-[#DFE7F3] bg-gradient-to-b from-[#EBF3FE] to-[#F5F8FD] p-4 shadow-sm group">
            {/* Light Factory Graphic */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden mb-3 bg-[#E2EAF8] flex items-end justify-center">
              <svg
                viewBox="0 0 200 100"
                className="w-full h-full object-cover opacity-80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Soft clouds/sky */}
                <circle cx="30" cy="20" r="12" fill="#FFFFFF" opacity="0.6" />
                <circle cx="45" cy="18" r="15" fill="#FFFFFF" opacity="0.6" />
                <circle cx="160" cy="25" r="14" fill="#FFFFFF" opacity="0.5" />

                {/* Industrial Silos & Chimneys */}
                <rect x="25" y="30" width="16" height="70" fill="#93C5FD" />
                <rect x="23" y="27" width="20" height="3" fill="#1769FF" />
                <line x1="33" y1="27" x2="33" y2="15" stroke="#EF4444" strokeWidth="2" strokeDasharray="2 2" />

                <rect x="50" y="45" width="22" height="55" fill="#BFDBFE" />
                <rect x="78" y="20" width="18" height="80" fill="#60A5FA" />
                <rect x="76" y="17" width="22" height="3" fill="#1769FF" />

                <rect x="105" y="55" width="35" height="45" fill="#93C5FD" />
                {/* Window lights */}
                <rect x="110" y="60" width="4" height="4" fill="#FFFFFF" />
                <rect x="118" y="60" width="4" height="4" fill="#FFFFFF" />
                <rect x="126" y="60" width="4" height="4" fill="#FFFFFF" />
                <rect x="110" y="70" width="4" height="4" fill="#FFFFFF" />
                <rect x="118" y="70" width="4" height="4" fill="#FFFFFF" />

                <rect x="145" y="35" width="18" height="65" fill="#60A5FA" />
                <rect x="168" y="50" width="20" height="50" fill="#BFDBFE" />
              </svg>
              {/* Soft bottom fade */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#E2EAF8] via-transparent to-transparent" />
            </div>

            {/* Title */}
            <div className="font-bold text-[#10213D] text-xs leading-snug tracking-tight">
              Smarter<br />Machines<br />Safer Operations
            </div>

            {/* Slider Dots */}
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-5 h-1.5 rounded-full bg-[#1769FF]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]" />
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
