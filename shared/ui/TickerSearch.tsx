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
        className="flex items-center bg-gray-800 border-2 border-white rounded-lg px-3 py-1.5 gap-2 w-64 hover:bg-gray-700 transition-colors"
      >
        <Search size={14} className="text-white" />
        <span className="text-sm text-gray-300 font-bold">종목명 또는 코드...</span>
      </button>
      <StockSearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
