import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FLOWX — 개인정보처리방침',
  description: 'FLOWX 개인정보 수집·이용·보유 및 파기 안내',
}

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen bg-[var(--landing-bg)] text-[var(--landing-text)] px-4 py-16"
      style={{ fontFamily: 'var(--landing-font)' }}
    >
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-block text-2xl font-bold mb-6">
          <span className="text-[var(--landing-text)]">FLOW</span>
          <span className="text-[var(--flowx-green)]">X</span>
        </Link>
        <h1 className="text-2xl font-bold mb-2">개인정보처리방침</h1>
        <p className="text-sm text-[var(--landing-text-dim)] mb-8">시행일: 2026년 4월 1일</p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--landing-text-sub)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제1조 (개인정보의 처리 목적)</h2>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li><strong>회원 가입 및 관리</strong>: 본인 확인, 개인 식별, 가입 의사 확인, 연령 확인, 민원 처리, 고지사항 전달</li>
              <li><strong>서비스 제공</strong>: 맞춤형 서비스 제공, 서비스 이용 기록 분석 및 통계</li>
              <li><strong>유료서비스 결제</strong>: 결제 처리, 환불 처리, 구독 관리</li>
              <li><strong>마케팅 및 광고</strong>: 신규 서비스 및 이벤트 안내 (별도 동의 시)</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제2조 (수집하는 개인정보의 항목)</h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">구분</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">수집 항목</th>
                    <th className="text-left py-2 font-semibold text-[var(--landing-text)]">수집 목적</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-border)]">
                  <tr><td className="py-2 pr-4">필수</td><td className="py-2 pr-4">이메일, 비밀번호(암호화), 전화번호</td><td className="py-2">회원 식별, 서비스 제공</td></tr>
                  <tr><td className="py-2 pr-4">선택</td><td className="py-2 pr-4">이름, 닉네임</td><td className="py-2">맞춤형 서비스 제공</td></tr>
                  <tr><td className="py-2 pr-4">결제 시</td><td className="py-2 pr-4">결제 수단 정보(카드번호는 PG사 보관)</td><td className="py-2">유료서비스 결제 처리</td></tr>
                  <tr><td className="py-2 pr-4">자동 수집</td><td className="py-2 pr-4">IP 주소, 접속 일시, 기기 정보, 브라우저 종류</td><td className="py-2">서비스 개선, 부정 이용 방지</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제3조 (개인정보의 처리 및 보유 기간)</h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">보유 정보</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">보유 기간</th>
                    <th className="text-left py-2 font-semibold text-[var(--landing-text)]">근거</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-border)]">
                  <tr><td className="py-2 pr-4">회원 가입 정보</td><td className="py-2 pr-4">회원 탈퇴 시까지</td><td className="py-2">서비스 이용계약</td></tr>
                  <tr><td className="py-2 pr-4">서비스 이용 기록</td><td className="py-2 pr-4">3년</td><td className="py-2">통신비밀보호법</td></tr>
                  <tr><td className="py-2 pr-4">결제 및 공급 기록</td><td className="py-2 pr-4">5년</td><td className="py-2">전자상거래법</td></tr>
                  <tr><td className="py-2 pr-4">소비자 불만·분쟁 처리 기록</td><td className="py-2 pr-4">3년</td><td className="py-2">전자상거래법</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제4조 (개인정보의 제3자 제공)</h2>
            <p>회사는 이용자의 동의 없이 제3자에게 개인정보를 제공하지 않습니다. 다만, 이용자가 사전에 동의하거나 법령에 의한 수사기관의 요구가 있는 경우는 예외로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제5조 (개인정보 처리의 위탁)</h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--landing-border)]">
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">수탁업체</th>
                    <th className="text-left py-2 pr-4 font-semibold text-[var(--landing-text)]">위탁 업무</th>
                    <th className="text-left py-2 font-semibold text-[var(--landing-text)]">보유 기간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--landing-border)]">
                  <tr><td className="py-2 pr-4">Toss Payments</td><td className="py-2 pr-4">결제 처리 및 관리</td><td className="py-2">위탁 계약 종료 시까지</td></tr>
                  <tr><td className="py-2 pr-4">Supabase Inc.</td><td className="py-2 pr-4">데이터베이스 호스팅</td><td className="py-2">위탁 계약 종료 시까지</td></tr>
                  <tr><td className="py-2 pr-4">Vercel Inc.</td><td className="py-2 pr-4">웹 서비스 호스팅</td><td className="py-2">위탁 계약 종료 시까지</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제6조 (이용자의 권리·의무 및 행사 방법)</h2>
            <p>이용자는 언제든지 개인정보 열람, 정정, 삭제, 처리 정지를 요구할 수 있습니다. 서비스 내 설정 화면 또는 hello@flowx.kr을 통해 행사할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제7조 (개인정보의 파기)</h2>
            <p>회사는 개인정보 보유 기간이 경과하거나 처리 목적이 달성된 경우 지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태로 저장된 개인정보는 복구할 수 없는 방법을 사용하여 삭제합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제8조 (개인정보의 안전성 확보 조치)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>비밀번호 단방향 암호화 저장</li>
              <li>SSL(TLS) 암호화 통신 및 침입차단시스템 운용</li>
              <li>개인정보 접근 권한을 최소 인원으로 제한</li>
              <li>Supabase RLS(Row Level Security) 정책 적용</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제9조 (개인정보 보호책임자)</h2>
            <p>개인정보보호 책임자: 대표이사 (겸임) · 연락처: hello@flowx.kr</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제10조 (권익 침해 구제 방법)</h2>
            <ul className="list-disc ml-5 space-y-1">
              <li>개인정보침해 신고센터 (한국인터넷진흥원): privacy.kisa.or.kr / 118</li>
              <li>개인정보 분쟁조정위원회: www.kopico.go.kr / 1833-6972</li>
              <li>대검찰청 사이버수사과: www.spo.go.kr / 1301</li>
              <li>경찰청 사이버안전국: ecrm.cyber.go.kr / 182</li>
            </ul>
          </section>

          <p className="text-[var(--landing-text-dim)] pt-6 border-t border-[var(--landing-border)]">
            시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
          </p>
        </div>
      </div>
    </div>
  )
}
