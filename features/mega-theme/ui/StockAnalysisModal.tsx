'use client'

import { useEffect, useState } from 'react'

/* ── 타입 ── */
interface StockAnalysis {
  ticker: string
  name: string
  analysis_date: string
  mega_theme_id: string | null
  company_overview: Record<string, unknown> | null
  financial_analysis: Record<string, unknown> | null
  supply_analysis: Record<string, unknown> | null
  technical_analysis: Record<string, unknown> | null
  shareholder_insider: Record<string, unknown> | null
  peer_comparison: Record<string, unknown> | null
  ai_judgment: Record<string, unknown> | null
  ai_commentary: string | null
  ai_commentary_source: string | null
}

/* ── 유틸 ── */
function fmtNum(n: unknown): string {
  if (n == null) return '-'
  const v = Number(n)
  if (isNaN(v)) return String(n)
  return v.toLocaleString('ko-KR')
}

function fmtPct(n: unknown): string {
  if (n == null) return '-'
  const v = Number(n)
  if (isNaN(v)) return String(n)
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}%`
}

function pctColor(n: unknown): string {
  const v = Number(n)
  if (isNaN(v)) return 'text-[#6B7280]'
  return v >= 0 ? 'text-[#DC2626]' : 'text-[#2563EB]'
}

/* ── 섹션 렌더러 ── */
function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="border border-[#E8E6E0] rounded-xl overflow-hidden">
      <div className="bg-[#F5F4F0] px-4 py-2.5 border-b border-[#E8E6E0]">
        <h3 className="text-[14px] font-bold text-[#1A1A2E]">{icon} {title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function KvRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-[#F5F4F0] last:border-0">
      <span className="text-[13px] text-[#6B7280]">{label}</span>
      <span className={`text-[13px] font-bold ${color ?? 'text-[#1A1A2E]'}`}>{value}</span>
    </div>
  )
}

function JsonKv({ data, keys }: { data: Record<string, unknown> | null; keys: [string, string][] }) {
  if (!data) return <p className="text-[13px] text-[#9CA3AF]">데이터 없음</p>
  return (
    <div>
      {keys.map(([k, label]) => {
        const v = data[k]
        if (v == null) return null
        const isNum = typeof v === 'number'
        const isPct = typeof k === 'string' && (k.includes('pct') || k.includes('rate') || k.includes('ratio') || k.includes('roe') || k.includes('roa') || k.includes('growth'))
        return (
          <KvRow
            key={k}
            label={label}
            value={isPct ? fmtPct(v) : isNum ? fmtNum(v) : String(v)}
            color={isPct ? pctColor(v) : undefined}
          />
        )
      })}
    </div>
  )
}

/* ── 전체 렌더 (JSONB 필드 자동 탐색) ── */
function AutoSection({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return <p className="text-[13px] text-[#9CA3AF]">데이터 없음</p>

  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => {
        if (v == null) return null
        // 중첩 객체는 건너뜀
        if (typeof v === 'object' && !Array.isArray(v)) {
          return (
            <div key={k} className="mt-2">
              <p className="text-[12px] font-bold text-[#6B7280] mb-1">{k.replace(/_/g, ' ').toUpperCase()}</p>
              <AutoSection data={v as Record<string, unknown>} />
            </div>
          )
        }
        if (Array.isArray(v)) {
          return (
            <div key={k} className="mt-1">
              <p className="text-[12px] font-bold text-[#6B7280]">{k.replace(/_/g, ' ')}</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {v.map((item, i) => (
                  <span key={i} className="text-[12px] px-2 py-0.5 rounded bg-[#F5F4F0] text-[#1A1A2E]">
                    {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                  </span>
                ))}
              </div>
            </div>
          )
        }
        const isNum = typeof v === 'number'
        const isPct = k.includes('pct') || k.includes('rate') || k.includes('ratio') || k.includes('roe') || k.includes('roa') || k.includes('growth') || k.includes('yield')
        return (
          <KvRow
            key={k}
            label={k.replace(/_/g, ' ')}
            value={isPct ? fmtPct(v) : isNum ? fmtNum(v) : String(v)}
            color={isPct ? pctColor(v) : undefined}
          />
        )
      })}
    </div>
  )
}

/* ── 모달 ── */
interface Props {
  ticker: string
  stockName: string
  onClose: () => void
}

export default function StockAnalysisModal({ ticker, stockName, onClose }: Props) {
  const [data, setData] = useState<StockAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`/api/stock/analysis?ticker=${ticker}`, { signal: controller.signal })
      .then(r => r.json())
      .then(j => setData(j.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [ticker])

  // ESC 닫기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const SECTIONS: { key: keyof StockAnalysis; title: string; icon: string }[] = [
    { key: 'company_overview', title: '기업 개요', icon: '🏢' },
    { key: 'financial_analysis', title: '재무 분석', icon: '📊' },
    { key: 'supply_analysis', title: '수급 분석', icon: '💰' },
    { key: 'technical_analysis', title: '기술적 분석', icon: '📈' },
    { key: 'shareholder_insider', title: '주주·내부자', icon: '👥' },
    { key: 'peer_comparison', title: '동종 비교', icon: '🔄' },
    { key: 'ai_judgment', title: 'AI 판단', icon: '🤖' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* 배경 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 */}
      <div className="relative w-full max-w-[800px] max-h-[90vh] mt-[5vh] bg-white rounded-2xl shadow-2xl overflow-y-auto mx-4">
        {/* 헤더 */}
        <div className="sticky top-0 z-10 bg-white border-b border-[#E8E6E0] px-5 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-[#1A1A2E]">{stockName}</h2>
            <p className="text-[13px] text-[#6B7280]">
              {ticker}
              {data?.analysis_date && <span className="ml-2">· {data.analysis_date} 분석</span>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6B7280] hover:text-[#1A1A2E] text-2xl leading-none px-2"
          >
            ×
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-5 space-y-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin w-8 h-8 border-2 border-[#E8E6E0] border-t-[#1A1A2E] rounded-full mx-auto" />
              <p className="text-[13px] text-[#6B7280] mt-3">분석 데이터 로딩 중...</p>
            </div>
          ) : !data ? (
            <div className="text-center py-16">
              <p className="text-[28px] mb-3">📋</p>
              <p className="text-[15px] font-bold text-[#1A1A2E]">아직 분석 데이터가 없습니다</p>
              <p className="text-[13px] text-[#6B7280] mt-1">
                매일 17:45 자동 분석됩니다. 곧 데이터가 채워집니다.
              </p>
              <a
                href={`/stock/${ticker}`}
                className="inline-block mt-4 text-[13px] font-bold text-[#2563EB] hover:underline"
              >
                기본 종목 페이지로 이동 →
              </a>
            </div>
          ) : (
            <>
              {/* AI 코멘터리 (최상단) */}
              {data.ai_commentary && (
                <div className="bg-gradient-to-r from-[#F0F0FF] to-[#F5F0FF] border border-[#C7D2FE] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] font-bold text-[#4C1D95]">✨ AI 종합 코멘터리</span>
                    {data.ai_commentary_source && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8E6E0] text-[#6B7280]">
                        {data.ai_commentary_source}
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-[#1A1A2E] leading-relaxed whitespace-pre-line">
                    {data.ai_commentary}
                  </p>
                </div>
              )}

              {/* 7개 섹션 */}
              {SECTIONS.map(sec => {
                const sectionData = data[sec.key] as Record<string, unknown> | null
                if (!sectionData) return null
                return (
                  <Section key={sec.key} title={sec.title} icon={sec.icon}>
                    <AutoSection data={sectionData} />
                  </Section>
                )
              })}

              {/* 하단 링크 */}
              <div className="text-center pt-2">
                <a
                  href={`/stock/${ticker}`}
                  className="text-[13px] font-bold text-[#2563EB] hover:underline"
                >
                  전체 종목 페이지로 이동 →
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
