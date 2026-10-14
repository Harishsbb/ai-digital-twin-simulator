import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'

const CURRENT_YEAR = new Date().getFullYear()

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col drafting-grid">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container offset for desktop sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-3 px-6 border-t border-slate-800/80 bg-[#07090e]/80 text-xs text-slate-400 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>AI DIGITAL TWIN // INDUSTRIAL MOTOR TELEMETRY PLATFORM</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>VERSION 0.1.0-DEV</span>
            <span>&copy; {CURRENT_YEAR}</span>
            <span className="text-cyan-400 font-semibold">STAGE 1 // PROJECT SETUP</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
