'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─── Types ─── */
interface RankItem {
  rank: number
  code: string
  name: string
  price: number
  change?: number
  change_pct: number
  volume: number
  volume_rate?: number
  turnover?: number
  amount_억?: number
  strength?: number
  frgn_qty?: number
  inst_qty?: number
  frgn_amt_억?: number
  inst_amt_억?: number
}

export interface MarketRankingData {
  date: string
  volume_rank: RankItem[]
  fluctuation_rank: RankItem[]
  volume_power: RankItem[]
  foreign_institution: {
    foreign_buy: RankItem[]
    foreign_sell: RankItem[]
    inst_buy: RankItem[]
    inst_sell: RankItem[]
  }
  limit_price: {
    upper_limit: RankItem[]
    lower_limit: RankItem[]
  }
  summary: Record<string, number> | null
}

/* ─── Helpers ─── */
const chgColor = (v: number) => v > 0 ? '#dc2626' : v < 0 ? '#2563eb' : '#888'
const chgStr = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
const fmtPrice = (v: number) => v.toLocaleString()
const fmtVol = (v: number) => {
  if (v >= 1e8) return `${(v / 1e8).toFixed(0)}억`
  if (v >= 1e4) return `${(v / 1e4).toFixed(0)}만`
  return v.toLocaleString()
}
const fmtAmt = (v: number) => {
  if (Math.abs(v) >= 10000) return `${(v / 10000).toFixed(1)}조`
  return `${v.toLocaleString()}억`
}

const TABS = [
  { key: 'volume', label: '거래량' },
  { key: 'fluct', label: '급등' },
  { key: 'power', label: '체결강도' },
  { key: 'supply', label: '수급' },
  { key: 'limit', label: '상하한가' },
] as const

type TabKey = typeof TABS[number]['key']

const DEFAULT_SHOW = 10

/* ─── Sub-components ─── */

function StockLink({ code, name }: { code: string; name: string }) {
  return (
    <Link href={`/stock/${code}`} className="hover:text-[#00FF88] transition-colors font-bold">
      {name}
    </Link>
  )
}

