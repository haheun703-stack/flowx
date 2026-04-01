'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'FlowX는 무료인가요?',
    a: '현재 베타 기간으로 모든 기능을 무료로 이용할 수 있습니다. 정식 출시 후에는 FREE(무료) / SIGNAL / PRO 요금제로 운영될 예정입니다.',
  },
  {
    q: '투자 추천 서비스인가요?',
    a: 'FlowX는 투자 자문 서비스가 아닙니다. AI 시그널과 데이터 분석을 제공하지만, 모든 투자 판단과 책임은 이용자 본인에게 있습니다.',
  },
  {
    q: '데이터는 실시간인가요?',
    a: '시장 데이터는 장중 실시간으로 업데이트되며, AI 종목 추천은 매일 아침 8시에 갱신됩니다. 일부 데이터는 5~15분 지연될 수 있습니다.',
  },
  {
    q: '어떤 종목을 분석하나요?',
    a: 'KOSPI와 KOSDAQ에 상장된 1,400개 이상의 종목을 분석합니다. ETF, 주요 글로벌 지수도 추적합니다.',
  },
  {
    q: '모바일에서도 사용할 수 있나요?',
    a: '네, 반응형 웹으로 제작되어 모바일 브라우저에서 동일하게 이용 가능합니다. 별도 앱 설치는 필요 없습니다.',
  },
  {
    q: '환불 정책은 어떻게 되나요?',
    a: '유료 서비스 결제일로부터 7일 이내, 서비스를 이용하지 않은 경우 전액 환불이 가능합니다. 자세한 내용은 환불 정책 페이지를 참조하세요.',
  },
]

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 px-6 bg-[var(--landing-bg-secondary)]">
      <div className="max-w-[720px] mx-auto">
        <h2 className="text-center text-2xl sm:text-[32px] font-semibold text-[var(--landing-text)] mb-4">
          자주 묻는 질문
        </h2>
        <p className="text-center text-[var(--landing-text-sub)] mb-12">
          궁금한 점이 있으신가요?
        </p>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[var(--landing-border)] rounded-2xl bg-white overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <span className="font-medium text-[var(--landing-text)]">{faq.q}</span>
                <svg
                  className={`w-5 h-5 text-[var(--landing-text-dim)] shrink-0 transition-transform duration-200 ${
                    openIdx === i ? 'rotate-180' : ''
                  }`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIdx === i && (
                <div className="px-6 pb-5 text-sm text-[var(--landing-text-sub)] leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
