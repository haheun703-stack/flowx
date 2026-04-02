'use client'

// ─── Row 1: 시장 경고 배너 (스펙 §4) ───
// Bear / Neutral / Bull 상태에 따라 색상 변경

interface MarketAlertBannerProps {
  verdict?: string
  regime?: string
  hotSectors?: { sector: string; ret_5: number }[]
  coldSectors?: { sector: string; ret_5: number }[]
}

function getAlertStyle(regime?: string) {
  const lower = (regime ?? '').toLowerCase()
  if (lower.includes('bear') || lower.includes('위험') || lower.includes('danger')) {
    return {
      bg: '#FEF2F2',
      border: '#FECACA',
      text: '#DC2626',
      icon: '🔴',
      label: 'BEAR MARKET',
    }
  }
  if (lower.includes('bull') || lower.includes('상승') || lower.includes('강세')) {
    return {
      bg: '#ECFDF5',
      border: '#A7F3D0',
      text: '#059669',
      icon: '🟢',
      label: 'BULL MARKET',
    }
  }
  return {
    bg: '#FFFBEB',
    border: '#FDE68A',
    text: '#D97706',
    icon: '🟡',
    label: 'NEUTRAL',
  }
}

export default function MarketAlertBanner({ verdict, regime, hotSectors, coldSectors }: MarketAlertBannerProps) {
  const style = getAlertStyle(regime)

  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: style.bg, border: `1px solid ${style.border}` }}
    >
      {/* 상단: 상태 + 판단 */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg">{style.icon}</span>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${style.text}15`, color: style.text }}
        >
          {style.label}
        </span>
        {regime && (
          <span className="text-xs font-medium" style={{ color: style.text }}>
            {regime}
          </span>
        )}
      </div>

      {/* 판단 요약 */}
      {verdict && (
        <p className="text-sm font-bold mb-3" style={{ color: style.text }}>
          {verdict}
        </p>
      )}

      {/* HOT / COLD 섹터 */}
      <div className="flex flex-wrap gap-4">
        {hotSectors && hotSectors.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#059669]">HOT</span>
            {hotSectors.slice(0, 5).map((s) => (
              <span
                key={s.sector}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium"
              >
                {s.sector} +{s.ret_5.toFixed(1)}%
              </span>
            ))}
          </div>
        )}
        {coldSectors && coldSectors.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-[#DC2626]">COLD</span>
            {coldSectors.slice(0, 5).map((s) => (
              <span
                key={s.sector}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] font-medium"
              >
                {s.sector} {s.ret_5.toFixed(1)}%
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
