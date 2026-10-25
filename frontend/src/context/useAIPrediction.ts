import { useContext } from 'react'
import {
  AIStreamContext,
  type AIStreamContextValue,
} from './AIStreamContextDef.ts'

/**
 * Access live AI Anomaly Detection state, predictions, and evaluation metrics.
 * Must be used within an AIStreamProvider.
 */
export function useAIPrediction(): AIStreamContextValue {
  const context = useContext(AIStreamContext)
  if (!context) {
    throw new Error('useAIPrediction must be used within an AIStreamProvider')
  }
  return context
}
