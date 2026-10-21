import { useContext } from 'react'
import { SensorStreamContext, type SensorStreamContextValue } from './SensorStreamContextDef'

export function useSensorStream(): SensorStreamContextValue {
  const context = useContext(SensorStreamContext)
  if (!context) {
    throw new Error('useSensorStream must be used within a SensorStreamProvider')
  }
  return context
}
