'use client'
import Link from 'next/link'

const PLANS = [
  {
    name: 'FREE',
    price: 0,
    desc: '수급 X-Ray 기본 체험',
    color: 'border-gray-700',
    btnColor: 'border border-gray-700 text-gray-300 hover:border-gray-500',
    features: [
      '수급 X-Ray 차트 (1일 지연)',
      '기본 캔들 차트 + MA',
      '인기 종목 10개',
      'Why Now Engine (기본)',
    ],
  },
  {
    name: 'SIGNAL',
    price: 9900,
    desc: '실시간 수급 분석',
    color: 'border-blue-500/50',
    btnColor: 'bg-blue-500 text-white hover:bg-blue-400',
    badge: '인기',
    features: [
      '수급 X-Ray 실시간',
      '전체 KOSPI/KOSDAQ 검색',
      'RSI + 볼린저밴드',
      'Why Now Engine 풀버전',
      '글로벌 지수 실시간',
    ],
  },
  {
    name: 'PRO',
    price: 29000,
    desc: '포물선 탐지 + 알람',
    color: 'border-[#00ff88]/50',
    btnColor: 'bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90',
    badge: '추천',
    features: [
      'SIGNAL 전체 포함',
      '포물선 탐지 알람',
      '매일 아침 텔레그램 브리핑',
      '섹터 릴레이 레이더',
      'DART 공시 알람',
    ],
  },
  {
    name: 'QUANT',
    price: 59000,
    desc: '퀀트 전략 도구',
    color: 'border-purple-500/50',
    btnColor: 'bg-purple-500 text-white hover:bg-purple-400',
    features: [
      'PRO 전체 포함',
      '전략 빌더 (노코드)',
      '백테스트 엔진',
      'API 데이터 제공',
      '우선 고객 지원',
    ],
  },
]

export function PricingSection() {
  return (
    <section className="px-6 py-24 max-w-6xl mx-auto" id="pricing">
      <div className="text-center mb-16">
        <div className="text-xs text-[#00ff88] font-mono tracking-widest uppercase mb-4">
          플랜 & 가격
        </div>
        <h2 className="text-4xl font-bold mb-4 font-display">
          당신의 레벨에 맞게
        </h2>
        <p className="text-gray-500 text-sm font-mono">
          언제든 업그레이드/다운그레이드 가능 · 연간 결제 시 2개월 무료
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map((plan, i) => (
          <div
            key={i}
            className={`relative p-6 rounded-2xl border bg-gray-900/30 flex flex-col ${plan.color} ${
              plan.name === 'PRO' ? 'scale-105 shadow-2xl shadow-[#00ff88]/10' : ''
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`text-xs px-3 py-1 rounded-full font-bold font-mono ${
                  plan.name === 'PRO'
                    ? 'bg-[#00ff88] text-black'
                    : 'bg-blue-500 text-white'
                }`}>
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

            <Link
              href={plan.price === 0 ? '/chart/005930' : '/pricing'}
              className={`w-full text-center py-3 rounded-xl text-sm transition-all font-mono ${plan.btnColor}`}
            >
              {plan.price === 0 ? '무료로 시작' : '구독하기'}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
