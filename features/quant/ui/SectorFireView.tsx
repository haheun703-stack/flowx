'use client'

import { useEffect, useState, useCallback } from 'react'

/* ── 타입 ── */
interface SectorFire {
  sector: string
  fire_score: number
  fire_grade: string
  flow_score: number
  inflection_score: number
  rhythm_score: number
  energy_score: number
  overheat_penalty: number
  fgn_5d: number
  inst_5d: number
  pension_5d: number
  fgn_reversal: number
  inst_reversal: number
  ma20_avg_dev: number
  rsi_avg: number
  vol_ratio_avg: number
  etf_code: string | null
  etf_name: string | null
  leverage_etf_code: string | null
  leverage_etf_name: string | null
  etf_recommend: string
}

interface SectorPick {
  sector: string
  ticker: string
  name: string
  close: number
  chg_1d: number
  buy_score: number
  buy_grade: string
  ma20_dev: number
  rsi: number
  vol_ratio: number
  fgn_5d: number
  inst_5d: number
  pension_5d: number
  fgn_reversal: number
  inst_reversal: number
  fgn_streak: number
  surge_type: string | null
  buy_reasons: string
}

/* ── 등급 색상 ── */
const GRADE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  S: { label: '최강 발화', color: '#FF4444', bg: 'rgba(255,68,68,0.2)' },
  A: { label: '강한 발화', color: '#FF8C00', bg: 'rgba(255,140,0,0.2)' },
  B: { label: '관심', color: '#F59E0B', bg: 'rgba(245,158,11,0.2)' },
  C: { label: '약세', color: '#64748B', bg: 'rgba(100,116,139,0.2)' },
  D: { label: '비활성', color: '#334155', bg: 'rgba(51,65,85,0.2)' },
}

const BUY_GRADE_CONFIG: Record<string, { label: string; color: string }> = {
  STRONG: { label: '강력', color: '#FF4444' },
  BUY: { label: 'BUY', color: '#FF8C00' },
  WATCH: { label: 'WATCH', color: '#64748B' },
}

function gaugeColor(score: number): string {
  if (score >= 80) return '#FF4444'
  if (score >= 60) return '#FF8C00'
  if (score >= 40) return '#F59E0B'
  return '#94a3b8'
}

function flowFmt(v: number): string {
  const sign = v >= 0 ? '+' : ''
  return `${sign}${Math.round(v).toLocaleString()}`
}

function flowClr(v: number): string {
  if (v > 0) return '#00ff88'
  if (v < 0) return '#ff3b5c'
  return '#6B7280'
}

function priceFmt(v: number): string {
  return v.toLocaleString()
}

function retClr(v: number): string {
  if (v > 0) return '#DC2626'
  if (v < 0) return '#2563EB'
  return '#6B7280'
}

/* ── FIRE 미니바 ── */
function FireBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="w-[50px] text-[#6B7280] font-medium">{label}</span>
      <div className="flex-1 h-[7px] bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: gaugeColor((value / max) * 100) }}
        />
      </div>
      <span className="w-[30px] text-right tabular-nums text-[#1A1A2E] font-bold">{Math.round(value)}</span>
    </div>
  )
}

