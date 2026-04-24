'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CrashBounceView from './CrashBounceView'
import AlphaSmartMoney from './AlphaSmartMoney'
import { type MarketRankingData } from '@/features/market-summary/ui/MarketRankingPanel'
import { type BluechipCheckupData } from './BluechipCheckupPanel'
import SectorRotationView from '@/features/swing/ui/SectorRotationView'
import type { AlphaScannerData } from './alpha-types'
import BluechipInspectionTab from './BluechipInspectionTab'
import SmallcapThemeTab from './SmallcapThemeTab'
import { GRADE_STRONG_PICK, GRADE_PICK } from '@/shared/constants/grades'

/* ── Jarvis Types ── */
interface FibEntryPick {
  code: string; name: string; price: number; drop: number
  rsi: number; foreign_net: number; inst_net: number
  fib_zone: string; target: number; upside: number
  sector?: string; cap?: number
}

interface JarvisData {
  date?: string | null
  fib_entry_picks?: FibEntryPick[]
}


/* ── SupplySurge / Bottom / ETF Types ── */
interface SupplySurgePick {
  date: string; ticker: string; name: string; close: number
  ret_d0: number; supply_type: string; base_score: number
  tech_score: number; streak_bonus: number; final_score: number
  fgn: number; inst: number; pension: number
  finance: number; corp: number; retail: number
  cum_fgn_5d: number; cum_inst_5d: number; cum_pension_5d: number
  ma20_dev: number; rsi: number; vol_ratio: number
  tech_flags: string; signal: string
}

interface BottomPick {
  date: string; ticker: string; name: string; close: number
  ret_d0: number; fib_zone: string; drop_pct: number
  vol_ratio: number; tv: number; rsi: number
  foreign_turn: boolean; inst_turn: boolean
  supply_score: number; final_score: number
  nxt_tradable: boolean
  grade?: string
}

interface EtfItem { ticker: string; name: string; desc?: string }

interface EtfStrategy {
  date: string; regime: string; shield: string; direction: string
  vix: number; fear_index: number; contrarian: boolean
  bull_etfs: EtfItem[] | null; bear_etfs: EtfItem[] | null; safe_etfs: EtfItem[] | null
  message: string | null
}

/* ── Constants ── */
const TABS = [
  { key: 'quant', label: '퀀트시스템' },
  { key: 'crash', label: '급락반등' },
  { key: 'bluechip', label: '대형주 피보나치' },
  { key: 'smallcap', label: '소형주 피보나치' },
  { key: 'sector', label: '섹터 로테이션' },
] as const

type TabKey = (typeof TABS)[number]['key']


const RANK_COLOR = ['#DC2626', '#EF4444', '#F59E0B', '#6B7280', '#6B7280']

const SURGE_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  'A_쌍끌이':    { label: '쌍끌이',   bg: '#FF4444', text: '#fff' },
  'B_기관연기금': { label: '스마트머니', bg: '#FF8C00', text: '#fff' },
  'C_3주체합류':  { label: '3주체',    bg: '#9C27B0', text: '#fff' },
  'D_외인폭발':   { label: '외인폭발',  bg: '#2196F3', text: '#fff' },
  'E_연기금매집':  { label: '연기금',   bg: '#4CAF50', text: '#fff' },
  'F_금투기타':   { label: '금투',     bg: '#607D8B', text: '#fff' },
}

const TEMP_CFG: Record<string, { bg: string; text: string }> = {
  HOT: { bg: '#DC2626', text: '#fff' },
  WARM: { bg: '#EA580C', text: '#fff' },
  COOL: { bg: '#3B82F6', text: '#fff' },
  COLD: { bg: '#9CA3AF', text: '#fff' },
}

const fmtP = (v: number) => v.toLocaleString('ko-KR')
const fmtBaseDate = (d: string) => { const m = d.match(/(\d+)-(\d+)$/); return m ? `${+m[1]}/${+m[2]}` : d }

