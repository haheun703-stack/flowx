'use client'

import { CARD_INNER, CONTAINER } from '@/shared/lib/card-styles'
import { DisclosuresPanel } from '@/features/information/ui/DisclosuresPanel'

export default function EdgarPage() {
  return (
    <div className={`${CONTAINER} pt-6`}>
      <div className={`${CARD_INNER.M} !min-h-[600px]`}>
        <DisclosuresPanel source="EDGAR" title="EDGAR 공시" accentColor="#a855f7" />
      </div>
    </div>
  )
}
