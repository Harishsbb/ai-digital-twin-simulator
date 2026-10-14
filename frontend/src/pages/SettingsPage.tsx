import React from 'react'
import { Settings } from 'lucide-react'
import { PlaceholderView } from '../components/PlaceholderView'

export const SettingsPage: React.FC = () => {
  return (
    <PlaceholderView
      title="Simulator Configuration & Control"
      phase="Phase 1 - Baseline"
      icon={Settings}
      description="Settings for telemetry simulation speed, physics noise variance, backend endpoint bindings, and display preferences."
      plannedFeatures={[
        'Simulation engine speed multipliers (Real-time 1x, Fast-forward 5x, 10x)',
        'Synthetic noise parameters (Gaussian vibration noise, ambient thermal drift)',
        'Failure scenario injection triggers (Induce Bearing Fault, Stator Phase Loss, Rotor Imbalance)',
        'Backend API endpoint configuration and WebSocket connection keep-alive timeout',
        'Dark/Light UI theme selection and high-contrast industrial control mode',
        'Sensor channel calibration offsets and custom telemetry unit toggles (Metric vs Imperial)',
      ]}
    />
  )
}
