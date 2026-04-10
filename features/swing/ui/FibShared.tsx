/* ── 피보나치 공통 타입/상수/컴포넌트 ── */

export interface FibStock {
  code: string; name: string; sector: string; cap: number
  price: number; w52h: number; w52l: number; drop: number
  fib_zone: string; fib_zone_label: string
  fib_382: number; fib_500: number; fib_618: number
  fib_status: string; target: number; upside: number
  per: number; pbr: number; frgn: number
}

export const ZONE_ORDER = ['DEEP', 'MID', 'MILD', 'SHALLOW'] as const

export const ZONE_CONFIG: Record<string, { icon: string; color: string; bg: string; border: string; label: string }> = {
  DEEP: { icon: '🔴', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: '50%+ 하락 (바닥 매수 구간)' },
  MID: { icon: '🟠', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA', label: '40~50% 하락 (중간 눌림)' },
  MILD: { icon: '🟡', color: '#CA8A04', bg: '#FFFBEB', border: '#FDE68A', label: '30~40% 하락 (1차 눌림)' },
  SHALLOW: { icon: '🟢', color: '#65A30D', bg: '#F7FEE7', border: '#D9F99D', label: '15~30% 하락 (얕은 조정)' },
}

export function fmtCap(cap: number): string {
  if (cap >= 10000) return `${(cap / 10000).toFixed(1)}조`
  return `${cap.toLocaleString()}억`
}

export function FibMiniGauge({ stock }: { stock: FibStock }) {
  const range = stock.w52h - stock.w52l
  if (range <= 0) return null
  const pricePct = ((stock.price - stock.w52l) / range) * 100
  const f382 = ((stock.fib_382 - stock.w52l) / range) * 100
  const f500 = ((stock.fib_500 - stock.w52l) / range) * 100
  const f618 = ((stock.fib_618 - stock.w52l) / range) * 100
  const clampedPct = Math.max(Math.min(pricePct, 96), 4)
  const dotColor = pricePct < f382 ? '#DC2626' : pricePct < f500 ? '#EA580C' : pricePct < f618 ? '#CA8A04' : '#16A34A'

  return (
    <div className="relative min-w-[120px]" style={{ paddingTop: 18, paddingBottom: 14 }}>
      {/* 가격 + ▼ 표시 */}
      <div className="absolute top-0 text-center" style={{ left: `${clampedPct}%`, transform: 'translateX(-50%)' }}>
        <span className="text-[12px] font-extrabold tabular-nums text-[#1A1A2E] whitespace-nowrap">
          {stock.price.toLocaleString()}
        </span>
        <div className="text-[10px] font-bold leading-none" style={{ color: dotColor }}>▼</div>
      </div>
      {/* 바 */}
      <div className="relative h-[6px] rounded-full overflow-visible">
        {/* 하락 영역 (52w고점→현재가) */}
        <div className="absolute inset-0 rounded-full bg-[#FECACA]" />
        <div className="absolute top-0 h-full rounded-r-full bg-[#BBF7D0]"
          style={{ left: `${clampedPct}%`, right: 0 }} />
        {/* 피보나치 라인 */}
        {[
          { pos: f618, color: '#DC2626' },
          { pos: f500, color: '#9CA3AF' },
          { pos: f382, color: '#16A34A' },
        ].map((f, i) => (
          <div key={i} className="absolute top-[-2px] h-[10px] w-[2px] rounded-full" style={{ left: `${f.pos}%`, backgroundColor: f.color }} />
        ))}
        {/* 현재가 점 */}
        <div className="absolute top-[-3px] w-[8px] h-[12px] rounded-full"
          style={{ left: `${clampedPct}%`, transform: 'translateX(-50%)', backgroundColor: dotColor }} />
      </div>
      {/* 피보나치 숫자 */}
      <div className="relative mt-0.5">
        <span className="absolute text-[10px] font-bold tabular-nums text-[#DC2626]" style={{ left: `${f618}%`, transform: 'translateX(-50%)' }}>0.618</span>
        <span className="absolute text-[10px] font-bold tabular-nums text-[#16A34A]" style={{ left: `${f382}%`, transform: 'translateX(-50%)' }}>0.382</span>
      </div>
    </div>
  )
}

export function FibLegend() {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor: '#1A1A2E' }}>
      <div className="flex items-start gap-3">
        <span className="text-[16px] shrink-0">📐</span>
        <div>
          <p className="text-[13px] font-bold text-white mb-1">피보나치 되돌림 읽는 법</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px] text-[#A5B4C3]">
            <span><strong className="text-white">38.2%</strong> — 약한 되돌림. 여기서 반등 = 강한 추세</span>
            <span><strong className="text-white">50.0%</strong> — 중간 되돌림. 가장 많이 쓰는 지지선</span>
            <span><strong className="text-white">61.8%</strong> — 황금비율. 여기 깨면 추세 전환</span>
          </div>
        </div>
      </div>
    </div>
  )
}
