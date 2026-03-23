'use client'

import { CARD_INNER, CONTAINER } from '@/shared/lib/card-styles'
import { DisclosuresPanel } from '@/features/information/ui/DisclosuresPanel'

export default function DartPage() {
  return (
    <div className={`${CONTAINER} pt-6`}>
      <div className={`${CARD_INNER.M} !min-h-[600px]`}>
        <DisclosuresPanel source="DART" title="DART 공시" accentColor="#00ff88" />
      </div>
    </div>
  )
}
