"use client"

import { useState } from "react"
import DaytradingPicksPanel from "@/features/daytrading/ui/DaytradingPicksPanel"
import DaytradingPerformancePanel from "@/features/daytrading/ui/DaytradingPerformancePanel"
import SwingDashboardView from "./SwingDashboardView"
import StealthScannerView from "./StealthScannerView"

const TABS = [
  { key: "dashboard", label: "대시보드" },
  { key: "daytrading", label: "단타 TOP픽" },
  { key: "stealth", label: "선매집 탐지" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function SwingTabsView() {
  const [tab, setTab] = useState<TabKey>("dashboard")

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 탭 바 */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6">
        <nav className="tab-scroll flex gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit max-w-full">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 md:py-2.5 px-3 md:px-5 rounded-lg text-[13px] md:text-[15px] font-bold transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "bg-[#00FF88] text-[#1A1A2E]"
                  : "text-[#6B7280] hover:text-[#1A1A2E] hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {tab === "daytrading" && (
        <>
          <DaytradingPicksPanel />
          <DaytradingPerformancePanel />
        </>
      )}
      {tab === "dashboard" && <SwingDashboardView />}
      {tab === "stealth" && <StealthScannerView />}
    </div>
  )
}
