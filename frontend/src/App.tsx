import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes'
import { SensorStreamProvider } from './context/SensorStreamContext'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SensorStreamProvider>
        <AppRoutes />
      </SensorStreamProvider>
    </BrowserRouter>
  )
}

export default App

