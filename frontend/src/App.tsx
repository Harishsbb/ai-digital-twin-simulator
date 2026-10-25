import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { SensorStreamProvider } from './context/SensorStreamContext'
import { AIStreamProvider } from './context/AIStreamContext'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SensorStreamProvider>
        <AIStreamProvider>
          <AppRoutes />
        </AIStreamProvider>
      </SensorStreamProvider>
    </BrowserRouter>
  )
}

export default App

