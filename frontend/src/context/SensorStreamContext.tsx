import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  controlSimulator as apiControlSimulator,
  fetchLatestSensorReading,
  fetchSensorHistory,
  fetchSimulatorState,
  getSensorWebSocketUrl,
} from '../services/api'
import type {
  SensorReading,
  SimulatorAction,
  SimulatorMode,
  SimulatorStateResponse,
  TelemetryConnectionStatus,
} from '../types'

import {
  SensorStreamContext,
  type SensorStreamContextValue,
} from './SensorStreamContextDef'

export const SensorStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reading, setReading] = useState<SensorReading | null>(null)
  const [history, setHistory] = useState<SensorReading[]>([])
  const [simState, setSimState] = useState<SimulatorStateResponse | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<TelemetryConnectionStatus>('Disconnected')
  const [lastReceivedAt, setLastReceivedAt] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<number | null>(null)
  const staleCheckIntervalRef = useRef<number | null>(null)
  const isUnmountedRef = useRef<boolean>(false)
  const connectRef = useRef<() => void>(() => {})

  // Establish and manage single shared WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (isUnmountedRef.current) return

    if (wsRef.current) {
      try {
        wsRef.current.close()
      } catch {
        // Ignore close errors on dead socket
      }
      wsRef.current = null
    }

    try {
      const wsUrl = getSensorWebSocketUrl()
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        if (isUnmountedRef.current) return
        setConnectionStatus('Connected')
        setError(null)
      }

      ws.onmessage = (event) => {
        if (isUnmountedRef.current) return
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'control_ack') {
            setSimState(data.state)
            if (data.state?.latest_reading) {
              setReading(data.state.latest_reading)
              setLastReceivedAt(Date.now())
              setConnectionStatus('Connected')
            }
          } else if (data.temperature !== undefined) {
            const newReading = data as SensorReading
            setReading(newReading)
            setLastReceivedAt(Date.now())
            setConnectionStatus('Connected')
            setHistory((prev) => {
              const updated = [...prev, newReading]
              return updated.length > 50 ? updated.slice(-50) : updated
            })
          }
        } catch {
          // Ignore invalid packets
        }
      }

      ws.onerror = () => {
        if (isUnmountedRef.current) return
        setConnectionStatus('Disconnected')
      }

      ws.onclose = () => {
        if (isUnmountedRef.current) return
        setConnectionStatus('Disconnected')
        // Automatically attempt reconnection with 2.5s backoff
        if (!reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = window.setTimeout(() => {
            reconnectTimeoutRef.current = null
            connectRef.current()
          }, 2500)
        }
      }
    } catch (err) {
      if (isUnmountedRef.current) return
      setConnectionStatus('Disconnected')
      setError(err instanceof Error ? err.message : 'WebSocket initialization failed')
    }
  }, [])

  useEffect(() => {
    connectRef.current = connectWebSocket
  }, [connectWebSocket])

  // Initial load via REST API and connect WebSocket
  useEffect(() => {
    isUnmountedRef.current = false

    const loadInitialData = async () => {
      try {
        const [latest, state, hist] = await Promise.all([
          fetchLatestSensorReading(),
          fetchSimulatorState(),
          fetchSensorHistory(40),
        ])
        if (!isUnmountedRef.current) {
          setReading(latest)
          setSimState(state)
          setHistory(hist)
          setLastReceivedAt(Date.now())
          setError(null)
        }
      } catch (err) {
        if (!isUnmountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to reach sensor REST API')
        }
      }
    }

    loadInitialData()
    connectWebSocket()

    // Stale Data Watchdog: If no message is received for > 3.5s while simulator is active
    staleCheckIntervalRef.current = window.setInterval(() => {
      setLastReceivedAt((prev) => {
        if (prev !== null && Date.now() - prev > 3500) {
          setConnectionStatus((curr) => (curr === 'Connected' ? 'Stale Data' : curr))
        }
        return prev
      })
    }, 1000)

    return () => {
      isUnmountedRef.current = true
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (staleCheckIntervalRef.current) {
        clearInterval(staleCheckIntervalRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connectWebSocket])

  // Simulator Control Handler
  const controlSimulator = useCallback(async (action: SimulatorAction, mode?: SimulatorMode) => {
    try {
      // Send fast WebSocket packet if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action, mode }))
      }
      // Reconcile with REST API as authoritative source
      const updatedState = await apiControlSimulator(action, mode)
      if (!isUnmountedRef.current) {
        setSimState(updatedState)
        if (updatedState.latest_reading) {
          setReading(updatedState.latest_reading)
          setLastReceivedAt(Date.now())
        }
        if (action === 'reset') {
          setHistory([updatedState.latest_reading])
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Control action ${action} failed`)
    }
  }, [])

  // Toggle Mode helper
  const toggleMode = useCallback(async () => {
    await controlSimulator('toggle_mode')
  }, [controlSimulator])

  const isSimulatorRunning = simState?.is_running ?? reading?.is_running ?? true
  const currentMode = simState?.mode ?? reading?.mode ?? 'normal'

  const value: SensorStreamContextValue = {
    reading,
    history,
    simState,
    connectionStatus,
    lastReceivedAt,
    error,
    isSimulatorRunning,
    currentMode,
    controlSimulator,
    toggleMode,
    reconnect: connectWebSocket,
  }

  return <SensorStreamContext.Provider value={value}>{children}</SensorStreamContext.Provider>
}
