'use client'

// ─── Row 6: 스마트머니 추적 3박스 (스펙 §9) ───
// picks 데이터에서 수급 패턴 분석

interface PickItem {
  ticker: string
  name: string
  total_score: number
  foreign_5d: number
  inst_5d: number
  close: number
  grade: string
  sources: string[]
  n_sources: number
  rsi: number
  stoch_k: number
  reasons: string[]
}

interface SmartMoneyTrackingProps {
  picks: PickItem[]
}

function formatBil(n: number): string {
  const bil = n / 1_000_000_000
  if (Math.abs(bil) >= 1) return `${bil >= 0 ? '+' : ''}${bil.toFixed(1)}억`
  const mil = n / 1_000_000
  return `${mil >= 0 ? '+' : ''}${mil.toFixed(0)}백만`
}

export default function SmartMoneyTracking({ picks }: SmartMoneyTrackingProps) {
  if (!picks?.length) return null

  // Box 1: 기관+외국인 동시매수
  const dualBuying = picks.filter((p) => p.foreign_5d > 0 && p.inst_5d > 0)
    .sort((a, b) => (b.foreign_5d + b.inst_5d) - (a.foreign_5d + a.inst_5d))
    .slice(0, 5)

  // Box 2: 기관 순매수 상위 (개인→기관 물량 이전)
  const instAccum = picks.filter((p) => p.inst_5d > 0)
    .sort((a, b) => b.inst_5d - a.inst_5d)
    .slice(0, 5)

  // Box 3: 외국인 순매수 상위
  const foreignAccum = picks.filter((p) => p.foreign_5d > 0)
    .sort((a, b) => b.foreign_5d - a.foreign_5d)
    .slice(0, 5)

  const boxes = [
    {
      title: '기관+외국인 동시매수',
      color: '#059669',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      items: dualBuying,
      badge: `${dualBuying.length}종목`,
    },
    {
      title: '기관 순매수 TOP',
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
      items: instAccum,
      badge: `${instAccum.length}종목`,
    },
    {
      title: '외국인 순매수 TOP',
      color: '#3B82F6',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      items: foreignAccum,
      badge: `${foreignAccum.length}종목`,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {boxes.map((box) => (
        <div
          key={box.title}
          className="rounded-xl border shadow-sm overflow-hidden"
          style={{ borderColor: box.border }}
        >
          {/* 헤더 */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ backgroundColor: box.bg }}
          >
            <h4 className="text-sm font-bold" style={{ color: box.color }}>
              {box.title}
            </h4>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${box.color}15`, color: box.color }}
            >
              {box.badge}
            </span>
          </div>

          {/* 종목 리스트 */}
          <div className="bg-white divide-y divide-[var(--border)]/30">
            {box.items.length === 0 ? (
              <p className="text-[var(--text-muted)] text-sm p-4 text-center">해당 종목 없음</p>
            ) : (
              box.items.map((p) => (
                <div key={p.ticker} className="px-4 py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{p.name}</span>
                    <span className="text-[12px] text-[var(--text-muted)] ml-1">{p.ticker}</span>
                  </div>
                  <div className="text-right">
                    <div className="flex gap-2 text-[12px]">
                      <span className={p.foreign_5d > 0 ? 'text-[#059669] font-bold' : 'text-[var(--text-muted)]'}>
                        외{formatBil(p.foreign_5d)}
                      </span>
                      <span className={p.inst_5d > 0 ? 'text-[#D97706] font-bold' : 'text-[var(--text-muted)]'}>
                        기{formatBil(p.inst_5d)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
