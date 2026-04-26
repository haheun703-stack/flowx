'use client'

import { useDashboardMarket, useMarketSnapshot } from '../api/useDashboard'

function getStatusStyle(regime: string) {
  switch (regime) {
    case 'BULL':
    case 'BULLISH':
      return {
        bg: '#ECFDF5', border: '#A7F3D0', text: '#059669',
        tipBg: 'rgba(16, 185, 129, 0.08)',
        label: '강세 (적극 포착)',
        advice: '오늘은 적극적으로 포착 기회를 찾아보세요',
      }
    case 'CAUTION':
      return {
        bg: '#FFFBEB', border: '#FDE68A', text: '#D97706',
        tipBg: 'rgba(245, 158, 11, 0.08)',
        label: '관망 (조심)',
        advice: '오늘은 신규 진입을 자제하고, 기존 보유 종목 점검을 권장합니다',
      }
    case 'BEAR':
    case 'BEARISH':
      return {
        bg: '#FEF2F2', border: '#FECACA', text: '#DC2626',
        tipBg: 'rgba(239, 68, 68, 0.08)',
        label: '약세 (방어)',
        advice: '하락장입니다. 신규 진입은 피하고 손절 라인을 점검하세요',
      }
    default:
      return {
        bg: '#F9FAFB', border: '#E5E7EB', text: '#6B7280',
        tipBg: 'rgba(107, 114, 128, 0.08)',
        label: '중립 (관찰)',
        advice: '방향성이 불분명합니다. 소액 분할 진입을 고려하세요',
      }
  }
}

export function MarketJudgmentCard() {
  const { data, isLoading } = useDashboardMarket()
  const { data: snap } = useMarketSnapshot()

  const regime = data?.kospi_regime ?? 'NEUTRAL'
  const status = getStatusStyle(regime)

  if (isLoading) {
    return (
      <div className="h-full rounded-xl p-[14px] border bg-[#F9FAFB] border-[#E5E7EB] animate-pulse">
        <div className="h-3 w-24 bg-[#E2E5EA] rounded mb-4" />
        <div className="h-6 w-32 bg-[#E2E5EA] rounded mb-2" />
        <div className="h-3 w-48 bg-[#E2E5EA] rounded" />
      </div>
    )
  }

  return (
    <div
      className="h-full rounded-xl p-[14px] border flex flex-col"
      style={{ background: status.bg, borderColor: status.border }}
    >
      {/* 라벨 */}
      <div className="text-[14px] font-bold mb-2" style={{ color: status.text }}>
        오늘의 시장 판단
      </div>

      {/* 상태값 */}
      <div className="text-[36px] font-bold mb-1" style={{ color: status.text }}>
        {status.label}
      </div>

      {/* KOSPI/KOSDAQ 등락 */}
      {snap && (
        <div className="text-[15px] font-semibold text-[#6B7280] mb-3">
          KOSPI {snap.kospi_change >= 0 ? '+' : ''}{snap.kospi_change.toFixed(2)}% | KOSDAQ {snap.kosdaq_change >= 0 ? '+' : ''}{snap.kosdaq_change.toFixed(2)}%
        </div>
      )}

      {/* AI 시장 판단문 또는 기본 조언 */}
      <div
        className="rounded-lg px-3 py-2 text-[14px] font-semibold leading-relaxed mb-3"
        style={{ background: status.tipBg, color: status.text }}
      >
        {data?.verdict || status.advice}
      </div>

      {/* 주요 종목 리스트 */}
      {snap && snap.stocks.length > 0 && (
        <div className="flex-1 min-h-0 overflow-y-auto">
          {snap.stocks.slice(0, 4).map((s) => (
            <div
              key={s.code}
              className="flex items-center justify-between py-1.5 border-b border-black/5 last:border-0"
            >
              <span className="text-[15px] font-semibold text-[#1A1A2E] truncate mr-2">{s.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[15px] text-[#1A1A2E] font-bold tabular-nums">
                  {s.price.toLocaleString()}
                </span>
                <span className={`text-[15px] font-bold tabular-nums ${
                  s.changePercent >= 0 ? 'text-[var(--up)]' : 'text-[var(--down)]'
                }`}>
                  {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 슬롯 + 릴레이 요약 */}
      <div className="mt-auto pt-2 border-t border-black/5 flex items-center gap-3 text-[14px] font-semibold text-[#9CA3AF]">
        <span>매수 슬롯 <span className="font-bold text-[#1A1A2E]">{data?.kospi_slots ?? 0}/5</span></span>
        <span>릴레이 <span className="font-bold text-[#2563EB]">{data?.relay_fired ?? 0}/{data?.relay_signals ?? 0}</span></span>
      </div>
    </div>
  )
}
