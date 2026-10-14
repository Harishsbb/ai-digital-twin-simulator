import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'

const CURRENT_YEAR = new Date().getFullYear()

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col industrial-grid">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container offset for desktop sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-500 font-mono">
          AI Digital Twin Simulator &copy; {CURRENT_YEAR} — Step 1: Project Setup & Baseline Infrastructure
        </footer>
      </div>
    </div>
  )
}
