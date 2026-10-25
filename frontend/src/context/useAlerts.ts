import { useContext } from 'react'
import { AlertContext, type AlertContextValue } from './AlertContextDef'

/**
 * Hook to access real-time AI alert states, lifecycle actions, and notification toasts.
 * Must be used within an AlertProvider.
 */
export function useAlerts(): AlertContextValue {
  const context = useContext(AlertContext)
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider')
  }
  return context
}
