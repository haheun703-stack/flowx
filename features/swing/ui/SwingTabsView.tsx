"use client"

import { useState } from "react"
import SwingDashboardView from "./SwingDashboardView"
import FibStocksView from "./FibStocksView"
import FibLeadersView from "./FibLeadersView"

const TABS = [
  { key: "dashboard", label: "대시보드" },
  { key: "fib-stocks", label: "피보나치 눌림목" },
  { key: "fib-leaders", label: "대형주" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function SwingTabsView() {
  const [tab, setTab] = useState<TabKey>("dashboard")

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 탭 바 */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <nav className="flex gap-1 bg-[#F5F4F0] rounded-xl p-1 border border-[#E8E6E0] w-fit">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
                tab === t.key
                  ? "bg-[#1A1A2E] text-white"
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
      {tab === "fib-stocks" && <FibStocksView />}
      {tab === "fib-leaders" && <FibLeadersView />}
    </div>
  )
}
