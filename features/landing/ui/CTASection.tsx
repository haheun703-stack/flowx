import Link from 'next/link'

export function CTASection() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00ff88] opacity-5 blur-[80px] rounded-full" />
          <div className="relative border border-[#00ff88]/20 rounded-3xl p-12 bg-gray-900/30">
            <div className="text-xs text-[#00ff88] font-mono tracking-widest uppercase mb-4">
              지금 시작하세요
            </div>
            <h2 className="text-4xl font-bold mb-4 font-display">
              스마트머니를<br />따라갈 준비됐나요?
            </h2>
            <p className="text-gray-400 text-sm mb-8 font-mono leading-relaxed">
              신용카드 없이 무료로 시작.<br />
              PRO는 첫 달 무료 체험 제공.
            </p>
            <Link
              href="/chart/005930"
              className="inline-block px-10 py-4 bg-[#00ff88] text-black font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all hover:scale-105 font-mono tracking-wider"
            >
              무료로 시작하기 →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
