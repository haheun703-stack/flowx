'use client'

// ─── Row 2: 시장 환경 4박스 (스펙 §5) ───

interface MarketEnv4BoxProps {
  verdict?: string
  riskLevel?: string
  cashPct?: number
  recommendation?: string
  vix?: number
  vixGrade?: string
  dangerMode?: string
}

function boxColor(type: 'verdict' | 'risk' | 'cash' | 'rec', value?: string | number) {
  if (type === 'verdict') {
    const v = String(value ?? '').toLowerCase()
    if (v.includes('매수') || v.includes('공격') || v.includes('bull')) return '#059669'
    if (v.includes('관망') || v.includes('중립') || v.includes('neutral')) return '#D97706'
    if (v.includes('방어') || v.includes('매도') || v.includes('bear')) return '#DC2626'
    return '#6B7280'
  }
  if (type === 'risk') {
    const v = String(value ?? '').toLowerCase()
    if (v.includes('high') || v.includes('높음') || v.includes('danger')) return '#DC2626'
    if (v.includes('medium') || v.includes('보통')) return '#D97706'
    return '#059669'
  }
  if (type === 'cash') {
    const n = Number(value ?? 0)
    if (n >= 50) return '#DC2626'
    if (n >= 30) return '#D97706'
    return '#059669'
  }
  return '#6B7280'
}

export default function MarketEnv4Box({ verdict, riskLevel, cashPct, recommendation, vix, vixGrade, dangerMode }: MarketEnv4BoxProps) {
  const cards = [
    {
      label: '시장 분위기',
      value: verdict ?? '-',
      sub: dangerMode ? `⚠ ${dangerMode}` : undefined,
      color: boxColor('verdict', verdict),
    },
    {
      label: '리스크 수준',
      value: riskLevel ?? '-',
      sub: vix != null ? `VIX ${vix.toFixed(1)} (${vixGrade ?? '-'})` : undefined,
      color: boxColor('risk', riskLevel),
    },
    {
      label: '현금 비중',
      value: cashPct != null ? `${cashPct}%` : '-',
      sub: '권장 현금 비중',
      color: boxColor('cash', cashPct),
    },
    {
      label: '추천 전략',
      value: recommendation ?? '-',
      sub: undefined,
      color: '#6B7280',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="bg-white rounded-xl border border-[var(--border)] shadow-sm p-4"
        >
          <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            {c.label}
          </p>
          <p
            className="text-lg font-bold truncate"
            style={{ color: c.color }}
          >
            {c.value}
          </p>
          {c.sub && (
            <p className="text-[11px] text-[var(--text-muted)] mt-1 truncate">{c.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
