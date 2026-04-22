"use client"

import { useState } from "react"
import DaytradingPicksPanel from "@/features/daytrading/ui/DaytradingPicksPanel"
import DaytradingPerformancePanel from "@/features/daytrading/ui/DaytradingPerformancePanel"
import SwingDashboardView from "./SwingDashboardView"
import CycleScanView from "./CycleScanView"
import StealthScannerView from "./StealthScannerView"
import ForeignFlowPanel from "./ForeignFlowPanel"

const TABS = [
  { key: "dashboard", label: "시장 판단 & 전략" },
  { key: "daytrading", label: "매매 포인트" },
  { key: "cycle", label: "수급 추적" },
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
      {tab === "dashboard" && <SwingDashboardView />}
      {tab === "daytrading" && (
        <>
          <DaytradingPicksPanel />
          <DaytradingPerformancePanel />
        </>
      )}
      {tab === "cycle" && (
        <>
          <CycleScanView />
          <div className="max-w-[1400px] mx-auto px-3 md:px-6 mt-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8E6E0]" />
              <h2 className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] whitespace-nowrap">
                외국인·기관 수급 X-Ray
              </h2>
              <div className="h-px flex-1 bg-[#E8E6E0]" />
            </div>
          </div>
          <ForeignFlowPanel />
          <div className="max-w-[1400px] mx-auto px-3 md:px-6 mt-10 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E8E6E0]" />
              <h2 className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] whitespace-nowrap">
                선매집 포착 — 아직 터지지 않은 조용한 매집
              </h2>
              <div className="h-px flex-1 bg-[#E8E6E0]" />
            </div>
          </div>
          <StealthScannerView />
        </>
      )}
    </div>
  )
}
