import Link from 'next/link'

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)]"
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-block text-2xl font-bold mb-2">
          <span className="text-[var(--landing-text)]">FLOW</span>
          <span className="text-[var(--landing-accent)]">X</span>
        </Link>
        <nav className="flex gap-4 text-sm text-[var(--landing-text-dim)] mb-8">
          <Link href="/policies" className="hover:text-[var(--landing-accent)]">정책 허브</Link>
          <Link href="/terms" className="hover:text-[var(--landing-accent)]">이용약관</Link>
          <Link href="/privacy" className="hover:text-[var(--landing-accent)]">개인정보처리방침</Link>
        </nav>
        {children}
      </div>
    </div>
  )
}
