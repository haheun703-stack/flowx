"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const tabs = [
  { href: "/scalper/brain", label: "BRAIN 판단" },
  { href: "/scalper/sector-flow", label: "섹터수급" },
  { href: "/scalper/sector-momentum", label: "섹터모멘텀" },
  { href: "/scalper/etf-flow", label: "ETF수급" },
  { href: "/scalper/etf-picks", label: "ETF추천" },
]

export function ScalperNav() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b border-gray-800 px-6 bg-[#080b10]">
      {tabs.map((t) => {
        const active = pathname === t.href
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`px-4 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              active
                ? "text-[#ff3b5c] border-[#ff3b5c]"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {t.label}
          </Link>
        )
      })}
    </div>
  )
}
