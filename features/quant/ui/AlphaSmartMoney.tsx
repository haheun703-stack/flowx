'use client'

import type { SmartMoneyItem } from './alpha-types'

function fmtBil(n: number | null | undefined): string {
  if (n == null) return '0억'
  return `${n >= 0 ? '+' : ''}${n.toFixed(0)}억`
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function MoneyRow({ item }: { item: SmartMoneyItem }) {
  const hasName = item.name && !/^\d{5,6}$/.test(item.name)
  return (
    <div className="py-2 space-y-0.5">
      {/* 1행: 종목명 + 티커 + 가격 + 등락률 */}
      <div className="flex items-center gap-2">
        <span className="truncate flex-1">
          <span className="text-[14px] font-bold text-[#1A1A2E]">{hasName ? item.name : item.ticker}</span>
          {hasName && <span className="text-[11px] text-[#9CA3AF] ml-1">{item.ticker}</span>}
        </span>
        <span className="text-[13px] text-[#1A1A2E] tabular-nums shrink-0">
          {fmtPrice(item.close)}
        </span>
        <span
          className={`text-[12px] font-bold tabular-nums shrink-0 ${
            item.change_pct >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
          }`}
        >
          {item.change_pct >= 0 ? '+' : ''}{item.change_pct.toFixed(1)}%
        </span>
      </div>
      {/* 2행: 수급 뱃지 */}
      <div className="flex gap-2">
        {item.foreign_5d_억 !== 0 && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              item.foreign_5d_억 > 0
                ? 'bg-[#2563EB]/10 text-[#2563EB]'
                : 'bg-[#DC2626]/10 text-[#DC2626]'
            }`}
          >
            외인{fmtBil(item.foreign_5d_억)}
          </span>
        )}
        {item.inst_5d_억 !== 0 && (
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
              item.inst_5d_억 > 0
                ? 'bg-[#EA580C]/10 text-[#EA580C]'
                : 'bg-[#DC2626]/10 text-[#DC2626]'
            }`}
          >
            기관{fmtBil(item.inst_5d_억)}
          </span>
        )}
      </div>
    </div>
  )
}

interface Props {
  dualBuy: SmartMoneyItem[]
  instTop: SmartMoneyItem[]
  fgnTop: SmartMoneyItem[]
}

export default function AlphaSmartMoney({ dualBuy, instTop, fgnTop }: Props) {
  const empty = dualBuy.length === 0 && instTop.length === 0 && fgnTop.length === 0

  return (
    <div className="bg-white rounded-xl border border-[#E2E5EA] shadow p-5">
      <h3 className="text-[15px] font-bold text-[#1A1A2E] mb-4">
        스마트 머니 흐름
      </h3>

      {empty ? (
        <p className="text-[13px] text-[#9CA3AF]">스마트 머니 데이터 없음</p>
      ) : (
        <>
          {/* 기관+외국인 동시매수 */}
          {dualBuy.length > 0 && (
            <div className="mb-4">
              <p className="text-[13px] font-bold text-[#16A34A] mb-1">
                기관+외국인 동시매수
              </p>
              <div className="divide-y divide-[#F5F4F0]">
                {dualBuy.map((item) => (
                  <MoneyRow key={item.ticker} item={item} />
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 기관 상위 */}
            {instTop.length > 0 && (
              <div>
                <p className="text-[13px] font-bold text-[#EA580C] mb-1">
                  기관 순매수 상위
                </p>
                <div className="divide-y divide-[#F5F4F0]">
                  {instTop.map((item) => (
                    <MoneyRow key={item.ticker} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* 외국인 상위 */}
            {fgnTop.length > 0 && (
              <div>
                <p className="text-[13px] font-bold text-[#2563EB] mb-1">
                  외국인 순매수 상위
                </p>
                <div className="divide-y divide-[#F5F4F0]">
                  {fgnTop.map((item) => (
                    <MoneyRow key={item.ticker} item={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
