import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FLOWX — 정책 문서',
  description: 'FLOWX 서비스 운영 정책 문서 허브',
}

const DOCS = [
  { title: '서비스 이용약관', href: '/terms', required: true, desc: '서비스 이용 조건 및 회원의 권리·의무' },
  { title: '개인정보처리방침', href: '/privacy', required: true, desc: '개인정보 수집·이용·보유 및 파기 안내' },
  { title: '유료서비스 이용약관 및 환불정책', href: '/policies/payment', required: true, desc: '요금제, 결제, 구독 해지 및 환불 규정' },
  { title: '투자 유의사항 및 면책 고지', href: '/policies/investment', required: true, desc: '투자 위험 및 서비스 면책사항 안내' },
  { title: 'AI 생성 콘텐츠 고지', href: '/policies/ai', required: false, desc: 'AI 기술 활용 범위 및 한계 안내' },
]

export default function PoliciesHubPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">정책 문서</h1>
      <p className="text-sm text-[var(--landing-text-sub)] mb-8">
        FlowX 서비스 운영에 관한 정책 문서 전체를 확인할 수 있습니다.
      </p>

      <div className="space-y-4">
        {DOCS.map((doc) => (
          <Link
            key={doc.href}
            href={doc.href}
            className="block p-5 border border-[var(--landing-border)] rounded-2xl hover:border-[var(--landing-accent)]/40 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-semibold text-[var(--landing-text)]">{doc.title}</h2>
              {doc.required && (
                <span className="text-xs px-2 py-0.5 bg-[var(--landing-accent)]/10 text-[var(--landing-accent)] rounded-full">필수</span>
              )}
            </div>
            <p className="text-sm text-[var(--landing-text-sub)]">{doc.desc}</p>
          </Link>
        ))}
      </div>

      <p className="text-xs text-[var(--landing-text-dim)] mt-8">
        시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
      </p>
    </div>
  )
}
