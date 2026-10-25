import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { RegisterPage } from '../pages/RegisterPage'
import { OverviewPage } from '../pages/OverviewPage'
import { DigitalTwinPage } from '../pages/DigitalTwinPage'
import { SensorsPage } from '../pages/SensorsPage'
import { AnomalyDetectionPage } from '../pages/AnomalyDetectionPage'
import { AlertsPage } from '../pages/AlertsPage'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { WhatIfSimulationPage } from '../pages/WhatIfSimulationPage'
import { SettingsPage } from '../pages/SettingsPage'
import { UserManualPage } from '../pages/UserManualPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<OverviewPage />} />
          <Route path="/digital-twin" element={<DigitalTwinPage />} />
          <Route path="/digital%20twin" element={<DigitalTwinPage />} />
          <Route path="/digital twin" element={<DigitalTwinPage />} />
          <Route path="/twin" element={<Navigate to="/digital-twin" replace />} />
          <Route path="/sensors" element={<SensorsPage />} />
          <Route path="/anomaly-detection" element={<AnomalyDetectionPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/what-if" element={<WhatIfSimulationPage />} />
          <Route path="/whatif" element={<Navigate to="/what-if" replace />} />
          <Route path="/user-manual" element={<UserManualPage />} />
          <Route path="/manual" element={<Navigate to="/user-manual" replace />} />
          <Route path="/guide" element={<Navigate to="/user-manual" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default AppRoutes
