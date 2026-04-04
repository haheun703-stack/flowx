"use client"

import { useState } from "react"
import SwingDashboardView from "./SwingDashboardView"
import FibStocksView from "./FibStocksView"

const TABS = [
  { key: "dashboard", label: "대시보드" },
  { key: "fib-stocks", label: "피보나치 눌림목" },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function SwingTabsView() {
  const [tab, setTab] = useState<TabKey>("dashboard")

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* 탭 바 */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6">
        <nav className="flex gap-1 bg-[var(--bg-row)] rounded-xl p-1 border border-[var(--border)] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 py-2 px-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
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
      {tab === "fib-stocks" && <FibStocksView />}
    </div>
  )
}
