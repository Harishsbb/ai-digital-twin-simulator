import React from 'react'
import { Link } from 'react-router-dom'
import { AlertOctagon, ArrowLeft } from 'lucide-react'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 mb-4 shadow-2xs">
        <AlertOctagon className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-bold font-mono text-stone-900 uppercase">404: Node Not Found</h2>
      <p className="text-sm text-stone-500 mt-2 max-w-md">
        The requested routing node does not exist within the digital twin telemetry network.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs uppercase tracking-wider transition-colors shadow-2xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Overview
      </Link>
    </div>
  )
}
