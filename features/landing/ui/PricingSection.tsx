'use client'
import Link from 'next/link'

const PLANS = [
  {
    name: 'FREE',
    price: 0,
    desc: '지금 바로 사용 가능',
    color: 'border-[#00ff88]/50',
    btnColor: 'bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90',
    badge: '현재 무료',
    features: [
      '수급 X-Ray 차트',
      'Bloomberg 대시보드 전체',
      'AI 종목 추천 Top 5',
      '세력 포착 + 섹터 모멘텀',
      'KOSPI 30일 종가 차트',
      '글로벌 지수 6개 실시간',
    ],
  },
  {
    name: 'SIGNAL',
    price: 9900,
    desc: '고급 분석 도구',
    color: 'border-blue-500/50',
    btnColor: 'border border-gray-700 text-gray-400 cursor-default',
    features: [
      'FREE 전체 포함',
      '실시간 수급 알림',
      '포물선 탐지 알람',
      '텔레그램 브리핑',
      'DART 공시 알람',
    ],
  },
  {
    name: 'PRO',
    price: 29000,
    desc: '전문 트레이더용',
    color: 'border-purple-500/50',
    btnColor: 'border border-gray-700 text-gray-400 cursor-default',
    features: [
      'SIGNAL 전체 포함',
      '섹터 릴레이 레이더',
      '노코드 전략 빌더',
      '백테스트 엔진',
      'API 데이터 제공',
    ],
  },
]

export function PricingSection() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto" id="pricing">
      <div className="text-center mb-10 sm:mb-16">
        <div className="text-xs text-[#00ff88] font-mono tracking-widest uppercase mb-4">
          플랜 & 가격
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 font-display">
          베타 기간 전체 무료
        </h2>
        <p className="text-gray-500 text-sm font-mono">
          지금은 모든 기능을 무료로 체험하세요. 유료 플랜은 준비 중입니다.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`relative p-6 rounded-2xl border bg-gray-900/30 flex flex-col ${plan.color} ${
              plan.name === 'FREE' ? 'scale-105 shadow-2xl shadow-[#00ff88]/10' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-xs px-3 py-1 rounded-full font-bold font-mono bg-[#00ff88] text-black">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="font-mono text-xs tracking-widest text-gray-500 mb-1">
              {plan.name}
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {plan.price === 0 ? '무료' : `₩${plan.price.toLocaleString()}`}
              {plan.price > 0 && <span className="text-sm text-gray-500 font-normal">/월</span>}
            </div>
            <div className="text-xs text-gray-500 mb-6 font-mono">{plan.desc}</div>

            <ul className="space-y-2 flex-1 mb-6">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-[#00ff88] mt-0.5 shrink-0">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {plan.price === 0 ? (
              <Link
                href="/dashboard"
                className={`w-full text-center py-3 rounded-xl text-sm transition-all font-mono ${plan.btnColor}`}
              >
                대시보드 시작하기
              </Link>
            ) : (
              <div className={`w-full text-center py-3 rounded-xl text-sm font-mono ${plan.btnColor}`}>
                준비 중
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
