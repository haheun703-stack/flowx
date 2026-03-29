'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { StockSearchModal } from '@/features/stock-search/ui/StockSearchModal'

export function TickerSearch() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="종목 검색 열기"
        className="flex items-center bg-gray-50 border border-[var(--border)] rounded-lg px-3 py-1.5 gap-2 w-64 hover:border-[var(--border-bright)] hover:bg-white transition-colors"
      >
        <Search size={14} className="text-gray-500" />
        <span className="text-sm text-gray-400 font-bold">종목명 또는 코드...</span>
      </button>
      <StockSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
