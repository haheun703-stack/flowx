'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { POPULAR_TICKERS } from '@/shared/constants/tickers'

export function TickerSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const filtered = POPULAR_TICKERS.filter(t =>
    t.name.includes(query) || t.code.includes(query)
  )

  const handleSelect = (code: string) => {
    router.push(`/chart/${code}`)
    setQuery('')
    setIsOpen(false)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-gray-800 border-2 border-white rounded-lg px-3 py-1.5 gap-2 w-64">
        <Search size={14} className="text-white" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          placeholder="종목명 또는 코드..."
          className="bg-transparent text-sm text-white font-bold placeholder-gray-300 placeholder:font-bold outline-none w-full"
        />
      </div>
      {isOpen && filtered.length > 0 && (
        <div className="absolute top-full mt-1 right-0 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden w-64 z-50 shadow-2xl">
          {filtered.map(t => (
            <button
              key={t.code}
              onClick={() => handleSelect(t.code)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-gray-800 transition-colors"
            >
              <span className="text-white font-medium">{t.name}</span>
              <span className="text-gray-500 text-xs font-mono">{t.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
