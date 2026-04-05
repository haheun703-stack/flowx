'use client'

import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, suffix: string, inView: boolean) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    if (!inView) return
    const duration = 1500
    const start = performance.now()
    let raf: number
    const tick = () => {
      const progress = Math.min((performance.now() - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * target).toLocaleString())
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, inView])
  return display + suffix
}

const STATS = [
  { value: 1400, suffix: '+', label: 'KOSPI·KOSDAQ 종목 분석' },
  { value: 13, suffix: '개', label: '섹터 실시간 추적' },
  { value: 8, suffix: '시', label: '매일 아침 브리핑' },
  { value: 350, suffix: '+', label: 'AI 분석 종목 풀' },
]

export function SocialProofSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true) },
      { threshold: 0.3 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section ref={ref} className="py-16 bg-[var(--landing-bg-secondary)]">
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-[var(--landing-text)]">
              {useCountUp(stat.value, stat.suffix, inView)}
            </div>
            <div className="text-sm text-[var(--landing-text-dim)] mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
