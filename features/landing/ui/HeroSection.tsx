'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FlowxLogo } from '@/shared/ui/logo'

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    const start = performance.now()
    let raf: number
    const tick = () => {
      const progress = Math.min((performance.now() - start) / duration, 1)
      setCount(Math.round(progress * target))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return count
}

export function HeroSection() {
  const stockCount    = useCountUp(2100)
  const panelCount    = useCountUp(8)
  const indexCount    = useCountUp(6)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-24">

      {/* 배경 그리드 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(#00ff8815 1px, transparent 1px),
            linear-gradient(90deg, #00ff8815 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 배경 글로우 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00ff88] opacity-[0.03] blur-[100px] pointer-events-none" />

      {/* 대형 로고 */}
      <FlowxLogo variant="hero" showTagline={true} className="relative mb-12" />

      {/* 배지 */}
      <div className="relative flex items-center gap-3 mb-8 px-8 py-4 border border-[#00ff88]/30 rounded-full bg-[#00ff88]/5">
        <span className="w-4 h-4 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="text-2xl sm:text-3xl text-[#00ff88] font-mono tracking-widest uppercase">
          BETA — 무료 공개 중
        </span>
      </div>

      {/* 메인 헤드라인 */}
      <h1 className="relative text-center max-w-4xl mb-6 font-display">
        <span className="block text-3xl sm:text-5xl md:text-7xl text-[var(--text-primary)] leading-tight">
          한국주식 실시간의
        </span>
        <span className="block text-3xl sm:text-5xl md:text-7xl leading-tight text-[#00ff88]">
          모든것을
        </span>
        <span className="block text-3xl sm:text-5xl md:text-7xl text-[var(--text-primary)] leading-tight">
          한 화면에
        </span>
      </h1>

      {/* 서브 카피 */}
      <p className="relative text-center text-[var(--text-dim)] text-sm sm:text-lg max-w-2xl mb-8 sm:mb-12 leading-relaxed font-mono px-2">
        외국인·기관 수급 X-Ray &middot; AI 종목추천 &middot; 세력 포착<br />
        실시간 대시보드로 시장을 한 화면에
      </p>

      {/* CTA 버튼 */}
      <div className="relative flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-20 w-full sm:w-auto px-4 sm:px-0">
        <Link
          href="/dashboard"
          className="px-12 py-6 bg-[#00ff88] text-black font-bold text-xl rounded-xl hover:bg-[#00ff88]/90 transition-all hover:scale-105 font-mono tracking-wider text-center"
        >
          대시보드 바로가기 →
        </Link>
        <Link
          href="/market"
          className="px-12 py-6 border border-[var(--border-bright)] text-[var(--text-dim)] text-xl rounded-xl hover:border-[var(--text-dim)] hover:text-[var(--text-primary)] transition-all font-mono tracking-wider text-center"
        >
          시장 현황 보기
        </Link>
      </div>

      {/* 실시간 통계 */}
      <div className="relative grid grid-cols-3 gap-4 sm:gap-8 md:gap-16">
        {[
          { value: stockCount.toLocaleString(), label: 'KOSPI·KOSDAQ 종목', unit: '+' },
          { value: panelCount,                  label: '실시간 분석 패널', unit: '개' },
          { value: indexCount,                  label: '글로벌 지수 추적', unit: '개' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl sm:text-3xl md:text-4xl font-bold font-mono text-[var(--text-primary)]">
              {stat.value}
              <span className="text-[#00ff88] text-base sm:text-xl">{stat.unit}</span>
            </div>
            <div className="text-[10px] sm:text-xs text-[var(--text-muted)] mt-1 font-mono">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
