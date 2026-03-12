import Link from 'next/link'
import { FlowxLogo } from '@/shared/ui/logo'

export function Footer() {
  return (
    <footer className="border-t border-gray-800 px-6 py-12">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <FlowxLogo variant="small" showTagline={true} />
        <div className="flex gap-8 text-sm text-gray-500">
          <Link href="/dashboard" className="hover:text-white transition-colors">대시보드</Link>
          <Link href="/market" className="hover:text-white transition-colors">시장</Link>
          <Link href="/chart/005930" className="hover:text-white transition-colors">차트</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">플랜</Link>
          <a href="https://ppwangga.com" target="_blank" className="hover:text-white transition-colors">ppwangga.com</a>
        </div>
        <div className="text-xs text-gray-700 font-mono">
          © 2026 FLOWX. 투자 참고용 정보 제공.
        </div>
      </div>
    </footer>
  )
}
