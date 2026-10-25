import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { AuthProvider } from './context/AuthContext'
import { SensorStreamProvider } from './context/SensorStreamContext'
import { AIStreamProvider } from './context/AIStreamContext'
import { AlertProvider } from './context/AlertContext'
import { AlertToastNotification } from './components/alerts'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SensorStreamProvider>
          <AIStreamProvider>
            <AlertProvider>
              <AppRoutes />
              <AlertToastNotification />
            </AlertProvider>
          </AIStreamProvider>
        </SensorStreamProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

