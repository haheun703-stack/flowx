'use client'

import type { SmartMoneyItem } from './alpha-types'

function fmtBil(n: number): string {
  return `${n >= 0 ? '+' : ''}${n.toFixed(0)}억`
}

function fmtPrice(n: number): string {
  return n.toLocaleString('ko-KR')
}

function MoneyRow({ item }: { item: SmartMoneyItem }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[14px] font-bold text-[#1A1A2E] flex-1 truncate">
        {item.name}
      </span>
      {item.foreign_5d_억 !== 0 && (
        <span
          className={`text-[12px] font-bold tabular-nums ${
            item.foreign_5d_억 > 0 ? 'text-[#2563EB]' : 'text-[#DC2626]'
          }`}
        >
          외인{fmtBil(item.foreign_5d_억)}
        </span>
      )}
      {item.inst_5d_억 !== 0 && (
        <span
          className={`text-[12px] font-bold tabular-nums ${
            item.inst_5d_억 > 0 ? 'text-[#EA580C]' : 'text-[#DC2626]'
          }`}
        >
          기관{fmtBil(item.inst_5d_억)}
        </span>
      )}
      <span className="text-[13px] text-[#1A1A2E] tabular-nums">
        {fmtPrice(item.close)}
      </span>
      <span
        className={`text-[12px] font-bold tabular-nums ${
          item.change_pct >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
        }`}
      >
        {item.change_pct >= 0 ? '+' : ''}
        {item.change_pct.toFixed(1)}%
      </span>
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
    <div className="bg-white rounded-xl border border-[#E8E6E0] shadow-sm p-5">
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
