import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FLOWX — 투자 유의사항 및 면책 고지',
  description: '투자 위험 및 FLOWX 서비스 면책사항 안내',
}

export default function InvestmentPolicyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">투자 유의사항 및 면책 고지</h1>
      <p className="text-sm text-[var(--landing-text-dim)] mb-8">시행일: 2026년 4월 1일</p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--landing-text-sub)]">
        {/* 경고 박스 */}
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl">
          <p className="font-bold text-red-700 mb-2">FlowX는 투자자문업체가 아닙니다.</p>
          <p className="text-red-600 text-xs leading-relaxed">
            FlowX는 금융위원회에 등록된 투자자문업자가 아니며, 「자본시장과 금융투자업에 관한 법률」에 따른 투자자문업 또는 투자일임업을 영위하지 않습니다.
            FlowX가 제공하는 모든 정보는 공개된 시장 데이터를 기반으로 한 참고 자료이며, 특정 금융투자상품의 매매를 권유하거나 투자 판단을 대행하는 것이 아닙니다.
          </p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-3">면책 사항</h2>
          <ol className="list-decimal ml-5 space-y-3">
            <li>
              <strong className="text-[var(--landing-text)]">투자 결정의 책임</strong>: 서비스를 통해 제공되는 모든 정보(AI 시그널, 종목 분석, 모닝 브리핑, 매수·매도 시그널 등)는 투자 조언이 아닙니다. 모든 투자 결정과 그에 따른 결과는 전적으로 이용자 본인의 판단과 책임에 의합니다.
            </li>
            <li>
              <strong className="text-[var(--landing-text)]">수익 보장 불가</strong>: 회사는 어떠한 분석이나 시그널에 대해서도 수익을 보장하지 않습니다. 과거의 성과가 미래의 수익을 보장하지 않습니다.
            </li>
            <li>
              <strong className="text-[var(--landing-text)]">데이터 정확성</strong>: 정보의 정확성과 완전성을 위해 최선을 다하나, 기술적 오류, 데이터 제공사 오류, 시장 급변 등으로 부정확한 정보가 제공될 수 있으며, 이로 인해 발생하는 손해에 대해 법적 책임을 지지 않습니다.
            </li>
            <li>
              <strong className="text-[var(--landing-text)]">실시간성 한계</strong>: 서비스에서 제공하는 데이터는 실시간 시세가 아닐 수 있으며, 5~15분 지연될 수 있습니다.
            </li>
            <li>
              <strong className="text-[var(--landing-text)]">AI 분석의 한계</strong>: AI 기반 분석은 과거 데이터에 기반한 통계적 모델의 산출물이며, 시장의 예측 불가능한 변동을 반영하지 못할 수 있습니다.
            </li>
            <li>
              <strong className="text-[var(--landing-text)]">제3자 데이터</strong>: 서비스에 포함된 제3자 제공 데이터(한국거래소, 금융감독원, Yahoo Finance 등)에 대해서는 해당 제공사의 이용 조건이 적용됩니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-3">법적 고지</h2>
          <ul className="list-disc ml-5 space-y-2">
            <li>본 서비스는 「자본시장과 금융투자업에 관한 법률」 제7조에 따라 투자자문업에 해당하지 않는 데이터 분석 정보 제공 서비스입니다.</li>
            <li>주식 투자에는 원금 손실의 위험이 있으며, 투자한 금액의 일부 또는 전부를 잃을 수 있습니다.</li>
            <li>서비스에서 제공하는 등급, 점수, 시그널 등은 회사 자체 분석 모델에 의한 참고 지표이며, 공인기관의 평가가 아닙니다.</li>
            <li>이용자는 투자 전 반드시 본인의 재무 상황, 투자 목적, 위험 감수 능력 등을 종합적으로 고려하여 독립적인 판단을 내려야 합니다.</li>
          </ul>
        </section>

        <p className="text-[var(--landing-text-dim)] pt-6 border-t border-[var(--landing-border)]">
          시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
        </p>
      </div>
    </div>
  )
}
