export function ImagePlaceholder({
  label = '장중 스크린샷 대기중',
  aspectRatio = '16/9',
  className = '',
}: {
  label?: string
  aspectRatio?: string
  className?: string
}) {
  return (
    <div
      className={`relative rounded-2xl bg-[#0F1117] border border-[#1E2030] overflow-hidden shadow-2xl ${className}`}
      style={{ aspectRatio }}
    >
      {/* 상단 브라우저 바 */}
      <div className="absolute top-0 inset-x-0 h-8 bg-[#0A0B10] flex items-center gap-1.5 px-3 border-b border-[#1E2030]">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-4 text-[10px] text-white/20 font-mono">flowx.kr/dashboard</span>
      </div>

      {/* 목업 대시보드 UI */}
      <div className="absolute inset-0 top-8 p-4 flex flex-col gap-3">
        {/* 상단 지수 바 */}
        <div className="flex gap-2">
          {['KOSPI', 'KOSDAQ', 'S&P 500', 'NASDAQ'].map((idx) => (
            <div key={idx} className="flex-1 bg-[#161824] rounded-lg px-3 py-2 border border-[#1E2030]">
              <div className="text-[9px] text-white/30 font-mono">{idx}</div>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-[11px] text-white/60 font-mono font-bold">
                  {idx === 'KOSPI' ? '2,680' : idx === 'KOSDAQ' ? '845' : idx === 'S&P 500' ? '5,420' : '17,200'}
                </span>
                <span className={`text-[8px] font-mono ${idx === 'KOSDAQ' ? 'text-blue-400' : 'text-red-400'}`}>
                  {idx === 'KOSDAQ' ? '▼0.3%' : '▲0.5%'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex gap-3 flex-1 min-h-0">
          {/* 좌측: 차트 영역 */}
          <div className="flex-[2] bg-[#161824] rounded-lg border border-[#1E2030] p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-white/40 font-mono">섹터 히트맵</span>
              <span className="text-[8px] text-[#00FF88]/60 font-mono">LIVE</span>
            </div>
            {/* 히트맵 목업 */}
            <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-1">
              {[
                { name: '반도체', c: 'bg-red-500/40' },
                { name: '자동차', c: 'bg-red-400/30' },
                { name: '바이오', c: 'bg-blue-400/30' },
                { name: '금융', c: 'bg-red-500/20' },
                { name: '철강', c: 'bg-red-400/20' },
                { name: '화학', c: 'bg-blue-500/20' },
                { name: '전기전자', c: 'bg-red-500/30' },
                { name: '건설', c: 'bg-blue-400/20' },
                { name: '유통', c: 'bg-red-400/15' },
                { name: '통신', c: 'bg-blue-500/15' },
                { name: '운수', c: 'bg-red-400/25' },
                { name: 'IT', c: 'bg-red-500/35' },
              ].map((s) => (
                <div key={s.name} className={`${s.c} rounded flex items-center justify-center`}>
                  <span className="text-[7px] text-white/40 font-mono">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 종목 리스트 */}
          <div className="flex-1 bg-[#161824] rounded-lg border border-[#1E2030] p-3">
            <div className="text-[10px] text-white/40 font-mono mb-2">AI 추천 TOP</div>
            <div className="space-y-1.5">
              {[
                { name: '삼성전자', score: 'A+', chg: '+2.1%', up: true },
                { name: 'SK하이닉스', score: 'A', chg: '+3.4%', up: true },
                { name: 'LG에너지솔루션', score: 'A', chg: '+1.8%', up: true },
                { name: 'NAVER', score: 'B+', chg: '-0.5%', up: false },
                { name: '카카오', score: 'B', chg: '+0.9%', up: true },
                { name: '현대차', score: 'A-', chg: '+1.2%', up: true },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-[#00FF88]/60 font-mono font-bold">{s.score}</span>
                    <span className="text-[9px] text-white/50 font-mono">{s.name}</span>
                  </div>
                  <span className={`text-[8px] font-mono ${s.up ? 'text-red-400/70' : 'text-blue-400/70'}`}>{s.chg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 그래디언트 페이드 */}
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0F1117] to-transparent pointer-events-none" />
    </div>
  )
}
