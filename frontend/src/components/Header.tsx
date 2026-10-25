import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ChevronDown,
  Menu,
  Search,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react'
import { fetchBackendHealth } from '../services/api'
import type { BackendHealthResponse } from '../types'
import { useAlerts } from '../context/useAlerts'
import { useAuth } from '../context/useAuth'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)

  const { counts } = useAlerts()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = user?.name || 'Operator'
  const displayEmail = user?.email || 'operator@digitaltwin.ai'
  const initial = displayName.trim().charAt(0).toUpperCase() || 'O'

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setProfileOpen(false)
    await logout()
    navigate('/login')
  }

  const checkHealth = React.useCallback(async () => {
    try {
      const res = await fetchBackendHealth()
      setHealth(res)
      setConnected(res.status === 'healthy')
    } catch {
      setConnected(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const run = async () => {
      try {
        const res = await fetchBackendHealth()
        if (active) {
          setHealth(res)
          setConnected(res.status === 'healthy')
        }
      } catch {
        if (active) {
          setConnected(false)
        }
      }
    }
    run()
    const interval = setInterval(run, 30000)
    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  return (
    <header className="h-18 px-6 lg:px-8 flex items-center justify-between border-b border-[#DFE7F3] bg-[#F4F7FC]/90 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Toggle & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-white border border-[#DFE7F3] text-[#64748B] hover:text-[#10213D] shadow-xs"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching reference image with Ctrl K shortcut */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search components, settings, documentation..."
            className="w-full bg-white border border-[#DFE7F3] rounded-xl pl-10 pr-16 py-2 text-xs text-[#10213D] placeholder-[#64748B] focus:outline-none focus:border-[#1769FF] focus:ring-2 focus:ring-[#1769FF]/10 shadow-xs transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-[#F1F5F9] border border-[#DFE7F3] text-[10px] font-semibold text-[#475569] pointer-events-none">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Right Actions: System Status, Notifications, Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* User Manual Button */}
        <Link
          to="/user-manual"
          id="user-manual-header-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DFE7F3] text-xs font-semibold text-[#10213D] hover:text-[#1769FF] hover:border-[#1769FF]/50 hover:bg-[#F8FAFC] transition-all shadow-xs cursor-pointer"
          title="Open User Manual & Operator Guide"
        >
          <BookOpen className="w-4 h-4 text-[#1769FF]" />
          <span className="hidden sm:inline">User Manual</span>
        </Link>

        {/* System Online Status Pill */}
        <button
          onClick={checkHealth}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
            connected
              ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
              : connected === false
              ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
              : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
          }`}
          title={
            connected
              ? `Backend Connected (${health?.service || 'FastAPI'})`
              : 'Backend checking / Click to ping'
          }
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>System Online</span>
        </button>

        {/* Notifications Icon with Dynamic Unacknowledged Badge */}
        <Link
          to="/alerts"
          className="relative p-2 rounded-xl bg-white border border-[#DFE7F3] text-[#64748B] hover:text-[#10213D] hover:border-[#CBD5E1] transition-all shadow-xs cursor-pointer inline-flex items-center justify-center"
          title={
            counts.unacknowledged > 0
              ? `${counts.unacknowledged} unacknowledged alert${counts.unacknowledged > 1 ? 's' : ''}`
              : 'Alert Center (0 unacknowledged)'
          }
        >
          <Bell className="w-4 h-4" />
          {counts.unacknowledged > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-4.5 h-4.5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold flex items-center justify-center shadow-xs animate-pulse">
              {counts.unacknowledged > 99 ? '99+' : counts.unacknowledged}
            </span>
          )}
        </Link>

        {/* User Profile Card & Interactive Dropdown */}
        <div ref={profileRef} className="relative pl-2 border-l border-[#DFE7F3]">
          <button
            type="button"
            id="user-profile-menu-button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/80 transition-colors cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center font-bold text-white text-xs shadow-xs">
              {initial}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-xs font-bold text-[#10213D] truncate max-w-[110px]">
                {displayName}
              </div>
              <div className="text-[11px] text-[#475569] font-medium">Operator</div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-[#94A3B8] hidden sm:block transition-transform duration-200 ${
                profileOpen ? 'rotate-180 text-[#0D9488]' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-xl shadow-teal-950/10 border border-[#E2E8F0] py-2 z-50 divide-y divide-[#F1F5F9] animate-in fade-in slide-in-from-top-2 duration-150"
            >
              {/* User Meta */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] flex items-center justify-center font-bold text-white text-sm shadow-xs shrink-0">
                    {initial}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-[#10213D] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#64748B] truncate">{displayEmail}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded-md bg-[#F0FDFA] border border-[#99F6E4] text-[10px] font-semibold text-[#0F766E]">
                      Digital Twin Operator
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#475569] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors"
                  role="menuitem"
                >
                  <SettingsIcon className="w-4 h-4 text-[#64748B]" />
                  <span>Platform Settings</span>
                </Link>
                <Link
                  to="/user-manual"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#475569] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors"
                  role="menuitem"
                >
                  <BookOpen className="w-4 h-4 text-[#64748B]" />
                  <span>User Manual & Guide</span>
                </Link>
              </div>

              {/* Sign Out Option */}
              <div className="py-1">
                <button
                  type="button"
                  id="header-logout-button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors font-medium cursor-pointer text-left"
                  role="menuitem"
                >
                  <LogOut className="w-4 h-4 text-[#EF4444]" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
