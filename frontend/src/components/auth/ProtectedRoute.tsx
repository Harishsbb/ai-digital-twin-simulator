import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/useAuth'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F7FC] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#CCFBF1] shadow-md flex items-center justify-center mb-4">
          <div className="w-6 h-6 border-2 border-[#0D9488] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-sm font-semibold text-[#10213D] tracking-tight">
          Verifying session...
        </div>
        <div className="text-xs text-[#64748B] mt-1">
          Loading AI Digital Twin Simulator
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Preserve intended destination path in router state
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
