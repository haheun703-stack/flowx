'use client'

import { useEffect, useState } from 'react'
import CrashBounceView from './CrashBounceView'
import AlphaContextBar from './AlphaContextBar'
import SectorHeatMap from './SectorHeatMap'
import AlphaScannerPanel from './AlphaScannerPanel'
import AlphaSmartMoney from './AlphaSmartMoney'
import AlphaPortfolio from './AlphaPortfolio'
import type { AlphaScannerData } from './alpha-types'

export default function SystemPage() {
  const [data, setData] = useState<AlphaScannerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'quant' | 'swing'>('quant')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      try {
        const res = await fetch('/api/alpha-scanner', { signal: controller.signal })
        if (!res.ok) throw new Error(`API error: ${res.status}`)
        const json = await res.json()
        setData(json.data ?? null)
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return
        setData(null)
      }
      setLoading(false)
    }
    load()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 pt-6 animate-pulse space-y-6">
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="h-14 bg-gray-200 rounded-xl" />
        <div className="h-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 pt-6 space-y-6">
      {/* 상단 그라데이션 라인 */}
      <div
        className="h-[2px] rounded-full"
        style={{
          background:
            tab === 'quant'
              ? 'linear-gradient(90deg, #7C3AED, #A78BFA 30%, #7C3AED 60%, #A78BFA)'
              : 'linear-gradient(90deg, #00FF88, #4ADE80 30%, #00FF88 60%, #4ADE80)',
        }}
      />

      {/* Quant / Swing 서브탭 */}
      <div className="flex items-center gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
        {(['quant', 'swing'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 rounded-lg text-[15px] font-bold transition-colors whitespace-nowrap ${
              tab === t
                ? 'bg-[#00FF88] text-[#1A1A2E]'
                : 'text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white'
            }`}
          >
            {t === 'quant' ? '퀀트시스템' : '급락반등'}
          </button>
        ))}
        {data?.date && (
          <span className="text-[13px] text-[#9CA3AF] ml-3">{data.date}</span>
        )}
      </div>

      {/* 급락반등 탭 */}
      {tab === 'swing' && <CrashBounceView />}

      {/* 퀀트시스템 탭 — 알파 스캐너 */}
      {tab === 'quant' && (
        <>
          {!data ? (
            <div className="text-center py-16 text-[#9CA3AF]">
              <p className="text-[16px] font-bold mb-2">알파 스캐너 데이터 없음</p>
              <p className="text-[13px]">
                퀀트봇이 장 마감 후 데이터를 업로드하면 표시됩니다
              </p>
            </div>
          ) : (
            <>
              {/* 영역 1: 상단 상태 바 */}
              {data.context && <AlphaContextBar ctx={data.context} />}

              {/* 영역 2: 섹터 온도 히트맵 */}
              {data.sector_heat && <SectorHeatMap items={data.sector_heat} />}

              {/* 영역 3: 알파 스캐너 (메인) */}
              <AlphaScannerPanel
                candidates={data.candidates ?? []}
                gradeSummary={
                  data.grade_summary ?? { GOLD: 0, SILVER: 0, BRONZE: 0 }
                }
                axisLabels={data.axis_labels}
              />

              {/* 영역 4: 하단 보조 (2열) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AlphaSmartMoney
                  dualBuy={data.smart_money?.dual_buy ?? []}
                  instTop={data.smart_money?.inst_top ?? []}
                  fgnTop={data.smart_money?.fgn_top ?? []}
                />
                <AlphaPortfolio
                  defensePct={data.portfolio?.defense_pct ?? 50}
                  offensePct={data.portfolio?.offense_pct ?? 50}
                  allocation={data.portfolio?.allocation ?? {}}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
