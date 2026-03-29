import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-[#16a34a] text-sm hover:underline">
          ← FlowX 홈으로
        </Link>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mt-6 mb-8">이용약관</h1>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">제1조 (목적)</h2>
            <p>
              이 약관은 FlowX(이하 &ldquo;서비스&rdquo;)가 제공하는 금융 데이터 분석 서비스의
              이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">제2조 (정의)</h2>
            <p>
              1. &ldquo;서비스&rdquo;란 FlowX가 제공하는 주식 시장 데이터 분석, 시그널, 대시보드 등
              일체의 온라인 서비스를 말합니다.<br />
              2. &ldquo;이용자&rdquo;란 이 약관에 따라 서비스를 이용하는 자를 말합니다.<br />
              3. &ldquo;유료 서비스&rdquo;란 SIGNAL, PRO, VIP 등 유료 결제를 통해 이용 가능한
              서비스를 말합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">제3조 (투자 면책)</h2>
            <p>
              본 서비스에서 제공하는 모든 정보(시그널, 분석, 종목 추천 등)는 참고 자료이며,
              투자 판단의 최종 책임은 이용자 본인에게 있습니다.
              서비스는 투자 손실에 대해 어떠한 법적 책임도 지지 않습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">제4조 (서비스 이용)</h2>
            <p>
              1. 서비스는 회원가입 후 이용 가능합니다.<br />
              2. 무료(FREE) 플랜은 기본 기능을 제공하며, 유료 플랜은 추가 기능을 제공합니다.<br />
              3. 서비스는 한국 시간(KST) 기준으로 운영되며, 시스템 점검 시 사전 공지합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">제5조 (결제 및 환불)</h2>
            <p>
              1. 유료 서비스는 월간 자동 결제 방식입니다.<br />
              2. 구독 해지는 언제든 가능하며, 해지 시 현재 결제 기간 종료 시점까지 서비스를 이용할 수 있습니다.<br />
              3. 환불은 결제일로부터 7일 이내, 서비스 미이용 시 가능합니다.
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
