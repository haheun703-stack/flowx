import Link from 'next/link'
import { FlowxLogo } from '@/shared/ui/logo'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] px-4 sm:px-6 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <FlowxLogo variant="small" showTagline={true} />
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-[var(--text-muted)]">
          <Link href="/dashboard" className="hover:text-[var(--text-primary)] transition-colors">대시보드</Link>
          <Link href="/market" className="hover:text-[var(--text-primary)] transition-colors">시장</Link>
          <Link href="/chart/005930" className="hover:text-[var(--text-primary)] transition-colors">차트</Link>
          <Link href="/pricing" className="hover:text-[var(--text-primary)] transition-colors">플랜</Link>
        </div>
        <div className="text-[10px] sm:text-xs text-[var(--text-muted)] font-mono text-center">
          © 2026 FLOWX. 투자 참고용 정보이며 매매 권유가 아닙니다.
        </div>
      </div>
    </footer>
  )
}
