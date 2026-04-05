'use client'

import Link from 'next/link'

const PLANS = [
  {
    name: 'FREE',
    price: '₩0',
    period: '영구 무료',
    desc: '기본 시장 현황과 제한된 분석',
    features: [
      '시장 종합 대시보드',
      '주요 지수 현황',
      'KOSPI/KOSDAQ 종목 검색',
      '기본 차트 (일봉)',
    ],
    cta: '무료로 시작',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'SIGNAL',
    price: '₩29,900',
    period: '/월',
    desc: 'AI 시그널과 수급 분석 전체 접근',
    features: [
      'FREE 전체 기능',
      'AI 종목 스크리닝 (매일 8시)',
      '외국인·기관 수급 X-Ray',
      '섹터 로테이션 히트맵',
      '세력 포착 알림',
      'ETF 시그널',
    ],
    cta: '시작하기',
    href: '/auth/signup',
    highlight: true,
  },
  {
    name: 'PRO',
    price: '₩59,900',
    period: '/월',
    desc: '프로 트레이더를 위한 올인원',
    features: [
      'SIGNAL 전체 기능',
      '실시간 스캘핑 시그널',
      '스윙 포지션 추적',
      '시나리오 딥 분석',
      '맞춤 알림 설정',
      'API 접근',
    ],
    cta: '시작하기',
    href: '/auth/signup',
    highlight: false,
  },
]

export function LandingPricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-2xl sm:text-[32px] font-semibold text-[var(--landing-text)] mb-4">
          요금제
        </h2>
        <p className="text-center text-[var(--landing-text-sub)] mb-6 max-w-xl mx-auto">
          베타 기간 중 모든 기능을 무료로 이용할 수 있습니다
        </p>

        {/* 베타 무료 배너 */}
        <div className="max-w-lg mx-auto mb-12 px-6 py-3 bg-[var(--landing-accent)]/5 border border-[var(--landing-accent)]/20 rounded-full text-center">
          <span className="text-[var(--landing-accent)] font-semibold text-sm">
            🎉 BETA 기간 — 전 요금제 무료 이용 가능
          </span>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 border transition-shadow ${
                plan.highlight
                  ? 'border-[var(--landing-accent)] shadow-lg shadow-[var(--landing-accent)]/10 relative'
                  : 'border-[var(--landing-border)]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--landing-accent)] text-[#1A1A2E] text-xs font-semibold rounded-full">
                  인기
                </div>
              )}
              <div className="text-sm font-semibold text-[var(--landing-accent)] mb-2">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold text-[var(--landing-text)]">{plan.price}</span>
                <span className="text-[var(--landing-text-dim)] text-sm">{plan.period}</span>
              </div>
              <p className="text-sm text-[var(--landing-text-sub)] mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--landing-text)]">
                    <svg className="w-4 h-4 mt-0.5 text-[var(--landing-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? 'bg-[var(--landing-accent)] text-[#1A1A2E] hover:bg-[var(--landing-accent-hover)]'
                    : 'border border-[var(--landing-border)] text-[var(--landing-text)] hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)]'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
