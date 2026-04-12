'use client'

import { useSupplyScoring, type SupplyScoringItem } from '../api/useInformation'
import { GRADE_LEGACY_BUY, GRADE_CAUTION } from '@/shared/constants/grades'

const GRADE_COLOR: Record<string, string> = {
  'A+': '#dc2626',
  'A': '#ea580c',
  'B+': '#ca8a04',
  'B': '#65a30d',
  'C': '#9ca3af',
}

const GRADE_BG: Record<string, string> = {
  'A+': 'rgba(220,38,38,0.08)',
  'A': 'rgba(234,88,12,0.06)',
  'B+': 'rgba(202,138,4,0.05)',
  'B': 'rgba(101,163,13,0.04)',
  'C': 'rgba(156,163,175,0.04)',
}

function formatAmt(v: number): string {
  const abs = Math.abs(v)
  const sign = v >= 0 ? '+' : '-'
  if (abs >= 100_000_000) return `${sign}${(abs / 100_000_000).toFixed(1)}조`
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000).toLocaleString()}억`
  return `${sign}${abs.toLocaleString()}`
}

function SignalBadge({ signal }: { signal: string }) {
  return (
    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 whitespace-nowrap">
      {signal}
    </span>
  )
}

function ScoringRow({ item, rank }: { item: SupplyScoringItem; rank: number }) {
  const gradeColor = GRADE_COLOR[item.grade] ?? '#9ca3af'
  const gradeBg = GRADE_BG[item.grade] ?? 'transparent'
  const isUp = item.change_pct > 0
  const signals = Array.isArray(item.signals) ? item.signals : []

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* 순위 */}
      <td className="py-3 px-3 text-center">
        <span className={`text-sm font-black ${rank <= 3 ? 'text-[#dc2626]' : rank <= 10 ? 'text-[#ea580c]' : 'text-gray-500'}`}>
          {rank}
        </span>
      </td>

      {/* 등급 */}
      <td className="py-3 px-2 text-center">
        <span
          className="inline-block px-2 py-1 rounded-md text-xs font-black"
          style={{ color: gradeColor, background: gradeBg, border: `1px solid ${gradeColor}30` }}
        >
          {item.grade}
        </span>
      </td>

      {/* 종목 */}
      <td className="py-3 px-3">
        <div className="text-sm font-bold text-[var(--text-primary)]">{item.name ?? item.ticker}</div>
        <div className="text-[10px] text-gray-400 font-mono">{item.ticker} · {item.sector ?? '-'}</div>
      </td>

      {/* 점수 */}
      <td className="py-3 px-2 text-center">
        <span className="text-sm font-black tabular-nums" style={{ color: gradeColor }}>
          {item.score}
        </span>
      </td>

      {/* 등락 */}
      <td className="py-3 px-2 text-right">
        <span className={`text-sm font-bold tabular-nums ${isUp ? 'text-[var(--up)]' : item.change_pct < 0 ? 'text-[var(--down)]' : 'text-gray-500'}`}>
          {isUp ? '+' : ''}{item.change_pct.toFixed(1)}%
        </span>
      </td>

      {/* 3일 누적 */}
      <td className="py-3 px-2 text-right">
        <span className={`text-xs font-bold tabular-nums ${item.cum_3d > 0 ? 'text-[var(--up)]' : item.cum_3d < 0 ? 'text-[var(--down)]' : 'text-gray-400'}`}>
          {item.cum_3d > 0 ? '+' : ''}{item.cum_3d.toFixed(1)}%
        </span>
      </td>

      {/* 외국인 */}
      <td className="py-3 px-2 text-right">
        <div className={`text-xs font-bold tabular-nums ${item.foreign_net_amt > 0 ? 'text-[var(--up)]' : item.foreign_net_amt < 0 ? 'text-[var(--down)]' : 'text-gray-400'}`}>
          {formatAmt(item.foreign_net_amt)}
        </div>
        {item.foreign_days !== 0 && (
          <div className="text-[10px] text-gray-400">{item.foreign_days > 0 ? GRADE_LEGACY_BUY : GRADE_CAUTION} {Math.abs(item.foreign_days)}일</div>
        )}
      </td>

      {/* 기관 */}
      <td className="py-3 px-2 text-right">
        <div className={`text-xs font-bold tabular-nums ${item.inst_net_amt > 0 ? 'text-[var(--up)]' : item.inst_net_amt < 0 ? 'text-[var(--down)]' : 'text-gray-400'}`}>
          {formatAmt(item.inst_net_amt)}
        </div>
        {item.inst_days !== 0 && (
          <div className="text-[10px] text-gray-400">{item.inst_days > 0 ? GRADE_LEGACY_BUY : GRADE_CAUTION} {Math.abs(item.inst_days)}일</div>
        )}
      </td>

      {/* 시그널 */}
      <td className="py-3 px-2">
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {signals.slice(0, 3).map((s, i) => <SignalBadge key={i} signal={s} />)}
          {signals.length > 3 && <span className="text-[10px] text-gray-400">+{signals.length - 3}</span>}
        </div>
      </td>

      {/* 적중 */}
      <td className="py-3 px-2 text-center">
        {item.hit === true && <span className="text-[var(--up)] font-bold text-sm">O</span>}
        {item.hit === false && <span className="text-[var(--down)] font-bold text-sm">X</span>}
        {item.hit == null && <span className="text-gray-300 text-xs">-</span>}
      </td>
    </tr>
  )
}

function GradeSummary({ items }: { items: SupplyScoringItem[] }) {
  const grades = ['A+', 'A', 'B+', 'B', 'C']
  const counts = grades.map(g => ({ grade: g, count: items.filter(i => i.grade === g).length }))
  const hitItems = items.filter(i => i.hit != null)
  const hitRate = hitItems.length > 0 ? (hitItems.filter(i => i.hit).length / hitItems.length * 100).toFixed(1) : null

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {counts.filter(c => c.count > 0).map(c => (
        <div key={c.grade} className="flex items-center gap-1.5">
          <span
            className="inline-block px-2 py-0.5 rounded text-xs font-black"
            style={{ color: GRADE_COLOR[c.grade], background: GRADE_BG[c.grade], border: `1px solid ${GRADE_COLOR[c.grade]}30` }}
          >
            {c.grade}
          </span>
          <span className="text-sm font-bold text-[var(--text-primary)]">{c.count}종목</span>
        </div>
      ))}
      {hitRate && (
        <div className="ml-auto text-xs text-gray-500">
          적중률 <span className="font-bold text-[var(--up)]">{hitRate}%</span> ({hitItems.filter(i => i.hit).length}/{hitItems.length})
        </div>
      )}
    </div>
  )
}

export function SupplyScoringPanel() {
  const { data, isLoading } = useSupplyScoring()
  const items = data?.items ?? []
  const date = data?.date ?? ''

  return (
    <div className="flex flex-col h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎯</span>
          <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">수급 스코어링</span>
          <span className="text-[10px] text-gray-400 font-mono ml-1">TOP {items.length}</span>
        </div>
        <div className="text-xs text-[var(--text-muted)]">{date}</div>
      </div>

      {/* 본문 */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)]">
            <div className="text-3xl mb-3">📊</div>
            <div className="text-sm">수급 스코어링 데이터 없음</div>
            <div className="text-xs mt-1 text-gray-400">Supabase supply_scoring 테이블 확인 필요</div>
          </div>
        ) : (
          <>
            {/* 등급 요약 */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <GradeSummary items={items} />
            </div>

            {/* 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="py-2 px-3 text-center w-10">#</th>
                    <th className="py-2 px-2 text-center w-14">등급</th>
                    <th className="py-2 px-3">종목</th>
                    <th className="py-2 px-2 text-center w-14">점수</th>
                    <th className="py-2 px-2 text-right w-16">등락</th>
                    <th className="py-2 px-2 text-right w-16">3일</th>
                    <th className="py-2 px-2 text-right w-20">외국인</th>
                    <th className="py-2 px-2 text-right w-20">기관</th>
                    <th className="py-2 px-2 w-48">시그널</th>
                    <th className="py-2 px-2 text-center w-10">적중</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <ScoringRow key={item.id} item={item} rank={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* 팁 */}
            <div className="fx-card-tip">
              A+ 등급은 수급+모멘텀+기술적 시그널이 동시 포착된 종목입니다. 적중 컬럼은 다음날 양수 여부를 검증합니다.
            </div>
          </>
        )}
      </div>
    </div>
  )
}
