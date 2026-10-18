import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'

const CURRENT_YEAR = new Date().getFullYear()

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false)

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#10213D] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Container offset for desktop sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0 bg-[#F4F7FC]">
        <Header onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1580px] w-full mx-auto space-y-6">
          <Outlet />
        </main>

        <footer className="py-4 px-8 border-t border-[#DFE7F3] bg-white text-xs text-[#64748B] flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1769FF]" />
            <span>AI Digital Twin Simulator &copy; {CURRENT_YEAR}</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#64748B]">
            <span>Smarter Machines, Safer Operations</span>
            <span className="text-[#1769FF] font-medium">System Nominal</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
