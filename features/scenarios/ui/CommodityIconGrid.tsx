'use client'

import type { CommodityInfo } from '../types'
import { GRADE_OBSERVE } from '@/shared/constants/grades'

// ─── 원자재별 SVG 아이콘 메타 ───

interface IconMeta {
  fill: string
  render: (id: string) => React.ReactNode
}

const ICON_MAP: Record<string, IconMeta> = {
  wti: {
    fill: '#4B5563',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="12" y="15" width="36" height="55" rx="4" />
            <rect x="16" y="8" width="28" height="10" rx="3" />
          </clipPath>
        </defs>
        <rect x="12" y="15" width="36" height="55" rx="4" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="16" y="8" width="28" height="10" rx="3" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  ng: {
    fill: '#F59E0B',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d="M30 8 C20 25, 8 40, 12 58 C14 68, 24 75, 30 75 C36 75, 46 68, 48 58 C52 40, 40 25, 30 8Z" />
          </clipPath>
        </defs>
        <path d="M30 8 C20 25, 8 40, 12 58 C14 68, 24 75, 30 75 C36 75, 46 68, 48 58 C52 40, 40 25, 30 8Z" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  copper: {
    fill: '#B87333',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="8" y="30" width="44" height="35" rx="3" />
            <rect x="18" y="22" width="24" height="12" rx="2" />
          </clipPath>
        </defs>
        <rect x="8" y="30" width="44" height="35" rx="3" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="18" y="22" width="24" height="12" rx="2" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  gold: {
    fill: '#FFD700',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <polygon points="15,70 45,70 52,45 38,25 22,25 8,45" />
          </clipPath>
        </defs>
        <polygon points="15,70 45,70 52,45 38,25 22,25 8,45" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  silver: {
    fill: '#C0C0C0',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <circle cx="30" cy="48" r="22" />
          </clipPath>
        </defs>
        <circle cx="30" cy="48" r="22" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  tio2: {
    fill: '#60A5FA',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <path d="M24 10 L24 30 L10 70 L50 70 L36 30 L36 10 Z" />
          </clipPath>
        </defs>
        <path d="M24 10 L24 30 L10 70 L50 70 L36 30 L36 10 Z" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
  uranium: {
    fill: '#22C55E',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="12" y="10" width="36" height="60" rx="4" />
          </clipPath>
        </defs>
        <rect x="12" y="10" width="36" height="60" rx="4" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
        <circle cx="30" cy="40" r="8" fill="none" stroke="#D1D5DB" strokeWidth="1" />
      </g>
    ),
  },
  naphtha: {
    fill: '#818CF8',
    render: (id) => (
      <g>
        <defs>
          <clipPath id={`clip-${id}`}>
            <rect x="10" y="20" width="40" height="50" rx="5" />
            <rect x="22" y="10" width="16" height="14" rx="3" />
          </clipPath>
        </defs>
        <rect x="10" y="20" width="40" height="50" rx="5" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
        <rect x="22" y="10" width="16" height="14" rx="3" fill="#F0EDE8" stroke="#D1D5DB" strokeWidth="1.5" />
      </g>
    ),
  },
}

function getIconKey(commodityKey: string): string {
  const k = commodityKey.toLowerCase()
  if (k.includes('wti') || k.includes('원유') || k.includes('oil') || k.includes('brent')) return 'wti'
  if (k.includes('ng') || k.includes('천연가스') || k.includes('gas') || k.includes('lpg') || k.includes('lng')) return 'ng'
  if (k.includes('copper') || k.includes('구리')) return 'copper'
  if (k.includes('gold') || k.includes('금') || k.includes('gld')) return 'gold'
  if (k.includes('silver') || k.includes('은') || k.includes('slv')) return 'silver'
  if (k.includes('tio2') || k.includes('티타늄')) return 'tio2'
  if (k.includes('uranium') || k.includes('우라늄')) return 'uranium'
  if (k.includes('naphtha') || k.includes('나프타')) return 'naphtha'
  return 'wti' // fallback
}

function getStatusBadge(gapPct: number): { label: string; bg: string; text: string } {
  if (gapPct >= 80) return { label: '과열', bg: '#FEE2E2', text: '#DC2626' }
  if (gapPct >= 40) return { label: '보유', bg: '#FEF3C7', text: '#D97706' }
  if (gapPct >= 20) return { label: GRADE_OBSERVE, bg: '#FEF3C7', text: '#D97706' }
  return { label: '매수구간', bg: '#DCFCE7', text: '#16A34A' }
}

function calculateFillHeight(gapPercent: number, maxHeight: number): number {
  // 150%가 100% 채움. 80%+ → 50%+ 채움으로 직관적 표현
  const normalized = Math.min(Math.max(gapPercent, 0) / 150, 1)
  return normalized * maxHeight
}

// ─── 개별 원자재 아이콘 ───

function CommodityIcon({ commodity }: { commodity: CommodityInfo }) {
  const iconKey = getIconKey(commodity.key)
  const iconMeta = ICON_MAP[iconKey] ?? ICON_MAP.wti
  const id = `commodity-${commodity.key}`
  const status = getStatusBadge(commodity.gap_pct)

  const svgH = 80
  const fillH = calculateFillHeight(commodity.gap_pct, svgH)
  const isOverflow = commodity.gap_pct >= 100
  const fillOpacity = commodity.gap_pct >= 80 ? 0.85 : commodity.gap_pct >= 40 ? 0.7 : 0.5

  return (
    <div className="flex flex-col items-center text-center min-w-[100px]">
      {/* 원자재명 */}
      <p className="text-[14px] font-bold text-[#1A1A2E] mb-1.5 truncate w-full">{commodity.name}</p>

      {/* SVG 아이콘 */}
      <svg width="80" height="100" viewBox="0 0 60 80" className="mb-1.5">
        {/* 외곽 + clipPath 정의 */}
        {iconMeta.render(id)}

        {/* 채움 (아래에서 위로) */}
        <rect
          x="0" y={80 - fillH} width="60" height={fillH}
          fill={iconMeta.fill}
          opacity={fillOpacity}
          clipPath={`url(#clip-${id})`}
        />

        {/* 과열 넘침 표시: 100%+ 이면 상단에 빨간 점선 */}
        {isOverflow && (
          <line x1="5" y1="12" x2="55" y2="12" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
        )}

        {/* 중앙 갭% 텍스트 */}
        <text
          x="30" y="48" textAnchor="middle" fontSize="11" fontWeight="800"
          fill={commodity.gap_pct >= 80 ? '#FFF' : '#1A1A2E'}
          stroke={commodity.gap_pct >= 80 ? '#00000030' : 'none'}
          strokeWidth={commodity.gap_pct >= 80 ? 0.5 : 0}
        >
          {commodity.gap_pct.toFixed(0)}%
        </text>
      </svg>

      {/* 현재가 */}
      <p className="text-[15px] font-bold text-[#1A1A2E] tabular-nums">
        {commodity.unit === 'USD/bbl' || commodity.unit === 'USD/oz' || commodity.unit === 'USD/lb'
          ? `$${commodity.price.toFixed(1)}`
          : commodity.price.toLocaleString()
        }
      </p>

      {/* 원가 */}
      <p className="text-[12px] text-[#6B7280]">
        원가 {commodity.production_cost.toLocaleString()}
      </p>

      {/* 변동률 */}
      <p
        className="text-[13px] font-bold"
        style={{ color: commodity.gap_pct >= 50 ? '#DC2626' : commodity.gap_pct >= 20 ? '#D97706' : '#16A34A' }}
      >
        {commodity.gap_pct >= 0 ? '+' : ''}{commodity.gap_pct.toFixed(1)}% {commodity.gap_pct >= 0 ? '↑' : '↓'}
      </p>

      {/* 상태 뱃지 */}
      <span
        className="text-[11px] font-bold px-2 py-0.5 rounded-full mt-1"
        style={{ backgroundColor: status.bg, color: status.text }}
      >
        {status.label}
      </span>
    </div>
  )
}

// ─── 메인 ───

export default function CommodityIconGrid({ commodities }: { commodities: CommodityInfo[] }) {
  if (!commodities?.length) return null

  return (
    <div>
      <h3 className="text-[18px] font-bold text-[#1A1A2E] mb-4">
        원자재 원가갭 — 지금 얼마나 올랐나?
      </h3>

      <div className="flex flex-wrap gap-6 justify-center">
        {commodities.map(c => (
          <CommodityIcon key={c.key} commodity={c} />
        ))}
      </div>

      {/* 하단 범례 */}
      <div className="flex flex-wrap gap-6 justify-center mt-5 text-[12px] font-medium text-[#6B7280]">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0' }} />매수구간(&lt;20%)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#FEF3C7', border: '1px solid #FDE68A' }} />관찰/보유(20~80%)</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#FEE2E2', border: '1px solid #FECACA' }} />과열(80%+)</span>
      </div>
    </div>
  )
}
