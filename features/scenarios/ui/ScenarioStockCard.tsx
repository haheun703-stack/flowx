'use client'

import { useState } from 'react'
import type { ScenarioStock } from '../types'

function formatKRW(n: number) {
  if (n >= 1_000_000) return `${(n / 10_000).toFixed(0)}만`
  return n.toLocaleString()
}

function flowLabel(val: number) {
  if (val === 0) return { text: '-', color: 'text-[#9CA3AF]' }
  const bil = val / 1_000_000_000
  return { text: `${bil >= 0 ? '+' : ''}${bil.toFixed(0)}억`, color: bil >= 0 ? 'text-[#DC2626]' : 'text-[#2563EB]' }
}

function getCategoryBorder(tag: string): string {
  const lower = tag.toLowerCase()
  if (lower.includes('원유') || lower.includes('에너지') || lower.includes('oil') || lower.includes('lpg') || lower.includes('가스'))
    return '#DC2626'
  if (lower.includes('방산') || lower.includes('defense') || lower.includes('무기') || lower.includes('군수'))
    return '#DC2626'
  if (lower.includes('etf') || lower.includes('인버스') || lower.includes('레버리지'))
    return '#2563EB'
  if (lower.includes('간접') || lower.includes('보험') || lower.includes('해운'))
    return '#F59E0B'
  return '#F59E0B'
}

function getCategoryLabel(tag: string): string {
  const lower = tag.toLowerCase()
  if (lower.includes('etf') || lower.includes('인버스') || lower.includes('레버리지'))
    return 'ETF'
  if (lower.includes('간접') || lower.includes('보험') || lower.includes('해운'))
    return '간접 수혜'
  return '직접 수혜'
}

export default function ScenarioStockCard({ stocks }: { stocks: ScenarioStock[] }) {
  const [openTicker, setOpenTicker] = useState<string | null>(null)

  if (!stocks.length) {
    return <p className="text-[#9CA3AF] text-sm">투자 유니버스가 비어있습니다.</p>
  }

  const topStocks = stocks.slice(0, 3)

  return (
    <div>
      <h2 className="text-[18px] font-bold text-[#1A1A2E] mb-3">
        지금 뭘 사야 할까? — 투자 유니버스
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topStocks.map((st) => {
          const borderColor = getCategoryBorder(st.scenario_tag)
          const categoryLabel = getCategoryLabel(st.scenario_tag)
          const isOpen = openTicker === st.ticker
          const foreignFlow = flowLabel(st.foreign_5d)
          const instFlow = flowLabel(st.inst_5d)

          return (
            <div
              key={st.ticker}
              className="rounded-r-[10px] overflow-hidden"
              style={{ background: '#F5F4F0', borderLeft: `3px solid ${borderColor}` }}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[16px] font-bold text-[#1A1A2E]">{st.name}</span>
                  <span
                    className="text-[11px] font-bold px-1.5 py-0.5 rounded"
                    style={{ color: borderColor, backgroundColor: `${borderColor}15`, border: `1px solid ${borderColor}30` }}
                  >
                    {categoryLabel}
                  </span>
                </div>
                <p className="text-[13px] text-[#6B7280]">{st.ticker} | {formatKRW(st.close)}원</p>
                {st.scenario_narrative && (
                  <p className="text-[13px] text-[#374151] mt-1.5 leading-relaxed line-clamp-2">{st.scenario_narrative}</p>
                )}
                <button
                  onClick={() => setOpenTicker(isOpen ? null : st.ticker)}
                  className="text-[13px] font-semibold text-[#00CC6A] mt-2 hover:underline"
                >
                  {isOpen ? '접기 ▲' : '상세 근거 보기 ▼'}
                </button>
              </div>

              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t border-[#E2E5EA] pt-2">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[11px] font-bold text-[#6B7280] mb-1">수급 (5일)</p>
                    <div className="flex gap-3 text-[13px]">
                      <span>외국인: <span className={`font-bold ${foreignFlow.color}`}>{foreignFlow.text}</span></span>
                      <span>기관: <span className={`font-bold ${instFlow.color}`}>{instFlow.text}</span></span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[11px] font-bold text-[#6B7280] mb-1">차트 지표</p>
                    <div className="flex gap-3 text-[13px]">
                      <span>RSI: <span className={`font-bold ${st.rsi >= 70 ? 'text-[#DC2626]' : st.rsi <= 30 ? 'text-[#16A34A]' : 'text-[#1A1A2E]'}`}>{st.rsi.toFixed(1)}</span></span>
                      <span>등급: <span className="font-bold text-[#1A1A2E]">{st.grade}</span></span>
                      <span>점수: <span className={`font-bold ${st.total_score >= 60 ? 'text-[#16A34A]' : st.total_score >= 40 ? 'text-[#D97706]' : 'text-[#9CA3AF]'}`}>{st.total_score.toFixed(1)}</span></span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[11px] font-bold text-[#6B7280] mb-1">시나리오 연동</p>
                    <p className="text-[13px] text-[#374151]">{st.scenario_tag}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-[11px] font-bold text-[#6B7280] mb-1">매매 전략</p>
                    <div className="grid grid-cols-3 gap-2 text-[13px]">
                      <div>
                        <span className="text-[#9CA3AF] text-[11px] block">진입가</span>
                        <span className="font-bold text-[#1A1A2E]">{formatKRW(st.entry_price)}</span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] text-[11px] block">목표가</span>
                        <span className="font-bold text-[#16A34A]">{formatKRW(st.target_price)}</span>
                      </div>
                      <div>
                        <span className="text-[#9CA3AF] text-[11px] block">손절가</span>
                        <span className="font-bold text-[#DC2626]">{formatKRW(st.stop_loss)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {stocks.length > 3 && (
        <p className="text-[12px] text-[#9CA3AF] text-center mt-2">외 {stocks.length - 3}개 종목</p>
      )}
    </div>
  )
}
