'use client'
import Link from 'next/link'
import { useAuth } from '@/shared/lib/AuthProvider'

const PLANS = [
  {
    name: 'FREE',
    price: 0,
    desc: '지금 바로 사용 가능',
    color: 'border-[var(--green)]/50',
    accent: 'var(--green)',
    badge: '현재 무료',
    cta: '대시보드 시작하기',
    href: '/dashboard',
    features: [
      '수급 X-Ray 차트',
      '실시간 대시보드 기본',
      'AI 종목 추천 (Claude + Perplexity)',
      'KOSPI 30일 종가 차트',
      '글로벌 지수 6개 실시간',
    ],
  },
  {
    name: 'SIGNAL',
    price: 9900,
    desc: '정보봇 데이터',
    color: 'border-[var(--blue)]/50',
    accent: 'var(--blue)',
    cta: '구독하기',
    features: [
      'FREE 전체 포함',
      '모닝 브리핑 (미국+한국 종합)',
      '섹터 히트맵 상세',
      '시장 판정 (사계절/방향)',
      '텔레그램 브리핑',
      'DART 공시 알람',
    ],
  },
  {
    name: 'PRO',
    price: 25000,
    desc: '퀀트봇 데이터',
    color: 'border-[var(--yellow)]/50',
    accent: 'var(--yellow)',
    cta: '구독하기',
    features: [
      'SIGNAL 전체 포함',
      'ETF 시그널 + 섹터 로테이션',
      '그룹순환 매매 (현대차/삼성)',
      '외국인 자금 흐름',
      '페이퍼 트레이딩 수익률 공개',
      '백테스트 엔진',
    ],
  },
  {
    name: 'VIP',
    price: 50000,
    desc: '단타봇 데이터',
    color: 'border-[var(--purple)]/50',
    accent: 'var(--purple)',
    cta: '구독하기',
    features: [
      'PRO 전체 포함',
      '국가별 외인 수급 상세',
      '세력 포착 + 스나이퍼 워치',
      '3~5일 단기 매매 시그널',
      '진입가/손절가/목표가 제시',
      '실시간 텔레그램 알림',
    ],
  },
]

// Toss 키가 없으면 결제 버튼 비활성 — 사업자등록 + 가맹점 심사 후 true로 변경
const PAYMENTS_READY = false

export function PricingSection() {
  const { user } = useAuth()

  return (
    <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-6xl mx-auto" id="pricing">
      <div className="text-center mb-10 sm:mb-16">
        <div className="text-3xl sm:text-4xl text-[#00ff88] font-mono tracking-widest uppercase mb-4">
          플랜 & 가격
        </div>
        <h2 className="text-2xl sm:text-4xl font-bold mb-4 font-display">
          {PAYMENTS_READY ? '나에게 맞는 플랜 선택' : '베타 기간 전체 무료'}
        </h2>
        <p className="text-[var(--text-muted)] text-sm font-mono">
          {PAYMENTS_READY
            ? '언제든 해지 가능. 첫 달 무료 체험.'
            : '지금은 모든 기능을 무료로 체험하세요. 유료 플랜은 준비 중입니다.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PLANS.map((plan) => {
          const isFree = plan.price === 0
          const canSubscribe = PAYMENTS_READY && !isFree

          return (
            <div
              key={plan.name}
              className={`relative p-6 rounded-2xl border bg-white flex flex-col shadow-sm ${plan.color} ${
                isFree ? 'shadow-lg shadow-[var(--green)]/10' : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className="text-xs px-3 py-1 rounded-full font-bold font-mono text-white"
                    style={{ backgroundColor: plan.accent }}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="font-mono text-xs tracking-widest mb-1" style={{ color: plan.accent }}>
                {plan.name}
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {isFree ? '무료' : `₩${plan.price.toLocaleString()}`}
                {!isFree && <span className="text-sm text-[var(--text-muted)] font-normal">/월</span>}
              </div>
              <div className="text-xs text-[var(--text-muted)] mb-6 font-mono">{plan.desc}</div>

              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-[var(--text-primary)]">
                    <span className="mt-0.5 shrink-0" style={{ color: plan.accent }}>
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              {isFree ? (
                <Link
                  href={plan.href ?? '/dashboard'}
                  className="w-full text-center py-3 rounded-xl text-sm transition-all font-mono
                             bg-[#00ff88] text-black font-bold hover:bg-[#00ff88]/90"
                >
                  {plan.cta}
                </Link>
              ) : canSubscribe ? (
                <Link
                  href={user ? `/pricing/checkout?tier=${plan.name}` : '/auth/signup'}
                  className="w-full text-center py-3 rounded-xl text-sm transition-all font-mono font-bold text-white"
                  style={{ backgroundColor: plan.accent }}
                >
                  {user ? plan.cta : '회원가입 후 구독'}
                </Link>
              ) : (
                <div className="w-full text-center py-3 rounded-xl text-sm font-mono border border-[var(--border)] text-[var(--text-dim)]">
                  준비 중
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
