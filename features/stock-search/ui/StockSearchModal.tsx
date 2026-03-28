'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { StockItem } from '../types'
import { useStockList } from '../model/useStockSearch'

const POPULAR: StockItem[] = [
  { code: '005930', name: '삼성전자', market: 'KOSPI' },
  { code: '000660', name: 'SK하이닉스', market: 'KOSPI' },
  { code: '035420', name: 'NAVER', market: 'KOSPI' },
  { code: '006400', name: '삼성SDI', market: 'KOSPI' },
  { code: '068270', name: '셀트리온', market: 'KOSPI' },
  { code: '005380', name: '현대차', market: 'KOSPI' },
]

const CODE_RE = /^\d{6}$/

interface Props {
  open: boolean
  onClose: () => void
}

export function StockSearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { data: stocks = [], isLoading } = useStockList(open)

  const filtered = useMemo(() => {
    if (!query.trim()) return POPULAR
    const q = query.trim().toLowerCase()
    const results: StockItem[] = []
    for (const s of stocks) {
      if (s.name.toLowerCase().includes(q) || s.code.includes(q)) {
        results.push(s)
        if (results.length >= 20) break
      }
    }
    return results
  }, [query, stocks])

  const handleSelect = useCallback((code: string) => {
    if (!CODE_RE.test(code)) return
    router.push(`/stock/${code}`)
    onClose()
  }, [router, onClose])

  // 모달 열릴 때 input focus + body scroll lock
  useEffect(() => {
    if (!open) return
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 50)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // 키보드 핸들러 — useRef로 stale closure 방지
  const filteredRef = useRef(filtered)
  filteredRef.current = filtered

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && !e.isComposing && filteredRef.current.length > 0) {
        handleSelect(filteredRef.current[0].code)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose, handleSelect])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-[#0a0f18] border border-[#1a2535] rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 검색 입력 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2535]">
          <Search size={18} className="text-[#64748b] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="종목명 또는 코드 검색..."
            className="flex-1 bg-transparent text-sm text-[#e2e8f0] placeholder-[#334155] outline-none"
          />
          <div className="flex items-center gap-2 shrink-0">
            {stocks.length > 0 && (
              <span className="text-[10px] text-[#64748b]">
                전체 {stocks.length.toLocaleString()}개
              </span>
            )}
            <button onClick={onClose} className="text-[#64748b] hover:text-[#e2e8f0] transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* 결과 리스트 */}
        <div className="max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center text-sm text-[#334155]">
              종목 데이터 로딩 중...
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[#334155]">
              검색 결과 없음
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div className="px-4 pt-3 pb-1 text-[10px] text-[#334155] tracking-widest uppercase">
                  인기 종목
                </div>
              )}
              {filtered.map(s => (
                <button
                  key={`${s.market}-${s.code}`}
                  onClick={() => handleSelect(s.code)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#0d1420] transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-sm border font-bold ${
                      s.market === 'KOSPI'
                        ? 'text-[#0ea5e9] border-[#0ea5e9]/20'
                        : 'text-[#a855f7] border-[#a855f7]/20'
                    }`}>
                      {s.market}
                    </span>
                    <span className="text-sm text-[#e2e8f0] font-medium group-hover:text-white">
                      {s.name}
                    </span>
                  </div>
                  <span className="text-xs text-[#334155] font-mono tabular-nums">
                    {s.code}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* 하단 힌트 */}
        <div className="px-4 py-2 border-t border-[#1a2535] flex items-center gap-3 text-[10px] text-[#334155]">
          <span><kbd className="px-1 py-0.5 rounded bg-[#1a2535] text-[#64748b]">ESC</kbd> 닫기</span>
          <span><kbd className="px-1 py-0.5 rounded bg-[#1a2535] text-[#64748b]">Enter</kbd> 선택</span>
        </div>
      </div>
    </div>
  )
}
