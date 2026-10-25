import { createContext } from 'react'
import type { AlertCounts, AlertFilterState, AlertItem } from '../types/alert'

export interface AlertContextValue {
  // Alert collections
  alerts: AlertItem[]
  activeAlerts: AlertItem[]
  unacknowledgedAlerts: AlertItem[]
  counts: AlertCounts
  
  // Active Alert Episode Tracking
  isAnomalyActive: boolean
  latestActiveAlert: AlertItem | null
  latestAlert: AlertItem | null

  // Lifecycle actions
  acknowledgeAlert: (id: string) => void
  dismissAlert: (id: string) => void
  acknowledgeAll: () => void
  dismissAll: () => void
  clearHistory: () => void

  // Filter state
  filterState: AlertFilterState
  setFilterState: React.Dispatch<React.SetStateAction<AlertFilterState>>
  filteredAlerts: AlertItem[]

  // Real-time In-App Notification (Toast)
  activeToast: AlertItem | null
  dismissToast: () => void
}

export const AlertContext = createContext<AlertContextValue | null>(null)
