import React, { useEffect, useState } from 'react'
import { Activity, Bell, Cpu, Menu, RefreshCw, User, Wifi, WifiOff } from 'lucide-react'
import { StatusBadge } from './StatusBadge'
import { fetchBackendHealth } from '../services/api'
import type { BackendHealthResponse } from '../types'

interface HeaderProps {
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [health, setHealth] = useState<BackendHealthResponse | null>(null)
  const [isChecking, setIsChecking] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean | null>(null)

  const checkHealth = React.useCallback(async () => {
    setIsChecking(true)
    try {
      const res = await fetchBackendHealth()
      setHealth(res)
      setConnected(res.status === 'healthy')
    } catch {
      setConnected(false)
    } finally {
      setIsChecking(false)
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
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Project Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-900/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
                AI Digital Twin Simulator
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded">
                v0.1.0-DEV
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Industrial Motor Telemetry & Predictive Monitoring
            </p>
          </div>
        </div>
      </div>

      {/* Center: Placeholder Machine Status */}
      <div className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
        <Activity className="w-4 h-4 text-cyan-400" />
        <div className="text-xs">
          <span className="text-slate-400 font-mono">ASSET:</span>{' '}
          <span className="font-semibold text-slate-200 font-mono">MTR-IND-150KW</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-700" />
        <StatusBadge label="STANDBY (SETUP)" variant="info" pulse={false} />
      </div>

      {/* Right: Backend Connection Status & Profile Placeholder */}
      <div className="flex items-center gap-3">
        {/* Backend API live indicator */}
        <button
          onClick={checkHealth}
          disabled={isChecking}
          title={connected ? `Backend API Online (${health?.service || 'FastAPI'})` : 'Backend API Disconnected / Click to retry'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
            connected
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 hover:bg-emerald-900/40'
              : connected === false
              ? 'bg-rose-950/40 text-rose-400 border-rose-800/40 hover:bg-rose-900/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}
          <span className="hidden sm:inline">
            {connected ? 'API ONLINE' : connected === false ? 'API OFFLINE' : 'CHECKING...'}
          </span>
          <RefreshCw className={`w-3 h-3 ml-0.5 ${isChecking ? 'animate-spin' : ''}`} />
        </button>

        {/* Notifications Placeholder */}
        <button
          className="relative p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="System Notifications (Standby)"
          aria-label="System Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
        </button>

        {/* Profile Placeholder */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-medium text-slate-200">Lead Reliability Eng.</p>
            <p className="text-[10px] text-slate-400 font-mono">SYS-ADMIN</p>
          </div>
        </div>
      </div>
    </header>
  )
}