/* ── Accordion ── */
function Accordion({ id, title, open, onToggle, children }: {
  id: string; title: string; open: boolean; onToggle: (id: string) => void; children: React.ReactNode
}) {
  return (
    <div>
      <button onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between bg-[#F5F4F0] hover:bg-[#ECEAE4] rounded-lg px-4 py-3 transition-colors mb-1">
        <span className="text-[13px] font-bold text-[#1A1A2E]">{title}</span>
        <span className="text-[11px] font-semibold text-[#7C3AED]">{open ? '접기 ▲' : '펼치기 ▼'}</span>
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════ */
/*               MAIN                     */
/* ═══════════════════════════════════════ */

export default function SystemPage() {
  const [data, setData] = useState<AlphaScannerData | null>(null)
  const [ranking, setRanking] = useState<MarketRankingData | null>(null)
  const [bluechip, setBluechip] = useState<BluechipCheckupData | null>(null)
  const [jarvis, setJarvis] = useState<JarvisData | null>(null)
  const [surgeBuys, setSurgeBuys] = useState<SupplySurgePick[]>([])
  const [surgeSells, setSurgeSells] = useState<SupplySurgePick[]>([])
  const [bottomPicks, setBottomPicks] = useState<BottomPick[]>([])
  const [etfStrategy, setEtfStrategy] = useState<EtfStrategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('quant')
  const [openAcc, setOpenAcc] = useState<string | null>(null)
  const [showAllBottom, setShowAllBottom] = useState(false)


  const toggleAcc = (id: string) => setOpenAcc(openAcc === id ? null : id)

  useEffect(() => {
    const ac = new AbortController()
    const sig = ac.signal
    async function load() {
      try {
        const r = await Promise.allSettled([
          fetch('/api/alpha-scanner', { signal: sig }),
          fetch('/api/quant/market-ranking', { signal: sig }),
          fetch('/api/quant/bluechip-checkup', { signal: sig }),
          fetch('/api/quant-jarvis', { signal: sig }),
          fetch('/api/supply-surge', { signal: sig }),
          fetch('/api/quant/bottom-picks', { signal: sig }),
          fetch('/api/quant/etf-strategy', { signal: sig }),
        ])
        if (r[0].status === 'fulfilled' && r[0].value.ok) {
          const j = await r[0].value.json(); setData(j.data ?? null)
        }
        if (r[1].status === 'fulfilled' && r[1].value.ok) {
          const j = await r[1].value.json(); if (j.data) setRanking(j.data)
        }
        if (r[2].status === 'fulfilled' && r[2].value.ok) {
          const j = await r[2].value.json(); if (j.data) setBluechip(j.data)
        }
        if (r[3].status === 'fulfilled' && r[3].value.ok) {
          const j = await r[3].value.json(); setJarvis(j ?? null)
        }
        if (r[4].status === 'fulfilled' && r[4].value.ok) {
          const j = await r[4].value.json()
          setSurgeBuys(j.buys ?? [])
          setSurgeSells(j.sells ?? [])
        }
        if (r[5].status === 'fulfilled' && r[5].value.ok) {
          const j = await r[5].value.json(); setBottomPicks(j.items ?? [])
        }
        if (r[6].status === 'fulfilled' && r[6].value.ok) {
          const j = await r[6].value.json(); setEtfStrategy(j.data ?? null)
        }
      } catch { /* abort */ }
      setLoading(false)
    }
    load()
    return () => ac.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-14 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  /* ── derived data ── */
  const sectorHeat = data?.sector_heat ?? []
  const dualTop3 = (data?.smart_money?.dual_buy ?? []).slice(0, 3)
  const volTop3 = (ranking?.volume_rank ?? []).slice(0, 3)
  const fgnTop3 = (ranking?.foreign_institution?.foreign_buy ?? []).slice(0, 3)

  const gc: Record<string, number> = {}
  for (const item of bluechip?.bluechips ?? []) gc[item.grade] = (gc[item.grade] ?? 0) + 1
  const bcVerdict = (gc['A'] ?? 0) > 10 ? '전반적 강세' : (gc['C'] ?? 0) > 20 ? '전반적 약세 — 주의' : '혼조세'

  const displayDate = jarvis?.date ?? data?.date ?? ''

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 space-y-6">
      {/* 그라데이션 라인 */}
      <div className="h-[2px] rounded-full" style={{
        background: tab === 'quant'
          ? 'linear-gradient(90deg, #7C3AED, #A78BFA 30%, #7C3AED 60%, #A78BFA)'
          : 'linear-gradient(90deg, #00FF88, #4ADE80 30%, #00FF88 60%, #4ADE80)',
      }} />

      {/* 탭 바 */}
      <div className="tab-scroll">
        <div className="flex items-center gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg text-[13px] md:text-[15px] font-bold transition-colors whitespace-nowrap ${
                tab === t.key ? 'bg-[#00FF88] text-[#1A1A2E]' : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
              }`}>
              {t.label}
            </button>
          ))}
          {displayDate && <span className="text-[12px] md:text-[13px] text-[#9CA3AF] ml-2 md:ml-3 shrink-0">{displayDate}</span>}
        </div>
      </div>

      {/* ═══ 퀀트시스템 탭 ═══ */}
      {tab === 'quant' && (
        <div className="space-y-5">

          {/* ══════ ZONE B: 30초 분석 ══════ */}

          {/* Box 1: 스마트 수급 포착 */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
            style={{ borderLeft: '3px solid #FF6B35' }}>
            <div className="px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-0.5">스마트 수급 포착</h3>
              <p className="text-[10px] text-[#6B7280] mb-3">외인·기관·연기금 스마트머니 급변 감지</p>
              {surgeBuys.length > 0 ? (
                <div className="space-y-2">
                  {surgeBuys.map((p, i) => {
                    const badge = SURGE_BADGE[p.supply_type] ?? { label: p.supply_type, bg: '#607D8B', text: '#fff' }
                    return (
                      <div key={p.ticker} className="border border-[#F0EDE8] rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: RANK_COLOR[i] ?? '#6B7280' }}>{i + 1}</span>
                          <span className="text-[14px] font-bold text-[#1A1A2E]">{p.name}</span>
                          <span className="text-[14px] font-bold tabular-nums" style={{ color: '#FF6B35' }}>{(p.final_score ?? 0).toFixed(0)}점</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
                          <span className="text-[12px] font-bold text-[#1A1A2E] ml-auto tabular-nums">{fmtP(p.close)}원</span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                          <div><span className="text-[#9CA3AF]">RSI</span> <span className="font-bold tabular-nums">{(p.rsi ?? 0).toFixed(0)}</span></div>
                          <div><span className="text-[#9CA3AF]">거래량</span> <span className="font-bold tabular-nums">{(p.vol_ratio ?? 0).toFixed(1)}x</span></div>
                          <div><span className="text-[#9CA3AF]">MA20</span> <span className={`font-bold tabular-nums ${(p.ma20_dev ?? 0) >= 0 ? 'text-[#DC2626]' : 'text-[#2563EB]'}`}>{(p.ma20_dev ?? 0) >= 0 ? '+' : ''}{(p.ma20_dev ?? 0).toFixed(1)}%</span></div>
                          <div><span className="text-[#9CA3AF]">외인</span> <span className={`font-bold tabular-nums ${(p.fgn ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>{(p.fgn ?? 0) >= 0 ? '+' : ''}{(p.fgn ?? 0).toFixed(0)}억</span></div>
                          <div><span className="text-[#9CA3AF]">기관</span> <span className={`font-bold tabular-nums ${(p.inst ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>{(p.inst ?? 0) >= 0 ? '+' : ''}{(p.inst ?? 0).toFixed(0)}억</span></div>
                          <div><span className="text-[#9CA3AF]">연기금</span> <span className={`font-bold tabular-nums ${(p.pension ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>{(p.pension ?? 0) >= 0 ? '+' : ''}{(p.pension ?? 0).toFixed(0)}억</span></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-[13px] text-[#9CA3AF] py-6 text-center">스마트 수급 포착 종목 없음 — 쉬는 것도 전략입니다</p>
              )}
            </div>
          </div>

          {/* 매도 경고: 개인추격 매도 시그널 */}
          {surgeSells.length > 0 && (
            <div className="rounded-xl border border-[#FDE68A] overflow-hidden" style={{ backgroundColor: '#FFF3E0' }}>
              <div className="px-5 py-3">
                <h3 className="text-[13px] font-bold text-[#D97706] mb-2">개인추격 매도 시그널 (보유 시 매도 검토)</h3>
                <div className="space-y-1">
                  {surgeSells.map((p) => (
                    <div key={p.ticker} className="flex items-center gap-3 text-[12px] flex-wrap">
                      <span className="font-bold text-[#1A1A2E]">{p.name}</span>
                      <span className="font-bold tabular-nums text-[#1A1A2E]">{fmtP(p.close)}원</span>
                      <span className={`tabular-nums ${(p.retail ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>개인 {(p.retail ?? 0) >= 0 ? '+' : ''}{(p.retail ?? 0).toFixed(0)}억</span>
                      <span className={`tabular-nums ${(p.fgn ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>외인 {(p.fgn ?? 0) >= 0 ? '+' : ''}{(p.fgn ?? 0).toFixed(0)}억</span>
                      <span className={`tabular-nums ${(p.inst ?? 0) >= 0 ? 'text-[#FF4444]' : 'text-[#2196F3]'}`}>기관 {(p.inst ?? 0) >= 0 ? '+' : ''}{(p.inst ?? 0).toFixed(0)}억</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Box 2: 바닥에서 고개 든 종목 */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
            style={{ borderLeft: '3px solid #4CAF50' }}>
            <div className="px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-0.5">바닥에서 고개 든 종목</h3>
              <p className="text-[10px] text-[#6B7280] mb-3">피보나치 바닥권 + 수급 양전환 종목</p>
              {bottomPicks.length > 0 ? (
                <div className="space-y-2">
                  {(showAllBottom ? bottomPicks : bottomPicks.slice(0, 3)).map((p, i) => {
                    const zoneCfg: Record<string, { bg: string; text: string }> = {
                      DEEP: { bg: '#DC2626', text: '#fff' },
                      BOTTOM: { bg: '#EA580C', text: '#fff' },
                      LOW: { bg: '#F59E0B', text: '#fff' },
                      MID: { bg: '#3B82F6', text: '#fff' },
                      HIGH: { bg: '#9CA3AF', text: '#fff' },
                    }
                    const zc = zoneCfg[p.fib_zone] ?? zoneCfg.MID
                    return (
                      <div key={p.ticker} className="border border-[#F0EDE8] rounded-lg p-3">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ backgroundColor: RANK_COLOR[i] ?? '#6B7280' }}>{i + 1}</span>
                          <span className="text-[14px] font-bold text-[#1A1A2E]">{p.name}</span>
                          <span className="text-[14px] font-bold tabular-nums" style={{ color: '#4CAF50' }}>{p.final_score.toFixed(0)}점</span>
                          {p.grade && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{
                              backgroundColor: p.grade === GRADE_STRONG_PICK ? 'rgba(220,38,38,0.15)' : p.grade === GRADE_PICK ? 'rgba(234,88,12,0.15)' : 'rgba(107,114,128,0.15)',
                              color: p.grade === GRADE_STRONG_PICK ? '#DC2626' : p.grade === GRADE_PICK ? '#EA580C' : '#6B7280',
                            }}>{p.grade}</span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: zc.bg, color: zc.text }}>{p.fib_zone}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                            style={{ backgroundColor: p.nxt_tradable ? 'rgba(74,144,217,0.15)' : 'rgba(136,136,136,0.15)', color: p.nxt_tradable ? '#4A90D9' : '#888' }}>
                            {p.nxt_tradable ? '통합' : 'KRX'}
                          </span>
                          <span className="text-[12px] font-bold text-[#1A1A2E] ml-auto tabular-nums">{fmtP(p.close)}원 <span className="text-[10px] text-[#9CA3AF] font-normal">({fmtBaseDate(p.date)} 기준)</span></span>
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                          <div><span className="text-[#9CA3AF]">하락률</span> <span className="font-bold tabular-nums text-[#2563EB]">{(p.drop_pct ?? 0).toFixed(1)}%</span></div>
                          <div><span className="text-[#9CA3AF]">RSI</span> <span className="font-bold tabular-nums">{(p.rsi ?? 0).toFixed(0)}</span></div>
                          <div><span className="text-[#9CA3AF]">거래량</span> <span className="font-bold tabular-nums">{(p.vol_ratio ?? 0).toFixed(1)}x</span></div>
                          <div><span className="text-[#9CA3AF]">수급</span> <span className="font-bold tabular-nums" style={{ color: '#4CAF50' }}>{p.supply_score.toFixed(0)}</span></div>
                          {p.foreign_turn && <div><span className="text-[10px] font-bold text-[#2563EB]">외인 양전환</span></div>}
                          {p.inst_turn && <div><span className="text-[10px] font-bold text-[#EA580C]">기관 양전환</span></div>}
                        </div>
                      </div>
                    )
                  })}
                  {bottomPicks.length > 3 && (
                    <button onClick={() => setShowAllBottom(!showAllBottom)}
                      className="w-full py-2 rounded-lg border border-[#E8E6E0] bg-[#F9F8F6] text-[13px] font-bold text-[#6B7280] hover:bg-[#F0EFEB] transition-colors">
                      {showAllBottom ? '접기' : `${bottomPicks.length - 3}개 더보기`}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-[#9CA3AF] py-6 text-center">바닥 반등 종목 없음</p>
              )}
            </div>
          </div>

          {/* Box 2.5: 피보나치 매수 적기 */}
          {(() => {
            const fibPicks = jarvis?.fib_entry_picks ?? []
            if (fibPicks.length === 0) return null
            const shown = fibPicks.slice(0, 5)
            const rest = fibPicks.length - 5
            return (
              <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
                style={{ borderLeft: '3px solid #FFD700' }}>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[15px] font-bold text-[#1A1A2E]">📐 피보나치 매수 적기</h3>
                    <span className="text-[12px] font-bold tabular-nums" style={{ color: '#B8860B' }}>{fibPicks.length}종목</span>
                  </div>
                  <p className="text-[10px] text-[#6B7280] mb-3">RSI 과매도 + 수급 유입 동시 충족 | D+5 +2.97%, 승률 61.9%</p>
                  <div className="space-y-2">
                    {shown.map((p) => (
                      <div key={p.code} className="flex items-center gap-2 flex-wrap text-[12px] px-3 py-2 rounded-lg" style={{ backgroundColor: '#FFFBEB' }}>
                        <span className="font-bold" style={{ color: '#B8860B' }}>★</span>
                        <Link href={`/stock/${p.code}`} className="font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">{p.name}</Link>
                        <span className="font-bold text-[#1A1A2E] tabular-nums">{fmtP(p.price)}원</span>
                        {displayDate && <span className="text-[9px] text-[#9CA3AF]">({fmtBaseDate(displayDate)} 기준)</span>}
                        <span className="text-[11px] text-[#6B7280]">RSI <strong className="text-[#DC2626]">{(p.rsi ?? 0).toFixed(0)}</strong></span>
                        {(p.foreign_net ?? 0) !== 0 && <span className="text-[11px] text-[#6B7280]">외인 <strong className="text-[#2563EB]">{p.foreign_net > 0 ? '+' : ''}{p.foreign_net.toFixed(0)}억</strong></span>}
                        {(p.inst_net ?? 0) !== 0 && <span className="text-[11px] text-[#6B7280]">기관 <strong className="text-[#EA580C]">{p.inst_net > 0 ? '+' : ''}{p.inst_net.toFixed(0)}억</strong></span>}
                      </div>
                    ))}
                    {rest > 0 && <p className="text-[11px] text-[#9CA3AF] text-center">외 {rest}종목</p>}
                  </div>
                  <button onClick={() => setTab('bluechip')} className="mt-3 text-[11px] font-bold text-[#B8860B] hover:underline">
                    피보나치 페이지에서 상세 보기 →
                  </button>
                </div>
              </div>
            )
          })()}

          {/* Box 3: 내일의 ETF 전략 */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
            style={{ borderLeft: '3px solid #2196F3' }}>
            <div className="px-5 py-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-0.5">내일의 ETF 전략</h3>
              <p className="text-[10px] text-[#6B7280] mb-3">Brain + Shield 기반 방향성 전략</p>
              {etfStrategy ? (() => {
                const dir = etfStrategy.direction ?? 'NEUTRAL'
                const showBull = dir === 'BULL' || dir === 'NEUTRAL'
                const showBear = dir === 'BEAR' || dir === 'NEUTRAL'
                const shieldColor: Record<string, string> = { GREEN: '#16A34A', YELLOW: '#F59E0B', RED: '#DC2626' }
                const safeArr = (v: unknown): EtfItem[] => Array.isArray(v) ? v : []
                const bullEtfs = safeArr(etfStrategy.bull_etfs)
                const bearEtfs = safeArr(etfStrategy.bear_etfs)
                const safeEtfs = safeArr(etfStrategy.safe_etfs)
                return (
                  <>
                    {/* 상태 배지 */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded"
                        style={{ backgroundColor: dir === 'BULL' ? 'rgba(22,163,74,0.15)' : dir === 'BEAR' ? 'rgba(220,38,38,0.15)' : 'rgba(107,114,128,0.15)',
                          color: dir === 'BULL' ? '#16A34A' : dir === 'BEAR' ? '#DC2626' : '#6B7280' }}>
                        {dir === 'BULL' ? '상승 방향' : dir === 'BEAR' ? '하락 방향' : '중립'}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded"
                        style={{ backgroundColor: `${shieldColor[etfStrategy.shield] ?? '#6B7280'}22`, color: shieldColor[etfStrategy.shield] ?? '#6B7280' }}>
                        Shield {etfStrategy.shield}
                      </span>
                      {etfStrategy.regime && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-gray-100 text-[#6B7280]">{etfStrategy.regime}</span>
                      )}
                      {etfStrategy.contrarian && (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded" style={{ backgroundColor: 'rgba(255,87,34,0.15)', color: '#FF5722' }}>역발상</span>
                      )}
                      {etfStrategy.vix > 0 && <span className="text-[11px] text-[#9CA3AF]">VIX {etfStrategy.vix.toFixed(1)}</span>}
                    </div>

                    {/* ETF 리스트 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {showBull && bullEtfs.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-[#16A34A] mb-1.5">오를 때 ETF</p>
                          <div className="space-y-1">
                            {bullEtfs.map((e) => (
                              <div key={e.ticker} className={`flex items-center gap-2 text-[12px] px-2 py-1.5 rounded ${dir === 'BULL' ? 'bg-green-50' : ''}`}>
                                <span className="font-bold text-[#1A1A2E] truncate">{e.name}</span>
                                {e.desc && <span className="text-[10px] text-[#9CA3AF] shrink-0">{e.desc}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {showBear && bearEtfs.length > 0 && (
                        <div>
                          <p className="text-[11px] font-bold text-[#DC2626] mb-1.5">내릴 때 ETF</p>
                          <div className="space-y-1">
                            {bearEtfs.map((e) => (
                              <div key={e.ticker} className={`flex items-center gap-2 text-[12px] px-2 py-1.5 rounded ${dir === 'BEAR' ? 'bg-red-50' : ''}`}>
                                <span className="font-bold text-[#1A1A2E] truncate">{e.name}</span>
                                {e.desc && <span className="text-[10px] text-[#9CA3AF] shrink-0">{e.desc}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 안전자산 (중립일 때) */}
                    {dir === 'NEUTRAL' && safeEtfs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[11px] font-bold text-[#F59E0B] mb-1.5">안전자산 ETF</p>
                        <div className="flex flex-wrap gap-2">
                          {safeEtfs.map((e) => (
                            <span key={e.ticker} className="text-[11px] font-bold px-2.5 py-1 rounded bg-amber-50 text-[#92400E]">{e.name}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 메시지 */}
                    {etfStrategy.message && (
                      <div className="mt-4 pt-3 border-t border-[#F5F4F0]">
                        <p className="text-[14px] font-bold text-[#1A1A2E] leading-relaxed">{etfStrategy.message}</p>
                      </div>
                    )}
                  </>
                )
              })() : (
                <p className="text-[13px] text-[#9CA3AF] py-6 text-center">ETF 전략 데이터 준비 중</p>
              )}
            </div>
          </div>

          {/* 왜 사야 하나? — 근거 모음 (2x2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 섹터 온도 */}
            <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">섹터 온도</h3>
              {sectorHeat.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {sectorHeat.map((s) => {
                    const c = TEMP_CFG[s.temperature] ?? TEMP_CFG.COOL
                    return (
                      <span key={s.sector} className="text-[11px] font-bold px-2.5 py-1 rounded-md"
                        style={{ backgroundColor: c.bg, color: c.text }}>
                        {s.sector} {s.ret_5d >= 0 ? '+' : ''}{s.ret_5d.toFixed(1)}%
                      </span>
                    )
                  })}
                </div>
              ) : <p className="text-[12px] text-[#9CA3AF]">섹터 데이터 준비 중</p>}
            </div>

            {/* 스마트 머니 쌍끌이 TOP 3 */}
            <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">스마트 머니 쌍끌이 TOP 3</h3>
              {dualTop3.length > 0 ? (
                <div className="space-y-2">
                  {dualTop3.map((m) => (
                    <div key={m.ticker} className="flex items-center gap-2 text-[12px]">
                      <span className="font-bold text-[#1A1A2E] truncate flex-1">{m.name && !/^\d{5,6}$/.test(m.name) ? m.name : m.ticker}</span>
                      {m.inst_5d_억 !== 0 && <span className="text-[#EA580C] font-bold shrink-0">기관{m.inst_5d_억 > 0 ? '+' : ''}{m.inst_5d_억.toFixed(0)}억</span>}
                      {m.foreign_5d_억 !== 0 && <span className="text-[#2563EB] font-bold shrink-0">외인{m.foreign_5d_억 > 0 ? '+' : ''}{m.foreign_5d_억.toFixed(0)}억</span>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-[12px] text-[#9CA3AF]">쌍끌이 종목 없음</p>}
            </div>

            {/* 오늘 폭발 TOP 3 */}
            <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">오늘 폭발 TOP 3</h3>
              {volTop3.length > 0 ? (
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] font-bold text-[#EA580C] mb-1">거래량 폭발</p>
                    {volTop3.map((v) => (
                      <div key={v.code} className="flex items-center gap-2 text-[12px]">
                        <span className="font-bold text-[#1A1A2E] truncate flex-1">{v.name}</span>
                        <span className="font-bold tabular-nums shrink-0" style={{ color: v.change_pct >= 0 ? '#DC2626' : '#2563EB' }}>
                          {v.change_pct >= 0 ? '+' : ''}{v.change_pct.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                  {fgnTop3.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-[#2563EB] mb-1">외인 순매수</p>
                      {fgnTop3.map((v) => (
                        <div key={v.code} className="flex items-center gap-2 text-[12px]">
                          <span className="font-bold text-[#1A1A2E] truncate flex-1">{v.name}</span>
                          <span className="font-bold tabular-nums text-[#2563EB] shrink-0">
                            {v.frgn_amt_억 != null ? `+${v.frgn_amt_억.toFixed(0)}억` : `${fmtP(v.volume)}주`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : <p className="text-[12px] text-[#9CA3AF]">순위 데이터 준비 중</p>}
            </div>

            {/* 대형주 건강 체크 */}
            <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">대형주 건강 체크</h3>
              {bluechip ? (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    {['A', 'B', 'C', 'D'].map((g) => (
                      <div key={g} className="text-center">
                        <span className="text-[18px] font-black tabular-nums text-[#1A1A2E]">{gc[g] ?? 0}</span>
                        <span className="text-[10px] font-bold block" style={{
                          color: g === 'A' ? '#16A34A' : g === 'B' ? '#2563EB' : g === 'C' ? '#EA580C' : '#9CA3AF'
                        }}>{g}등급</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] font-bold text-[#1A1A2E] mb-2">{bcVerdict}</p>
                  <button onClick={() => setTab('bluechip')} className="text-[11px] font-bold text-[#7C3AED] hover:underline">
                    대형주 점검 탭으로 →
                  </button>
                </>
              ) : <p className="text-[12px] text-[#9CA3AF]">대형주 데이터 준비 중</p>}
            </div>
          </div>

          {/* ══════ ZONE C: 3분 심층 (아코디언) ══════ */}
          <div className="space-y-1">
            <Accordion id="smart" title="스마트 머니 추적 — 기관+외인이 뭘 사고 있나?" open={openAcc === 'smart'} onToggle={toggleAcc}>
              <AlphaSmartMoney
                dualBuy={data?.smart_money?.dual_buy ?? []}
                instTop={data?.smart_money?.inst_top ?? []}
                fgnTop={data?.smart_money?.fgn_top ?? []}
              />
            </Accordion>


          </div>
        </div>
      )}

      {tab === 'crash' && <CrashBounceView />}
      {tab === 'bluechip' && <BluechipInspectionTab bluechip={bluechip} />}
      {tab === 'smallcap' && <SmallcapThemeTab bluechip={bluechip} />}
      {tab === 'sector' && <SectorRotationView />}
    </div>
  )
}
