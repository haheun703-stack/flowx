'use client'

function fmtBil(v: number) {
  if (v >= 1000) return `$${(v / 1000).toFixed(1)}T`
  if (v >= 1) return `$${v.toFixed(0)}B`
  if (v > 0) return `$${(v * 1000).toFixed(0)}M`
  return '$0'
}

// ─── 그룹별 정의 ───

interface NumItem {
  key: string
  label: string
  fmt: (v: number) => string
  before?: number | string  // 전쟁 전 값 (비교용)
  danger?: boolean          // 위험 신호인지
}

interface NumGroup {
  title: string
  icon: string
  accentBg: string
  accentBorder: string
  accentText: string
  items: NumItem[]
}

const GROUPS: NumGroup[] = [
  {
    title: '에너지 충격',
    icon: '⛽',
    accentBg: '#FEF2F2',
    accentBorder: '#FECACA',
    accentText: '#DC2626',
    items: [
      { key: 'wti_current', label: 'WTI 현재', fmt: v => `$${v}`, before: '$60', danger: true },
      { key: 'wti_peak', label: 'WTI 최고', fmt: v => `$${v}` },
      { key: 'wti_change_pct', label: 'WTI 변동', fmt: v => `+${v}%`, before: 0, danger: true },
      { key: 'lpg_asia_change_pct', label: 'LPG 아시아', fmt: v => `+${v}%`, danger: true },
      { key: 'lpg_europe_change_pct', label: 'LPG 유럽', fmt: v => `+${v}%`, danger: true },
    ],
  },
  {
    title: '수혜자 이익',
    icon: '💰',
    accentBg: '#F0FDF4',
    accentBorder: '#BBF7D0',
    accentText: '#16A34A',
    items: [
      { key: 'defense_market_cap_increase_bil', label: '방산 시총 ↑', fmt: fmtBil, danger: true },
      { key: 'arms_contracts_bil', label: '무기계약', fmt: fmtBil, danger: true },
      { key: 'russia_extra_oil_income_annual_bil', label: '러시아 추가수입', fmt: fmtBil, danger: true },
      { key: 'trump_network_deals_bil', label: '트럼프 딜', fmt: fmtBil },
    ],
  },
  {
    title: '전쟁 비용',
    icon: '💣',
    accentBg: '#FFF7ED',
    accentBorder: '#FED7AA',
    accentText: '#EA580C',
    items: [
      { key: 'total_war_cost_bil_high', label: '전비 (상단)', fmt: fmtBil, danger: true },
      { key: 'total_war_cost_bil_low', label: '전비 (하단)', fmt: fmtBil },
      { key: 'pentagon_budget_request_bil', label: '펜타곤 예산', fmt: fmtBil },
    ],
  },
  {
    title: '여론',
    icon: '📊',
    accentBg: '#EDE9FE',
    accentBorder: '#DDD6FE',
    accentText: '#7C3AED',
    items: [
      { key: 'trump_approval_pct', label: '트럼프 지지율', fmt: v => `${v}%` },
      { key: 'americans_unwilling_high_gas_pct', label: '고유가 반대', fmt: v => `${v}%`, danger: true },
    ],
  },
]

export default function KeyNumbersGrid({ keyNumbers }: { keyNumbers: Record<string, number> }) {
  if (!keyNumbers || Object.keys(keyNumbers).length === 0) return null

  return (
    <div>
      <h3 className="text-[17px] font-black text-[#1A1A2E] mb-5">
        핵심 숫자 — 전쟁 전 vs 지금
      </h3>

      <div className="space-y-4">
        {GROUPS.map(group => {
          const groupItems = group.items.filter(item => keyNumbers[item.key] != null)
          if (groupItems.length === 0) return null

          return (
            <div
              key={group.title}
              className="rounded-xl p-4"
              style={{ backgroundColor: group.accentBg, border: `1px solid ${group.accentBorder}` }}
            >
              {/* 그룹 헤더 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{group.icon}</span>
                <span className="text-[14px] font-black" style={{ color: group.accentText }}>
                  {group.title}
                </span>
              </div>

              {/* 숫자 카드들 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {groupItems.map(item => {
                  const val = keyNumbers[item.key]
                  const formatted = item.fmt(val)
                  const isLarge = val >= 100 || formatted.includes('T')

                  return (
                    <div
                      key={item.key}
                      className="bg-white rounded-lg p-3 text-center shadow-sm"
                    >
                      <p className="text-[11px] font-bold text-[#6B7280] mb-1">{item.label}</p>
                      <p
                        className={`${isLarge ? 'text-[20px]' : 'text-[17px]'} font-black tabular-nums`}
                        style={{ color: item.danger ? group.accentText : '#1A1A2E' }}
                      >
                        {formatted}
                      </p>
                      {item.before != null && (
                        <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                          전쟁 전: {typeof item.before === 'number' ? item.fmt(item.before) : item.before}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
