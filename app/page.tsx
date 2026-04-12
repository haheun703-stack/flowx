import type { Metadata } from 'next'
import { LandingNavbar }           from '@/features/landing/ui/LandingNavbar'

export const metadata: Metadata = {
  title: 'FLOWX — AI 기반 한국 주식 수급 레이더',
  description: '외국인·기관 수급 X-Ray로 스마트머니를 추적하세요. AI 종목 스크리닝, 세력 포착, 섹터 모멘텀, ETF 시그널까지.',
}
import { HeroSection }             from '@/features/landing/ui/HeroSection'
import { SocialProofSection }      from '@/features/landing/ui/SocialProofSection'
import { FeatureCardsSection }     from '@/features/landing/ui/FeatureCardsSection'
import { FeatureShowcaseSection }  from '@/features/landing/ui/FeatureShowcaseSection'
import { LandingPricingSection }   from '@/features/landing/ui/LandingPricingSection'
import { FAQSection }              from '@/features/landing/ui/FAQSection'
import { FooterCTASection }        from '@/features/landing/ui/FooterCTASection'
import { LandingFooter }           from '@/features/landing/ui/LandingFooter'

export default function LandingPage() {
  return (
    <main
      className="bg-[var(--landing-bg)] text-[var(--landing-text)] overflow-x-hidden"
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      <LandingNavbar />
      <HeroSection />
      <SocialProofSection />
      <FeatureCardsSection />
      <FeatureShowcaseSection />
      <LandingPricingSection />
      <FAQSection />
      <FooterCTASection />
      <LandingFooter />
    </main>
  )
}
