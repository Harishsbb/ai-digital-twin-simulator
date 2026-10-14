import React from 'react'
import { Activity } from 'lucide-react'
import { PlaceholderView } from '../components/PlaceholderView'

export const SensorsPage: React.FC = () => {
  return (
    <PlaceholderView
      title="Sensor Monitoring & Telemetry Stream"
      phase="Phase 2"
      icon={Activity}
      description="Real-time multi-channel sensor ingestion, high-frequency charts, and industrial telemetry metrics."
      plannedFeatures={[
        'Live multi-axis vibration waveforms (DE / NDE Bearings: X, Y, Z)',
        'Stator winding temperature profiles (Phases U, V, W thermocouples)',
        'Three-phase voltage and current draw tracking with power factor calculation',
        'Shaft angular velocity (RPM) and torque load estimations',
        'Interactive time-series charts with zoom, pan, and live window pause',
        'FastAPI WebSocket high-throughput data stream integration',
      ]}
    />
  )
}
