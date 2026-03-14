export function FeatureSection() {
  const features = [
    {
      icon: '📡',
      title: '수급 X-Ray',
      subtitle: '트레이딩뷰에 없는 것',
      desc: '외국인·기관·개인 순매수를 캔들 차트 위에 겹쳐 분석. 스마트머니가 조용히 매집하는 구간을 한눈에 포착.',
      tag: 'LIVE',
      tagColor: 'text-[#00ff88] border-[#00ff88]/40',
    },
    {
      icon: '🖥️',
      title: 'Bloomberg 대시보드',
      subtitle: '8개 패널 실시간 터미널',
      desc: 'AI 종목추천, 세력 포착, 섹터 모멘텀, 중국자금, ETF 시그널, 스나이퍼 워치까지. 프로 트레이더 환경을 무료로.',
      tag: 'LIVE',
      tagColor: 'text-[#00ff88] border-[#00ff88]/40',
    },
    {
      icon: '🎯',
      title: 'AI 종목 추천',
      subtitle: '매일 갱신되는 Top 5',
      desc: '다중 전략 스코어링으로 종합 점수 산출. 진입가·손절가·목표가까지 자동 제시. 매일 장 마감 후 업데이트.',
      tag: 'LIVE',
      tagColor: 'text-[#00ff88] border-[#00ff88]/40',
    },
  ]

  return (
    <section className="px-6 py-24 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <div className="text-xs text-[#00ff88] font-mono tracking-widest uppercase mb-4">
          핵심 기능
        </div>
        <h2 className="text-4xl font-bold font-display">
          트레이딩뷰가 못 하는 것
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="relative p-6 rounded-2xl border border-gray-800 bg-gray-900/30 hover:border-gray-600 transition-all group"
          >
            <div className="absolute inset-0 rounded-2xl bg-[#00ff88] opacity-0 group-hover:opacity-[0.02] transition-opacity" />

            <div className="text-3xl mb-4">{f.icon}</div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              <span className={`text-xs border px-2 py-0.5 rounded-full font-mono ${f.tagColor}`}>
                {f.tag}
              </span>
            </div>
            <div className="text-xs text-[#00ff88] font-mono mb-3">{f.subtitle}</div>
            <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
