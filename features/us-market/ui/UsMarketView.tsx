'use client'

import { useUsMarket } from '../api/useUsMarket'
import { UsIndexCards } from './UsIndexCards'
import { UsRatePanel } from './UsRatePanel'
import { UsSectorPanel } from './UsSectorPanel'
import type { UsMarketDaily } from '../types'

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-100 ${className ?? ''}`} />
}

function PageSkeleton() {
  return (
    <div className="space-y-[14px]">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

function UsMarketHeader({ data }: { data: UsMarketDaily }) {
  const sp = data.sp500_change
  const nq = data.nasdaq_change
  const overall = sp != null && nq != null ? (sp + nq) / 2 : null

  const statusColor =
    overall == null ? '#9CA3AF' :
    overall >= 1 ? '#dc2626' :
    overall <= -1 ? '#2563eb' :
    '#9CA3AF'

  const statusLabel =
    overall == null ? '—' :
    overall >= 1 ? '강세' :
    overall <= -1 ? '약세' :
    '혼조'

  return (
    <div className="bg-white rounded-xl border-2 border-[#00FF88] px-5 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[16px] font-bold text-[var(--text-primary)] font-mono tracking-wide">
              US MARKET
            </h2>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded font-bold"
              style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}30` }}
            >
              {statusLabel}
            </span>
          </div>
          <div className="text-[11px] text-[var(--text-dim)] font-mono mt-0.5">
            {data.date} 기준 | 미국장 마감 데이터
          </div>
        </div>
      </div>

      <div className="flex items-center gap-5 text-right">
        {[
          { label: 'S&P', val: data.sp500_change },
          { label: 'NQ', val: data.nasdaq_change },
          { label: 'VIX', val: data.vix, raw: true },
        ].map(({ label, val, raw }) => (
          <div key={label}>
            <div className="text-[10px] text-[var(--text-dim)] font-mono">{label}</div>
            <div
              className="text-[14px] font-mono font-semibold"
              style={{
                color: raw
                  ? val != null && val >= 25 ? '#f59e0b' : '#9CA3AF'
                  : val == null ? '#9CA3AF'
                  : val >= 0 ? '#dc2626' : '#2563eb',
              }}
            >
              {val == null
                ? '—'
                : raw
                ? val.toFixed(1)
                : `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UsMarketView() {
  const { data, isLoading, error } = useUsMarket()

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <PageSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
        <div className="text-[#dc2626] text-sm font-mono">{error?.message ?? '알 수 없는 오류'}</div>
        <div className="text-[var(--text-dim)] text-xs font-mono mt-1">
          정보봇이 데이터를 아직 수집하지 않았거나, API 연결을 확인하세요.
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-[14px]">
      <UsMarketHeader data={data} />
      <UsIndexCards data={data} />
      <UsRatePanel data={data} />
      <UsSectorPanel data={data} />
    </div>
  )
}
