import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { PlaceholderView } from '../components/PlaceholderView'

export const AlertsPage: React.FC = () => {
  return (
    <PlaceholderView
      title="Alerts & Threshold Management"
      phase="Phase 2"
      icon={AlertTriangle}
      description="Industrial safety limits, ISO 10816 vibration severity standards, and operator incident dispatch."
      plannedFeatures={[
        'Configurable ISO 10816-3 vibration severity zones (Class A: Good to Class D: Danger)',
        'Multi-stage alert escalation (Advisory -> Warning -> Critical Shutdown Request)',
        'Event log with acknowledgment, operator commentary, and resolution timestamps',
        'Audio-visual indicators and browser push notifications for emergency states',
        'Auto-inhibiting alert suppression during planned maintenance and motor cold-starts',
        'Integration with plant SCADA and webhook notification systems',
      ]}
    />
  )
}
