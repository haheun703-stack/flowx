'use client'

import Link from 'next/link'
import { ImagePlaceholder } from './ImagePlaceholder'

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-6">
      <div className="max-w-[1200px] mx-auto">
        {/* 배지 */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--landing-accent)]/5 border border-[var(--landing-accent)]/20 rounded-full text-[var(--landing-accent)] text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-[var(--landing-accent)] animate-pulse" />
            BETA — 무료 공개 중
          </span>
        </div>

        {/* 메인 헤드라인 */}
        <h1 className="text-center text-[32px] sm:text-[40px] md:text-[48px] font-bold leading-tight text-[var(--landing-text)] mb-6">
          트레이딩뷰가 못 하는 것,
          <br />
          <span className="text-[var(--landing-text)]">Flow</span><span className="text-[var(--flowx-green)]">X</span>가 합니다
        </h1>

        {/* 서브 카피 */}
        <p className="text-center text-[var(--landing-text-sub)] text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          외국인·기관 수급 추적, AI 종목 추천, 세력 포착까지
          <br className="hidden sm:block" />
          한국 주식에 특화된 실시간 대시보드
        </p>

        {/* CTA 버튼 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-3.5 bg-[var(--landing-accent)] text-white font-semibold text-base rounded-xl hover:bg-[var(--landing-accent-hover)] transition-all hover:shadow-lg hover:shadow-[var(--landing-accent)]/20"
          >
            대시보드 바로가기 →
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 border border-[var(--landing-border)] text-[var(--landing-text-sub)] font-medium text-base rounded-xl hover:border-[var(--landing-accent)] hover:text-[var(--landing-accent)] transition-all"
          >
            무료로 시작하기
          </Link>
        </div>

        {/* 대시보드 프리뷰 */}
        <div className="max-w-[960px] mx-auto">
          <ImagePlaceholder label="FlowX 대시보드 프리뷰" aspectRatio="16/9" />
        </div>
      </div>
    </section>
  )
}
