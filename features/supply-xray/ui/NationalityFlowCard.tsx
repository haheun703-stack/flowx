'use client'

import { useQuery } from '@tanstack/react-query'
import { fetchJson } from '@/shared/lib/fetchJson'
import { useUserProfile } from '@/shared/lib/useUserProfile'
import { PaywallBlur } from '@/shared/ui/PaywallBlur'
import { GRADE_STRONG_PICK, GRADE_PICK, GRADE_LEGACY_BUY } from '@/shared/constants/grades'

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
    queryFn: () => fetchJson(`/api/nationality?code=${code}`),
    staleTime: 1000 * 60 * 5,
  })
}

const C = {
  bg: '#f8f9fb', bg2: '#ffffff', bg3: '#f3f4f6',
  border: '#e2e5ea',
  text: '#111827', muted: '#6b7280',
  green: '#16a34a', red: '#dc2626',
  blue: '#2563eb', amber: '#d97706',
} as const

const MONO = "'Space Mono', monospace"
const BUY = '#dc2626'
const SELL = '#2563eb'
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
  const isBuyDir = item.direction === GRADE_LEGACY_BUY || item.direction === '유입'
  if (item.prev === 0 && isBuyDir) return '(NEW) 신규'
  const pct = Math.abs(item.change_pct)
  const sign = item.change_pct > 0 ? '+' : '-'
  const pctStr = pct >= 10 ? pct.toFixed(0) : pct.toFixed(1)
  if (isBuyDir && pct >= 500) return `(${sign}${pctStr}%) 급증`
  if (isBuyDir) return `(${sign}${pctStr}%) 매집`
  return `(${sign}${pctStr}%) 이탈`
}

const catAbbr = (c: string) => c === '헤지펀드' ? '헤지' : c

const signalColor = (s: string) => {
  if (s.includes('BUY') || s.includes('PICK')) return C.green
  if (s.includes('SELL') || s.includes('CAUTION')) return C.red
  return C.amber
}

const signalLabel = (s: string) => {
  const map: Record<string, string> = {
    STRONG_BUY: GRADE_STRONG_PICK, STRONG_PICK: GRADE_STRONG_PICK,
    BUY: GRADE_PICK, PICK: GRADE_PICK,
    WEAK_BUY: `약 ${GRADE_PICK}`, WEAK_PICK: `약 ${GRADE_PICK}`,
    NEUTRAL: '중립',
    WEAK_SELL: '약 경계', WEAK_CAUTION: '약 경계',
    SELL: '경계', CAUTION: '경계',
    STRONG_SELL: '강력 경계', STRONG_CAUTION: '강력 경계',
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
          const isBuy = item.direction === GRADE_LEGACY_BUY || item.direction === '유입'
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
              <div style={{ width: 200, flexShrink: 0 }}>
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
              <span style={{ fontSize: 11, color: C.muted }}>= 유입</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <PersonIcon color={SELL} size={12} />
              <span style={{ fontSize: 11, color: C.muted }}>= 유출</span>
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
