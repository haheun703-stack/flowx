'use client'

// ─── Row 2: 미국장 → 한국장 릴레이 (보라 라인 카드) ───
// 왼쪽: 어젯밤 미국 시장 마감 + 섹터별 핵심 변동
// 오른쪽: 오늘 한국 ETF 전략 (매수/대기 뱃지)

interface USMarketData {
  sp500?: { close: number; change_pct: number }
  nasdaq?: { close: number; change_pct: number }
  vix?: { close: number; change_pct: number }
  sector_moves?: { sector: string; change_pct: number; driver: string }[]
  summary?: string
}

interface ETFRelay {
  name: string
  ticker: string
  weight: string
  action: 'buy' | 'wait' | 'conditional'
  reason: string
}

interface PreMarketScannerProps {
  data?: USMarketData
  etfRelays?: ETFRelay[]
}

// US→KR 자동 매핑 (플레이스홀더 — 향후 봇 연동)
const PLACEHOLDER_US: USMarketData = {
  sp500: { close: 5248.3, change_pct: -0.32 },
  nasdaq: { close: 16412.7, change_pct: -0.45 },
  vix: { close: 18.2, change_pct: 5.1 },
  sector_moves: [
    { sector: '반도체', change_pct: 2.3, driver: '엔비디아 +5.2%' },
    { sector: '방산', change_pct: 1.8, driver: '미국 국방 예산 증가' },
    { sector: '에너지', change_pct: -1.5, driver: '유가 하락' },
  ],
  summary: '기술주 약세 속 방산·반도체 강세 — 한국 관련 ETF 주목',
}

const PLACEHOLDER_RELAYS: ETFRelay[] = [
  { name: 'TIGER 반도체', ticker: '091230', weight: '8%', action: 'buy', reason: '엔비디아 +5% 수혜' },
  { name: 'KODEX 방산', ticker: '364690', weight: '5%', action: 'buy', reason: '미국 방산 예산 증가' },
  { name: 'KODEX 인버스2X', ticker: '252670', weight: '5%', action: 'conditional', reason: 'VIX 30+ 시 진입' },
  { name: 'KODEX 골드선물', ticker: '132030', weight: '5%', action: 'wait', reason: '금 가격 보합' },
  { name: 'KODEX 2차전지', ticker: '305540', weight: '3%', action: 'wait', reason: '테슬라 보합 대기' },
]

const ACTION_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  buy: { label: '매수', bg: '#E8F5E9', text: '#16A34A' },
  wait: { label: '대기', bg: '#F3F4F6', text: '#6B7280' },
  conditional: { label: '조건부', bg: '#FFFBEB', text: '#D97706' },
}

function changeColor(pct: number) {
  return pct >= 0 ? '#059669' : '#DC2626'
}

export default function PreMarketScanner({ data, etfRelays }: PreMarketScannerProps) {
  const d = data ?? PLACEHOLDER_US
  const relays = etfRelays ?? PLACEHOLDER_RELAYS
  const isPlaceholder = !data

  return (
    <div
      className="bg-white rounded-r-xl overflow-hidden shadow-sm"
      style={{ borderLeft: '3px solid #7C3AED', border: '1px solid var(--border)', borderLeftWidth: '3px', borderLeftColor: '#7C3AED' }}
    >
      {isPlaceholder && (
        <div className="bg-[#F5F3FF] px-4 py-1.5 text-center">
          <span className="text-[9px] text-[#7C3AED] font-medium">
            데이터 파이프라인 준비 중 — 예시 데이터
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* 좌: 어젯밤 미국 시장 */}
        <div className="p-5 border-b md:border-b-0 md:border-r border-[var(--border)]">
          <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
            어젯밤 미국
          </h3>

          {/* 지수 3개 */}
          <div className="space-y-2 mb-4">
            {[
              { label: 'S&P 500', data: d.sp500 },
              { label: 'NASDAQ', data: d.nasdaq },
              { label: 'VIX', data: d.vix },
            ].map((item) => item.data && (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-[11px] text-[#6B7280]">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono font-bold text-[#1A1A2E] tabular-nums">
                    {item.label === 'VIX' ? item.data.close.toFixed(1) : item.data.close.toLocaleString()}
                  </span>
                  <span
                    className="text-[11px] font-bold tabular-nums"
                    style={{ color: item.label === 'VIX'
                      ? (item.data.change_pct >= 0 ? '#DC2626' : '#059669')
                      : changeColor(item.data.change_pct)
                    }}
                  >
                    {item.data.change_pct >= 0 ? '+' : ''}{item.data.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 섹터별 핵심 변동 */}
          {d.sector_moves && d.sector_moves.length > 0 && (
            <div className="space-y-1.5 mb-3">
              <p className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-wider">섹터 변동</p>
              {d.sector_moves.map((s) => (
                <div key={s.sector} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="font-bold tabular-nums w-[48px]"
                    style={{ color: changeColor(s.change_pct) }}
                  >
                    {s.change_pct >= 0 ? '+' : ''}{s.change_pct.toFixed(1)}%
                  </span>
                  <span className="font-bold text-[#1A1A2E]">{s.sector}</span>
                  <span className="text-[#6B7280] truncate">{s.driver}</span>
                </div>
              ))}
            </div>
          )}

          {/* 요약 한 줄 */}
          {d.summary && (
            <p className="text-[11px] text-[#4C1D95] font-medium border-l-2 border-[#7C3AED] pl-2 leading-relaxed">
              {d.summary}
            </p>
          )}
        </div>

        {/* 우: 오늘 한국 ETF 전략 + → 화살표 */}
        <div className="p-5 relative">
          {/* 화살표 */}
          <div className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#7C3AED] text-white items-center justify-center text-[11px] font-bold z-10">
            →
          </div>

          <h3 className="text-[13px] font-bold text-[#1A1A2E] mb-3">
            오늘 한국 ETF 전략
          </h3>

          <div className="space-y-2">
            {relays.map((r) => {
              const badge = ACTION_BADGE[r.action] ?? ACTION_BADGE.wait
              return (
                <div key={r.ticker} className="flex items-center gap-2 bg-[#FAFAF8] rounded-lg p-2.5">
                  {/* 매수/대기 뱃지 */}
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: badge.bg, color: badge.text }}
                  >
                    {badge.label}
                  </span>

                  {/* 종목명 + 비중 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[12px] font-bold text-[#1A1A2E] truncate">{r.name}</span>
                      <span className="text-[10px] text-[#7C3AED] font-bold shrink-0">{r.weight}</span>
                    </div>
                    <p className="text-[10px] text-[#6B7280] truncate">{r.reason}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
