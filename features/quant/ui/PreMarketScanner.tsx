'use client'

// ─── Row 3: US 프리마켓 스캐너 (스펙 §6) ───
// 데이터 파이프라인 미존재 → 정적 플레이스홀더

interface PreMarketData {
  sp500?: { close: number; change_pct: number }
  nasdaq?: { close: number; change_pct: number }
  vix?: { close: number; change_pct: number }
  strategy?: string
  ai_picks?: { name: string; ticker: string; reason: string }[]
}

interface PreMarketScannerProps {
  data?: PreMarketData
}

const PLACEHOLDER: PreMarketData = {
  sp500: { close: 5248.3, change_pct: -0.32 },
  nasdaq: { close: 16412.7, change_pct: -0.45 },
  vix: { close: 18.2, change_pct: 5.1 },
  strategy: '미국 기술주 약세 → 한국 반도체·2차전지 관망, 방산 관심',
  ai_picks: [
    { name: '한화에어로스페이스', ticker: '012450', reason: '미국 방산 예산 증가 수혜' },
    { name: 'KODEX 인버스', ticker: '114800', reason: 'VIX 상승 시 헤지 포지션' },
  ],
}

function changeColor(pct: number) {
  return pct >= 0 ? '#059669' : '#DC2626'
}

export default function PreMarketScanner({ data }: PreMarketScannerProps) {
  const d = data ?? PLACEHOLDER
  const isPlaceholder = !data

  return (
    <div className="bg-white rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
      {isPlaceholder && (
        <div className="bg-[#F3F4F6] px-4 py-1.5 text-center">
          <span className="text-[9px] text-[var(--text-muted)] font-medium">
            데이터 파이프라인 준비 중 — 예시 데이터
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
        {/* 좌: 미국 시장 마감 */}
        <div className="p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-3">
            어제 미국 시장 마감
          </h3>
          <div className="space-y-2">
            {d.sp500 && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">S&P 500</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                    {d.sp500.close.toLocaleString()}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: changeColor(d.sp500.change_pct) }}
                  >
                    {d.sp500.change_pct >= 0 ? '+' : ''}{d.sp500.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            {d.nasdaq && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">NASDAQ</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                    {d.nasdaq.close.toLocaleString()}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: changeColor(d.nasdaq.change_pct) }}
                  >
                    {d.nasdaq.change_pct >= 0 ? '+' : ''}{d.nasdaq.change_pct.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
            {d.vix && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-[var(--text-muted)]">VIX</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold text-[var(--text-primary)]">
                    {d.vix.close.toFixed(1)}
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{ color: d.vix.change_pct >= 0 ? '#DC2626' : '#059669' }}
                  >
                    {d.vix.change_pct >= 0 ? '+' : ''}{d.vix.change_pct.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 우: AI 전략 제안 */}
        <div className="p-5">
          <h3 className="text-[15px] font-bold text-[var(--text-primary)] mb-3">
            AI 전략 제안
          </h3>
          {d.strategy && (
            <p className="text-xs text-[var(--text-dim)] mb-3 leading-relaxed border-l-2 border-[#8B5CF6] pl-3">
              {d.strategy}
            </p>
          )}
          {d.ai_picks && d.ai_picks.length > 0 && (
            <div className="space-y-2">
              {d.ai_picks.map((p) => (
                <div
                  key={p.ticker}
                  className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg p-2"
                >
                  <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0" />
                  <span className="font-bold text-[var(--text-primary)]">{p.name}</span>
                  <span className="text-[var(--text-muted)]">{p.ticker}</span>
                  <span className="text-[var(--text-dim)] ml-auto truncate max-w-[200px]">
                    {p.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
