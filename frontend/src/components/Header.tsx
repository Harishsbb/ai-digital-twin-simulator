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
    <header className="h-16 border-b border-stone-200/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Toggle & Industrial Unit Tag */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg bg-stone-100 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors"
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-white shadow-2xs group">
            <Cpu className="w-5 h-5 transition-transform group-hover:scale-105" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold tracking-wider text-stone-900 uppercase font-mono">
                AI Digital Twin
              </h1>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
                STEP-1 // CORE
              </span>
            </div>
            <p className="text-[10px] text-stone-500 font-mono tracking-tight hidden sm:block">
              INDUSTRIAL MOTOR TELEMETRY STATION
            </p>
          </div>
        </div>
      </div>

      {/* Center: Realtime Asset & Station Telecode */}
      <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-stone-50 border border-stone-200/90 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-stone-600">
          <Activity className="w-3.5 h-3.5 text-stone-700" />
          <span className="text-stone-400">ASSET:</span>
          <span className="font-semibold text-stone-900">MTR-150KW-SIMOTICS</span>
        </div>
        <div className="h-3 w-[1px] bg-stone-200" />
        <div className="text-[11px] text-stone-600">
          <span className="text-stone-400">DUTY:</span> S1 CONT
        </div>
        <div className="h-3 w-[1px] bg-stone-200" />
        <div className="text-[11px] text-stone-700 font-mono font-medium">
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
          className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-mono border transition-all shadow-2xs ${
            connected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : connected === false
              ? 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              : 'bg-stone-100 text-stone-700 border-stone-200'
          }`}
        >
          {connected ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-600" />
          )}

          <div className="flex items-center gap-1.5">
            <span className="font-semibold hidden sm:inline">
              {connected ? 'API BUS' : 'BUS OFFLINE'}
            </span>
            {latencyMs !== null && connected && (
              <span className="text-[10px] text-emerald-800 font-bold bg-white px-1 py-0.5 rounded border border-emerald-300">
                {latencyMs}ms
              </span>
            )}
          </div>

          <RefreshCw
            className={`w-3 h-3 text-stone-500 hover:text-stone-800 ${
              isChecking ? 'animate-spin text-stone-900' : ''
            }`}
          />
        </button>

        {/* Machine Alert Standby Status */}
        <div className="hidden md:flex items-center">
          <StatusBadge label="STANDBY" variant="neutral" pulse={false} size="sm" />
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg bg-stone-50 border border-stone-200 text-stone-600 hover:text-stone-900 transition-colors shadow-2xs"
          title="Telemetry Bus Notifications (All Clear)"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-stone-900" />
        </button>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
          <div className="w-8 h-8 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-white shadow-2xs">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-stone-900 font-mono">
                DR. S. VANCE
              </span>
              <Shield className="w-3 h-3 text-stone-500" />
            </div>
            <p className="text-[9px] text-stone-400 font-mono tracking-wider uppercase">
              LEAD RELIABILITY ENG
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
