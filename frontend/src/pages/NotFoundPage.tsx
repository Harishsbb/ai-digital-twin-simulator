import React from 'react'
import { Link } from 'react-router-dom'
import { AlertOctagon, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-400 mb-5 flex items-center justify-center shadow-lg">
        <AlertOctagon className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-bold text-white">404: Page Not Found</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-md">
        The requested routing node does not exist within the digital twin telemetry network.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold uppercase tracking-wider transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Link>
    </div>
  )
}
