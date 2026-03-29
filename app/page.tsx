import { HeroSection }    from '@/features/landing/ui/HeroSection'
import { FeatureSection } from '@/features/landing/ui/FeatureSection'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { CTASection }     from '@/features/landing/ui/CTASection'
import { Footer }         from '@/features/landing/ui/Footer'

export default function LandingPage() {
  return (
    <main className="bg-[var(--bg-base)] text-[var(--text-primary)] overflow-x-hidden">
      <HeroSection />
      <FeatureSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
