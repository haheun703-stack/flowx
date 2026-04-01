export default function PaymentPolicyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">유료서비스 이용약관 및 환불정책</h1>
      <p className="text-sm text-[var(--landing-text-dim)] mb-8">시행일: 2026년 4월 1일</p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--landing-text-sub)]">
        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제1조 (유료서비스의 종류 및 요금)</h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--landing-border)]">
                  <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">서비스</th>
                  <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">월 요금</th>
                  <th className="text-left py-2 font-semibold text-[var(--landing-text)]">주요 기능</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--landing-border)]">
                <tr><td className="py-2 pr-4">FREE</td><td className="py-2 pr-4">&#8361;0</td><td className="py-2">시장 요약, 섹터 히트맵, 글로벌 지수</td></tr>
                <tr><td className="py-2 pr-4">SIGNAL</td><td className="py-2 pr-4">&#8361;29,900</td><td className="py-2">FREE + AI 시그널, 모닝 브리핑, 섹터 모멘텀, ETF 시그널</td></tr>
                <tr><td className="py-2 pr-4">PRO</td><td className="py-2 pr-4">&#8361;59,900</td><td className="py-2">SIGNAL + 세력 포착, 스나이퍼 시그널, 1:1 알림, 우선 지원</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2">요금 및 서비스 내용은 변경될 수 있으며, 변경 시 30일 전에 공지합니다. 베타 기간 중에는 모든 유료서비스를 무료로 제공합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제2조 (결제 방법)</h2>
          <ol className="list-decimal ml-5 space-y-1">
            <li>신용카드/체크카드 결제, 계좌이체, 기타 회사가 지정하는 결제 수단</li>
            <li>정기구독 결제는 최초 결제일을 기준으로 매월 동일 날짜에 자동 결제됩니다.</li>
            <li>결제 과정에서 발생하는 오류는 PG사(Toss Payments) 정책에 따라 처리됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제3조 (무료 체험 및 베타 서비스)</h2>
          <ol className="list-decimal ml-5 space-y-1">
            <li>회사는 일정 기간 동안 무료 체험 또는 베타 서비스를 제공할 수 있습니다.</li>
            <li>무료 체험에서 유료로 전환되는 경우, 전환 시점 최소 7일 전에 사전 통지합니다.</li>
            <li>유료 전환 전에 구독을 해지하면 별도의 비용이 발생하지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제4조 (구독 해지)</h2>
          <ol className="list-decimal ml-5 space-y-1">
            <li>설정 &gt; 구독 관리 또는 hello@flowx.kr을 통해 언제든 구독을 해지할 수 있습니다.</li>
            <li>해지 시 현재 결제 기간 종료까지 서비스를 계속 이용할 수 있습니다.</li>
            <li>해지 후 결제 기간 만료 시 자동으로 무료(FREE) 등급으로 전환됩니다.</li>
            <li>별도의 위약금이나 해지 수수료는 없습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제5조 (환불 정책)</h2>
          <div className="overflow-x-auto mt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--landing-border)]">
                  <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">환불 신청 시점</th>
                  <th className="text-left py-2 font-semibold text-[var(--landing-text)]">환불 금액</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--landing-border)]">
                <tr><td className="py-2 pr-4">결제일로부터 7일 이내 + 미로그인</td><td className="py-2">결제 금액 100%</td></tr>
                <tr><td className="py-2 pr-4">결제일로부터 7일 이내 + 이용 내역 있음</td><td className="py-2">결제 금액 - (월 요금 / 30 x 이용 일수)</td></tr>
                <tr><td className="py-2 pr-4">결제일로부터 7일 초과</td><td className="py-2">환불 불가</td></tr>
                <tr><td className="py-2 pr-4">서비스 장애 48시간 이상</td><td className="py-2">장애 기간 일할 금액 보상</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3"><strong className="text-[var(--landing-text)]">환불 절차:</strong> hello@flowx.kr로 신청 → 3영업일 이내 처리 → 결제 수단과 동일한 방법으로 환불</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제6조 (과오금의 환불)</h2>
          <p>과오금 발생 시 결제와 동일한 방법으로 전액 환불합니다. 회사 귀책 시 수수료에 관계없이 전액 환불하며, 이용자 귀책 시 환불 소요 비용은 합리적 범위 내에서 이용자가 부담합니다.</p>
        </section>

        <p className="text-[var(--landing-text-dim)] pt-6 border-t border-[var(--landing-border)]">
          시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
        </p>
      </div>
    </div>
  )
}
