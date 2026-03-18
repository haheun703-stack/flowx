'use client'

import { useState } from 'react'
import { useIntelligenceScenarios, type ScenarioItem } from '../api/useIntelligence'

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: 'text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/30',
  HIT: 'text-[#ff3b5c] bg-[#ff3b5c]/10 border-[#ff3b5c]/30',
  MISS: 'text-[#64748b] bg-[#64748b]/10 border-[#64748b]/30',
  EXPIRED: 'text-[#555] bg-[#555]/10 border-[#555]/30',
}

const TIMEFRAME_LABEL: Record<string, string> = {
  SHORT: '단기',
  MID: '중기',
  LONG: '장기',
}

function ConfidenceDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < level ? 'bg-[#00ff88]' : 'bg-[#2a2a3a]'}`} />
      ))}
    </div>
  )
}

function ChainStep({ steps }: { steps: string[] }) {
  return (
    <div className="flex items-center gap-1 flex-wrap my-1.5">
      {steps.map((step, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-[11px] text-[#e2e8f0] bg-[#1a2535] px-1.5 py-0.5 rounded-sm border border-[#2a2a3a]">
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="text-[10px] text-[#555]">→</span>
          )}
        </span>
      ))}
    </div>
  )
}

function ScenarioCard({ item }: { item: ScenarioItem }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-[#2a2a3a] rounded bg-[#0d1117] hover:border-[#00ff88]/30 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-3 py-2.5"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[9px] px-1 py-0.5 rounded-sm border font-bold ${STATUS_COLOR[item.status]}`}>
            {item.status}
          </span>
          <span className="text-[10px] text-[#8a8a8a]">{TIMEFRAME_LABEL[item.time_frame]}</span>
          <ConfidenceDots level={item.confidence} />
          <span className="text-[10px] text-[#555] ml-auto">{item.date}</span>
        </div>
        <div className="text-[14px] text-[#e2e8f0] font-bold leading-snug">{item.title}</div>
        <div className="text-[11px] text-[#8a8a8a] mt-0.5">{item.trigger_event}</div>
      </button>

      {/* CHAIN MAP 화살표 */}
      <div className="px-3">
        <ChainStep steps={item.chain_steps} />
      </div>

      {/* 수혜 섹터 + 관심종목 */}
      <div className="px-3 pb-2 flex flex-wrap gap-1">
        {item.beneficiary_sectors.map(s => (
          <span key={s} className="text-[9px] text-[#f59e0b] border border-[#f59e0b]/20 px-1 rounded-sm">{s}</span>
        ))}
        {item.watch_tickers.map(t => (
          <span key={t.code} className="text-[9px] text-[#0ea5e9] border border-[#0ea5e9]/20 px-1 rounded-sm">{t.name}</span>
        ))}
      </div>

      {/* 확장: 상세 설명 */}
      {expanded && item.reasoning && (
        <div className="px-3 pb-3 border-t border-[#2a2a3a] pt-2">
          <div className="text-[11px] text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">{item.reasoning}</div>
        </div>
      )}
    </div>
  )
}

export function ScenarioAnalysisPanel() {
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE')
  const { data, isLoading } = useIntelligenceScenarios(statusFilter)
  const items = data?.items ?? []

  const filters = ['ACTIVE', 'HIT', 'MISS', 'ALL'] as const

  return (
    <div className="flex flex-col h-full text-xs" style={{ fontFamily: 'var(--font-terminal)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#2a2a3a]">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
          <span className="text-sm font-bold text-[#e2e8f0] tracking-wider uppercase">CHAIN MAP</span>
          <span className="text-[10px] text-[#00ff88] font-bold">시나리오 분석</span>
        </div>
        <div className="flex gap-1">
          {filters.map(f => (
            <button key={f}
              onClick={() => setStatusFilter(f)}
              className={`text-[10px] px-2 py-0.5 rounded-sm border font-bold transition-colors ${
                statusFilter === f
                  ? 'text-[#e2e8f0] border-[#00ff88]/50 bg-[#00ff88]/10'
                  : 'text-[#555] border-[#2a2a3a] hover:text-[#8a8a8a]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[80px] bg-[#1a2535] animate-pulse rounded" />
          ))
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#334155]">시나리오 없음</div>
        ) : (
          items.map(item => <ScenarioCard key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
