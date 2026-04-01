import { LandingNavbar }           from '@/features/landing/ui/LandingNavbar'
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
