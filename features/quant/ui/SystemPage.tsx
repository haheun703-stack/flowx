'use client'

import { useEffect, useState } from 'react'
import CrashBounceView from './CrashBounceView'
import AlphaSmartMoney from './AlphaSmartMoney'
import AlphaPortfolio from './AlphaPortfolio'
import MarketRankingPanel, { type MarketRankingData } from '@/features/market-summary/ui/MarketRankingPanel'
import { type BluechipCheckupData } from './BluechipCheckupPanel'
import SectorRotationView from '@/features/swing/ui/SectorRotationView'
import type { AlphaScannerData } from './alpha-types'
import { GRADE_BADGE_CLASS } from '@/shared/constants/grades'
import BluechipInspectionTab from './BluechipInspectionTab'
import SmallcapThemeTab from './SmallcapThemeTab'

/* ── Jarvis Types ── */
interface PickItem {
  ticker: string; name: string; grade: string; total_score: number
  sources: string[]; n_sources: number; close: number; rsi: number
  stoch_k: number; foreign_5d: number; inst_5d: number; reasons: string[]
  entry_price?: number; stop_loss?: number; target_price?: number
  entry_info?: { entry: number; stop: number; target: number }
}

interface KillerEtf {
  rank: number; ticker: string; name: string
  category?: string; signal?: string; action?: string; sizing?: string
}

interface JarvisData {
  picks?: { picks?: PickItem[] } | null
  brain?: Record<string, unknown> | null
  etf_picks?: {
    regime?: string
    allocation?: Record<string, number>
    accelerations?: { sector: string; rank_change: number; score: number; ret_5d: number }[]
  } | null
  killer_picks?: { etf_top5?: KillerEtf[] } | null
  date?: string | null
}

interface NuggetItem {
  code: string; name: string; grade: string; total_score: number
  entry_price: number; stop_loss: number; target_price: number
  holding_days: number; momentum_regime: string
}

/* ── Constants ── */
const TABS = [
  { key: 'quant', label: '퀀트시스템' },
  { key: 'crash', label: '급락반등' },
  { key: 'bluechip', label: '대형주 점검' },
  { key: 'smallcap', label: '소형주 테마' },
  { key: 'sector', label: '섹터 로테이션' },
] as const

type TabKey = (typeof TABS)[number]['key']

const NUGGET_BADGE: Record<string, { bg: string; text: string }> = {
  GOLD: { bg: 'rgba(255,215,0,0.2)', text: '#92400E' },
  SILVER: { bg: 'rgba(192,192,192,0.2)', text: '#6B7280' },
  BRONZE: { bg: 'rgba(205,127,50,0.2)', text: '#78350F' },
}

const RANK_COLOR = ['#DC2626', '#EF4444', '#F59E0B', '#6B7280', '#6B7280']

const TEMP_CFG: Record<string, { bg: string; text: string }> = {
  HOT: { bg: '#DC2626', text: '#fff' },
  WARM: { bg: '#EA580C', text: '#fff' },
  COOL: { bg: '#3B82F6', text: '#fff' },
  COLD: { bg: '#9CA3AF', text: '#fff' },
}

