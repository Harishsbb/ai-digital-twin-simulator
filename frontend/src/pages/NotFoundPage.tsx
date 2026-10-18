import React from 'react'
import { Link } from 'react-router-dom'
import { AlertOctagon, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444] mb-5 flex items-center justify-center shadow-xs">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-[#10213D]">404: Page Not Found</h1>
      <p className="text-sm text-[#64748B] mt-2 max-w-md">
        The requested routing node does not exist within the digital twin telemetry network.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-[#0F54D6] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Link>
    </div>
  )
}
