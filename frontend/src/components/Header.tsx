import React, { useEffect, useState } from 'react'
import {
  Bell,
  ChevronDown,
  Menu,
  Search,
} from 'lucide-react'
import { fetchBackendHealth } from '../services/api'
import type { BackendHealthResponse } from '../types'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null)
  const [connected, setConnected] = useState<boolean | null>(null)

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
    <header className="h-18 px-6 lg:px-8 flex items-center justify-between border-b border-slate-800/60 bg-[#080b11]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Mobile Toggle & Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching reference */}
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-[#111726] border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions: System Status, Notifications, Profile */}
      <div className="flex items-center gap-4">
        {/* System Online Status Pill */}
        <button
          onClick={checkHealth}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
            connected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
              : connected === false
              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
              : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
          }`}
          title={
            connected
              ? `Backend Connected (${health?.service || 'FastAPI'})`
              : 'Backend checking / Click to ping'
          }
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span>System Online</span>
        </button>

        {/* Notifications Icon with Badge Dot */}
        <button
          className="relative p-2.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800/80 cursor-pointer group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold shadow-md">
            H
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
              Harish
            </div>
            <div className="text-[11px] text-slate-400">
              Developer
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:block" />
        </div>
      </div>
    </header>
  )
}
