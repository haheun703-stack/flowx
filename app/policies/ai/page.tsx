export default function AIPolicyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">AI 생성 콘텐츠 고지</h1>
      <p className="text-sm text-[var(--landing-text-dim)] mb-8">시행일: 2026년 4월 1일</p>

      <div className="space-y-8 text-sm leading-relaxed text-[var(--landing-text-sub)]">
        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-3">AI 활용 범위</h2>
          <p className="mb-3">FlowX 서비스에는 다음과 같이 AI(인공지능) 기술이 활용됩니다.</p>
          <ol className="list-decimal ml-5 space-y-2">
            <li><strong className="text-[var(--landing-text)]">종목 분석 시그널</strong>: 기술적 분석, 수급, 모멘텀, 밸류에이션 4축 스코어링 결과 생성</li>
            <li><strong className="text-[var(--landing-text)]">모닝 브리핑</strong>: 시장 데이터를 기반으로 한 일일 시장 요약 보고서 자동 생성</li>
            <li><strong className="text-[var(--landing-text)]">시나리오 분석</strong>: 시장 상황에 따른 상승/하락/횡보 시나리오 자동 생성</li>
            <li><strong className="text-[var(--landing-text)]">세력 포착</strong>: 비정상적 거래량 패턴을 AI가 자동 감지</li>
            <li><strong className="text-[var(--landing-text)]">섹터 모멘텀</strong>: 섹터별 자금 흐름과 모멘텀 추세를 AI가 분석</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-3">AI 콘텐츠의 한계</h2>
          <ol className="list-decimal ml-5 space-y-2">
            <li>AI가 생성한 콘텐츠는 입력 데이터의 품질과 모델의 한계에 의해 부정확할 수 있습니다.</li>
            <li>AI 분석은 과거 패턴에 기반하며, 전례 없는 시장 상황에서는 예측력이 저하될 수 있습니다.</li>
            <li>AI가 생성한 콘텐츠는 사전에 사람에 의한 검수를 거치지 않을 수 있습니다.</li>
            <li>이용자는 AI 생성 콘텐츠를 비판적으로 검토하고, 이를 유일한 투자 근거로 사용하지 않을 것을 권고합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[var(--landing-text)] mb-3">표시 의무</h2>
          <p>서비스 내에서 AI에 의해 생성된 콘텐츠에는 &ldquo;AI 분석&rdquo; 또는 &ldquo;AI 생성&rdquo; 등의 라벨을 표시하여 이용자가 해당 콘텐츠의 생성 방식을 인지할 수 있도록 합니다.</p>
        </section>

        <p className="text-[var(--landing-text-dim)] pt-6 border-t border-[var(--landing-border)]">
          시행일: 2026년 4월 1일 · 문의: hello@flowx.kr
        </p>
      </div>
    </div>
  )
}
