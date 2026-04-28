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
  if (v > 0) return '#DC2626'
  if (v < 0) return '#2563EB'
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
  const ratio = max > 0 ? (value / max) * 100 : 0
  const pct = Math.max(0, Math.min(100, ratio))
  const isNegative = value < 0
  return (
    <div className="flex items-center gap-1.5 text-[13px]">
      <span className="w-[50px] text-[#6B7280] font-medium">{label}</span>
      <div className="flex-1 h-[7px] bg-[#f0f0f0] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: isNegative ? '#94a3b8' : gaugeColor(ratio) }}
        />
      </div>
      <span className={`w-[30px] text-right tabular-nums font-bold ${isNegative ? 'text-[#DC2626]' : 'text-[#1A1A2E]'}`}>{Math.round(value)}</span>
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
        <span className="text-[24px] font-bold tabular-nums" style={{ color: gc.color }}>
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
      <div className="grid grid-cols-3 gap-1 text-[15px] mb-3">
        <div>
          <span className="text-[13px] text-[#9ca3b8]">외인</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.fgn_5d) >= 100 ? 'text-[17px]' : ''}`} style={{ color: flowClr(s.fgn_5d) }}>
            {flowFmt(s.fgn_5d)}
          </div>
        </div>
        <div>
          <span className="text-[13px] text-[#9ca3b8]">기관</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.inst_5d) >= 100 ? 'text-[17px]' : ''}`} style={{ color: flowClr(s.inst_5d) }}>
            {flowFmt(s.inst_5d)}
          </div>
        </div>
        <div>
          <span className="text-[13px] text-[#9ca3b8]">연기금</span>
          <div className={`font-bold tabular-nums ${Math.abs(s.pension_5d) >= 100 ? 'text-[17px]' : ''}`} style={{ color: flowClr(s.pension_5d) }}>
            {flowFmt(s.pension_5d)}
          </div>
        </div>
      </div>

      {/* 기술 지표 */}
      <div className="flex items-center gap-3 text-[15px] text-[#6B7280] mb-3">
        <span>MA20 <b className="text-[#1A1A2E]">{s.ma20_avg_dev >= 0 ? '+' : ''}{s.ma20_avg_dev.toFixed(1)}%</b></span>
        <span>RSI <b className="text-[#1A1A2E]">{Math.round(s.rsi_avg)}</b></span>
      </div>

      {/* ETF 추천 */}
      {s.etf_code && s.etf_name && (
        <div className="border-t border-[#f0f0f0] pt-3 mt-1">
          <a
            href={`https://finance.naver.com/item/main.naver?code=${s.etf_code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] text-[#2563EB] hover:underline"
            onClick={e => e.stopPropagation()}
          >
            📈 {s.etf_name}
          </a>
          {s.leverage_etf_code && s.leverage_etf_name && (
            <a
              href={`https://finance.naver.com/item/main.naver?code=${s.leverage_etf_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] text-[#FF4444] hover:underline ml-2"
              onClick={e => e.stopPropagation()}
            >
              🔥 {s.leverage_etf_name}
            </a>
          )}
          {s.etf_recommend && (
            <div className="text-[14px] text-[#6B7280] mt-1">{s.etf_recommend}</div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── FIRE 등급별 카드 테두리 ── */
const FIRE_CARD_STYLE: Record<string, { border: string; bg: string }> = {
  S: { border: '#FF4444', bg: 'rgba(255,68,68,0.05)' },
  A: { border: '#FF6B35', bg: 'rgba(255,107,53,0.05)' },
  B: { border: '#FFB347', bg: 'rgba(255,179,71,0.03)' },
  C: { border: '#999999', bg: 'transparent' },
}

type GradeFilter = 'ALL' | 'STRONG' | 'BUY' | 'WATCH'

/* ── 섹터 종목 카드 (그룹) ── */
function SectorPicksCard({ fire, picks: cardPicks }: { fire: SectorFire; picks: SectorPick[] }) {
  const gc = GRADE_CONFIG[fire.fire_grade] ?? GRADE_CONFIG.D
  const cs = FIRE_CARD_STYLE[fire.fire_grade] ?? FIRE_CARD_STYLE.C

  return (
    <div
      className="rounded-xl border-2 overflow-hidden"
      style={{ borderColor: cs.border, background: cs.bg }}
    >
      {/* 카드 헤더 */}
      <div className="px-5 py-4 border-b" style={{ borderColor: `${cs.border}30` }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[18px] font-bold text-[#1A1A2E]">{fire.sector}</span>
          <span
            className="text-[14px] font-bold px-2.5 py-1 rounded-md"
            style={{ color: gc.color, background: gc.bg }}
          >
            FIRE {fire.fire_grade}등급 {Math.round(fire.fire_score)}점
          </span>
        </div>
        <div className="flex items-center gap-4 text-[14px] text-[#6B7280] mt-1.5">
          <span>외인5d: <b style={{ color: flowClr(fire.fgn_5d) }}>{flowFmt(fire.fgn_5d)}억</b></span>
          <span>기관5d: <b style={{ color: flowClr(fire.inst_5d) }}>{flowFmt(fire.inst_5d)}억</b></span>
          <span>연기금: <b style={{ color: flowClr(fire.pension_5d) }}>{flowFmt(fire.pension_5d)}억</b></span>
        </div>
        {fire.etf_code && fire.etf_name && (
          <div className="mt-1.5">
            <a
              href={`https://finance.naver.com/item/main.naver?code=${fire.etf_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#2563EB] hover:underline"
            >
              ETF: {fire.etf_name} ({fire.etf_code})
            </a>
          </div>
        )}
      </div>

      {/* 종목 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="bg-[#F5F4F0]/60">
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E]">종목</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">종가</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">등락</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E]">점수</th>
              <th className="text-center py-2.5 px-3 font-bold text-[#1A1A2E]">등급</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">MA20</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">RSI</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">외5d</th>
              <th className="text-right py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">기5d</th>
              <th className="text-left py-2.5 px-3 font-bold text-[#1A1A2E] hidden md:table-cell">근거</th>
            </tr>
          </thead>
          <tbody>
            {cardPicks.map(p => {
              const bg = BUY_GRADE_CONFIG[p.buy_grade]
              return (
                <tr key={p.ticker} className="border-t border-[#e5e7ef]/40 hover:bg-white/60">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-[#1A1A2E]">{p.name}</span>
                    <span className="text-[12px] text-[#9ca3b8] ml-1.5">{p.ticker}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#1A1A2E]">{priceFmt(p.close)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold" style={{ color: retClr(p.chg_1d) }}>
                    {p.chg_1d >= 0 ? '+' : ''}{p.chg_1d.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold text-[#1A1A2E]">{Math.round(p.buy_score)}</td>
                  <td className="py-2.5 px-3 text-center">
                    {bg && (
                      <span className="text-[12px] font-bold px-2 py-1 rounded text-white" style={{ background: bg.color }}>
                        {bg.label}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#6B7280] hidden md:table-cell">
                    {p.ma20_dev >= 0 ? '+' : ''}{p.ma20_dev.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums text-[#6B7280] hidden md:table-cell">{Math.round(p.rsi)}</td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold hidden md:table-cell" style={{ color: flowClr(p.fgn_5d) }}>
                    {flowFmt(p.fgn_5d)}
                  </td>
                  <td className="py-2.5 px-3 text-right tabular-nums font-bold hidden md:table-cell" style={{ color: flowClr(p.inst_5d) }}>
                    {flowFmt(p.inst_5d)}
                  </td>
                  <td className="py-2.5 px-3 text-left text-[#6B7280] truncate max-w-[140px] hidden md:table-cell" title={p.buy_reasons}>
                    {p.buy_reasons?.split(',')[0] ?? ''}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
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
  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('ALL')

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

  const handleSectorClick = useCallback((sector: string) => {
    setSelectedSector(prev => prev === sector ? null : sector)
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

  // 등급 필터 적용
  const filteredPicks = gradeFilter === 'ALL'
    ? picks
    : picks.filter(p => p.buy_grade === gradeFilter)

  // 섹터별 그룹핑
  const grouped: Record<string, SectorPick[]> = {}
  filteredPicks.forEach(p => {
    if (!grouped[p.sector]) grouped[p.sector] = []
    grouped[p.sector].push(p)
  })

  // fire map
  const fireMap: Record<string, SectorFire> = {}
  sectors.forEach(f => { fireMap[f.sector] = f })

  // fire_score 내림차순, D등급 제외, 종목 0개 제외
  const sortedSectors = Object.keys(grouped)
    .filter(s => fireMap[s] && fireMap[s].fire_grade !== 'D')
    .filter(s => !selectedSector || s === selectedSector)
    .sort((a, b) => (fireMap[b]?.fire_score ?? 0) - (fireMap[a]?.fire_score ?? 0))

  // 등급별 카운트
  const strongCount = picks.filter(p => p.buy_grade === 'STRONG').length
  const buyCount = picks.filter(p => p.buy_grade === 'BUY').length
  const watchCount = picks.filter(p => p.buy_grade === 'WATCH').length

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-[19px] font-bold text-[#1A1A2E]">SECTOR FIRE</h2>
          {date && <span className="text-[14px] text-[#9ca3b8]">{date}</span>}
        </div>
        <p className="text-[14px] text-[#6B7280] mt-0.5">돈의 흐름으로 읽는 다음 발화 섹터</p>
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

      {/* 섹션 2: 섹터별 종목 카드 그룹 */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-[17px] font-bold text-[#1A1A2E]">발화 섹터 종목 — 매수 후보</h3>
            <span className="text-[14px] text-[#9ca3b8]">{filteredPicks.length}종목</span>
          </div>
          {selectedSector && (
            <button
              onClick={() => setSelectedSector(null)}
              className="text-[13px] px-2.5 py-1 rounded bg-[#f0f0f0] text-[#6B7280] hover:bg-[#e5e7ef]"
            >
              전체 보기
            </button>
          )}
        </div>

        {/* 등급 필터 칩 */}
        <div className="flex gap-1.5 mb-4 flex-wrap">
          {([
            { key: 'ALL' as GradeFilter, label: `전체 ${picks.length}` },
            { key: 'STRONG' as GradeFilter, label: `강력 ${strongCount}` },
            { key: 'BUY' as GradeFilter, label: `BUY ${buyCount}` },
            { key: 'WATCH' as GradeFilter, label: `WATCH ${watchCount}` },
          ]).map(f => (
            <button
              key={f.key}
              onClick={() => setGradeFilter(f.key)}
              className={`py-1.5 px-3.5 rounded-lg text-[14px] font-semibold transition-all ${
                gradeFilter === f.key
                  ? 'bg-[#00FF88] text-[#1A1A2E] shadow-sm'
                  : 'bg-[#F5F4F0] text-[#9CA3AF] hover:text-[#1A1A2E]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* 섹터 카드 목록 */}
        <div className="space-y-4">
          {sortedSectors.length === 0 ? (
            <div className="text-center py-8 text-[#9CA3AF]">
              해당 조건의 종목이 없습니다
            </div>
          ) : (
            sortedSectors.map(sectorName => (
              <SectorPicksCard
                key={sectorName}
                fire={fireMap[sectorName]}
                picks={grouped[sectorName]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