/* ── 섹터 카드 ── */
function SectorCard({ s, isSelected, onClick }: { s: SectorFire; isSelected: boolean; onClick: () => void }) {
  const gc = GRADE_CONFIG[s.fire_grade] ?? GRADE_CONFIG.D
  const gaugePct = Math.max(0, Math.min(100, s.fire_score))

  return (
    <div
      className={`rounded-xl border-2 bg-white p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-[#FF6B35] shadow-lg' : 'border-[#e5e7ef] hover:border-[#FF6B35]/50'
      }`}
      onClick={onClick}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[16px] font-bold text-[#1A1A2E]">{s.sector}</span>
        <span className="text-[24px] font-black tabular-nums" style={{ color: gc.color }}>
          {Math.round(s.fire_score)}
        </span>
      </div>

      {/* 게이지 바 + 등급 */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-[8px] bg-[#f0f0f0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${gaugePct}%`, background: `linear-gradient(90deg, #F59E0B, ${gc.color})` }}
          />
        </div>
        <span
          className="text-[12px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap"
          style={{ color: gc.color, background: gc.bg }}
        >
          {gc.label}
        </span>
      </div>

      {/* FIRE 4요소 */}
      <div className="space-y-1 mb-3">
        <FireBar label="F 흐름" value={s.flow_score} max={25} />
        <FireBar label="I 반전" value={s.inflection_score} max={20} />
        <FireBar label="R 리듬" value={s.rhythm_score} max={15} />
        <FireBar label="E 에너지" value={s.energy_score} max={25} />
      </div>

      {s.overheat_penalty < 0 && (
        <div className="text-[12px] text-[#FF4444] font-bold mb-2">
          과열 감산 {s.overheat_penalty.toFixed(0)}
        </div>
      )}

      {/* 수급 */}
      <div className="grid grid-cols-3 gap-1 text-[13px] mb-2">
        <div>
          <span className="text-[#9ca3b8]">외인</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.fgn_5d) >= 100 ? 'text-[15px]' : ''}`} style={{ color: flowClr(s.fgn_5d) }}>
            {flowFmt(s.fgn_5d)}
          </div>
        </div>
        <div>
          <span className="text-[#9ca3b8]">기관</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.inst_5d) >= 100 ? 'text-[15px]' : ''}`} style={{ color: flowClr(s.inst_5d) }}>
            {flowFmt(s.inst_5d)}
          </div>
        </div>
        <div>
          <span className="text-[#9ca3b8]">연기금</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.pension_5d) >= 100 ? 'text-[15px]' : ''}`} style={{ color: flowClr(s.pension_5d) }}>
            {flowFmt(s.pension_5d)}
          </div>
        </div>
      </div>

      {/* 기술 지표 */}
      <div className="flex items-center gap-3 text-[13px] text-[#6B7280] mb-2">
        <span>MA20 <b className="text-[#1A1A2E]">{s.ma20_avg_dev >= 0 ? '+' : ''}{s.ma20_avg_dev.toFixed(1)}%</b></span>
        <span>RSI <b className="text-[#1A1A2E]">{Math.round(s.rsi_avg)}</b></span>
      </div>

      {/* ETF 추천 */}
      {s.etf_code && s.etf_name && (
        <div className="border-t border-[#f0f0f0] pt-2 mt-1">
          <a
            href={`https://finance.naver.com/item/main.naver?code=${s.etf_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[13px] text-[#2563EB] hover:underline"
            onClick={e => e.stopPropagation()}
          >
            📈 {s.etf_name}
          </a>
          {s.leverage_etf_code && s.leverage_etf_name && (
            <a
              href={`https://finance.naver.com/item/main.naver?code=${s.leverage_etf_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-[#FF4444] hover:underline ml-2"
              onClick={e => e.stopPropagation()}
            >
              🔥 {s.leverage_etf_name}
            </a>
          )}
          {s.etf_recommend && (
            <div className="text-[12px] text-[#6B7280] mt-0.5">{s.etf_recommend}</div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── 메인 뷰 ── */
export default function SectorFireView() {
  const [sectors, setSectors] = useState<SectorFire[]>([])
  const [picks, setPicks] = useState<SectorPick[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState<string | null>(null)
  const [expandedTicker, setExpandedTicker] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()
    Promise.all([
      fetch('/api/sector-fire', { signal: ac.signal }).then(r => r.json()),
      fetch('/api/sector-picks', { signal: ac.signal }).then(r => r.json()),
    ])
      .then(([fireRes, picksRes]) => {
        setSectors(Array.isArray(fireRes.data) ? fireRes.data : [])
        setPicks(Array.isArray(picksRes.data) ? picksRes.data : [])
        setDate(fireRes.date ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const filteredPicks = selectedSector
    ? picks.filter(p => p.sector === selectedSector)
    : picks

  const handleSectorClick = useCallback((sector: string) => {
    setSelectedSector(prev => prev === sector ? null : sector)
    setExpandedTicker(null)
  }, [])

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-[#f0f0f0] rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-[280px] bg-[#f0f0f0] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (sectors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[#6B7280]">섹터 발화 데이터가 아직 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">매일 장 마감 후 자동 갱신됩니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-black text-[#1A1A2E]">SECTOR FIRE</h2>
          {date && <span className="text-[12px] text-[#9ca3b8]">{date}</span>}
        </div>
        <p className="text-[12px] text-[#6B7280] mt-0.5">돈의 흐름으로 읽는 다음 발화 섹터</p>
      </div>

      {/* 섹션 1: 섹터 카드 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sectors.map(s => (
          <SectorCard
            key={s.sector}
            s={s}
            isSelected={selectedSector === s.sector}
            onClick={() => handleSectorClick(s.sector)}
          />
        ))}
      </div>

      {/* 섹션 2: 종목 매수 후보 테이블 */}
      <div className="rounded-xl border border-[#e5e7ef] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[#e5e7ef]">
          <div className="flex items-center gap-2">
            <h3 className="text-[15px] font-bold text-[#1A1A2E]">🔥 발화 섹터 종목 — 매수 후보</h3>
            {selectedSector && (
              <span className="text-[12px] font-bold px-2 py-0.5 rounded-md bg-[#FF6B35]/10 text-[#FF6B35]">
                {selectedSector}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedSector && (
              <button
                onClick={() => { setSelectedSector(null); setExpandedTicker(null) }}
                className="text-[11px] px-2 py-1 rounded bg-[#f0f0f0] text-[#6B7280] hover:bg-[#e5e7ef]"
              >
                전체 보기
              </button>
            )}
            <span className="text-[12px] text-[#9ca3b8]">{filteredPicks.length}종목</span>
          </div>
        </div>

        <div className="overflow-x-auto table-scroll">
          <table className="w-full text-[12px] min-w-[800px]">
            <thead>
              <tr className="bg-[#F5F4F0] border-b border-[#e5e7ef]">
                <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">섹터</th>
                <th className="text-left py-2.5 px-2 font-bold text-[#1A1A2E]">종목</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">종가</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">등락</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">점수</th>
                <th className="text-center py-2.5 px-2 font-bold text-[#1A1A2E]">등급</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">MA20</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">RSI</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">외5d</th>
                <th className="text-right py-2.5 px-2 font-bold text-[#1A1A2E]">기5d</th>
                <th className="text-left py-2.5 px-2 font-bold text-[#1A1A2E]">근거</th>
              </tr>
            </thead>
            <tbody>
              {filteredPicks.map(p => {
                const bg = BUY_GRADE_CONFIG[p.buy_grade]
                const isExpanded = expandedTicker === p.ticker
                return (
                  <tr key={p.ticker} className="group">
                    <td colSpan={11} className="p-0">
                      <div
                        className="grid items-center border-b border-[#e5e7ef]/50 hover:bg-[#FFF7ED] cursor-pointer transition-colors"
                        style={{ gridTemplateColumns: 'auto 1fr repeat(9, auto)', padding: '8px 0' }}
                        onClick={() => setExpandedTicker(isExpanded ? null : p.ticker)}
                      >
                        <div className="text-left px-3 text-[#6B7280]">{p.sector}</div>
                        <div className="text-left px-2">
                          <span className="font-bold text-[#1A1A2E]">{p.name}</span>
                          <span className="text-[10px] text-[#9ca3b8] ml-1">{p.ticker}</span>
                        </div>
                        <div className="text-right px-2 tabular-nums text-[#1A1A2E]">{priceFmt(p.close)}</div>
                        <div className="text-right px-2 tabular-nums font-bold" style={{ color: retClr(p.chg_1d) }}>
                          {p.chg_1d >= 0 ? '+' : ''}{p.chg_1d.toFixed(1)}%
                        </div>
                        <div className="text-right px-2 tabular-nums font-bold text-[#1A1A2E]">{Math.round(p.buy_score)}</div>
                        <div className="text-center px-2">
                          {bg && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: bg.color, background: `${bg.color}20` }}>
                              {bg.label}
                            </span>
                          )}
                        </div>
                        <div className="text-right px-2 tabular-nums text-[#6B7280]">
                          {p.ma20_dev >= 0 ? '+' : ''}{p.ma20_dev.toFixed(1)}%
                        </div>
                        <div className="text-right px-2 tabular-nums text-[#6B7280]">{Math.round(p.rsi)}</div>
                        <div className="text-right px-2 tabular-nums font-bold" style={{ color: flowClr(p.fgn_5d) }}>
                          {flowFmt(p.fgn_5d)}
                        </div>
                        <div className="text-right px-2 tabular-nums font-bold" style={{ color: flowClr(p.inst_5d) }}>
                          {flowFmt(p.inst_5d)}
                        </div>
                        <div className="text-left px-2 text-[#6B7280] truncate max-w-[120px]">{p.buy_reasons}</div>
                      </div>
                      {/* 확장 상세 */}
                      {isExpanded && (
                        <div className="bg-[#FFF7ED] px-4 py-3 border-b border-[#e5e7ef] text-[11px] space-y-1">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                              <span className="text-[#9ca3b8]">외인 반전</span>
                              <div className="font-bold" style={{ color: flowClr(p.fgn_reversal) }}>{flowFmt(p.fgn_reversal)}억</div>
                            </div>
                            <div>
                              <span className="text-[#9ca3b8]">기관 반전</span>
                              <div className="font-bold" style={{ color: flowClr(p.inst_reversal) }}>{flowFmt(p.inst_reversal)}억</div>
                            </div>
                            <div>
                              <span className="text-[#9ca3b8]">외인 연속매수</span>
                              <div className="font-bold text-[#1A1A2E]">{p.fgn_streak}일</div>
                            </div>
                            <div>
                              <span className="text-[#9ca3b8]">수급포착 유형</span>
                              <div className="font-bold text-[#1A1A2E]">{p.surge_type ?? '미포착'}</div>
                            </div>
                          </div>
                          <div>
                            <span className="text-[#9ca3b8]">연기금 5일</span>
                            <span className="font-bold ml-1" style={{ color: flowClr(p.pension_5d) }}>{flowFmt(p.pension_5d)}억</span>
                            <span className="text-[#9ca3b8] ml-3">거래량배수</span>
                            <span className="font-bold text-[#1A1A2E] ml-1">{p.vol_ratio.toFixed(1)}x</span>
                          </div>
                          {p.buy_reasons && (
                            <div>
                              <span className="text-[#9ca3b8]">매수 근거: </span>
                              <span className="text-[#1A1A2E]">{p.buy_reasons}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
