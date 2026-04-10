'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */
interface SectorItem {
  sector: string; count: number; total_score: number
  momentum: number; flow_score: number; dual_bonus: number
  avg_chg: number; avg_drop: number; avg_upside: number
  net_flow_억: number; dual_buy_3d: number
  up_count: number; down_count: number
  deep: number; mid: number; mild: number; shallow: number
  cap_조: number; cap_억: number
  stage: string; stage_num: number; stage_color: string; warning: string
}

interface SectorRotation {
  timestamp: string; total_sectors: number; total_stocks: number
  sectors: SectorItem[]
}

/* ── 단계 스타일 ── */
const STAGE_STYLE: Record<string, { bg: string; border: string; text: string; badge: string; badgeText: string }> = {
  '선도': { bg: '#F0FDFA', border: '#14B8A6', text: '#0D9488', badge: '#14B8A6', badgeText: '#FFF' },
  '추격': { bg: '#F7FEE7', border: '#84CC16', text: '#65A30D', badge: '#84CC16', badgeText: '#FFF' },
  '대기': { bg: '#FFFBEB', border: '#EAB308', text: '#CA8A04', badge: '#EAB308', badgeText: '#FFF' },
  '후발': { bg: '#FEF2F2', border: '#EF4444', text: '#DC2626', badge: '#EF4444', badgeText: '#FFF' },
}

export default function SectorRotationView() {
  const [rotation, setRotation] = useState<SectorRotation | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        let res = await fetch('/api/quant/fib-scanner', { signal: controller.signal })
        let json = res.ok ? await res.json() : null
        if (json?.data?.sector_rotation) {
          setRotation(json.data.sector_rotation)
        } else {
          res = await fetch('/api/swing-dashboard', { signal: controller.signal })
          json = res.ok ? await res.json() : null
          setRotation(json?.data?.sector_rotation ?? null)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setRotation(null)
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-3">
        <div className="h-8 w-48 bg-[var(--bg-row)] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 bg-[var(--bg-row)] rounded-xl" />)}
        </div>
      </div>
    )
  }

  const sectors = rotation?.sectors ?? []

  if (sectors.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 text-center py-12">
        <p className="text-[#6B7280]">섹터 로테이션 데이터가 아직 없습니다.</p>
        <p className="text-[#9CA3AF] text-sm mt-1">매일 16:45 업데이트됩니다.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-[17px] font-bold text-[#1A1A2E]">섹터 로테이션 맵</h2>
          <p className="text-[12px] text-[#6B7280]">자금 흐름 예측 · 피보나치 + 수급 + 모멘텀</p>
        </div>
        <div className="flex items-center gap-3 text-[12px] text-[#6B7280]">
          <span>{rotation!.total_sectors}개 섹터 · {rotation!.total_stocks}종목</span>
          <span>{rotation!.timestamp}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {sectors.map((s) => {
          const st = STAGE_STYLE[s.stage] ?? STAGE_STYLE['대기']
          const fibTotal = s.deep + s.mid + s.mild + s.shallow
          const capText = s.cap_조 > 0 ? `${s.cap_조.toFixed(1)}조` : `${s.cap_억.toLocaleString()}억`

          return (
            <div
              key={s.sector}
              className="rounded-xl p-4"
              style={{ backgroundColor: st.bg, border: `1px solid ${st.border}30` }}
            >
              {/* 상단: 뱃지 + 섹터명 + 점수 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: st.badge, color: st.badgeText }}
                  >
                    {s.stage}
                  </span>
                  <span className="text-[15px] font-bold text-[#1A1A2E]">{s.sector}</span>
                  <span className="text-[11px] text-[#6B7280]">{s.count}종목 · {capText}</span>
                </div>
                <span
                  className="text-[18px] font-black tabular-nums"
                  style={{ color: s.total_score >= 0 ? st.text : '#DC2626' }}
                >
                  {s.total_score >= 0 ? '+' : ''}{s.total_score.toFixed(1)}
                </span>
              </div>

              {/* 점수 구성 3칸 */}
              <div className="grid grid-cols-3 gap-1.5 mb-3">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">모멘텀</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: '#2563EB' }}>
                    {s.momentum >= 0 ? '+' : ''}{s.momentum.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">수급</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: s.flow_score >= 0 ? '#16A34A' : '#DC2626' }}>
                    {s.flow_score >= 0 ? '+' : ''}{s.flow_score.toFixed(1)}
                  </p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-[10px] font-bold text-[#6B7280]">쌍유입</p>
                  <p className="text-[14px] font-black tabular-nums" style={{ color: '#D97706' }}>
                    {s.dual_bonus > 0 ? '+' : ''}{s.dual_bonus.toFixed(0)}
                  </p>
                </div>
              </div>

              {/* 상세 정보 2행 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px] mb-2">
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">3일 수급</span>
                  <span className="font-bold tabular-nums" style={{ color: s.net_flow_억 >= 0 ? '#16A34A' : '#DC2626' }}>
                    {s.net_flow_억 >= 0 ? '+' : ''}{s.net_flow_억.toLocaleString()}억
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">쌍유입</span>
                  <span className="font-bold text-[#1A1A2E] tabular-nums">{s.dual_buy_3d}종목</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">평균 하락</span>
                  <span className="font-bold text-[#DC2626] tabular-nums">{s.avg_drop.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">상승여력</span>
                  <span className="font-bold text-[#16A34A] tabular-nums">+{s.avg_upside.toFixed(1)}%</span>
                </div>
              </div>

              {/* 종목 등락 */}
              <div className="flex items-center gap-2 text-[12px] mb-2">
                <span className="text-[#6B7280]">등락</span>
                <span className="font-bold text-[#DC2626]">↑{s.up_count}</span>
                <span className="font-bold text-[#2563EB]">↓{s.down_count}</span>
                <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden ml-1">
                  <div
                    className="h-full bg-[#DC2626] rounded-full"
                    style={{ width: `${(s.up_count / (s.up_count + s.down_count || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* 피보나치 존 분포 */}
              {fibTotal > 0 && (
                <div className="flex items-center gap-1 text-[10px]">
                  {[
                    { label: 'DEEP', count: s.deep, color: '#EF4444' },
                    { label: 'MID', count: s.mid, color: '#F97316' },
                    { label: 'MILD', count: s.mild, color: '#EAB308' },
                    { label: 'SH', count: s.shallow, color: '#22C55E' },
                  ].filter(z => z.count > 0).map((z) => (
                    <div key={z.label} className="flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: z.color }} />
                      <span className="text-[#6B7280] font-bold">{z.label} {z.count}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning */}
              {s.warning && (
                <div className="mt-2 rounded-md px-2.5 py-1.5 text-[11px] font-bold" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
                  ⚠ {s.warning}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
