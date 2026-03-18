'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useScoreboard, type ScoreboardPeriod } from '../api/useDashboard'

const PERIOD_LABELS: Record<ScoreboardPeriod, string> = { '30D': '30일', '60D': '60일', '90D': '90일', 'ALL': '전체' }

// TODO: Toss Payments 연동 후 실제 유저 tier로 교체
const IS_FREE = false

export function SignalScoreboard() {
  const [botType, setBotType] = useState<'QUANT' | 'DAYTRADING'>('QUANT')
  const [period, setPeriod] = useState<ScoreboardPeriod>('30D')
  const { data, isLoading } = useScoreboard(botType, period)

  const winRate = data?.win_rate ?? 0
  const avgReturn = data?.avg_return ?? 0
  const isPositive = avgReturn >= 0

  return (
    <div className="border-b border-[#2a2a3a]" style={{ background: '#0d1117' }}>
      <div className="px-4 py-3">
        {/* 헤더 + 탭 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">Signal Scoreboard</span>
            <div className="flex gap-1">
              {(['QUANT', 'DAYTRADING'] as const).map(bt => (
                <button
                  key={bt}
                  onClick={() => setBotType(bt)}
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-sm border transition-colors ${
                    botType === bt
                      ? 'text-[#00ff88] border-[#00ff88]/40 bg-[#00ff88]/10'
                      : 'text-[#64748b] border-[#1a2535] hover:text-[#8a8a8a]'
                  }`}
                >
                  {bt === 'QUANT' ? '퀀트' : '단타'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            {(['30D', '60D', '90D', 'ALL'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-sm ${
                  period === p
                    ? 'text-[#e2e8f0] bg-[#1a2535]'
                    : 'text-[#64748b] hover:text-[#8a8a8a]'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-[48px] flex-1 bg-[#1a2535] animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4">
            {/* 적중률 — FREE에도 노출 */}
            <div className="flex-1 bg-[#0a0f18] rounded-md p-3 border border-[#1a2535]">
              <div className="text-[10px] text-[#64748b] font-bold mb-1">적중률</div>
              <div className={`text-2xl font-bold tabular-nums ${winRate >= 60 ? 'text-[#00ff88]' : winRate >= 40 ? 'text-[#f59e0b]' : 'text-[#ff3b5c]'}`}>
                {winRate.toFixed(1)}%
              </div>
            </div>

            {/* 평균 수익률 — FREE: 블러 */}
            <div className="flex-1 relative">
              <div className={`bg-[#0a0f18] rounded-md p-3 border border-[#1a2535] ${IS_FREE ? 'select-none' : ''}`}
                style={IS_FREE ? { filter: 'blur(6px)' } : undefined}>
                <div className="text-[10px] text-[#64748b] font-bold mb-1">평균 수익률</div>
                <div className={`text-2xl font-bold tabular-nums ${isPositive ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
                  {isPositive ? '+' : ''}{avgReturn.toFixed(1)}%
                </div>
              </div>
              {IS_FREE && <ScoreboardLock />}
            </div>

            {/* 시그널 통계 — FREE: 블러 */}
            <div className="flex-1 relative">
              <div className={`bg-[#0a0f18] rounded-md p-3 border border-[#1a2535] ${IS_FREE ? 'select-none' : ''}`}
                style={IS_FREE ? { filter: 'blur(6px)' } : undefined}>
                <div className="text-[10px] text-[#64748b] font-bold mb-1">시그널</div>
                <div className="text-lg font-bold text-[#e2e8f0] tabular-nums">
                  {data?.total_signals ?? 0}건
                </div>
                <div className="text-[10px] text-[#64748b]">
                  성공 <span className="text-[#00ff88]">{data?.win_count ?? 0}</span> / 실패 <span className="text-[#ff3b5c]">{data?.loss_count ?? 0}</span>
                </div>
              </div>
              {IS_FREE && <ScoreboardLock />}
            </div>

            {/* 최근 청산 — FREE: 블러 + CTA */}
            <div className="flex-[1.5] relative">
              <div className={`bg-[#0a0f18] rounded-md p-3 border border-[#1a2535] ${IS_FREE ? 'select-none' : ''}`}
                style={IS_FREE ? { filter: 'blur(6px)' } : undefined}>
                <div className="text-[10px] text-[#64748b] font-bold mb-1">최근 청산</div>
                {data?.recent_closed && data.recent_closed.length > 0 ? (
                  <div className="space-y-0.5">
                    {data.recent_closed.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px]">
                        <span className="text-[#cbd5e1]">{s.ticker_name}</span>
                        <span className={`font-bold tabular-nums ${s.return_pct >= 0 ? 'text-[#00ff88]' : 'text-[#ff3b5c]'}`}>
                          {s.return_pct >= 0 ? '+' : ''}{s.return_pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[11px] text-[#334155]">아직 청산 데이터 없음</div>
                )}
              </div>
              {IS_FREE && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link href="/pricing"
                    className="px-3 py-1.5 text-[11px] font-bold rounded bg-[#00ff88]/10 border border-[#00ff88]/40 text-[#00ff88] hover:bg-[#00ff88]/20 transition-colors">
                    SIGNAL로 전체 보기
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** 블러된 카드 위에 표시되는 작은 자물쇠 */
function ScoreboardLock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-40">
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#00ff88" strokeWidth="1.5" />
        <path d="M8 11V7a4 4 0 018 0v4" stroke="#00ff88" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}
