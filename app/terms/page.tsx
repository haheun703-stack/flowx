import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FLOWX — 서비스 이용약관',
  description: 'FLOWX 서비스 이용 조건 및 회원의 권리·의무',
}

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold mb-2">서비스 이용약관</h1>
        <p className="text-sm text-[var(--landing-text-dim)] mb-8">시행일: 2026년 4월 1일</p>

        <div className="space-y-8 text-sm leading-relaxed text-[var(--landing-text-sub)]">
          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제1조 (목적)</h2>
            <p>본 약관은 FlowX(이하 &ldquo;회사&rdquo;)가 제공하는 금융 데이터 분석 플랫폼 서비스(이하 &ldquo;서비스&rdquo;)의 이용 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제2조 (정의)</h2>
            <p>본 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>&ldquo;서비스&rdquo;란 회사가 flowx.kr 웹사이트 및 관련 애플리케이션을 통해 제공하는 금융 데이터 분석, 시장 정보, AI 기반 종목 분석, 섹터 모니터링 등 일체의 서비스를 말합니다.</li>
              <li>&ldquo;이용자&rdquo;란 본 약관에 동의하고 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
              <li>&ldquo;회원&rdquo;이란 회사에 회원가입을 하고 회원 아이디(ID)를 부여받은 이용자를 말합니다.</li>
              <li>&ldquo;유료서비스&rdquo;란 회사가 유료로 제공하는 각종 서비스 및 디지털콘텐츠를 말합니다.</li>
              <li>&ldquo;콘텐츠&rdquo;란 서비스 내에서 제공되는 AI 분석 보고서, 시그널, 브리핑, 차트, 데이터 시각화 등 일체의 정보를 말합니다.</li>
              <li>&ldquo;게시물&rdquo;이란 이용자가 서비스 내에 게시한 글, 댓글, 이미지 등 일체의 정보를 말합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제3조 (약관의 효력 및 변경)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
              <li>회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있으며, 약관이 변경되는 경우 변경 내용과 적용일을 명시하여 서비스 내에 적용일 7일 전부터 공지합니다. 다만, 이용자에게 불리한 변경의 경우 적용일 30일 전부터 공지합니다.</li>
              <li>이용자가 변경된 약관의 적용일까지 거부 의사를 표시하지 않으면 변경된 약관에 동의한 것으로 봅니다.</li>
              <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제4조 (서비스 이용계약의 체결)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>서비스 이용계약은 이용자가 본 약관에 동의하고 회원가입을 신청한 후 회사가 이를 승낙함으로써 체결됩니다.</li>
              <li>회사는 다음 각 호에 해당하는 경우 승낙을 유보하거나 거절할 수 있습니다.
                <ul className="list-disc ml-5 mt-1 space-y-0.5">
                  <li>실명이 아니거나 타인의 명의를 사용한 경우</li>
                  <li>허위 정보를 기재하거나 필수 항목을 기재하지 않은 경우</li>
                  <li>만 19세 미만인 경우</li>
                  <li>이전에 본 약관 위반으로 자격이 상실된 적이 있는 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제5조 (회원 정보의 변경)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>회원은 서비스 내 설정 화면을 통해 본인의 정보를 열람하고 수정할 수 있습니다.</li>
              <li>회원가입 시 기재한 사항에 변경이 생긴 경우 지체 없이 수정하여야 하며, 수정하지 않아 발생하는 불이익에 대해 회사는 책임지지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제6조 (회원의 의무)</h2>
            <p>회원은 다음 각 호의 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal ml-5 mt-2 space-y-1">
              <li>타인의 개인정보를 도용하거나 허위 정보를 등록하는 행위</li>
              <li>서비스에서 제공하는 정보를 회사의 사전 동의 없이 복제·배포·방송하거나 제3자에게 제공하는 행위</li>
              <li>서비스의 안정적 운영을 방해하는 행위 (해킹, DDoS 공격, 크롤링, 스크래핑 등)</li>
              <li>서비스를 이용하여 타인에게 투자자문업에 해당하는 행위를 하는 것</li>
              <li>서비스 내 콘텐츠를 가공하여 마치 자신의 분석인 것처럼 재배포하는 행위</li>
              <li>기타 관련 법령, 본 약관 및 회사가 정한 이용 규정에 위반하는 행위</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제7조 (서비스의 제공 및 변경)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>회사는 다음과 같은 서비스를 제공합니다: 시장 요약 및 글로벌 지수 정보, 섹터 히트맵 및 트리맵, AI 기반 종목 분석 시그널, 모닝 브리핑 및 시장 시나리오, 세력 포착 및 수급 분석, ETF 시그널 등.</li>
              <li>회사는 서비스의 내용, 이용 방법, 이용 시간을 변경할 수 있으며, 이 경우 변경 사유 및 내용을 사전에 공지합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제8조 (서비스의 중단)</h2>
            <p>회사는 정보통신설비의 보수 점검, 시스템 장애, 천재지변, 한국거래소 시스템 장애 등 불가피한 사유로 서비스의 전부 또는 일부를 중단할 수 있습니다. 서비스 중단의 경우 사전에 공지하며, 불가피한 경우 사후에 공지할 수 있습니다.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제9조 (계약 해지 및 자격 상실)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>회원은 언제든지 설정 화면 또는 고객센터를 통해 탈퇴를 요청할 수 있으며, 회사는 이를 즉시 처리합니다.</li>
              <li>허위 정보 기재, 타인 정보 도용, 법령 위반 행위 시 회원 자격이 제한 또는 정지될 수 있습니다.</li>
              <li>회원 자격이 상실된 경우 재가입이 제한될 수 있습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제10조 (손해배상)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>회사는 무료로 제공되는 서비스의 이용과 관련하여 이용자에게 발생한 손해에 대해 책임을 지지 않습니다.</li>
              <li>회사의 고의 또는 중과실로 인해 이용자에게 손해를 발생시킨 경우 해당 손해를 배상합니다. 다만, 투자 손실은 배상 범위에 포함되지 않습니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제11조 (분쟁 해결)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>서비스 이용과 관련하여 분쟁이 발생한 경우, 쌍방은 분쟁의 해결을 위해 성실히 협의합니다.</li>
              <li>본 약관에서 정하지 않은 사항 및 약관의 해석에 관해서는 전자상거래법, 약관규제법, 정보통신망법 등 관련 법령에 따릅니다.</li>
              <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우, 회사의 본사 소재지를 관할하는 법원을 관할 법원으로 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--landing-text)] mb-2">제12조 (연령 제한)</h2>
            <ol className="list-decimal ml-5 space-y-1">
              <li>본 서비스는 만 19세 이상의 성인만 이용할 수 있습니다.</li>
              <li>금융 투자 관련 데이터를 다루는 서비스의 특성상, 미성년자의 가입 및 이용은 제한됩니다.</li>
            </ol>
          </section>

          <p className="text-[var(--landing-text-dim)] pt-6 border-t border-[var(--landing-border)]">
            시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
          </p>
        </div>
      </div>
    </div>
  )
}
