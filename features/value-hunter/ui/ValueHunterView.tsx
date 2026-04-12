'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  GRADE_BADGE_CLASS,
  GRADE_STRONG_PICK,
  GRADE_PICK,
  GRADE_WATCH,
  GRADE_OBSERVE,
} from '@/shared/constants/grades'

/* ─── Types ─── */
interface VHItem {
  code: string
  name: string
  grade: string
  total_score: number
  entry_price: number
  stop_loss: number
  target_price: number
  holding_days: number
  momentum_regime: string
  created_at: string
}

/* ─── Helpers ─── */
const fmtPrice = (v: number) => v.toLocaleString()
const pctStr = (entry: number, target: number) => {
  if (!entry || !target) return '—'
  return `+${(((target - entry) / entry) * 100).toFixed(1)}%`
}
const riskStr = (entry: number, sl: number) => {
  if (!entry || !sl) return '—'
  return `${(((sl - entry) / entry) * 100).toFixed(1)}%`
}

const REGIME_LABEL: Record<string, { text: string; color: string }> = {
  BULL: { text: '상승', color: '#16a34a' },
  BEAR: { text: '하락', color: '#dc2626' },
  SIDEWAYS: { text: '횡보', color: '#d97706' },
  RECOVERY: { text: '회복', color: '#2563eb' },
}

function regimeInfo(regime: string) {
  return REGIME_LABEL[regime] ?? { text: regime, color: '#888' }
}

function gradeBadge(grade: string) {
  const cls = GRADE_BADGE_CLASS[grade] ?? 'bg-gray-200 text-gray-600'
  return cls
}

/* ─── Score gauge ─── */
function ScoreGauge({ score }: { score: number }) {
  const pct = Math.min(score, 100)
  const color = score >= 80 ? '#dc2626' : score >= 60 ? '#d97706' : score >= 40 ? '#2563eb' : '#9CA3AF'
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-[6px] bg-[#F0EDE8] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[13px] font-black tabular-nums" style={{ color }}>{score}</span>
    </div>
  )
}

/* ─── Main ─── */
export function ValueHunterView() {
  const [items, setItems] = useState<VHItem[]>([])
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/intelligence/value-hunter', { signal: ac.signal })
      .then(r => r.json())
      .then(json => {
        setItems(json.items ?? [])
        setDate(json.date ?? '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-4">
        <div className="animate-pulse rounded bg-[#E8E6E0] h-8 w-48" />
        <div className="animate-pulse rounded bg-[#E8E6E0] h-64" />
      </div>
    )
  }

  const gradeGroups = [
    { grade: GRADE_STRONG_PICK, items: items.filter(i => i.grade === GRADE_STRONG_PICK || i.grade === 'STRONG_PICK') },
    { grade: GRADE_PICK, items: items.filter(i => i.grade === GRADE_PICK || i.grade === 'PICK' || i.grade === 'BUY') },
    { grade: GRADE_WATCH, items: items.filter(i => i.grade === GRADE_WATCH) },
    { grade: GRADE_OBSERVE, items: items.filter(i => i.grade === GRADE_OBSERVE) },
  ].filter(g => g.items.length > 0)

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 py-6 space-y-[14px]">
      {/* 헤더 */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center justify-between gap-2 shadow-sm">
        <div>
          <div className="text-[11px] md:text-[13px] font-black text-[#888] tracking-widest uppercase">Value Hunter</div>
          <div className="text-[18px] md:text-[24px] font-black text-[#1A1A2E] mt-1">
            저평가 가치주 발굴
            <span className="text-[12px] md:text-[14px] px-2 py-0.5 rounded-full font-black ml-3 bg-[#E6F9EE] text-[#00843D]">
              {items.length}종목
            </span>
          </div>
          <div className="text-[11px] md:text-[13px] text-[#777] mt-1">
            펀더멘탈 + 모멘텀 + 수급 종합 스코어 기반 자동 탐색
          </div>
        </div>
        <div className="text-left md:text-right shrink-0">
          <div className="text-[11px] md:text-[13px] text-[#888]">{date} 기준</div>
          <div className="text-[11px] md:text-[13px] font-black text-[#00843D] mt-1">● FLOWX 자동수집</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="fx-card text-center py-10">
          <div className="text-[#9CA3AF] text-sm">오늘 탐색된 종목이 없습니다</div>
          <div className="text-[#C4C1BA] text-xs mt-1">장 마감 후 자동 업데이트됩니다</div>
        </div>
      ) : (
        <>
          {/* 등급별 그룹 */}
          {gradeGroups.map(group => (
            <div key={group.grade} className="fx-card">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[12px] font-black ${gradeBadge(group.grade)}`}>
                  {group.grade}
                </span>
                <span className="text-[13px] text-[#9CA3AF]">{group.items.length}종목</span>
              </div>

              {/* 테이블 헤더 */}
              <div className="hidden md:grid grid-cols-[1fr_70px_80px_80px_80px_60px_70px_60px] gap-2 text-[11px] font-bold text-[#9CA3AF] border-b border-[#E8E6E0] pb-1.5 mb-1">
                <span>종목</span>
                <span className="text-center">스코어</span>
                <span className="text-right">진입가</span>
                <span className="text-right">목표가</span>
                <span className="text-right">손절가</span>
                <span className="text-right">수익률</span>
                <span className="text-center">모멘텀</span>
                <span className="text-right">보유일</span>
              </div>

              {/* 종목 리스트 */}
              <div className="space-y-0">
                {group.items.map(item => {
                  const r = regimeInfo(item.momentum_regime)
                  return (
                    <div key={item.code} className="grid grid-cols-2 md:grid-cols-[1fr_70px_80px_80px_80px_60px_70px_60px] gap-2 items-center py-2 border-b border-[#F0EDE8]">
                      {/* 종목명 */}
                      <div className="min-w-0">
                        <Link href={`/stock/${item.code}`} className="text-[14px] font-bold text-[#1A1A2E] hover:text-[#00FF88] transition-colors">
                          {item.name}
                        </Link>
                        <div className="text-[11px] text-[#9CA3AF]">{item.code}</div>
                      </div>

                      {/* 스코어 */}
                      <div className="md:flex md:justify-center">
                        <ScoreGauge score={item.total_score} />
                      </div>

                      {/* 진입가 */}
                      <div className="text-right text-[13px] tabular-nums font-semibold text-[#1A1A2E]">
                        {fmtPrice(item.entry_price)}
                      </div>

                      {/* 목표가 */}
                      <div className="text-right text-[13px] tabular-nums font-bold text-[#dc2626]">
                        {fmtPrice(item.target_price)}
                      </div>

                      {/* 손절가 */}
                      <div className="text-right text-[13px] tabular-nums text-[#2563eb]">
                        {fmtPrice(item.stop_loss)}
                      </div>

                      {/* 기대수익률 */}
                      <div className="text-right text-[13px] tabular-nums font-bold text-[#dc2626]">
                        {pctStr(item.entry_price, item.target_price)}
                      </div>

                      {/* 모멘텀 */}
                      <div className="text-center">
                        <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${r.color}15`, color: r.color }}>
                          {r.text}
                        </span>
                      </div>

                      {/* 보유일 */}
                      <div className="text-right text-[13px] tabular-nums text-[#6B7280]">
                        {item.holding_days}일
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* 리스크 안내 */}
          <div className="text-center text-[12px] text-[#bbb] py-1">
            본 정보는 투자 권유가 아니며 최종 판단은 투자자 본인에게 있습니다 · 손절가 반드시 설정
          </div>
        </>
      )}
    </div>
  )
}
