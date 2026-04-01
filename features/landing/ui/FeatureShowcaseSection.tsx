'use client'

import { useEffect, useRef, useState } from 'react'
import { ImagePlaceholder } from './ImagePlaceholder'

const SHOWCASES = [
  {
    title: '실시간 수급 X-Ray',
    desc: '외국인·기관·개인의 매수/매도 흐름을 실시간으로 추적합니다. 누가 사고, 누가 파는지 한 화면에서 확인하세요.',
    label: '수급 X-Ray 대시보드',
  },
  {
    title: 'AI 종목 추천 시스템',
    desc: '머신러닝 모델이 매일 아침 8시에 추천 종목을 업데이트. 적중률, 수익률, 추천 근거를 투명하게 공개합니다.',
    label: 'AI 추천 패널',
  },
  {
    title: '섹터 히트맵 & 로테이션',
    desc: '13개 업종의 자금 흐름 변화를 히트맵으로 시각화. 어떤 섹터에 돈이 몰리고 빠지는지 직관적으로 파악하세요.',
    label: '섹터 히트맵',
  },
]

export function FeatureShowcaseSection() {
  return (
    <section id="showcase" className="py-24 px-6 bg-[var(--landing-bg-secondary)]">
      <div className="max-w-[1200px] mx-auto space-y-24">
        {SHOWCASES.map((item, i) => (
          <ShowcaseRow key={item.title} item={item} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

function ShowcaseRow({
  item,
  reverse,
}: {
  item: (typeof SHOWCASES)[number]
  reverse: boolean
}) {
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
    <div
      ref={ref}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 ${
        visible ? 'landing-animate' : 'opacity-0'
      }`}
    >
      <div className="md:w-1/2 space-y-4">
        <h3 className="text-2xl font-semibold text-[var(--landing-text)]">{item.title}</h3>
        <p className="text-[var(--landing-text-sub)] leading-relaxed">{item.desc}</p>
      </div>
      <div className="md:w-1/2">
        <ImagePlaceholder label={item.label} aspectRatio="4/3" />
      </div>
    </div>
  )
}
