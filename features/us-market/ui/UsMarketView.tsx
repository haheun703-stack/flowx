'use client'

import { useEffect, useMemo, useState } from 'react'

// ── 타입 ─────────────────────────────────────────────────────
interface UsMarketData {
  date: string
  sp500_close: number | null
  sp500_change: number | null
  nasdaq_close: number | null
  nasdaq_change: number | null
  dow_close: number | null
  dow_change: number | null
  vix: number | null
  fear_greed: number | null
  fear_greed_label: string | null
  us_3y_yield: number | null
  us_10y_yield: number | null
  spread_3y_10y: number | null
  spread_2y_10y: number | null
  dxy: number | null
  wti: number | null
  gold: number | null
  soxx_close: number | null
  soxx_change: number | null
  sector_etf: Record<string, number>
  kr_impact: string | null
  risk_flags: string[]
  mag7: Record<string, { close: number; change_pct: number; volume_ratio?: number }> | null
  futures: Record<string, { price?: number; change_pct: number }> | null
  crypto: Record<string, { price: number; change_24h_pct: number }> | null
  forex: Record<string, { rate: number; change_pct: number }> | null
  yield_curve: Record<string, number> & { inverted?: boolean } | null
  breadth: {
    sp500_advance?: number; sp500_decline?: number; sp500_unchanged?: number
    sp500_new_52w_high?: number; sp500_new_52w_low?: number
    nasdaq_advance?: number; nasdaq_decline?: number
    put_call_ratio?: number; mcclellan_osc?: number
  } | null
  us_news: Array<{ title: string; source?: string; impact?: string }> | null
}

interface CalEvent {
  id: number
  date: string
  type: string
  title: string
  detail?: string
  impact?: string
  market?: string
  ticker?: string | null
}

interface FlowRow {
  date: string
  etf: string
  net_flow: number
  aum?: number
  flow_pct?: number
}

interface IndexHistoryRow {
  date: string
  sp500_close: number | null
  nasdaq_close: number | null
  dow_close: number | null
}

// ── 상수 ─────────────────────────────────────────────────────
const ETF_LIST = [
  { ticker: 'SPY', name: 'S&P500', category: '지수'},
  { ticker: 'QQQ', name: '나스닥100', category: '지수'},
  { ticker: 'DIA', name: '다우존스', category: '지수'},
  { ticker: 'TQQQ', name: '나스닥3배', category: '레버리지'},
  { ticker: 'SQQQ', name: '나스닥인버스', category: '인버스'},
  { ticker: 'SOXX', name: '반도체', category: '섹터'},
  { ticker: 'XLK', name: '기술', category: '섹터'},
  { ticker: 'XLF', name: '금융', category: '섹터'},
  { ticker: 'XLE', name: '에너지', category: '섹터'},
  { ticker: 'TLT', name: '장기국채', category: '채권'},
  { ticker: 'GLD', name: '금', category: '원자재'},
  { ticker: 'USO', name: '원유', category: '원자재'},
]

const SECTOR_INFO: Record<string, { name: string; emoji: string; kr: string }> = {
  XLK: { name: '기술', emoji: '', kr: '삼성전자·SK하이닉스 연관'},
  SOXX: { name: '반도체', emoji: '', kr: '엔비디아·AMD·브로드컴'},
  XLC: { name: '통신', emoji: '', kr: '알파벳·메타'},
  XLF: { name: '금융', emoji: '', kr: 'JP모건·뱅크오브아메리카'},
  XLV: { name: '헬스케어', emoji: '', kr: '존슨앤존슨·유나이티드'},
  XLI: { name: '산업재', emoji: '', kr: '캐터필러·허니웰'},
  XLE: { name: '에너지', emoji: '⛽', kr: '엑손모빌·셰브론'},
  XLY: { name: '경기소비재', emoji: '', kr: '아마존·테슬라'},
  XLP: { name: '필수소비재', emoji: '', kr: '코카콜라·P&G'},
  XLU: { name: '유틸리티', emoji: '⚡', kr: '넥스트에라·듀크에너지'},
  XLB: { name: '소재', emoji: '', kr: '린데·에어프로덕츠'},
  XLRE: { name: '부동산', emoji: '', kr: '프롤로지스·아메리칸타워'},
}

// ── 헬퍼 ─────────────────────────────────────────────────────
const f2 = (v: number | null, d = 2) =>
  v == null ? '—': v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

const changeColor = (v: number | null) =>
  v == null ? '#888': v > 0 ? '#D62728': v < 0 ? '#1565C0': '#888'

const changeStr = (v: number | null) =>
  v == null ? '—': `${v >= 0 ? '+': ''}${v.toFixed(2)}%`

