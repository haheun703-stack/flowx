import { formatSupplyVolume } from '@/shared/lib/formatters'

interface Props {
  label: string
  value: number
  variant: 'foreign' | 'institution' | 'individual'
}

const STYLES = {
  foreign:     { pos: 'bg-blue-500/20 text-blue-300',   neg: 'bg-blue-900/20 text-blue-600' },
  institution: { pos: 'bg-green-500/20 text-green-300', neg: 'bg-red-900/20 text-red-400' },
  individual:  { pos: 'bg-yellow-500/20 text-yellow-300', neg: 'bg-[var(--bg-row)] text-[var(--text-dim)]' },
}

export function SupplyBadge({ label, value, variant }: Props) {
  const s = STYLES[variant]
  return (
    <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${value >= 0 ? s.pos : s.neg}`}>
      {label} {formatSupplyVolume(value)}
    </div>
  )
}
