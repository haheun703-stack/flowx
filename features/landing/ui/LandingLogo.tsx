import Link from 'next/link'

export function LandingLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-baseline text-2xl font-bold tracking-tight ${className}`}>
      <span className="text-[var(--landing-text)]">FLOW</span>
      <span className="text-[var(--flowx-green)]">X</span>
    </Link>
  )
}
