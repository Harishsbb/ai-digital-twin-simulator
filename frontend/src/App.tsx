import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { SensorStreamProvider } from './context/SensorStreamContext'
import { AIStreamProvider } from './context/AIStreamContext'
import { AlertProvider } from './context/AlertContext'
import { AlertToastNotification } from './components/alerts'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SensorStreamProvider>
        <AIStreamProvider>
          <AlertProvider>
            <AppRoutes />
            <AlertToastNotification />
          </AlertProvider>
        </AIStreamProvider>
      </SensorStreamProvider>
    </BrowserRouter>
  )
}

export default App

