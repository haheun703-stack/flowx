'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useUserProfile } from '@/shared/lib/useUserProfile'
import { PaywallBlur } from '@/shared/ui/PaywallBlur'

interface CountryItem {
  country: string
  category: string
  prev: number
  curr: number
  change: number
  change_pct: number
  direction: string
}

interface NationalityData {
  date: string
  code: string
  name: string
  signal: string
  score: number
  countries: { date_new: string; date_old: string; items: CountryItem[] }
  arch_scores: Record<string, number>
}

function useNationality(code: string) {
  return useQuery<NationalityData>({
    queryKey: ['nationality', code],
    queryFn: () => axios.get(`/api/nationality?code=${code}`).then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

const C = {
  bg: '#0a0c10', bg2: '#0f1218', bg3: '#161b24',
  border: '#1e2736',
  text: '#e2e8f0', muted: '#5a6a82',
  green: '#00e59b', red: '#ff4d6d',
  blue: '#38bdf8', amber: '#f5a623', purple: '#a78bfa',
} as const

const MONO = "'Space Mono', monospace"

const signalColor = (s: string) => {
  if (s.includes('BUY')) return C.green
  if (s.includes('SELL')) return C.red
  return C.amber
}

const signalLabel = (s: string) => {
  const map: Record<string, string> = {
    STRONG_BUY: '강력매수', BUY: '매수', WEAK_BUY: '약매수',
    NEUTRAL: '중립',
    WEAK_SELL: '약매도', SELL: '매도', STRONG_SELL: '강력매도',
  }
  return map[s] || s
}

function formatVol(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 100000000) return (v / 100000000).toFixed(1) + '억'
  if (abs >= 10000) return (v / 10000).toFixed(0) + '만'
  return v.toLocaleString()
}

function CardContent({ data }: { data: NationalityData }) {
  const items = data.countries?.items ?? []
  const sorted = [...items]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 10)
  const maxAbs = sorted.length > 0 ? Math.abs(sorted[0].change) : 1
  const archEntries = Object.entries(data.arch_scores || {})
  const sc = signalColor(data.signal)
  const dateLabel = data.countries?.date_new
    ? `${data.countries.date_new.slice(0, 4)}.${data.countries.date_new.slice(4, 6)}.${data.countries.date_new.slice(6)}`
    : data.date

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: C.bg3, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted, letterSpacing: '0.15em' }}>국적별 수급</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{data.name}</span>
          <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{data.code}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 700, background: sc, color: '#000' }}>{signalLabel(data.signal)}</span>
          <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: sc }}>{data.score}</span>
        </div>
      </div>

      {/* 국가별 행 */}
      <div style={{ padding: '8px 16px' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 12, color: C.muted, fontSize: 12 }}>국적별 데이터 없음</div>
        ) : (
          sorted.map((item, i) => {
            const isBuy = item.direction === '매수'
            const color = isBuy ? C.red : C.blue
            const arrow = isBuy ? '\u25B2' : '\u25BC'
            const barW = Math.min(Math.abs(item.change) / maxAbs * 100, 100)

            return (
              <div key={`${item.country}-${item.category}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: 12, width: 80, flexShrink: 0, color: C.text }}>{item.country}</span>
                <span style={{ fontFamily: MONO, fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${C.muted}20`, color: C.muted, flexShrink: 0 }}>{item.category}</span>
                <div style={{ flex: 1, position: 'relative', height: 5, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 3, width: `${barW}%`, background: color }} />
                </div>
                <span style={{ fontFamily: MONO, fontSize: 10, width: 50, textAlign: 'right', color: C.muted }}>{item.change_pct > 0 ? '+' : ''}{item.change_pct.toFixed(1)}%</span>
                <span style={{ fontFamily: MONO, fontSize: 11, width: 60, textAlign: 'right', color }}>{formatVol(item.change)}</span>
                <span style={{ fontSize: 12, width: 16, textAlign: 'center', color }}>{arrow}</span>
              </div>
            )
          })
        )}
      </div>

      {/* 아키타입 요약 바 */}
      {archEntries.length > 0 && (
        <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, background: C.bg3 }}>
          {archEntries.map(([label, val]) => {
            const vc = val > 0 ? C.green : val < 0 ? C.red : C.muted
            return (
              <div key={label} style={{ flex: 1, padding: '10px 14px', borderRight: `1px solid ${C.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{label}</div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: vc }}>{val > 0 ? '+' : ''}{val}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* 날짜 */}
      <div style={{ padding: '6px 16px', borderTop: `1px solid ${C.border}`, textAlign: 'right' }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: C.muted }}>{dateLabel}</span>
      </div>
    </div>
  )
}

export function NationalityFlowCard({ ticker }: { ticker: string }) {
  const { data, isLoading, isError } = useNationality(ticker)
  const { data: profile } = useUserProfile()
  const userTier = profile?.tier ?? 'FREE'

  if (isLoading) {
    return (
      <div style={{ height: 200, background: C.bg3, borderRadius: 6, marginTop: 24, animation: 'pulse 2s infinite' }} />
    )
  }

  if (isError || !data) return null

  return (
    <div style={{ marginTop: 24 }}>
      <PaywallBlur requiredTier="PRO" userTier={userTier}>
        <CardContent data={data} />
      </PaywallBlur>
    </div>
  )
}
