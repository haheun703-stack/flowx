import { useMemo } from 'react'
import { SupplyData } from '@/entities/stock/types'
import { runWhyNowEngine } from '@/features/why-now-engine/model/scoreEngine'
import { SignalGrade } from '@/features/why-now-engine/types'

const GRADE_CONFIG: Record<SignalGrade, { label: string; color: string; bg: string; border: string }> = {
  STRONG_BUY: { label: '매수 강신호',   color: 'text-emerald-600', bg: 'bg-white', border: 'border-emerald-500/40' },
  BUY:        { label: '매수 관심',      color: 'text-[var(--green)]',   bg: 'bg-white', border: 'border-green-500/40' },
  NEUTRAL:    { label: '중립',           color: 'text-[var(--yellow)]',  bg: 'bg-white', border: 'border-yellow-500/40' },
  CAUTION:    { label: '주의',           color: 'text-orange-600',  bg: 'bg-white', border: 'border-orange-500/40' },
  AVOID:      { label: '회피',           color: 'text-[var(--up)]',     bg: 'bg-white', border: 'border-red-500/40' },
}

export function SupplyInsight({ supplyData }: { supplyData: SupplyData[] }) {
  if (!supplyData || supplyData.length < 5) return null

  const result = useMemo(() => runWhyNowEngine(supplyData), [supplyData])
  const cfg = GRADE_CONFIG[result.grade]

  return (
    <div className={`mt-4 rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>

      {/* 헤더: 등급 + 점수 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--text-primary)] uppercase tracking-widest font-bold">
            Why Now Engine
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
            {cfg.label}
          </span>
        </div>
        {/* 점수 게이지 */}
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                result.totalScore >= 80 ? 'bg-emerald-400' :
                result.totalScore >= 60 ? 'bg-green-400' :
                result.totalScore >= 40 ? 'bg-yellow-400' :
                result.totalScore >= 20 ? 'bg-orange-400' : 'bg-red-400'
              }`}
              style={{ width: `${result.totalScore}%` }}
            />
          </div>
          <span className={`text-sm font-bold ${cfg.color}`}>
            {result.totalScore}
          </span>
        </div>
      </div>

      {/* 채점 항목 */}
      {result.items.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {result.items.map(item => (
            <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-base leading-tight">{item.icon}</span>
                <span className="text-[var(--text-primary)] leading-snug">{item.text}</span>
              </div>
              <span className={`text-xs font-mono whitespace-nowrap ${item.score > 0 ? 'text-emerald-600' : 'text-[var(--up)]'}`}>
                {item.score > 0 ? `+${item.score}` : item.score}pt
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-[var(--border)] pt-3">
        {/* 한 줄 요약 */}
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-1">
          {result.summary}
        </p>
        {/* 진입 코멘트 */}
        {result.entryComment && (
          <p className={`text-xs font-medium ${cfg.color}`}>
            → {result.entryComment}
          </p>
        )}
      </div>

    </div>
  )
}