// ── 스켈레톤 ─────────────────────────────────────────────────
function Sk({ h = 'h-4', w = 'w-full', className = ''}: { h?: string; w?: string; className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E8E6E0] ${h} ${w} ${className}`} />
}

// ══════════════════════════════════════════════════════════════
// 서브 컴포넌트
// ══════════════════════════════════════════════════════════════

// ── 3대 지수 멀티라인 차트 ──────────────────────────────────
const INDEX_LINES = [
  { key: 'sp500_close' as const, name: 'S&P 500', color: '#D62728' },
  { key: 'nasdaq_close' as const, name: '나스닥', color: '#2563EB' },
  { key: 'dow_close' as const, name: '다우존스', color: '#16A34A' },
]

function UsIndexChart({ history }: { history: IndexHistoryRow[] }) {
  if (history.length < 2) return null

  const W = 700, H = 220, PX = 48, PY = 20
  const chartW = W - PX * 2, chartH = H - PY * 2

  // 각 지수를 첫 날 기준 %변화로 정규화
  const normalized = useMemo(() => {
    const result: Record<string, number[]> = {}
    for (const line of INDEX_LINES) {
      const vals = history.map(r => r[line.key])
      const base = vals.find(v => v != null && v > 0)
      if (!base) { result[line.key] = []; continue }
      result[line.key] = vals.map(v => v != null ? ((v - base) / base) * 100 : NaN)
    }
    return result
  }, [history])

  // Y축 범위
  const allVals = Object.values(normalized).flat().filter(v => !isNaN(v))
  if (allVals.length === 0) return null
  const yMin = Math.min(...allVals)
  const yMax = Math.max(...allVals)
  const yPad = Math.max((yMax - yMin) * 0.15, 0.5)
  const domainMin = yMin - yPad
  const domainMax = yMax + yPad

  const toX = (i: number) => PX + (i / (history.length - 1)) * chartW
  const toY = (v: number) => PY + (1 - (v - domainMin) / (domainMax - domainMin)) * chartH

  // Y축 그리드
  const yTicks: number[] = []
  const step = (domainMax - domainMin) / 4
  for (let i = 0; i <= 4; i++) yTicks.push(domainMin + step * i)

  // X축 라벨 (5개)
  const xLabels: { i: number; label: string }[] = []
  const xStep = Math.max(1, Math.floor((history.length - 1) / 4))
  for (let i = 0; i < history.length; i += xStep) {
    xLabels.push({ i, label: history[i].date.slice(5) }) // MM-DD
  }
  if (xLabels[xLabels.length - 1]?.i !== history.length - 1) {
    xLabels.push({ i: history.length - 1, label: history[history.length - 1].date.slice(5) })
  }

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-1">
        <span className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">3대 지수 추이</span>
        <div className="flex items-center gap-3">
          {INDEX_LINES.map(l => (
            <span key={l.key} className="flex items-center gap-1 text-[12px] text-[#555]">
              <span className="w-3 h-[3px] rounded-full inline-block" style={{ backgroundColor: l.color }} />
              {l.name}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 400, maxHeight: 240 }}>
          {/* 그리드 + Y라벨 */}
          {yTicks.map(v => (
            <g key={v}>
              <line x1={PX} x2={W - PX} y1={toY(v)} y2={toY(v)} stroke="#E8E6E0" strokeWidth={1} />
              <text x={PX - 6} y={toY(v) + 4} textAnchor="end" fill="#9CA3AF" fontSize={10}>
                {v >= 0 ? '+' : ''}{v.toFixed(1)}%
              </text>
            </g>
          ))}
          {/* 0%선 강조 */}
          {domainMin <= 0 && domainMax >= 0 && (
            <line x1={PX} x2={W - PX} y1={toY(0)} y2={toY(0)} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          )}
          {/* X라벨 */}
          {xLabels.map(({ i, label }) => (
            <text key={i} x={toX(i)} y={H - 2} textAnchor="middle" fill="#9CA3AF" fontSize={10}>{label}</text>
          ))}
          {/* 라인 */}
          {INDEX_LINES.map(line => {
            const vals = normalized[line.key]
            if (!vals || vals.length === 0) return null
            const points = vals
              .map((v, i) => (!isNaN(v) ? `${toX(i)},${toY(v)}` : null))
              .filter(Boolean)
              .join(' ')
            return (
              <polyline key={line.key} points={points} fill="none"
                stroke={line.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            )
          })}
          {/* 최신값 점 + 라벨 */}
          {INDEX_LINES.map(line => {
            const vals = normalized[line.key]
            if (!vals || vals.length === 0) return null
            const lastIdx = vals.length - 1
            const lastVal = vals[lastIdx]
            if (isNaN(lastVal)) return null
            return (
              <g key={`dot-${line.key}`}>
                <circle cx={toX(lastIdx)} cy={toY(lastVal)} r={3.5} fill={line.color} />
                <text x={toX(lastIdx) + 6} y={toY(lastVal) + 4} fill={line.color} fontSize={10} fontWeight="bold">
                  {lastVal >= 0 ? '+' : ''}{lastVal.toFixed(1)}%
                </text>
              </g>
            )
          })}
        </svg>
      </div>
      <div className="text-[11px] text-[#888] mt-1">첫 날 대비 등락률 (%) · 최근 {history.length}일</div>
    </div>
  )
}

function EtfBar({ sectorEtf }: { sectorEtf: Record<string, number> }) {
  const getCategoryBg = (cat: string) => ({
    '지수': 'bg-[#FFF1F1] border-[#FFBBBB]',
    '레버리지': 'bg-[#F5F0FF] border-[#D4AAFF]',
    '인버스': 'bg-[#EEF4FF] border-[#AACCFF]',
    '섹터': 'bg-[#FFF8F0] border-[#FFDDAA]',
    '채권': 'bg-[#F0FFF4] border-[#AADDBB]',
    '원자재': 'bg-[#FFFBF0] border-[#FFE4A0]',
  }[cat] ?? 'bg-[#F8F7F3] border-[#E8E6E0]')

  return (
    <div className="fx-card px-4 py-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-1">
        <span className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">주요 ETF 현황</span>
        <span className="text-[11px] md:text-[12px] text-[#888]">레버리지 · 섹터 · 안전자산 한눈에</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {ETF_LIST.map(({ ticker, name, category }) => {
          const chg = sectorEtf[ticker] ?? null
          return (
            <div key={ticker} className={`border rounded-lg px-2 py-2 text-center ${getCategoryBg(category)}`}>
              <div className="text-[11px] font-bold text-[#888] mb-0.5">{category}</div>
              <div className="text-[14px] font-black text-[#1A1A2E]">{ticker}</div>
              <div className="text-[12px] text-[#888] mb-1">{name}</div>
              <div className="text-[16px] font-black" style={{ color: changeColor(chg) }}>
                {changeStr(chg)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-2 md:gap-3 text-[11px] md:text-[12px] text-[#888]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFBBBB] inline-block" />지수</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#D4AAFF] inline-block" />레버리지</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#AACCFF] inline-block" />인버스</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFDDAA] inline-block" />섹터</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#AADDBB] inline-block" />채권</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFE4A0] inline-block" />원자재</span>
      </div>
    </div>
  )
}

function IndexCards({ data }: { data: UsMarketData }) {
  const cards = [
    { name: 'S&P 500', sub: '미국 대형주 500개', close: data.sp500_close, change: data.sp500_change, note: '시장 전체 체온'},
    { name: '나스닥 100', sub: '기술주 중심 지수', close: data.nasdaq_close, change: data.nasdaq_change, note: 'AI · 반도체 주도'},
    { name: '다우존스', sub: '전통 대형주 30개', close: data.dow_close, change: data.dow_change, note: '제조 · 금융 중심'},
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {cards.map(card => (
        <div key={card.name} className="fx-card px-4 py-4" style={{ borderTop: `3px solid ${changeColor(card.change)}` }}>
          <div className="flex items-center justify-between sm:block">
            <div>
              <div className="text-[14px] sm:text-[16px] font-bold text-[#1A1A2E] tracking-wide">{card.name}</div>
              <div className="text-[11px] sm:text-[12px] text-[#888] mb-1 sm:mb-2">{card.sub}</div>
            </div>
            <div className="text-right sm:text-left">
              <div className="text-[28px] sm:text-[36px] font-black leading-none" style={{ color: changeColor(card.change) }}>
                {changeStr(card.change)}
              </div>
              <div className="text-[18px] sm:text-[22px] font-bold text-[#1A1A2E] mt-1 font-mono">{f2(card.close, 0)}</div>
            </div>
          </div>
          <div className="text-[11px] sm:text-[12px] text-[#888] mt-2">{card.note}</div>
        </div>
      ))}
    </div>
  )
}

function MarketVitals({ data }: { data: UsMarketData }) {
  const vixColor = data.vix == null ? '#888': data.vix >= 30 ? '#D62728': data.vix >= 25 ? '#B07D00': '#00843D'
  const fgColor = data.fear_greed == null ? '#888': data.fear_greed <= 25 ? '#D62728': data.fear_greed <= 45 ? '#B07D00': data.fear_greed >= 75 ? '#9333ea': '#00843D'
  const yieldColor = data.us_3y_yield == null ? '#888': data.us_3y_yield >= 4.5 ? '#D62728': data.us_3y_yield >= 4.0 ? '#B07D00': '#00843D'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
      <div className="fx-card px-4 py-4">
        <div className="text-[14px] md:text-[16px] font-bold text-[#1A1A2E] mb-1">VIX 공포지수</div>
        <div className="text-[11px] md:text-[12px] text-[#888] mb-3">20 이하 = 안심 / 30 이상 = 공포</div>
        <div className="text-[26px] md:text-[32px] font-black font-mono" style={{ color: vixColor }}>{f2(data.vix)}</div>
        <div className="h-2 bg-[#F0EEE8] rounded-full overflow-hidden mt-2 mb-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((data.vix ?? 0) / 50 * 100, 100)}%`, background: vixColor }} />
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: vixColor }}>
          {data.vix == null ? '—': data.vix >= 30 ? '⚠ 패닉구간 — 신중하게': data.vix >= 25 ? '⚠ 주의구간 — 비중 조절': '✅ 안정 — 정상 매매'}
        </div>
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[14px] md:text-[16px] font-bold text-[#1A1A2E] mb-1">공포 · 탐욕 지수</div>
        <div className="text-[11px] md:text-[12px] text-[#888] mb-3">0 극단공포 ↔ 100 극단탐욕</div>
        <div className="text-[26px] md:text-[32px] font-black font-mono" style={{ color: fgColor }}>{data.fear_greed ?? '—'}</div>
        <div className="text-[13px] font-bold mt-1" style={{ color: fgColor }}>{data.fear_greed_label ?? '—'}</div>
        <div className="text-[12px] text-[#888] mt-1">
          {data.fear_greed == null ? '': data.fear_greed <= 25 ? '저가매수 기회일 수도 있어요': data.fear_greed >= 75 ? '과열 — 차익실현 타이밍': '중립 구간 — 수급 보고 결정'}
        </div>
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[14px] md:text-[16px] font-bold text-[#1A1A2E] mb-1">3년물 금리 ★핵심</div>
        <div className="text-[11px] md:text-[12px] text-[#888] mb-3">높을수록 성장주 · 기술주 부담</div>
        <div className="text-[26px] md:text-[32px] font-black font-mono" style={{ color: yieldColor }}>
          {data.us_3y_yield != null ? `${data.us_3y_yield.toFixed(2)}%` : '—'}
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: yieldColor }}>
          {data.us_3y_yield == null ? '—': data.us_3y_yield >= 4.5 ? '⚠ 고금리 — 기술주 밸류에이션 부담': data.us_3y_yield >= 4.0 ? '⚠ 주의 — 보수적 운영 권장': '✅ 안정 — 성장주 우호 환경'}
        </div>
        {data.spread_3y_10y != null && data.spread_3y_10y < 0 && (
          <div className="text-[12px] text-[#D62728] font-bold mt-1">⚠ 장단기 금리 역전 중</div>
        )}
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[14px] md:text-[16px] font-bold text-[#1A1A2E] mb-1">달러 DXY</div>
        <div className="text-[11px] md:text-[12px] text-[#888] mb-3">높을수록 달러 강세 = 신흥국 약세</div>
        <div className="text-[26px] md:text-[32px] font-black font-mono" style={{ color: data.dxy == null ? '#888': data.dxy >= 104 ? '#D62728': data.dxy <= 100 ? '#00843D': '#888'}}>
          {f2(data.dxy)}
        </div>
        <div className="mt-2 space-y-0.5">
          {[
            { label: 'WTI 유가', value: data.wti, suffix: '$'},
            { label: '금', value: data.gold, suffix: '$'},
          ].map(({ label, value, suffix }) => (
            <div key={label} className="flex justify-between text-[12px]">
              <span className="text-[#888]">{label}</span>
              <span className="font-bold text-[#1A1A2E]">{value != null ? `${suffix}${f2(value, 0)}` : '—'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectorHeatmap({ sectorEtf }: { sectorEtf: Record<string, number> }) {
  const sorted = Object.entries(SECTOR_INFO).map(([ticker, info]) => ({
    ticker, ...info, change: sectorEtf[ticker] ?? null,
  })).sort((a, b) => (b.change ?? -99) - (a.change ?? -99))

  const getBg = (chg: number | null) => {
    if (chg == null) return 'bg-[#F8F7F3] border-[#E8E6E0]'
    if (chg >= 2) return 'bg-[#FFDDDD] border-[#FF9999]'
    if (chg >= 0.5) return 'bg-[#FFEEEE] border-[#FFBBBB]'
    if (chg >= -0.5) return 'bg-[#F8F7F3] border-[#DDDBD3]'
    if (chg >= -2) return 'bg-[#EEF4FF] border-[#BBCCEE]'
    return 'bg-[#E0EAFF] border-[#99AADD]'
  }

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1 gap-1">
        <div className="text-[17px] md:text-[20px] font-bold text-[#1A1A2E]">어떤 섹터가 뜨나?</div>
        <div className="text-[11px] md:text-[12px] text-[#888]">S&P 500 섹터 ETF 등락률 — 진한 빨강일수록 강세</div>
      </div>
      <div className="text-[12px] md:text-[13px] text-[#888] mb-4">빨강 섹터 = 오늘 돈이 몰리는 곳 / 파랑 섹터 = 자금 이탈 중</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {sorted.map(({ ticker, name, emoji, kr, change }) => (
          <div key={ticker} className={`border rounded-xl px-3 py-3 ${getBg(change)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[18px] md:text-[20px]">{emoji}</span>
              <span className="text-[11px] md:text-[12px] font-bold text-[#888]">{ticker}</span>
            </div>
            <div className="text-[14px] md:text-[16px] font-black text-[#1A1A2E]">{name}</div>
            <div className="text-[22px] md:text-[26px] font-black font-mono my-1" style={{ color: changeColor(change) }}>
              {changeStr(change)}
            </div>
            <div className="text-[10px] md:text-[11px] text-[#888] leading-tight">{kr}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAG7 패널 ─────────────────────────────────────────
function Mag7Panel({ mag7 }: { mag7: NonNullable<UsMarketData['mag7']> }) {
  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA']
  const names: Record<string, string> = {
    AAPL: '애플', MSFT: '마이크로소프트', GOOGL: '알파벳', AMZN: '아마존',
    NVDA: '엔비디아', META: '메타', TSLA: '테슬라',
  }

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-1">
        <span className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">MAG 7 — 빅테크 7인방</span>
        <span className="text-[11px] md:text-[12px] text-[#888]">미국장을 움직이는 핵심 7종목</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {tickers.map(t => {
          const d = mag7[t]
          if (!d) return null
          const chg = d.change_pct
          const volHigh = (d.volume_ratio ?? 1) >= 1.3
          return (
            <div key={t} className="border rounded-lg px-2 py-2 text-center"
              style={{ borderColor: chg >= 0 ? '#FFBBBB' : '#BBCCEE', backgroundColor: chg >= 0 ? '#FFF8F8' : '#F4F7FF' }}>
              <div className="text-[13px] md:text-[14px] font-black text-[#1A1A2E]">{t}</div>
              <div className="text-[11px] text-[#888]">{names[t]}</div>
              <div className="text-[18px] md:text-[20px] font-black font-mono my-0.5" style={{ color: changeColor(chg) }}>
                {changeStr(chg)}
              </div>
              <div className="text-[11px] font-bold text-[#1A1A2E] tabular-nums">${f2(d.close, 0)}</div>
              {volHigh && (
                <div className="text-[10px] text-[#D62728] font-bold mt-0.5">거래량 {((d.volume_ratio ?? 1) * 100).toFixed(0)}%</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Breadth 패널 ──────────────────────────────────────
function BreadthPanel({ breadth }: { breadth: NonNullable<UsMarketData['breadth']> }) {
  const adv = breadth.sp500_advance ?? 0
  const dec = breadth.sp500_decline ?? 0
  const total = adv + dec + (breadth.sp500_unchanged ?? 0)
  const advPct = total > 0 ? (adv / total * 100) : 50
  const h52 = breadth.sp500_new_52w_high ?? 0
  const l52 = breadth.sp500_new_52w_low ?? 0
  const pcr = breadth.put_call_ratio

  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] mb-3">시장 폭 (Market Breadth)</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 상승/하락 게이지 */}
        <div>
          <div className="flex justify-between text-[12px] font-bold mb-1">
            <span className="text-[#D62728]">상승 {adv}</span>
            <span className="text-[#1565C0]">하락 {dec}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex">
            <div className="h-full bg-[#D62728] transition-all" style={{ width: `${advPct}%` }} />
            <div className="h-full bg-[#1565C0] flex-1" />
          </div>
          <div className="text-[11px] text-[#888] mt-1 text-center">S&P 500 종목 기준</div>
        </div>

        {/* 52주 신고/신저가 */}
        <div className="text-center">
          <div className="text-[12px] font-bold text-[#888] mb-1">52주 신고/신저가</div>
          <div className="flex items-center justify-center gap-4">
            <div>
              <div className="text-[22px] md:text-[26px] font-black text-[#D62728]">{h52}</div>
              <div className="text-[11px] text-[#888]">신고가</div>
            </div>
            <div className="text-[16px] text-[#ccc]">/</div>
            <div>
              <div className="text-[22px] md:text-[26px] font-black text-[#1565C0]">{l52}</div>
              <div className="text-[11px] text-[#888]">신저가</div>
            </div>
          </div>
        </div>

        {/* Put/Call Ratio */}
        <div className="text-center">
          <div className="text-[12px] font-bold text-[#888] mb-1">풋콜 비율</div>
          <div className="text-[26px] md:text-[30px] font-black font-mono" style={{
            color: pcr == null ? '#888' : pcr >= 1.0 ? '#D62728' : pcr <= 0.7 ? '#9333ea' : '#00843D',
          }}>
            {pcr != null ? pcr.toFixed(2) : '—'}
          </div>
          <div className="text-[11px] text-[#888]">
            {pcr == null ? '' : pcr >= 1.0 ? '공포 구간' : pcr <= 0.7 ? '과열 — 탐욕' : '중립'}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── 금리 커브 패널 ────────────────────────────────────
function YieldCurvePanel({ yc }: { yc: NonNullable<UsMarketData['yield_curve']> }) {
  const keys = ['us_1m', 'us_3m', 'us_6m', 'us_1y', 'us_2y', 'us_3y', 'us_5y', 'us_7y', 'us_10y', 'us_20y', 'us_30y']
  const labels = ['1M', '3M', '6M', '1Y', '2Y', '3Y', '5Y', '7Y', '10Y', '20Y', '30Y']
  const values = keys.map(k => yc[k] ?? null).filter((v): v is number => v != null)
  if (values.length < 3) return null

  const min = Math.min(...values) - 0.2
  const max = Math.max(...values) + 0.2
  const range = max - min || 1

  // SVG 패스
  const w = 320, h = 80, px = 10
  const step = (w - px * 2) / (values.length - 1)
  const pts = values.map((v, i) => ({
    x: px + i * step,
    y: h - px - ((v - min) / range) * (h - px * 2),
  }))
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 gap-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">미국 국채 금리 커브</span>
          {yc.inverted && (
            <span className="text-[11px] font-bold bg-[#FFEEEE] text-[#D62728] px-2 py-0.5 rounded-full">역전</span>
          )}
        </div>
        <span className="text-[11px] md:text-[12px] text-[#888]">단기→장기 금리 구조</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[400px]">
        <path d={path} fill="none" stroke={yc.inverted ? '#D62728' : '#00843D'} strokeWidth="2" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill={yc.inverted ? '#D62728' : '#00843D'} />
            <text x={p.x} y={h - 1} textAnchor="middle" fontSize="7" fill="#888">{labels[i]}</text>
            <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1A1A2E">
              {values[i].toFixed(1)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

// ── 환율/암호화폐 미니 패널 ───────────────────────────
function ForexCryptoPanel({ forex, crypto }: { forex: UsMarketData['forex']; crypto: UsMarketData['crypto'] }) {
  if (!forex && !crypto) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* 환율 */}
      {forex && Object.keys(forex).length > 0 && (
        <div className="fx-card px-4 py-4">
          <div className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] mb-3">주요 환율</div>
          <div className="space-y-2">
            {Object.entries(forex).map(([pair, d]) => {
              const label: Record<string, string> = {
                USD_KRW: '달러/원', USD_JPY: '달러/엔', EUR_USD: '유로/달러',
              }
              return (
                <div key={pair} className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#1A1A2E]">{label[pair] ?? pair.replace('_', '/')}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] font-black font-mono text-[#1A1A2E]">
                      {d.rate.toLocaleString('en-US', { minimumFractionDigits: pair === 'EUR_USD' ? 4 : 2, maximumFractionDigits: pair === 'EUR_USD' ? 4 : 2 })}
                    </span>
                    <span className="text-[13px] font-bold" style={{ color: changeColor(d.change_pct) }}>
                      {changeStr(d.change_pct)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 암호화폐 */}
      {crypto && Object.keys(crypto).length > 0 && (
        <div className="fx-card px-4 py-4">
          <div className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] mb-3">주요 암호화폐</div>
          <div className="space-y-2">
            {Object.entries(crypto).map(([coin, d]) => (
              <div key={coin} className="flex items-center justify-between">
                <span className="text-[13px] font-bold text-[#1A1A2E]">{coin}</span>
                <div className="flex items-center gap-3">
                  <span className="text-[15px] font-black font-mono text-[#1A1A2E]">
                    ${d.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[13px] font-bold" style={{ color: changeColor(d.change_24h_pct) }}>
                    {changeStr(d.change_24h_pct)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── 뉴스 패널 ─────────────────────────────────────────
function NewsPanel({ news }: { news: NonNullable<UsMarketData['us_news']> }) {
  if (news.length === 0) return null
  const impactColor: Record<string, string> = { positive: '#00843D', negative: '#D62728', neutral: '#888' }
  const impactLabel: Record<string, string> = { positive: '호재', negative: '악재', neutral: '중립' }

  return (
    <div className="fx-card px-4 py-4">
      <div className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] mb-3">주요 뉴스</div>
      <div className="space-y-2">
        {news.slice(0, 5).map((n, i) => (
          <div key={i} className="flex items-start gap-2 text-[13px]">
            {n.impact && (
              <span className="shrink-0 text-[11px] font-bold px-1.5 py-0.5 rounded mt-0.5"
                style={{ backgroundColor: n.impact === 'positive' ? '#E6F9EE' : n.impact === 'negative' ? '#FFEEEE' : '#F1F0EA', color: impactColor[n.impact] ?? '#888' }}>
                {impactLabel[n.impact] ?? n.impact}
              </span>
            )}
            <div className="flex-1">
              <span className="text-[#1A1A2E] font-bold">{n.title}</span>
              {n.source && <span className="text-[11px] text-[#aaa] ml-2">{n.source}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 캘린더 패널 (한국시장 패턴 동일) ─────────────────────
const CAL_TYPE_CFG: Record<string, { icon: string; color: string; dot: string; label: string }> = {
  earnings:       { icon: '📊', color: '#2563EB', dot: '#2563EB', label: '실적 발표' },
  options_expiry: { icon: '⚠️', color: '#DC2626', dot: '#DC2626', label: '옵션 만기' },
  central_bank:   { icon: '🏦', color: '#7C3AED', dot: '#7C3AED', label: '중앙은행' },
  economic:       { icon: '📈', color: '#D97706', dot: '#D97706', label: '경제지표' },
  holiday:        { icon: '🔴', color: '#9CA3AF', dot: '#9CA3AF', label: '휴장' },
  ipo:            { icon: '🆕', color: '#16A34A', dot: '#16A34A', label: 'IPO' },
  dividend:       { icon: '💰', color: '#0891B2', dot: '#0891B2', label: '배당' },
  etc:            { icon: '📌', color: '#6B7280', dot: '#6B7280', label: '기타' },
}
const CAL_GROUP_ORDER: Record<string, { icon: string; label: string; order: number }> = {
  central_bank:   { icon: '🏦', label: '중앙은행', order: 1 },
  earnings:       { icon: '📊', label: '실적발표', order: 2 },
  options_expiry: { icon: '⚠️', label: '옵션만기', order: 3 },
  economic:       { icon: '📈', label: '경제지표', order: 4 },
  holiday:        { icon: '🔴', label: '휴장일', order: 5 },
  ipo:            { icon: '🆕', label: 'IPO', order: 6 },
  dividend:       { icon: '💰', label: '배당', order: 7 },
  etc:            { icon: '📌', label: '기타', order: 8 },
}
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
function calCfg(type: string) { return CAL_TYPE_CFG[type] ?? CAL_TYPE_CFG.etc }
function calGrp(type: string) { return CAL_GROUP_ORDER[type] ?? CAL_GROUP_ORDER.etc }

function UsCalendarPanel({ events }: { events: CalEvent[] }) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const [yearMonth, setYearMonth] = useState(today.slice(0, 7))
  const [selectedDate, setSelectedDate] = useState(today)
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => events.filter(e => e.date.startsWith(yearMonth)), [events, yearMonth])

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const ev of filtered) {
      const d = ev.date
      if (!map[d]) map[d] = []
      map[d].push(ev)
    }
    return map
  }, [filtered])

  const selectedEvents = eventsByDate[selectedDate] ?? []

  const groupedEvents = useMemo(() => {
    const map: Record<string, CalEvent[]> = {}
    for (const ev of filtered) {
      const t = ev.type
      if (!map[t]) map[t] = []
      map[t].push(ev)
    }
    return Object.entries(map).sort(([a, aEvs], [b, bEvs]) => {
      const aH = aEvs.some(e => e.impact === 'high') ? 0 : 1
      const bH = bEvs.some(e => e.impact === 'high') ? 0 : 1
      if (aH !== bH) return aH - bH
      return calGrp(a).order - calGrp(b).order
    })
  }, [filtered])

  useEffect(() => {
    if (groupedEvents.length > 0) {
      const max = groupedEvents.reduce((a, b) => b[1].length > a[1].length ? b : a)
      setOpenGroups(new Set([max[0]]))
    }
  }, [groupedEvents])

  const [year, month] = yearMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function moveMonth(delta: number) {
    const d = new Date(year, month - 1 + delta, 1)
    setYearMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  return (
    <div className="fx-card">
      <span className="fx-card-title">시장 이벤트 캘린더</span>
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-3" style={{ minHeight: 340 }}>
        {/* 캘린더 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => moveMonth(-1)} className="text-[#6B7280] hover:text-[#1A1A2E] font-bold px-2">‹</button>
            <span className="text-[14px] md:text-[16px] font-bold text-[#1A1A2E]">{year}년 {month}월</span>
            <button onClick={() => moveMonth(1)} className="text-[#6B7280] hover:text-[#1A1A2E] font-bold px-2">›</button>
          </div>
          <div className="grid grid-cols-7 text-center text-[12px] font-bold text-[#9CA3AF] mb-1">
            {WEEKDAYS.map(w => <div key={w}>{w}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-[2px]">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />
              const ds = `${yearMonth}-${String(day).padStart(2, '0')}`
              const dayEvs = eventsByDate[ds] ?? []
              const isToday = ds === today
              const isSel = ds === selectedDate
              const hasHigh = dayEvs.some(e => e.impact === 'high')
              return (
                <button key={ds} onClick={() => setSelectedDate(ds)}
                  className={`relative flex flex-col items-center py-1.5 rounded-lg text-[14px] font-semibold transition-colors
                    ${isSel ? 'bg-[#00FF88] text-[#1A1A2E]' : isToday ? 'bg-[#F0FDF4] text-[#1A1A2E]' : 'text-[#1A1A2E] hover:bg-[#F5F4F0]'}`}>
                  <span>{day}</span>
                  {dayEvs.length > 0 && (
                    <div className="flex gap-[2px] mt-0.5">
                      {dayEvs.slice(0, 3).map((ev, j) => (
                        <span key={j} className="w-[5px] h-[5px] rounded-full"
                          style={{ backgroundColor: hasHigh && j === 0 ? '#DC2626' : calCfg(ev.type).dot }} />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-3 border-t border-[#E8E6E0] pt-3">
            <p className="text-[13px] font-bold text-[#6B7280] mb-2">{selectedDate.slice(5).replace('-', '/')} ({WEEKDAYS[new Date(selectedDate).getDay()]})</p>
            {selectedEvents.length === 0 ? (
              <p className="text-[13px] text-[#9CA3AF]">이벤트 없음</p>
            ) : (
              <div className="space-y-2">
                {selectedEvents.map(ev => {
                  const c = calCfg(ev.type)
                  return (
                    <div key={ev.id} className="flex items-start gap-2">
                      <span className="text-[14px]">{c.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold ${ev.impact === 'high' ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                          {ev.title}{ev.ticker && <span className="text-[11px] text-[#9CA3AF] ml-1">{ev.ticker}</span>}
                        </p>
                        {ev.detail && <p className="text-[12px] text-[#9CA3AF] truncate">{ev.detail}</p>}
                      </div>
                      <span className="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-auto"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}>{c.label}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
        {/* 아코디언 */}
        <div className="w-full md:w-[300px] md:shrink-0 border-t md:border-t-0 md:border-l border-[#E8E6E0] pt-3 md:pt-0 md:pl-4 overflow-y-auto">
          <p className="text-[14px] font-bold text-[#1A1A2E] mb-3">{month}월 이벤트</p>
          {groupedEvents.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">이벤트 없음</p>
          ) : (
            <div className="space-y-1">
              {groupedEvents.map(([type, evs]) => {
                const g = calGrp(type)
                const c = calCfg(type)
                const isOpen = openGroups.has(type)
                return (
                  <div key={type}>
                    <button onClick={() => setOpenGroups(prev => {
                      const next = new Set(prev)
                      if (next.has(type)) next.delete(type); else next.add(type)
                      return next
                    })} className="w-full flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-[#F5F4F0] transition-colors">
                      <span className="text-[13px]">{g.icon}</span>
                      <span className="text-[13px] font-bold text-[#1A1A2E]">{g.label}</span>
                      <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${c.color}15`, color: c.color }}>{evs.length}</span>
                      <span className="ml-auto text-[11px] text-[#9CA3AF]">{isOpen ? '▼' : '▶'}</span>
                    </button>
                    {isOpen && (
                      <div className="ml-4 pl-2 border-l-2 space-y-1 pb-1" style={{ borderColor: `${c.color}30` }}>
                        {evs.map(ev => {
                          const dl = `${new Date(ev.date).getMonth() + 1}/${new Date(ev.date).getDate()}`
                          return (
                            <button key={ev.id} onClick={() => setSelectedDate(ev.date)} className="w-full text-left py-0.5 group">
                              <p className={`text-[12px] group-hover:text-[#1A1A2E] transition-colors ${ev.impact === 'high' ? 'font-bold text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                                <span className="text-[#9CA3AF] tabular-nums mr-1">{dl}</span>{ev.title}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── ETF 투자자 흐름 패널 ─────────────────────────────────
const FLOW_ETF_LABELS: Record<string, string> = {
  SPY: 'S&P 500', QQQ: '나스닥 100', DIA: '다우존스',
  IWM: '러셀 2000', TLT: '장기국채', GLD: '금',
  XLK: '기술', XLF: '금융', XLE: '에너지', SOXX: '반도체',
}

function InvestorFlowPanel({ flows }: { flows: FlowRow[] }) {
  if (flows.length === 0) return null

  // 최신 날짜 기준 ETF별 순매수 집계
  const latestDate = flows.reduce((a, b) => a > b.date ? a : b.date, '')
  const latest = flows.filter(f => f.date === latestDate)
  const sorted = [...latest].sort((a, b) => b.net_flow - a.net_flow)
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.net_flow)), 1)

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 gap-1">
        <span className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E]">ETF 자금 흐름</span>
        <span className="text-[11px] md:text-[12px] text-[#888]">{latestDate} 기준 · 순유입/유출</span>
      </div>
      <div className="space-y-2">
        {sorted.map(row => {
          const pct = (row.net_flow / maxAbs) * 100
          const isPos = row.net_flow >= 0
          const label = FLOW_ETF_LABELS[row.etf] ?? row.etf
          const flowStr = Math.abs(row.net_flow) >= 1e9
            ? `${(row.net_flow / 1e9).toFixed(1)}B`
            : `${(row.net_flow / 1e6).toFixed(0)}M`
          return (
            <div key={row.etf}>
              <div className="flex items-center justify-between text-[13px] mb-0.5">
                <span className="font-bold text-[#1A1A2E]">{row.etf} <span className="font-normal text-[#888]">{label}</span></span>
                <span className="font-black font-mono" style={{ color: isPos ? '#D62728' : '#1565C0' }}>
                  {isPos ? '+' : ''}{flowStr}
                </span>
              </div>
              <div className="h-2 bg-[#F0EEE8] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.abs(pct)}%`,
                    backgroundColor: isPos ? '#D62728' : '#1565C0',
                    marginLeft: isPos ? '0' : 'auto',
                  }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="text-[11px] text-[#888] mt-3">양수 = 자금 유입(빨강) · 음수 = 자금 유출(파랑) · 단위: USD</div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 메인 뷰
// ══════════════════════════════════════════════════════════════
export function UsMarketView() {
  const [market, setMarket] = useState<UsMarketData | null>(null)
  const [calEvents, setCalEvents] = useState<CalEvent[]>([])
  const [flows, setFlows] = useState<FlowRow[]>([])
  const [history, setHistory] = useState<IndexHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const [mRes, cRes, fRes, hRes] = await Promise.allSettled([
          fetch('/api/us-market/daily', { signal: controller.signal }),
          fetch('/api/us-market/calendar', { signal: controller.signal }),
          fetch('/api/us-market/investor-flow', { signal: controller.signal }),
          fetch('/api/us-market/history', { signal: controller.signal }),
        ])
        if (mRes.status === 'fulfilled' && mRes.value.ok) {
          const json = await mRes.value.json()
          if (json.date) setMarket(json)
        }
        if (cRes.status === 'fulfilled' && cRes.value.ok) {
          const json = await cRes.value.json()
          setCalEvents(json.events ?? [])
        }
        if (fRes.status === 'fulfilled' && fRes.value.ok) {
          const json = await fRes.value.json()
          setFlows(json.flows ?? [])
        }
        if (hRes.status === 'fulfilled' && hRes.value.ok) {
          const json = await hRes.value.json()
          setHistory(json.history ?? [])
        }
      } catch {
        /* abort */
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-4">
        <Sk h="h-8" w="w-48" />
        <Sk h="h-20" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">{Array.from({ length: 12 }).map((_, i) => <Sk key={i} h="h-24" />)}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} h="h-36" />)}</div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-10 text-center">
        <div className="text-[#D62728] text-sm font-bold">미국장 데이터 없음</div>
        <div className="text-[#888] text-xs mt-1">데이터 수집 후 다시 확인해주세요</div>
      </div>
    )
  }

  const nqChg = market.nasdaq_change ?? 0
  const overallUp = nqChg >= 0.5
  const overallDn = nqChg <= -0.5

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-[14px]">
      {/* 히어로 배너 */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm">
        <div>
          <div className="text-[11px] md:text-[13px] font-black text-[#888] tracking-widest uppercase">오늘 미국장 한줄 요약</div>
          <div className="text-[17px] md:text-[22px] font-black text-[#1A1A2E] mt-1 leading-snug">
            {overallUp ? `나스닥 ${nqChg >= 0 ? '+': ''}${nqChg.toFixed(1)}% 상승, ${market.soxx_change && market.soxx_change > 0 ? '반도체 강세': '기술주 주도'}`
             : overallDn ? `나스닥 ${nqChg.toFixed(1)}% 하락, 시장 조정 중`
             : '나스닥 보합, 방향 탐색 중'}
            <span className={`text-[12px] md:text-[14px] px-2 md:px-3 py-0.5 md:py-1 rounded-full font-black ml-2 md:ml-3 inline-block mt-1 md:mt-0 ${
              overallUp ? 'bg-[#E6F9EE] text-[#00843D]'
              : overallDn ? 'bg-[#FFEEEE] text-[#C0392B]'
              : 'bg-[#F1F0EA] text-[#555]'}`}>
              {overallUp ? '↑ 긍정': overallDn ? '↓ 주의': '→ 중립'}
            </span>
          </div>
          <div className="text-[11px] md:text-[13px] text-[#777] mt-1">
            S&P500 {changeStr(market.sp500_change)} · 나스닥 {changeStr(market.nasdaq_change)} · SOXX {changeStr(market.soxx_change)}
          </div>
        </div>
        <div className="text-left md:text-right shrink-0">
          <div className="text-[11px] md:text-[13px] text-[#888]">{market.date} 기준</div>
          <div className="text-[11px] md:text-[13px] font-black text-[#00843D] mt-1">● FLOWX 자동수집</div>
        </div>
      </div>

      {history.length >= 2 && <UsIndexChart history={history} />}
      <EtfBar sectorEtf={market.sector_etf} />
      <IndexCards data={market} />
      {market.mag7 && <Mag7Panel mag7={market.mag7} />}
      <MarketVitals data={market} />
      {market.breadth && <BreadthPanel breadth={market.breadth} />}
      {market.yield_curve && <YieldCurvePanel yc={market.yield_curve} />}
      <ForexCryptoPanel forex={market.forex} crypto={market.crypto} />
      <SectorHeatmap sectorEtf={market.sector_etf} />
      {market.us_news && market.us_news.length > 0 && <NewsPanel news={market.us_news} />}
      {calEvents.length > 0 && <UsCalendarPanel events={calEvents} />}
      {flows.length > 0 && <InvestorFlowPanel flows={flows} />}

      <div className="text-center text-[12px] text-[#bbb] py-1">
        본 정보는 투자 권유가 아니며 최종 판단은 투자자 본인에게 있습니다 · FLOWX 자동수집
      </div>
    </div>
  )
}
