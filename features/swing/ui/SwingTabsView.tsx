"use client"

import { useState } from "react"
import SwingDashboardView from "./SwingDashboardView"
import { MarketBrainView } from "@/features/quant-scalper/ui/MarketBrainView"
import { SectorFlowView } from "@/features/quant-scalper/ui/SectorFlowView"
import { SectorMomentumView } from "@/features/quant-scalper/ui/SectorMomentumView"
import { EtfFlowView } from "@/features/quant-scalper/ui/EtfFlowView"
import { EtfPicksView } from "@/features/quant-scalper/ui/EtfPicksView"
import { SectorRotationView } from "@/features/quant-scalper/ui/SectorRotationView"

const TABS = [
  { key: "dashboard", label: "대시보드" },
  { key: "brain", label: "BRAIN 판단" },
  { key: "sector-flow", label: "섹터수급" },
  { key: "sector-momentum", label: "섹터모멘텀" },
  { key: "sector-rotation", label: "섹터로테이션" },
  { key: "etf-flow", label: "ETF수급" },
  { key: "etf-picks", label: "ETF추천" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function SwingTabsView() {
  const [tab, setTab] = useState<TabKey>("dashboard")

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 탭 바 — /quant pill 스타일 */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <nav className="flex gap-1 bg-[var(--bg-row)] rounded-xl p-1 border border-[var(--border)] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 px-3 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "bg-[var(--text-primary)] text-white"
                  : "text-[var(--text-dim)] hover:text-[var(--text-primary)] hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "dashboard" && <SwingDashboardView />}
      {tab === "brain" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <MarketBrainView />
        </div>
      )}
      {tab === "sector-flow" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <SectorFlowView />
        </div>
      )}
      {tab === "sector-momentum" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <SectorMomentumView />
        </div>
      )}
      {tab === "sector-rotation" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <SectorRotationView />
        </div>
      )}
      {tab === "etf-flow" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <EtfFlowView />
        </div>
      )}
      {tab === "etf-picks" && (
        <div className="max-w-[1400px] mx-auto px-6 pt-6">
          <EtfPicksView />
        </div>
      )}
    </div>
  )
}
