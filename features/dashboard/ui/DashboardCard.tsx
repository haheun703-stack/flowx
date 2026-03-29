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
    <div className={`bg-white border border-[var(--border)] rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
        {updatedAt && (
          <span className="text-[10px] text-[var(--text-muted)]">{updatedAt}</span>
        )}
      </div>
      {children}
    </div>
  )
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white border border-[var(--border)] rounded-xl p-4 animate-pulse shadow-sm ${className}`}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )
}
