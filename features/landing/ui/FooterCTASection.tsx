import Link from 'next/link'

export function FooterCTASection() {
  return (
    <section className="py-24 px-6 bg-[#1A1A2E]">
      <div className="max-w-[720px] mx-auto text-center">
        <h2 className="text-2xl sm:text-[36px] font-bold text-white mb-4 leading-tight">
          지금 시작하면,
          <br />
          내일 아침부터 달라집니다
        </h2>
        <p className="text-[#9CA3AF] mb-10 max-w-md mx-auto">
          매일 아침 8시, AI가 분석한 오늘의 시장과 추천 종목을 받아보세요.
          베타 기간 중 모든 기능 무료.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 bg-[var(--landing-accent)] text-white font-semibold rounded-xl hover:bg-[var(--landing-accent-hover)] transition-colors"
          >
            무료로 시작하기 →
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 border border-white/20 text-white/70 font-medium rounded-xl hover:border-white/40 hover:text-white transition-colors"
          >
            대시보드 둘러보기
          </Link>
        </div>
      </div>
    </section>
  )
}
