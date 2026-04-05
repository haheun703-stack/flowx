'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useShortSignals, type ShortSignalItem } from '@/features/dashboard/api/useDashboard'
import { useQuery } from '@tanstack/react-query'
import { getRefetchInterval } from '@/shared/lib/marketUtils'

// ── 상수 ──
const GRADE_COLOR: Record<string, string> = {
  AA: 'text-black bg-[#16a34a] border-[#16a34a]',
  A: 'text-black bg-[#15803d] border-[#15803d]',
  B: 'text-white bg-[#2563eb] border-[#2563eb]',
  C: 'text-white bg-[#9ca3af] border-[#9ca3af]',
}

const SIGNAL_LABEL: Record<string, string> = {
  FORCE_BUY: '적극매수',
  BUY: '매수',
  WATCH: '관심',
}

const SIGNAL_COLOR: Record<string, string> = {
  FORCE_BUY: 'text-[#dc2626]',
  BUY: 'text-[#16a34a]',
  WATCH: 'text-[#f59e0b]',
}

const STEP_KEYS = ['multi', 'individual', 'tech', 'flow', 'safety'] as const
const STEP_LABELS: Record<string, string> = {
  multi: '다중소스', individual: '개별분석', tech: '기술적', flow: '수급', safety: '안전성',
}
const STEP_WEIGHTS = [0.85, 0.92, 0.95, 0.80, 1.0]

// ── 타입 ──
interface WhaleDetectItem {
  ticker: string
  name: string
  grade: string
  volume_surge_ratio: number
  price_change: number
  strength: string
}

interface SectorItem {
  sector: string
  status: string
  change: string
}

interface CommodityItem {
  name: string
  change: string
}

interface SourceItem {
  name: string
  total: number
  hit: number
  rate: number
}

interface AlertItem {
  ticker: string
  type: string
  reason: string
  severity: string
}

// ── 공통 컴포넌트 ──
function Skeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[40px] mx-2 my-px bg-[var(--bg-row)] animate-pulse rounded" />
      ))}
    </>
  )
}

