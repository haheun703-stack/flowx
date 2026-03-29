import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#16a34a] text-sm hover:underline">
          ← FlowX 홈으로
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-6 mb-8">개인정보 처리방침</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">1. 수집하는 개인정보</h2>
            <p>
              FlowX는 서비스 제공을 위해 다음 정보를 수집합니다:<br />
              - 필수: 이메일, 이름, 비밀번호 (암호화 저장)<br />
              - 선택: 전화번호<br />
              - 자동 수집: 접속 IP, 브라우저 정보, 접속 일시
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">2. 개인정보의 이용 목적</h2>
            <p>
              - 회원 관리 및 서비스 제공<br />
              - 유료 결제 처리 및 구독 관리<br />
              - 서비스 개선 및 통계 분석<br />
              - 마케팅 수신 동의자에 한하여 프로모션 안내
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">3. 개인정보 보유 기간</h2>
            <p>
              - 회원 탈퇴 시 즉시 파기<br />
              - 단, 관련 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간 동안 보관<br />
              - 전자상거래법: 계약/결제 기록 5년, 소비자 불만 3년
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">4. 개인정보의 제3자 제공</h2>
            <p>
              FlowX는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
              단, 법령에 의한 요청이 있는 경우는 예외입니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">5. 개인정보 처리 위탁</h2>
            <p>
              - 결제 처리: Toss Payments (토스페이먼츠)<br />
              - 데이터 저장: Supabase (클라우드 데이터베이스)<br />
              - 호스팅: Vercel (웹 호스팅)
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">6. 이용자의 권리</h2>
            <p>
              이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제할 수 있으며,
              회원 탈퇴를 통해 개인정보 처리를 중단할 수 있습니다.
            </p>
          </section>

          <p className="text-[var(--text-muted)] pt-6 border-t border-[var(--border)]">
            시행일: 2026년 3월 22일
          </p>
        </div>
      </div>
    </div>
  )
}
