'use client'

import { ReactNode } from 'react'

interface DashboardCardProps {
  title: string
  icon: string
  updatedAt?: string
  className?: string
  children: ReactNode
}

export function DashboardCard({ title, icon, updatedAt, className = '', children }: DashboardCardProps) {
  return (
    <div className={`bg-[#0f1117] border border-gray-800 rounded-xl p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        {updatedAt && (
          <span className="text-[10px] text-gray-600">{updatedAt}</span>
        )}
      </div>
      {children}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-[#0f1117] border border-gray-800 rounded-xl p-4 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-2/3" />
        <div className="h-3 bg-gray-800 rounded w-1/2" />
      </div>
    </div>
  )
}
