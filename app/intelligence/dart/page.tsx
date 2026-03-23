'use client'

import { CARD_INNER, CONTAINER, PAGE, PAGE_HEADER } from '@/shared/lib/card-styles'
import { DisclosuresPanel } from '@/features/intelligence/ui/DisclosuresPanel'

export default function DartPage() {
  return (
    <div className={PAGE}>
      <div className={PAGE_HEADER}>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-wider uppercase text-white">DART 공시</h1>
          <span className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" />
          <span className="text-sm text-gray-500">금융감독원 전자공시시스템</span>
        </div>
      </div>

      <div className={`${CONTAINER} pt-6`}>
        <div className={`${CARD_INNER.M} !min-h-[600px]`}>
          <DisclosuresPanel source="DART" title="DART 공시" accentColor="#00ff88" />
        </div>
      </div>
    </div>
  )
}
