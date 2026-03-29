'use client'

import { useMemo, useState } from 'react'
import { useSectorLeaders, LeaderRow } from '../api/useSectorLeaders'
import { CONTAINER, PAGE } from '@/shared/lib/card-styles'

const FONT = 'var(--font-jetbrains), monospace'

const REL_COLORS: Record<string, string> = {
  '공급':   'bg-blue-50 text-blue-700 border-blue-200',
  '경쟁':   'bg-red-50 text-red-700 border-red-200',
  '자회사': 'bg-purple-50 text-purple-700 border-purple-200',
  '협력':   'bg-green-50 text-green-700 border-green-200',
  '고객':   'bg-amber-50 text-amber-700 border-amber-200',
}

const DEP_COLORS: Record<string, string> = {
  '높음': 'text-red-600 font-bold',
  '중간': 'text-amber-600 font-bold',
  '낮음': 'text-green-600',
  '불명': 'text-gray-400',
}

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded border ${className}`}>
      {text}
    </span>
  )
}

function changeColor(v: number) {
  return v > 0 ? 'text-[var(--up)]' : v < 0 ? 'text-[var(--down)]' : 'text-gray-400'
}

interface SectorGroup {
  sector: string
  leaders: {
    ticker: string
    name: string
    exchange: string
    theme: string
    price: number
    changePct: number
    connections: LeaderRow[]
  }[]
}

function groupBySector(rows: LeaderRow[]): SectorGroup[] {
  const sectorMap = new Map<string, Map<string, LeaderRow[]>>()

  for (const r of rows) {
    if (!sectorMap.has(r.sector)) sectorMap.set(r.sector, new Map())
    const leaderMap = sectorMap.get(r.sector)!
    if (!leaderMap.has(r.leader_ticker)) leaderMap.set(r.leader_ticker, [])
    leaderMap.get(r.leader_ticker)!.push(r)
  }

  return Array.from(sectorMap.entries()).map(([sector, leaderMap]) => ({
    sector,
    leaders: Array.from(leaderMap.entries()).map(([ticker, conns]) => ({
      ticker,
      name: conns[0].leader_name,
      exchange: conns[0].leader_exchange,
      theme: conns[0].leader_theme,
      price: conns[0].leader_price,
      changePct: conns[0].leader_change_pct,
      connections: conns,
    })),
  }))
}

function LeaderCard({ leader }: { leader: SectorGroup['leaders'][number] }) {
  const sign = leader.changePct >= 0 ? '+' : ''
  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      {/* Leader header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black text-[var(--text-primary)]">{leader.name}</span>
          <span className="text-xs text-[var(--text-muted)]">{leader.ticker}</span>
          <span className="text-[10px] text-[var(--text-muted)] border border-[var(--border)] px-1 rounded">
            {leader.exchange}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {leader.theme && (
            <span className="text-[10px] text-[var(--yellow)] font-bold">{leader.theme}</span>
          )}
          <span className="text-xs text-[var(--text-dim)]">
            ${leader.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className={`text-xs font-bold ${changeColor(leader.changePct)}`}>
            {sign}{leader.changePct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Connections table */}
      <div className="divide-y divide-[var(--border)]/50">
        {leader.connections.map((c) => (
          <div key={c.kr_ticker} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 min-w-[140px]">
              <span className="text-xs font-bold text-[var(--text-primary)]">{c.kr_name}</span>
              <span className="text-[10px] text-[var(--text-muted)]">{c.kr_ticker}</span>
            </div>

            <Badge
              text={c.relation}
              className={REL_COLORS[c.relation] ?? 'bg-gray-50 text-gray-600 border-gray-200'}
            />

            <span className={`text-[10px] min-w-[28px] ${DEP_COLORS[c.revenue_dependency] ?? 'text-gray-400'}`}>
              {c.revenue_dependency}
            </span>

            <span className="text-[11px] text-[var(--text-dim)] flex-1 truncate">{c.detail}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SectorLeadersView() {
  const { data: rows, isLoading } = useSectorLeaders()
  const [filter, setFilter] = useState<string | null>(null)

  const groups = useMemo(() => (rows ? groupBySector(rows) : []), [rows])
  const sectors = useMemo(() => groups.map((g) => g.sector), [groups])
  const filtered = filter ? groups.filter((g) => g.sector === filter) : groups

  const totalLeaders = useMemo(() => new Set(rows?.map((r) => r.leader_ticker)).size, [rows])
  const totalKr = useMemo(() => new Set(rows?.map((r) => r.kr_ticker)).size, [rows])

  return (
    <div className={PAGE} style={{ fontFamily: FONT }}>
      <div className={CONTAINER}>
        {/* Header */}
        <div className="flex items-center justify-between py-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--blue)]" />
            <span className="text-xl font-black tracking-widest uppercase text-[var(--text-primary)]">
              글로벌 대장주
            </span>
            <span className="text-sm text-[var(--text-dim)]">
              {totalLeaders}개 글로벌 리더 → {totalKr}개 한국 종목 · {rows?.length ?? 0}개 연결
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="py-2 text-xs text-[var(--text-muted)] border-b border-[var(--border)]/50">
          NVIDIA → 삼성전자·SK하이닉스 등 글로벌 대장주가 움직이면 한국 연결 종목도 동반 움직임 · 매출 의존도 = 높음/중간/낮음
        </div>

        {/* Sector filter */}
        <div className="flex items-center gap-1.5 py-3 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
              !filter
                ? 'bg-blue-50 text-[var(--blue)] border border-blue-200'
                : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] border border-transparent'
            }`}
          >
            전체
          </button>
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                filter === s
                  ? 'bg-blue-50 text-[var(--blue)] border border-blue-200'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-4 animate-pulse">
                <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 rounded" />
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {filtered.map((group) => (
              <div key={group.sector}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1.5 h-4 rounded bg-[var(--blue)]" />
                  <h2 className="text-base font-black text-[var(--text-primary)]">{group.sector}</h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    {group.leaders.length}개 대장주 · {group.leaders.reduce((s, l) => s + l.connections.length, 0)}개 연결
                  </span>
                </div>
                <div className="space-y-3">
                  {group.leaders.map((leader) => (
                    <LeaderCard key={leader.ticker} leader={leader} />
                  ))}
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-[var(--text-muted)]">
                데이터가 없습니다
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
