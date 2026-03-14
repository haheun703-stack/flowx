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
        className="flex items-center bg-[#0d1420] border border-[#1a2535] rounded-lg px-3 py-1.5 gap-2 w-64 hover:border-[#253548] hover:bg-[#131722] transition-colors"
      >
        <Search size={14} className="text-white" />
        <span className="text-sm text-gray-300 font-bold">종목명 또는 코드...</span>
      </button>
      <StockSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
