import Link from 'next/link'

export function CTASection() {
  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--green)] opacity-5 blur-[80px] rounded-full" />
          <div className="relative border border-[var(--green)]/20 rounded-3xl p-8 sm:p-12 bg-white shadow-sm">
            <div className="text-xl sm:text-2xl text-[var(--green)] font-mono tracking-widest uppercase mb-4">
              지금 시작하세요
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 font-display">
              외국인이 사는 종목<br />먼저 확인하세요
            </h2>
            <p className="text-[var(--text-dim)] text-sm mb-8 font-mono leading-relaxed">
              가입 없이 바로 시작. 베타 기간 전체 무료.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-10 py-4 bg-[var(--green)] text-black font-bold rounded-xl hover:bg-[var(--green)]/90 transition-all hover:scale-105 font-mono tracking-wider"
            >
              대시보드 바로가기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