function VolumeTab({ items }: { items: RankItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? items : items.slice(0, DEFAULT_SHOW)

  return (
    <div>
      <div className="grid grid-cols-[32px_1fr_80px_70px_80px_70px] gap-1 text-[11px] font-bold text-[#9CA3AF] border-b border-[#E8E6E0] pb-1.5 mb-1">
        <span>#</span><span>종목</span><span className="text-right">현재가</span>
        <span className="text-right">등락률</span><span className="text-right">거래대금</span><span className="text-right">거래비</span>
      </div>
      {list.map(item => (
        <div key={item.code} className="grid grid-cols-[32px_1fr_80px_70px_80px_70px] gap-1 items-center py-1.5 border-b border-[#F0EDE8] text-[13px]">
          <span className="text-[#9CA3AF] font-bold tabular-nums">{item.rank}</span>
          <span className="truncate"><StockLink code={item.code} name={item.name} /></span>
          <span className="text-right tabular-nums font-semibold text-[#1A1A2E]">{fmtPrice(item.price)}</span>
          <span className="text-right tabular-nums font-bold" style={{ color: chgColor(item.change_pct) }}>{chgStr(item.change_pct)}</span>
          <span className="text-right tabular-nums text-[#6B7280]">{fmtAmt(item.amount_억 ?? 0)}</span>
          <span className="text-right tabular-nums text-[#6B7280]">{(item.volume_rate ?? 0).toFixed(0)}%</span>
        </div>
      ))}
      {items.length > DEFAULT_SHOW && (
        <button onClick={() => setShowAll(p => !p)} className="w-full text-center text-[12px] text-[#9CA3AF] hover:text-[#1A1A2E] py-2 font-bold">
          {showAll ? '접기 ▲' : `전체 ${items.length}개 보기 ▼`}
        </button>
      )}
    </div>
  )
}

function FluctTab({ items }: { items: RankItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? items : items.slice(0, DEFAULT_SHOW)

  return (
    <div>
      <div className="grid grid-cols-[32px_1fr_80px_70px_70px] gap-1 text-[11px] font-bold text-[#9CA3AF] border-b border-[#E8E6E0] pb-1.5 mb-1">
        <span>#</span><span>종목</span><span className="text-right">현재가</span>
        <span className="text-right">등락(원)</span><span className="text-right">등락률</span>
      </div>
      {list.map(item => (
        <div key={item.code} className="grid grid-cols-[32px_1fr_80px_70px_70px] gap-1 items-center py-1.5 border-b border-[#F0EDE8] text-[13px]">
          <span className="text-[#9CA3AF] font-bold tabular-nums">{item.rank}</span>
          <span className="truncate"><StockLink code={item.code} name={item.name} /></span>
          <span className="text-right tabular-nums font-semibold text-[#1A1A2E]">{fmtPrice(item.price)}</span>
          <span className="text-right tabular-nums font-bold" style={{ color: chgColor(item.change ?? 0) }}>
            {(item.change ?? 0) >= 0 ? '+' : ''}{fmtPrice(item.change ?? 0)}
          </span>
          <span className="text-right tabular-nums font-bold" style={{ color: chgColor(item.change_pct) }}>{chgStr(item.change_pct)}</span>
        </div>
      ))}
      {items.length > DEFAULT_SHOW && (
        <button onClick={() => setShowAll(p => !p)} className="w-full text-center text-[12px] text-[#9CA3AF] hover:text-[#1A1A2E] py-2 font-bold">
          {showAll ? '접기 ▲' : `전체 ${items.length}개 보기 ▼`}
        </button>
      )}
    </div>
  )
}

function PowerTab({ items }: { items: RankItem[] }) {
  const [showAll, setShowAll] = useState(false)
  const list = showAll ? items : items.slice(0, DEFAULT_SHOW)

  return (
    <div>
      <div className="grid grid-cols-[32px_1fr_80px_70px_80px] gap-1 text-[11px] font-bold text-[#9CA3AF] border-b border-[#E8E6E0] pb-1.5 mb-1">
        <span>#</span><span>종목</span><span className="text-right">현재가</span>
        <span className="text-right">등락률</span><span className="text-right">체결강도</span>
      </div>
      {list.map(item => (
        <div key={item.code} className="grid grid-cols-[32px_1fr_80px_70px_80px] gap-1 items-center py-1.5 border-b border-[#F0EDE8] text-[13px]">
          <span className="text-[#9CA3AF] font-bold tabular-nums">{item.rank}</span>
          <span className="truncate"><StockLink code={item.code} name={item.name} /></span>
          <span className="text-right tabular-nums font-semibold text-[#1A1A2E]">{fmtPrice(item.price)}</span>
          <span className="text-right tabular-nums font-bold" style={{ color: chgColor(item.change_pct) }}>{chgStr(item.change_pct)}</span>
          <span className="text-right tabular-nums font-black text-[#1A1A2E]">{(item.strength ?? 0).toFixed(1)}</span>
        </div>
      ))}
      {items.length > DEFAULT_SHOW && (
        <button onClick={() => setShowAll(p => !p)} className="w-full text-center text-[12px] text-[#9CA3AF] hover:text-[#1A1A2E] py-2 font-bold">
          {showAll ? '접기 ▲' : `전체 ${items.length}개 보기 ▼`}
        </button>
      )}
    </div>
  )
}

function SupplyColumn({ title, items, color }: { title: string; items: RankItem[]; color: string }) {
  return (
    <div>
      <div className="text-[13px] font-black mb-2" style={{ color }}>{title}</div>
      <div className="space-y-1">
        {items.slice(0, 10).map(item => (
          <div key={item.code} className="flex items-center justify-between text-[12px] py-1 border-b border-[#F0EDE8]">
            <span className="truncate flex-1 min-w-0">
              <StockLink code={item.code} name={item.name} />
            </span>
            <span className="tabular-nums font-bold ml-2 shrink-0" style={{ color: chgColor(item.change_pct) }}>
              {chgStr(item.change_pct)}
            </span>
            <span className="tabular-nums text-[11px] text-[#6B7280] ml-2 shrink-0 w-[60px] text-right">
              {fmtAmt(item.frgn_amt_억 ?? item.inst_amt_억 ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SupplyTab({ fi }: { fi: MarketRankingData['foreign_institution'] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <SupplyColumn title="외국인 순매수" items={fi.foreign_buy} color="#dc2626" />
      <SupplyColumn title="외국인 순매도" items={fi.foreign_sell} color="#2563eb" />
      <SupplyColumn title="기관 순매수" items={fi.inst_buy} color="#dc2626" />
      <SupplyColumn title="기관 순매도" items={fi.inst_sell} color="#2563eb" />
    </div>
  )
}

function LimitTab({ lp }: { lp: MarketRankingData['limit_price'] }) {
  const upper = lp.upper_limit ?? []
  const lower = lp.lower_limit ?? []

  if (upper.length === 0 && lower.length === 0) {
    return <p className="text-[13px] text-[#9CA3AF] py-4 text-center">상하한가 종목 없음</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 상한가 */}
      <div>
        <div className="text-[13px] font-black text-[#dc2626] mb-2">
          상한가 ({upper.length}종목)
        </div>
        {upper.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF]">없음</p>
        ) : (
          <div className="space-y-1">
            {upper.map(item => (
              <div key={item.code} className="flex items-center justify-between text-[12px] py-1 border-b border-[#F0EDE8]">
                <span className="truncate flex-1 min-w-0">
                  <StockLink code={item.code} name={item.name} />
                </span>
                <span className="tabular-nums font-bold text-[#dc2626] ml-2">{fmtPrice(item.price)}</span>
                <span className="tabular-nums text-[11px] text-[#6B7280] ml-2">{fmtVol(item.volume)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* 하한가 */}
      <div>
        <div className="text-[13px] font-black text-[#2563eb] mb-2">
          하한가 ({lower.length}종목)
        </div>
        {lower.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF]">없음</p>
        ) : (
          <div className="space-y-1">
            {lower.map(item => (
              <div key={item.code} className="flex items-center justify-between text-[12px] py-1 border-b border-[#F0EDE8]">
                <span className="truncate flex-1 min-w-0">
                  <StockLink code={item.code} name={item.name} />
                </span>
                <span className="tabular-nums font-bold text-[#2563eb] ml-2">{fmtPrice(item.price)}</span>
                <span className="tabular-nums text-[11px] text-[#6B7280] ml-2">{fmtVol(item.volume)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main Component ─── */
export default function MarketRankingPanel({ data }: { data: MarketRankingData }) {
  const [tab, setTab] = useState<TabKey>('volume')

  return (
    <div className="fx-card">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
        <span className="fx-card-title">시장 순위</span>
        <span className="text-[12px] text-[#9CA3AF]">{data.date} 장마감 기준</span>
      </div>

      {/* 탭 */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 text-[13px] font-bold rounded-lg transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-[#00FF88] text-[#1A1A2E]'
                : 'bg-[#F0EDE8] text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {t.label}
            {t.key === 'limit' && data.limit_price.upper_limit.length > 0 && (
              <span className="ml-1 text-[11px]">({data.limit_price.upper_limit.length})</span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {tab === 'volume' && <VolumeTab items={data.volume_rank} />}
      {tab === 'fluct' && <FluctTab items={data.fluctuation_rank} />}
      {tab === 'power' && <PowerTab items={data.volume_power} />}
      {tab === 'supply' && <SupplyTab fi={data.foreign_institution} />}
      {tab === 'limit' && <LimitTab lp={data.limit_price} />}
    </div>
  )
}
