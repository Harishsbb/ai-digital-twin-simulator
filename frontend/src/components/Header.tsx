import React, { useEffect, useState } from 'react'
import {
  Activity,
  Bell,
  Cpu,
  Menu,
  RefreshCw,
  Shield,
  User,
  Wifi,
  WifiOff,
} from 'lucide-react'
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
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [utcTime, setUtcTime] = useState<string>('')

  // Live UTC timecode ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setUtcTime(
        now.toISOString().substring(11, 19) + ' UTC'
      )
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const checkHealth = React.useCallback(async () => {
    setIsChecking(true)
    const t0 = performance.now()
    try {
      const res = await fetchBackendHealth()
      const t1 = performance.now()
      setLatencyMs(Math.round(t1 - t0))
      setHealth(res)
      setConnected(res.status === 'healthy')
    } catch {
      setConnected(false)
      setLatencyMs(null)
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    const run = async () => {
      const t0 = performance.now()
      try {
        const res = await fetchBackendHealth()
        const t1 = performance.now()
        if (active) {
          setLatencyMs(Math.round(t1 - t0))
          setHealth(res)
          setConnected(res.status === 'healthy')
        }
      } catch {
        if (active) {
          setConnected(false)
          setLatencyMs(null)
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
    <header className="h-16 border-b border-slate-800/80 bg-[#090c13]/90 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Industrial Unit Tag */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-gradient-to-b from-slate-800 to-slate-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-950/20 group">
            <Cpu className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping opacity-75" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-wider text-slate-100 uppercase font-mono">
                AI Digital Twin
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-700/50">
                STEP-1 // CORE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
              INDUSTRIAL MOTOR TELEMETRY STATION
            </p>
          </div>
        </div>
      </div>

      {/* Center: Realtime Asset & Station Telecode */}
      <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-500">ASSET:</span>
          <span className="font-semibold text-slate-200">MTR-150KW-SIMOTICS</span>
        </div>
        <div className="h-3 w-[1px] bg-slate-800" />
        <div className="text-[11px] text-slate-400">
          <span className="text-slate-500">DUTY:</span> S1 CONT
        </div>
        <div className="h-3 w-[1px] bg-slate-800" />
        <div className="text-[11px] text-cyan-400 font-mono font-medium">
          {utcTime || '16:00:00 UTC'}
        </div>
      </div>

      {/* Right: Telemetry Bus Latency & Operator Console */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Backend Handshake Pill with Latency */}
        <button
          onClick={checkHealth}
          disabled={isChecking}
          title={
            connected
              ? `FastAPI Backend Online (${health?.service || 'FastAPI'} v${
                  health?.version || '0.1.0'
                }) - Latency: ${latencyMs ?? '--'}ms`
              : 'Backend API Offline. Click to reconnect.'
          }
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all ${
            connected
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50 hover:bg-emerald-900/40'
              : connected === false
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/40'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400" />
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-semibold hidden sm:inline">
              {connected ? 'API BUS' : 'BUS OFFLINE'}
            </span>
            {latencyMs !== null && connected && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-1 py-0.2 rounded border border-emerald-800/60">
                {latencyMs}ms
              </span>
            )}
          </div>

          <RefreshCw
            className={`w-3 h-3 text-slate-400 hover:text-slate-200 ${
              isChecking ? 'animate-spin text-cyan-400' : ''
            }`}
          />
        </button>

        {/* Machine Alert Standby Status */}
        <div className="hidden md:flex items-center">
          <StatusBadge label="STANDBY" variant="info" pulse={false} size="sm" />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title="Telemetry Bus Notifications (All Clear)"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shadow-sm">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-200 font-mono">
                DR. S. VANCE
              </span>
              <Shield className="w-3 h-3 text-cyan-400" />
            </div>
            <p className="text-[9px] text-slate-400 font-mono tracking-wider uppercase">
              LEAD RELIABILITY ENG
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