function Panel({ title, badge, dot, sample, children }: {
  title: string; badge?: string; dot?: string; sample?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col bg-white border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          {dot && <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />}
          <span className="text-sm font-bold text-[var(--text-primary)] tracking-wider uppercase">{title}</span>
          {sample && <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-amber-50 text-[var(--yellow)] border border-[var(--yellow)]/30 font-bold ml-1">샘플</span>}
        </div>
        {badge && <span className="text-sm text-[var(--text-dim)] font-bold">{badge}</span>}
      </div>
      {children}
    </div>
  )
}

function EmptyState({ msg = '데이터 없음' }: { msg?: string }) {
  return <div className="flex items-center justify-center h-32 text-[var(--text-muted)] text-sm">{msg}</div>
}

// ── 데이터 훅 ──
function useWhaleDetect() {
  return useQuery<{ detected: WhaleDetectItem[] } | null>({
    queryKey: ['whale-detect'],
    queryFn: async () => {
      const res = await fetch('/data/whale_detect.json')
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: getRefetchInterval(5 * 60 * 1000, 30 * 60 * 1000),
  })
}

interface VipContentData {
  panel_6_relay?: { hot_sectors?: SectorItem[]; commodities?: CommodityItem[] }
  panel_7_patterns?: { sources?: SourceItem[]; overall_rate?: number }
  panel_8_alerts?: { items?: AlertItem[] }
}

function useVipContent() {
  return useQuery<VipContentData | null>({
    queryKey: ['vip-content'],
    queryFn: async () => {
      const res = await fetch('/api/vip-content')
      if (!res.ok) return null
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: getRefetchInterval(5 * 60 * 1000, 30 * 60 * 1000),
    retry: 1,
  })
}

// ══════════════════════════════════════
// Panel 1: 주목종목 + 소스 태그
// ══════════════════════════════════════
function Panel1_Recommendations({ stocks, isLoading }: { stocks: ShortSignalItem[]; isLoading: boolean }) {
  const COLS = '72px 1fr 76px 72px 72px 52px 48px 48px'

  return (
    <Panel title="주목종목 + 소스 태그" dot="bg-[#a855f7]" badge={`${stocks.length}종목`}>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[13px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: COLS }}>
        <span className="text-center">신호</span>
        <span>종목</span>
        <span className="text-right">진입가</span>
        <span className="text-right">목표가</span>
        <span className="text-right">손절가</span>
        <span className="text-right">배수</span>
        <span className="text-right">점수</span>
        <span className="text-center">보유</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
        {isLoading ? <Skeleton rows={8} /> : stocks.length === 0 ? <EmptyState /> :
          stocks.map((s, i) => (
            <Link key={s.code} href={`/chart/${s.code}`}
              className={`grid items-center px-2 py-1.5 border-b border-[var(--border)]/30 hover:bg-[var(--bg-row)] cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
              style={{ gridTemplateColumns: COLS }}>
              <span className={`text-[13px] px-1.5 py-0.5 rounded-sm border text-center whitespace-nowrap font-bold ${GRADE_COLOR[s.grade] ?? 'text-[var(--text-dim)] border-[#334155]'}`}>
                {SIGNAL_LABEL[s.signal_type] ?? s.grade}
              </span>
              <div className="min-w-0 pl-1">
                <div className="text-sm text-[var(--text-primary)] font-medium truncate">{s.name}</div>
                <div className="text-[12px] text-[var(--text-muted)]">{s.code}</div>
              </div>
              <span className="text-right text-sm text-[var(--text-primary)] tabular-nums">{s.entry_price?.toLocaleString() ?? '-'}</span>
              <span className="text-right text-sm text-[#16a34a] tabular-nums font-bold">{s.target_price?.toLocaleString() ?? '-'}</span>
              <span className="text-right text-sm text-[#dc2626] tabular-nums">{s.stop_loss?.toLocaleString() ?? '-'}</span>
              <span className="text-right text-sm text-[#f59e0b] font-bold tabular-nums">x{(s.volume_ratio ?? 0).toFixed(1)}</span>
              <span className={`text-right text-sm font-bold tabular-nums ${
                s.total_score >= 80 ? 'text-[#16a34a]' : s.total_score >= 60 ? 'text-[#f59e0b]' : 'text-[var(--text-dim)]'
              }`}>{s.total_score}</span>
              <span className="text-center text-sm text-[var(--text-dim)] tabular-nums">{s.holding_days}일</span>
            </Link>
          ))
        }
      </div>
      {(() => {
        const aa = stocks.filter(s => s.grade === 'AA').length
        const a = stocks.filter(s => s.grade === 'A').length
        const b = stocks.filter(s => s.grade === 'B').length
        return (
          <div className="flex gap-3 px-3 py-1.5 border-t border-[var(--border)] text-[13px] font-bold text-[var(--text-dim)]">
            <span>AA <span className="text-[#16a34a]">{aa}</span></span>
            <span>A <span className="text-[#15803d]">{a}</span></span>
            <span>B <span className="text-[#2563eb]">{b}</span></span>
            <span className="ml-auto">총 <span className="text-[var(--text-primary)]">{stocks.length}</span></span>
          </div>
        )
      })()}
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 2: ALL 수급
// ══════════════════════════════════════
function Panel2_AllSupply({ stocks, isLoading }: { stocks: ShortSignalItem[]; isLoading: boolean }) {
  const filtered = useMemo(() => stocks.filter(s => s.foreign_detail && Object.keys(s.foreign_detail).length > 0), [stocks])

  return (
    <Panel title="ALL 수급" dot="bg-[#2563eb]" badge={`${filtered.length}종목`}>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[13px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: '1fr 72px 72px 72px' }}>
        <span>종목</span>
        <span className="text-right">외국인</span>
        <span className="text-right">기관</span>
        <span className="text-right">개인</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {isLoading ? <Skeleton /> : filtered.length === 0 ? (
          <EmptyState msg="nationality_detail 데이터 준비중" />
        ) : filtered.map((s, i) => {
          const fd = s.foreign_detail ?? {}
          const foreign = Object.values(fd).reduce((a: number, b: number) => a + (b ?? 0), 0)
          return (
            <div key={s.code}
              className={`grid items-center px-2 py-1.5 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
              style={{ gridTemplateColumns: '1fr 72px 72px 72px' }}>
              <div className="text-sm text-[var(--text-primary)] truncate">{s.name}</div>
              <span className={`text-right text-sm font-bold tabular-nums ${foreign > 0 ? 'text-[#dc2626]' : foreign < 0 ? 'text-[#2563eb]' : 'text-[var(--text-dim)]'}`}>
                {foreign > 0 ? '+' : ''}{foreign.toLocaleString()}
              </span>
              <span className="text-right text-sm text-[var(--text-dim)] tabular-nums">-</span>
              <span className="text-right text-sm text-[var(--text-dim)] tabular-nums">-</span>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 3: 분석 근거 (5단계 분석)
// ══════════════════════════════════════
function Panel3_Analysis({ stocks, isLoading }: { stocks: ShortSignalItem[]; isLoading: boolean }) {
  const top5 = stocks.slice(0, 5)

  return (
    <Panel title="분석 근거" dot="bg-[#16a34a]" badge="5단계 분석">
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
        {isLoading ? <Skeleton /> : top5.length === 0 ? <EmptyState /> :
          top5.map((s, i) => (
            <div key={s.code} className={`px-3 py-2 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[12px] px-1.5 py-0.5 rounded-sm border font-bold ${GRADE_COLOR[s.grade] ?? ''}`}>{s.grade}</span>
                <span className="text-sm text-[var(--text-primary)] font-bold">{s.name}</span>
                <span className="text-[12px] text-[var(--text-muted)]">{s.code}</span>
                <span className={`ml-auto text-[12px] font-bold ${SIGNAL_COLOR[s.signal_type] ?? ''}`}>{SIGNAL_LABEL[s.signal_type]}</span>
              </div>
              <div className="flex gap-1">
                {STEP_KEYS.map((key, idx) => {
                  const score = Math.round(s.total_score * STEP_WEIGHTS[idx])
                  const pct = Math.min(100, Math.max(20, score))
                  return (
                    <div key={key} className="flex-1">
                      <div className="text-[11px] text-[var(--text-muted)] text-center mb-0.5">{STEP_LABELS[key]}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${pct}%`,
                          backgroundColor: pct >= 80 ? '#16a34a' : pct >= 60 ? '#f59e0b' : '#dc2626'
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              {s.total_score < 65 && (
                <div className="mt-1 text-[11px] text-[#dc2626]">
                  !! 위험요소: 점수 {s.total_score} (기준 65 미달)
                </div>
              )}
            </div>
          ))
        }
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 4: 국적별 수급
// ══════════════════════════════════════
function Panel4_NationalSupply({ stocks, isLoading }: { stocks: ShortSignalItem[]; isLoading: boolean }) {
  const filtered = useMemo(() => stocks.filter(s => s.foreign_detail && Object.keys(s.foreign_detail).length > 0).slice(0, 8), [stocks])
  const countries = ['미국', '영국', '싱가포르', '기타']

  return (
    <Panel title="국적별 수급" dot="bg-[#f59e0b]" badge="국가별 상세">
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[13px] text-[var(--text-dim)] font-bold"
        style={{ gridTemplateColumns: `1fr ${countries.map(() => '56px').join(' ')}` }}>
        <span>종목</span>
        {countries.map(c => <span key={c} className="text-right">{c}</span>)}
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 320 }}>
        {isLoading ? <Skeleton /> : filtered.length === 0 ? (
          <EmptyState msg="국적별 상세 데이터 준비중" />
        ) : filtered.map((s, i) => {
          const fd = s.foreign_detail ?? {}
          return (
            <div key={s.code}
              className={`grid items-center px-2 py-1.5 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
              style={{ gridTemplateColumns: `1fr ${countries.map(() => '56px').join(' ')}` }}>
              <span className="text-sm text-[var(--text-primary)] truncate">{s.name}</span>
              {countries.map(c => {
                const val = fd[c] ?? 0
                return (
                  <span key={c} className={`text-right text-[13px] tabular-nums font-bold ${
                    val > 0 ? 'text-[#dc2626]' : val < 0 ? 'text-[#2563eb]' : 'text-[var(--text-muted)]'
                  }`}>
                    {val === 0 ? '-' : val > 0 ? `+${val}` : val}
                  </span>
                )
              })}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 5: 매집 감지 레이더
// ══════════════════════════════════════
const WHALE_STATUS_COLOR: Record<string, string> = {
  '세력포착': 'text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/30',
  '매집의심': 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  '이상감지': 'text-[#2563eb] bg-[#2563eb]/10 border-[#2563eb]/30',
}

function Panel5_AccumulationRadar() {
  const { data, isLoading } = useWhaleDetect()
  const whales: WhaleDetectItem[] = data?.detected ?? []

  return (
    <Panel title="매집 감지 레이더" dot="bg-[#dc2626]" badge={`${whales.length}건`}>
      <div className="grid px-2 py-1 border-b border-[var(--border)] text-[13px] text-[var(--text-dim)] font-bold uppercase"
        style={{ gridTemplateColumns: '72px 1fr 64px 64px 56px' }}>
        <span className="text-center">상태</span>
        <span>종목</span>
        <span className="text-right">거래량배</span>
        <span className="text-right">등락</span>
        <span className="text-center">강도</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
        {isLoading ? <Skeleton /> : whales.length === 0 ? (
          <EmptyState msg="tv_scanner 데이터 준비중" />
        ) : whales.slice(0, 20).map((w, i) => (
          <div key={w.ticker || i}
            className={`grid items-center px-2 py-1.5 border-b border-[var(--border)]/30 hover:bg-[var(--bg-row)] ${i % 2 === 1 ? 'bg-gray-50' : ''}`}
            style={{ gridTemplateColumns: '72px 1fr 64px 64px 56px' }}>
            <span className={`text-[11px] px-1 py-0.5 rounded-sm border text-center font-bold ${WHALE_STATUS_COLOR[w.grade] ?? 'text-[var(--text-dim)] border-[#334155]'}`}>
              {w.grade ?? 'QUIET'}
            </span>
            <div className="min-w-0 pl-1">
              <span className="text-sm text-[var(--text-primary)] truncate block">{w.name}</span>
            </div>
            <span className="text-right text-sm text-[#f59e0b] font-bold tabular-nums">
              x{(w.volume_surge_ratio ?? 1).toFixed(1)}
            </span>
            <span className={`text-right text-sm font-bold tabular-nums ${
              (w.price_change ?? 0) > 0 ? 'text-[#dc2626]' : (w.price_change ?? 0) < 0 ? 'text-[#2563eb]' : 'text-[var(--text-dim)]'
            }`}>
              {(w.price_change ?? 0) > 0 ? '+' : ''}{((w.price_change ?? 0) * 100).toFixed(1)}%
            </span>
            <span className={`text-center text-sm font-bold ${
              w.strength === 'STRONG' ? 'text-[#dc2626]' :
              w.strength === 'MODERATE' ? 'text-[#f59e0b]' : 'text-[var(--text-dim)]'
            }`}>
              {w.strength === 'STRONG' ? '!!!' : w.strength === 'MODERATE' ? '!!' : '!'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-3 py-1.5 border-t border-[var(--border)] text-[13px] font-bold text-[var(--text-dim)]">
        <span>세력포착 <span className="text-[#dc2626]">{whales.filter(w => w.grade === '세력포착').length}</span></span>
        <span>매집의심 <span className="text-[#f59e0b]">{whales.filter(w => w.grade === '매집의심').length}</span></span>
        <span>이상감지 <span className="text-[#2563eb]">{whales.filter(w => w.grade === '이상감지').length}</span></span>
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 6: 릴레이 체인
// ══════════════════════════════════════
function Panel6_RelayChain() {
  const { data } = useVipContent()
  const relay = data?.panel_6_relay ?? null
  const isSample = !relay?.hot_sectors

  const sectors: SectorItem[] = relay?.hot_sectors ?? [
    { sector: '방산', status: 'HOT', change: '+4.2%' },
    { sector: '반도체', status: 'ROTATION', change: '+1.8%' },
    { sector: '2차전지', status: 'CLUSTER', change: '-0.5%' },
    { sector: '정유', status: 'HOT', change: '+3.1%' },
    { sector: '조선', status: 'ROTATION', change: '+2.4%' },
  ]

  const STATUS_STYLE: Record<string, string> = {
    HOT: 'text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/30',
    ROTATION: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
    CLUSTER: 'text-[#2563eb] bg-[#2563eb]/10 border-[#2563eb]/30',
    COMMODITY: 'text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/30',
  }

  return (
    <Panel title="릴레이 체인" dot="bg-[#f59e0b]" badge="HOT섹터+로테이션" sample={isSample}>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
        {sectors.map((s, i) => (
          <div key={s.sector}
            className={`flex items-center gap-2 px-3 py-2 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
            <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border font-bold ${STATUS_STYLE[s.status] ?? STATUS_STYLE.CLUSTER}`}>
              {s.status}
            </span>
            <span className="text-sm text-[var(--text-primary)] font-bold flex-1">{s.sector}</span>
            <span className={`text-sm font-bold tabular-nums ${
              s.change?.startsWith('+') ? 'text-[#dc2626]' : s.change?.startsWith('-') ? 'text-[#2563eb]' : 'text-[var(--text-dim)]'
            }`}>{s.change ?? '-'}</span>
            {i < sectors.length - 1 && (
              <span className="text-[12px] text-[var(--text-muted)]">&rarr;</span>
            )}
          </div>
        ))}

        <div className="px-3 py-2 border-t border-[var(--border)]">
          <div className="text-[12px] text-[var(--text-muted)] font-bold mb-1">원자재 연동</div>
          <div className="flex gap-3 text-[13px]">
            {(relay?.commodities ?? [
              { name: 'WTI 원유', change: '+0.0%' },
              { name: '금', change: '+0.0%' },
              { name: '구리', change: '+0.0%' },
            ]).map((c: CommodityItem) => (
              <span key={c.name} className="text-[var(--text-primary)]">
                {c.name}{' '}
                <span className={`font-bold ${c.change?.startsWith('+') ? 'text-[#dc2626]' : c.change?.startsWith('-') ? 'text-[#2563eb]' : 'text-[var(--text-dim)]'}`}>
                  {c.change}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 7: 적중률 대시보드
// ══════════════════════════════════════
function Panel7_HitRate() {
  const { data } = useVipContent()
  const patterns = data?.panel_7_patterns ?? null
  const isSample = !patterns?.sources

  const sources: SourceItem[] = patterns?.sources ?? [
    { name: 'MOMENTUM', total: 45, hit: 35, rate: 77.8 },
    { name: 'QUANT', total: 32, hit: 24, rate: 75.0 },
    { name: 'SMART_MONEY', total: 28, hit: 22, rate: 78.6 },
    { name: 'RELAY', total: 15, hit: 11, rate: 73.3 },
    { name: 'BOTTOM', total: 20, hit: 14, rate: 70.0 },
  ]

  const overall = patterns?.overall_rate ?? 78.6

  return (
    <Panel title="적중률 대시보드" dot="bg-[#16a34a]" badge={`전체 ${overall}%`} sample={isSample}>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
        <div className="px-3 py-3">
          <div className="text-center mb-3">
            <div className="text-3xl font-bold tabular-nums" style={{
              color: overall >= 75 ? '#16a34a' : overall >= 60 ? '#f59e0b' : '#dc2626'
            }}>{overall}%</div>
            <div className="text-[12px] text-[var(--text-muted)] font-bold">전체 적중률</div>
          </div>

          <div className="space-y-2">
            {sources.map((src) => (
              <div key={src.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[13px] text-[var(--text-dim)] font-bold">{src.name}</span>
                  <span className="text-[13px] text-[var(--text-primary)] font-bold tabular-nums">
                    {src.hit}/{src.total} ({src.rate}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${src.rate}%`,
                    backgroundColor: src.rate >= 75 ? '#16a34a' : src.rate >= 60 ? '#f59e0b' : '#dc2626',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// Panel 8: 변곡점 알림
// ══════════════════════════════════════
function Panel8_InflectionAlerts() {
  const { data } = useVipContent()
  const alerts = data?.panel_8_alerts ?? null
  const isSample = !alerts?.items

  const items: AlertItem[] = alerts?.items ?? [
    { ticker: '삼성전자', type: 'REDUCE', reason: 'RSI 과열 + 외국인 매도 전환', severity: 'HIGH' },
    { ticker: 'LG에너지', type: 'EXIT', reason: '목표가 도달 + 거래량 감소', severity: 'CRITICAL' },
    { ticker: 'SK하이닉스', type: 'REDUCE', reason: '수급 이탈 + 섹터 모멘텀 약화', severity: 'MEDIUM' },
  ]

  const TYPE_STYLE: Record<string, string> = {
    EXIT: 'text-[#dc2626] bg-[#dc2626]/10 border-[#dc2626]/30',
    REDUCE: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
  }

  const SEV_DOT: Record<string, string> = {
    CRITICAL: 'bg-[#dc2626] animate-pulse',
    HIGH: 'bg-[#f59e0b]',
    MEDIUM: 'bg-[#64748b]',
  }

  return (
    <Panel title="변곡점 알림" dot="bg-[#dc2626]" badge="EXIT/REDUCE" sample={isSample}>
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: 360 }}>
        {items.length === 0 ? <EmptyState msg="guardian 경보 없음" /> :
          items.map((a, i) => (
            <div key={`${a.ticker}-${i}`}
              className={`px-3 py-2.5 border-b border-[var(--border)]/30 ${i % 2 === 1 ? 'bg-gray-50' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${SEV_DOT[a.severity] ?? 'bg-[#64748b]'}`} />
                <span className={`text-[11px] px-1.5 py-0.5 rounded-sm border font-bold ${TYPE_STYLE[a.type] ?? TYPE_STYLE.REDUCE}`}>
                  {a.type}
                </span>
                <span className="text-sm text-[var(--text-primary)] font-bold">{a.ticker}</span>
              </div>
              <div className="text-[13px] text-[var(--text-dim)] ml-4">{a.reason}</div>
            </div>
          ))
        }
      </div>
    </Panel>
  )
}

// ══════════════════════════════════════
// 메인 SwingView
// ══════════════════════════════════════
export function SwingView() {
  const { data, isLoading } = useShortSignals('all')
  const stocks = data ?? []

  return (
    <div className="min-h-screen bg-[var(--bg-base)]" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-wider uppercase">스윙시스템</h1>
          <span className="text-[12px] px-2 py-0.5 rounded-sm border border-[#a855f7] text-white bg-[#a855f7] font-bold">VIP</span>
        </div>
        <span className="text-sm text-[var(--text-dim)] font-bold">50,000/월</span>
      </div>

      <div className="p-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {/* Row 1: 주목종목 (2칸) + ALL수급 + 분석근거 */}
        <div className="lg:col-span-2">
          <Panel1_Recommendations stocks={stocks} isLoading={isLoading} />
        </div>
        <Panel2_AllSupply stocks={stocks} isLoading={isLoading} />
        <Panel3_Analysis stocks={stocks} isLoading={isLoading} />

        {/* Row 2: 국적별수급 + 매집감지 + 릴레이체인 + 적중률 */}
        <Panel4_NationalSupply stocks={stocks} isLoading={isLoading} />
        <Panel5_AccumulationRadar />
        <Panel6_RelayChain />
        <Panel7_HitRate />

        {/* Row 3: 변곡점 알림 (full width) */}
        <div className="lg:col-span-2 xl:col-span-4">
          <Panel8_InflectionAlerts />
        </div>
      </div>
    </div>
  )
}
