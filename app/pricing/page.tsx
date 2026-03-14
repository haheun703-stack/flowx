import type { Metadata } from 'next'
import { Navbar } from '@/shared/ui/Navbar'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { Footer } from '@/features/landing/ui/Footer'

export const metadata: Metadata = {
  title: '플랜 & 가격 — FLOWX',
  description: '베타 기간 전체 무료. 수급 X-Ray, Bloomberg 대시보드, AI 종목추천을 지금 바로 체험하세요.',
}

export default function PricingPage() {
  return (
    <main className="bg-[#080b10] text-white min-h-screen">
      <Navbar />
      <PricingSection />
      <Footer />
    </main>
  )
}
