'use client'

import { useEffect, useRef, useState } from 'react'

const CARDS = [
  {
    icon: '🤖',
    title: 'AI 시그널',
    desc: '머신러닝 기반 매수·매도 시그널을 매일 아침 자동 생성. 적중률과 수익률을 투명하게 공개합니다.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: '🔍',
    title: '세력 포착 (스마트머니)',
    desc: '외국인·기관의 대량 매수를 실시간 감지. 프로그램 매매와 수급 X-Ray로 세력의 움직임을 추적합니다.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: '📊',
    title: '섹터 로테이션',
    desc: '13개 업종의 자금 흐름을 히트맵으로 시각화. 어떤 섹터로 돈이 몰리는지 한눈에 파악합니다.',
    color: 'bg-purple-50 text-purple-600',
  },
]

export function FeatureCardsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="features" className="py-24 px-6">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <h2 className="text-center text-2xl sm:text-[32px] font-semibold text-[var(--landing-text)] mb-4">
          왜 Flow<span className="text-[#00FF88]">X</span>인가?
        </h2>
        <p className="text-center text-[var(--landing-text-sub)] mb-16 max-w-xl mx-auto">
          트레이딩뷰에는 없는 한국 주식 특화 기능을 제공합니다
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              className={`p-8 rounded-2xl bg-white border-2 border-[#00FF88]/40 hover:border-[#00FF88] hover:shadow-lg hover:shadow-[#00FF88]/10 transition-all duration-300 ${
                visible ? 'landing-animate' : 'opacity-0'
              }`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 ${card.color}`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-[var(--landing-text)] mb-3">{card.title}</h3>
              <p className="text-sm text-[var(--landing-text-sub)] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
