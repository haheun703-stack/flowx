import Link from 'next/link'
import { LandingLogo } from './LandingLogo'

const COLUMNS = [
  {
    title: '서비스',
    links: [
      { label: '대시보드', href: '/dashboard' },
      { label: '시장 현황', href: '/market' },
      { label: 'AI 인사이트', href: '/quant' },
      { label: '시나리오', href: '/scenario' },
    ],
  },
  {
    title: '정보',
    links: [
      { label: '요금제', href: '/pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: '법적 고지',
    links: [
      { label: '이용약관', href: '/terms' },
      { label: '개인정보처리방침', href: '/privacy' },
      { label: '투자 유의사항', href: '/policies/investment' },
      { label: '결제·환불 정책', href: '/policies/payment' },
      { label: 'AI 콘텐츠 고지', href: '/policies/ai' },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="bg-[#111827] text-white/70 pt-16 pb-8 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* 로고 + 소개 */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-2xl font-bold mb-3">
              <span className="text-white">FLOW</span>
              <span className="text-[var(--flowx-green)]">X</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              한국 주식에 특화된
              <br />
              실시간 분석 플랫폼
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white/90 mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 투자 면책 */}
        <div className="border-t border-white/10 pt-6 mb-6">
          <p className="text-xs text-white/30 leading-relaxed max-w-3xl">
            FLOWX는 데이터 기반 정보 제공 서비스이며, 투자 권유 또는 자문이 아닙니다.
            모든 투자 판단과 그에 따른 손익의 책임은 투자자 본인에게 있습니다.
            과거 수익률이 미래 수익률을 보장하지 않습니다.
          </p>
        </div>

        {/* 카피라이트 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <span>&copy; {new Date().getFullYear()} FlowX. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-white/50 transition-colors">이용약관</Link>
            <Link href="/privacy" className="hover:text-white/50 transition-colors">개인정보처리방침</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
