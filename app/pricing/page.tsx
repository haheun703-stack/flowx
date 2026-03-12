import Link from 'next/link'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { Footer } from '@/features/landing/ui/Footer'
import { FlowxLogo } from '@/shared/ui/logo'

export default function PricingPage() {
  return (
    <main className="bg-[#080b10] text-white min-h-screen">
      {/* 간단 헤더 */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <Link href="/">
          <FlowxLogo variant="small" />
        </Link>
        <Link
          href="/chart/005930"
          className="text-sm text-gray-400 hover:text-white transition-colors font-mono"
        >
          차트 보기 →
        </Link>
      </nav>

      <PricingSection />
      <Footer />
    </main>
  )
}
