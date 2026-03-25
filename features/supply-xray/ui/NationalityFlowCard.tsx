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
  blue: '#38bdf8', amber: '#f5a623',
} as const

const MONO = "'Space Mono', monospace"
const BUY = '#ff4d6d'
const SELL = '#38bdf8'
const MAX_ICONS = 10

function PersonIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 20 27" fill={color} style={{ flexShrink: 0 }}>
      <circle cx="10" cy="6" r="5.5" />
      <path d="M10 13.5c-5.2 0-9 3.2-9 7v3h18v-3c0-3.8-3.8-7-9-7z" />
    </svg>
  )
}

function formatShares(v: number): string {
  const abs = Math.abs(v)
  const sign = v > 0 ? '+' : ''
  if (abs >= 10000) return `${sign}${(v / 10000).toFixed(1)}만주`
  if (abs >= 1000) return `${sign}${(v / 1000).toFixed(1)}천주`
  return `${sign}${v.toLocaleString()}주`
}

function getStatus(item: CountryItem): string {
  if (item.prev === 0 && item.direction === '매수') return '(NEW) 신규'
  const pct = Math.abs(item.change_pct)
  const sign = item.change_pct > 0 ? '+' : '-'
  const pctStr = pct >= 10 ? pct.toFixed(0) : pct.toFixed(1)
  if (item.direction === '매수' && pct >= 500) return `(${sign}${pctStr}%) 급증`
  if (item.direction === '매수') return `(${sign}${pctStr}%) 매집`
  return `(${sign}${pctStr}%) 이탈`
}

const catAbbr = (c: string) => c === '헤지펀드' ? '헤지' : c

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

function CardContent({ data }: { data: NationalityData }) {
  const items = data.countries?.items ?? []
  const sorted = [...items]
    .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
    .slice(0, 12)
  const maxAbs = sorted.length > 0 ? Math.abs(sorted[0].change) : 1
  const sc = signalColor(data.signal)

  const dn = data.countries?.date_new
  const dOld = data.countries?.date_old
  const dateLabel = dn
    ? `${dn.slice(0, 4)}/${dn.slice(4, 6)}/${dn.slice(6)} vs ${dOld?.slice(4, 6)}/${dOld?.slice(6)}`
    : data.date

  // 카테고리별 합산 (하단 요약용)
  const catTotals: Record<string, number> = {}
  for (const it of items) {
    catTotals[it.category] = (catTotals[it.category] || 0) + it.change
  }
  const catEntries = Object.entries(catTotals).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))

  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{data.name}({data.code})</span>
            <span style={{ fontSize: 13, color: C.muted, marginLeft: 8 }}>외국인 국적별 수급</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, padding: '2px 8px', borderRadius: 3, fontWeight: 700, background: sc, color: '#000' }}>{signalLabel(data.signal)}</span>
            <span style={{ fontFamily: MONO, fontSize: 15, fontWeight: 700, color: sc }}>{data.score}</span>
          </div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 4 }}>{dateLabel}</div>
      </div>

      {/* 픽토그램 행 */}
      <div style={{ padding: '4px 20px' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 24, color: C.muted, fontSize: 13, textAlign: 'center' }}>국적별 데이터 없음</div>
        ) : sorted.map((item, i) => {
          const isBuy = item.direction === '매수'
          const color = isBuy ? BUY : SELL
          const iconCount = Math.max(1, Math.round(Math.abs(item.change) / maxAbs * MAX_ICONS))
          const status = getStatus(item)

          return (
            <div key={`${item.country}-${item.category}`} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              {/* 좌: [카테고리] 국가 */}
              <div style={{ width: 150, flexShrink: 0 }}>
                <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>[{catAbbr(item.category)}]</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text, marginLeft: 4 }}>{item.country}</span>
              </div>

              {/* 중앙: 사람 아이콘 */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', minHeight: 26 }}>
                {Array.from({ length: iconCount }).map((_, idx) => (
                  <PersonIcon key={idx} color={color} size={18} />
                ))}
              </div>

              {/* 우: 수량 + 상태 */}
              <div style={{ width: 110, flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color }}>{formatShares(item.change)}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>{status}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 하단 범례 + 카테고리 합산 */}
      {sorted.length > 0 && (
        <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, background: C.bg3 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PersonIcon color={BUY} size={12} />
              <span style={{ fontSize: 11, color: C.muted }}>= 매수</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PersonIcon color={SELL} size={12} />
              <span style={{ fontSize: 11, color: C.muted }}>= 매도</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
            {catEntries.map(([cat, total]) => (
              <span key={cat} style={{ fontFamily: MONO, fontSize: 12, color: total > 0 ? BUY : SELL }}>
                {cat} {formatShares(total)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function NationalityFlowCard({ ticker }: { ticker: string }) {
  const { data, isLoading, isError } = useNationality(ticker)
  const { data: profile } = useUserProfile()
  const userTier = profile?.tier ?? 'FREE'

  if (isLoading) {
    return (
      <div style={{ height: 200, background: C.bg3, borderRadius: 8, marginTop: 24, animation: 'pulse 2s infinite' }} />
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
