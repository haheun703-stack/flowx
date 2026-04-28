"use client"

import { useState } from "react"
import DaytradingPicksPanel from "@/features/daytrading/ui/DaytradingPicksPanel"
import DaytradingPerformancePanel from "@/features/daytrading/ui/DaytradingPerformancePanel"
import SwingDashboardView from "./SwingDashboardView"
import CycleScanView from "./CycleScanView"
import StealthScannerView from "./StealthScannerView"
import ForeignFlowPanel from "./ForeignFlowPanel"
import SmallcapThemeTab from "@/features/quant/ui/SmallcapThemeTab"
import BluechipInspectionTab from "@/features/quant/ui/BluechipInspectionTab"
import SectorFireView from "@/features/quant/ui/SectorFireView"
import TodayVsNxtPanel from "./TodayVsNxtPanel"

/* ── 상단 탭 정의 ── */
const TABS = [
  { key: "dashboard", label: "시장판단 & 전략" },
  { key: "trade", label: "매매포인트" },
  { key: "supply", label: "수급추적" },
] as const

type TabKey = (typeof TABS)[number]["key"]

/* ── 피보나치 3탭 (매매포인트 내부) ── */
const QUANT_TABS = [
  { key: "smallcap", label: "전체 피보나치" },
  { key: "bluechip", label: "대형주 피보나치" },
  { key: "sector", label: "섹터 로테이션" },
] as const

type QuantTab = (typeof QUANT_TABS)[number]["key"]

function QuantTabsPanel() {
  const [tab, setTab] = useState<QuantTab>("smallcap")
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6">
      <nav className="tab-scroll flex gap-1.5 bg-[#F5F4F0] rounded-xl p-1.5 border border-[#E2E5EA] w-fit max-w-full mb-4">
        {QUANT_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 py-2 px-4 rounded-lg text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
              tab === t.key
                ? "bg-[#00FF88] text-[#1A1A2E] shadow-sm"
                : "text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "smallcap" && <SmallcapThemeTab bluechip={null} />}
      {tab === "bluechip" && <BluechipInspectionTab bluechip={null} />}
      {tab === "sector" && <SectorFireView />}
    </div>
  )
}

/* ── 섹션 구분선 ── */
function SectionDivider({ title }: { title: string }) {
  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-6 mt-10 mb-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E2E5EA]" />
        <h2 className="text-[15px] md:text-[17px] font-bold text-[#1A1A2E] whitespace-nowrap">
          {title}
        </h2>
        <div className="h-px flex-1 bg-[#E2E5EA]" />
      </div>
    </div>
  )
}

export function SwingTabsView() {
  const [tab, setTab] = useState<TabKey>("dashboard")

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ── 상단 탭 네비게이션 (퀀트 SystemPage 동일 패턴) ── */}
      <div className="max-w-[1400px] mx-auto px-3 md:px-6 pt-6 pb-2">
        <nav className="tab-scroll flex gap-1.5 bg-[#F5F4F0] rounded-xl p-1.5 border border-[#E2E5EA] w-fit max-w-full">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 px-5 rounded-lg text-[14px] font-semibold transition-all duration-150 whitespace-nowrap ${
                tab === t.key
                  ? "bg-[#00FF88] text-[#1A1A2E] shadow-sm"
                  : "text-[#9CA3AF] hover:text-[#1A1A2E] hover:bg-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── 탭 1: 시장판단 & 전략 ── */}
      {tab === "dashboard" && <SwingDashboardView />}

      {/* ── 탭 2: 매매포인트 ── */}
      {tab === "trade" && (
        <>
          <DaytradingPicksPanel />
          <DaytradingPerformancePanel />
          <TodayVsNxtPanel />
          <SectionDivider title="피보나치 분석 + 섹터 로테이션" />
          <QuantTabsPanel />
        </>
      )}

      {/* ── 탭 3: 수급추적 ── */}
      {tab === "supply" && (
        <>
          <CycleScanView />
          <SectionDivider title="기관 선매집 탐지" />
          <StealthScannerView />
          <SectionDivider title="외국인·기관 수급 X-Ray" />
          <ForeignFlowPanel />
        </>
      )}
    </div>
  )
}
