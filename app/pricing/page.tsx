import { Navbar } from '@/shared/ui/Navbar'
import { PricingSection } from '@/features/landing/ui/PricingSection'
import { Footer } from '@/features/landing/ui/Footer'

export default function PricingPage() {
  return (
    <main className="bg-[#080b10] text-white min-h-screen">
      <Navbar />
      <PricingSection />
      <Footer />
    </main>
  )
}