const fmtP = (v: number) => v.toLocaleString('ko-KR')

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
  const [nuggets, setNuggets] = useState<NuggetItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('quant')
  const [openAcc, setOpenAcc] = useState<string | null>(null)
  const [showAllPicks, setShowAllPicks] = useState(false)

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
          fetch('/api/intelligence/value-hunter', { signal: sig }),
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
          const j = await r[4].value.json(); setNuggets(j.items ?? [])
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
  const picks = jarvis?.picks?.picks ?? []
  const sorted = [...picks].sort((a, b) => b.total_score - a.total_score)
  const top3 = sorted.slice(0, 3)
  const top5 = sorted.slice(0, 5)
  const restPicks = sorted.slice(5)
  const nug2 = [...nuggets].sort((a, b) => b.total_score - a.total_score).slice(0, 2)
  const etfs = jarvis?.killer_picks?.etf_top5 ?? []
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

          {/* ══════ ZONE A: 통합 추천 카드 ══════ */}
          <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm overflow-hidden"
            style={{ borderLeft: '3px solid #7C3AED' }}>
            <div className="px-5 py-4">
              <h2 className="text-[15px] font-bold text-[#1A1A2E] mb-0.5">이 종목을 반드시 주목합시다</h2>
              <p className="text-[10px] text-[#6B7280] mb-4">파워스코어 + 노다지 + ETF에서 뽑은 오늘의 핵심 추천</p>

              {/* 파워스코어 TOP 3 */}
              {top3.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-[#7C3AED] mb-2">종목 추천 (파워스코어 TOP 3)</p>
                  <div className="space-y-2.5">
                    {top3.map((p, i) => {
                      const entry = p.entry_info?.entry ?? p.entry_price ?? 0
                      return (
                        <div key={p.ticker} className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5"
                            style={{ backgroundColor: RANK_COLOR[i] }}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px] font-bold text-[#1A1A2E]">{p.name}</span>
                              <span className="text-[16px] font-bold tabular-nums" style={{ color: '#7C3AED' }}>{p.total_score}점</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${GRADE_BADGE_CLASS[p.grade] ?? 'bg-gray-200 text-gray-600'}`}>{p.grade}</span>
                              {entry > 0 && <span className="text-[12px] font-bold text-[#1A1A2E] ml-auto tabular-nums">진입 {fmtP(entry)}원</span>}
                            </div>
                            {p.reasons.length > 0 && <p className="text-[10px] text-[#6B7280] mt-0.5">{p.reasons.slice(0, 3).join(' + ')}</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 노다지 TOP 2 */}
              {nug2.length > 0 && (
                <div className="mb-4">
                  <p className="text-[11px] font-bold text-[#92400E] mb-2">저평가 발굴 (노다지 TOP 2)</p>
                  <div className="space-y-2">
                    {nug2.map((n) => {
                      const badge = NUGGET_BADGE[n.grade] ?? NUGGET_BADGE.BRONZE
                      return (
                        <div key={n.code} className="flex items-center gap-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                            style={{ backgroundColor: badge.bg, color: badge.text }}>{n.grade}</span>
                          <span className="text-[14px] font-bold text-[#1A1A2E]">{n.name}</span>
                          <span className="text-[13px] font-bold tabular-nums" style={{ color: '#92400E' }}>{n.total_score.toFixed(1)}점</span>
                          {n.entry_price > 0 && <span className="text-[12px] font-bold text-[#1A1A2E] ml-auto tabular-nums">진입 {fmtP(n.entry_price)}원</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ETF 추천 */}
              {etfs.length > 0 && (
                <div className="mb-3">
                  <p className="text-[11px] font-bold text-[#2563EB] mb-2">ETF 추천</p>
                  <div className="grid grid-cols-2 gap-2">
                    {etfs.slice(0, 4).map((e) => (
                      <div key={e.ticker} className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-bold text-[#1A1A2E] truncate">{e.name}</span>
                        {e.action && (
                          <span className={`shrink-0 px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            e.action.includes('FULL') || e.action.includes('BUY') ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                          }`}>{e.sizing ?? e.action}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(top3.length > 0 || nug2.length > 0) && (
                <p className="text-[10px] text-[#9CA3AF] pt-2 border-t border-[#F5F4F0]">
                  위 추천은 AI 분석 참고 자료이며 투자 조언이 아닙니다
                </p>
              )}
              {top3.length === 0 && nug2.length === 0 && (
                <p className="text-[13px] text-[#9CA3AF] py-4 text-center">추천 데이터 준비 중</p>
              )}
            </div>
          </div>

          {/* ══════ ZONE B: 30초 분석 ══════ */}

          {/* 파워스코어 TOP 5 */}
          {top5.length > 0 && (
            <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4">
              <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-3">파워스코어 TOP 5</h3>
              <div className="space-y-2">
                {top5.map((p, i) => {
                  const entry = p.entry_info?.entry ?? p.entry_price ?? 0
                  const stop = p.entry_info?.stop ?? p.stop_loss ?? 0
                  const target = p.entry_info?.target ?? p.target_price ?? 0
                  return (
                    <div key={p.ticker} className="border border-[#F0EDE8] rounded-lg p-3">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ backgroundColor: RANK_COLOR[i] ?? '#6B7280' }}>{i + 1}</span>
                        <span className="text-[14px] font-bold text-[#1A1A2E]">{p.name}</span>
                        <span className="text-[14px] font-bold tabular-nums" style={{ color: '#7C3AED' }}>{p.total_score}점</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${GRADE_BADGE_CLASS[p.grade] ?? 'bg-gray-200 text-gray-600'}`}>{p.grade}</span>
                      </div>
                      {i < 3 ? (
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                          {entry > 0 && <div><span className="text-[#9CA3AF]">진입</span> <span className="font-bold text-[#1A1A2E] tabular-nums">{fmtP(entry)}</span></div>}
                          {target > 0 && <div><span className="text-[#9CA3AF]">목표</span> <span className="font-bold text-[#16A34A] tabular-nums">{fmtP(target)}</span></div>}
                          {stop > 0 && <div><span className="text-[#9CA3AF]">손절</span> <span className="font-bold text-[#DC2626] tabular-nums">{fmtP(stop)}</span></div>}
                          <div><span className="text-[#9CA3AF]">RSI</span> <span className="font-bold tabular-nums">{p.rsi.toFixed(0)}</span></div>
                          <div><span className="text-[#9CA3AF]">외인5일</span> <span className={`font-bold tabular-nums ${p.foreign_5d > 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'}`}>{p.foreign_5d > 0 ? '+' : ''}{p.foreign_5d.toFixed(0)}</span></div>
                          <div><span className="text-[#9CA3AF]">기관5일</span> <span className={`font-bold tabular-nums ${p.inst_5d > 0 ? 'text-[#EA580C]' : 'text-[#DC2626]'}`}>{p.inst_5d > 0 ? '+' : ''}{p.inst_5d.toFixed(0)}</span></div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-[#6B7280]">{p.reasons.slice(0, 2).join(' + ')}</div>
                      )}
                    </div>
                  )
                })}
              </div>
              {restPicks.length > 0 && (
                <>
                  <button onClick={() => setShowAllPicks(!showAllPicks)}
                    className="w-full mt-3 py-2 text-[12px] font-bold text-[#7C3AED] hover:bg-[#F5F4F0] rounded-lg transition-colors">
                    {showAllPicks ? '접기 ▲' : `전체 ${sorted.length}종목 보기 ▼`}
                  </button>
                  {showAllPicks && (
                    <div className="space-y-1.5 mt-2">
                      {restPicks.map((p, i) => (
                        <div key={p.ticker} className="flex items-center gap-2 px-3 py-1.5 text-[12px] border-b border-[#F5F4F0]">
                          <span className="text-[#9CA3AF] w-5 tabular-nums">{i + 6}</span>
                          <span className="font-bold text-[#1A1A2E]">{p.name}</span>
                          <span className="font-bold tabular-nums" style={{ color: '#7C3AED' }}>{p.total_score}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${GRADE_BADGE_CLASS[p.grade] ?? 'bg-gray-200 text-gray-600'}`}>{p.grade}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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

            <Accordion id="nugget" title="노다지 리포트 — 5축 저평가 발굴 전체" open={openAcc === 'nugget'} onToggle={toggleAcc}>
              {nuggets.length > 0 ? (
                <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-4 space-y-2">
                  {nuggets.map((n) => {
                    const badge = NUGGET_BADGE[n.grade] ?? NUGGET_BADGE.BRONZE
                    return (
                      <div key={n.code} className="flex items-center gap-2 py-1.5 border-b border-[#F5F4F0] last:border-0 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0"
                          style={{ backgroundColor: badge.bg, color: badge.text }}>{n.grade}</span>
                        <span className="text-[13px] font-bold text-[#1A1A2E]">{n.name}</span>
                        <span className="text-[12px] font-bold tabular-nums" style={{ color: '#92400E' }}>{n.total_score.toFixed(1)}점</span>
                        <span className="text-[11px] text-[#1A1A2E] tabular-nums ml-auto">진입 {fmtP(n.entry_price)}</span>
                        <span className="text-[11px] text-[#DC2626] tabular-nums">손절 {fmtP(n.stop_loss)}</span>
                        <span className="text-[11px] text-[#16A34A] tabular-nums">목표 {fmtP(n.target_price)}</span>
                      </div>
                    )
                  })}
                </div>
              ) : <p className="text-[13px] text-[#9CA3AF] p-4">노다지 데이터 없음</p>}
            </Accordion>

            <Accordion id="portfolio" title="포트폴리오 배분 — 방어/공격 비율" open={openAcc === 'portfolio'} onToggle={toggleAcc}>
              <AlphaPortfolio
                defensePct={data?.portfolio?.defense_pct ?? 50}
                offensePct={data?.portfolio?.offense_pct ?? 50}
                allocation={data?.portfolio?.allocation ?? {}}
                etfPerformance={data?.etf_performance}
              />
            </Accordion>

            <Accordion id="ranking" title="시장 순위 — 거래량/급등/체결강도" open={openAcc === 'ranking'} onToggle={toggleAcc}>
              {ranking ? <MarketRankingPanel data={ranking} /> : <p className="text-[13px] text-[#9CA3AF] p-4">시장 순위 데이터 없음</p>}
            </Accordion>

            <Accordion id="crashbounce" title="바닥잡이 레이더 — 52주 신저가 근접" open={openAcc === 'crashbounce'} onToggle={toggleAcc}>
              <div className="text-center py-8 text-[#9CA3AF] text-[12px]">COMING SOON</div>
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
