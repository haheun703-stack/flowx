export function FeatureSection() {
  const features = [
    {
      icon: '📡',
      title: '수급 X-Ray',
      subtitle: '트레이딩뷰에 없는 것',
      desc: '외국인·기관·개인 순매수를 캔들 차트와 동시에 분석. 스마트머니가 조용히 담는 구간을 시각화.',
      tag: 'FREE',
      tagColor: 'text-gray-400 border-gray-700',
    },
    {
      icon: '🧠',
      title: 'Why Now Engine',
      subtitle: '지금 왜 이 종목인가',
      desc: '수급 패턴 5가지를 자동 채점해서 0~100점 종합 판정. "외국인 5일 연속 매수 + 기관 역방향" 같은 신호를 즉시 감지.',
      tag: 'SIGNAL',
      tagColor: 'text-blue-400 border-blue-400/40',
    },
    {
      icon: '🚀',
      title: '포물선 탐지 알람',
      subtitle: '시작점을 잡는다',
      desc: '거래량 에너지 압축 → 폭발 패턴을 자동 감지. 매일 아침 7시 텔레그램으로 오늘의 포물선 후보 3종목 발송.',
      tag: 'PRO',
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
