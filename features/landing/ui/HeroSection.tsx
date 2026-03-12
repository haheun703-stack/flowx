'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FlowxLogo } from '@/shared/ui/logo'

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev >= target) { clearInterval(timer); return target }
        return Math.min(prev + step, target)
      })
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return Math.floor(count)
}

export function HeroSection() {
  const supplyCount   = useCountUp(2543)
  const signalCount   = useCountUp(847)
  const accuracyCount = useCountUp(73)

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24">

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

      {/* 배경 레이더 글로우 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00ff88] opacity-[0.03] blur-[100px] pointer-events-none" />

      {/* 대형 로고 */}
      <FlowxLogo variant="large" showTagline={true} className="relative mb-12" />

      {/* 배지 */}
      <div className="relative flex items-center gap-2 mb-8 px-4 py-2 border border-[#00ff88]/30 rounded-full bg-[#00ff88]/5">
        <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
        <span className="text-xs text-[#00ff88] font-mono tracking-widest uppercase">
          FLOWX — 수급 플로우를 읽다
        </span>
      </div>

      {/* 메인 헤드라인 */}
      <h1 className="relative text-center max-w-4xl mb-6 font-display">
        <span className="block text-5xl md:text-7xl text-white leading-tight">
          스마트머니가
        </span>
        <span className="block text-5xl md:text-7xl leading-tight text-[#00ff88]">
          움직이는 순간을
        </span>
        <span className="block text-5xl md:text-7xl text-white leading-tight">
          포착한다
        </span>
      </h1>

      {/* 서브 카피 */}
      <p className="relative text-center text-gray-400 text-lg max-w-2xl mb-12 leading-relaxed font-mono">
        외국인·기관 수급 X-Ray · Why Now Engine · 포물선 탐지<br />
        트레이딩뷰에 없는 한국 전용 신호 분석 시스템
      </p>

      {/* CTA 버튼 */}
      <div className="relative flex flex-col sm:flex-row gap-4 mb-20">
        <Link
          href="/chart/005930"
          className="px-8 py-4 bg-[#00ff88] text-black font-bold text-sm rounded-xl hover:bg-[#00ff88]/90 transition-all hover:scale-105 font-mono tracking-wider"
        >
          무료로 시작하기 →
        </Link>
        <Link
          href="/pricing"
          className="px-8 py-4 border border-gray-700 text-gray-300 text-sm rounded-xl hover:border-gray-500 hover:text-white transition-all font-mono tracking-wider"
        >
          플랜 보기
        </Link>
      </div>

      {/* 실시간 통계 */}
      <div className="relative grid grid-cols-3 gap-8 md:gap-16">
        {[
          { value: supplyCount.toLocaleString(), label: '분석 종목', unit: '개' },
          { value: signalCount.toLocaleString(), label: '오늘 신호 발생', unit: '건' },
          { value: accuracyCount,                label: 'Why Now 정확도', unit: '%' },
        ].map((stat, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-bold font-mono text-white">
              {stat.value}
              <span className="text-[#00ff88] text-xl">{stat.unit}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1 font-mono">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
