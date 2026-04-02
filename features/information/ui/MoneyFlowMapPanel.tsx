'use client'

export function MoneyFlowMapPanel() {
  const regions = [
    { id: 'us', label: '미국', x: 30, y: 30, w: 150, h: 195, bg: '#EFF6FF', status: '금리 동결 관망', emoji: '🇺🇸' },
    { id: 'eu', label: '유럽', x: 200, y: 50, w: 120, h: 170, bg: '#F9FAFB', status: '재정 확대 기대', emoji: '🇪🇺' },
    { id: 'asia', label: '중국·일본', x: 340, y: 40, w: 130, h: 180, bg: '#FEF2F2', status: '유동성 확대', emoji: '🇨🇳' },
    { id: 'kr', label: '한국', x: 490, y: 30, w: 160, h: 260, bg: '#E8F5E9', status: '외국인 순유입 전환?', emoji: '🇰🇷' },
  ]

  const arrows = [
    { x1: 180, y1: 128, x2: 198, y2: 135, strong: false },
    { x1: 320, y1: 135, x2: 338, y2: 130, strong: false },
    { x1: 470, y1: 130, x2: 488, y2: 120, strong: true },
  ]

  const analysis = [
    {
      title: '📍 현재 상태',
      bg: '#F0FDF4',
      border: '#A7F3D0',
      items: ['글로벌 달러 약세 전환 초기', '신흥국 자금 유입 모드 진입', '한국 외국인 매수 전환 시그널'],
    },
    {
      title: '🔄 전환 조건',
      bg: '#FFFBEB',
      border: '#FDE68A',
      items: ['환율 ≤ 1,400원 도달 시', 'PBR ≤ 0.9 (저평가 구간)', '외국인 3일 연속 순매수'],
    },
    {
      title: '⚠️ 위험 신호',
      bg: '#FEF2F2',
      border: '#FECACA',
      items: ['VIX 30 이상 급등 시 자금 회수', '미중 무역갈등 재점화', '글로벌 채권금리 급등'],
    },
  ]

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">🗺️ 글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>

      {/* SVG Flow Map */}
      <div className="w-full overflow-x-auto">
        <svg viewBox="0 0 680 320" className="w-full min-w-[500px]" style={{ maxHeight: 320 }}>
          <defs>
            <marker id="fx-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#00FF88" />
            </marker>
            <marker id="fx-arrow-gray" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6" fill="#9CA3AF" />
            </marker>
          </defs>

          {/* Region cards */}
          {regions.map(r => (
            <g key={r.id}>
              <rect
                x={r.x} y={r.y} width={r.w} height={r.h}
                rx="12" fill={r.bg}
                stroke={r.id === 'kr' ? '#00FF88' : '#E5E7EB'}
                strokeWidth={r.id === 'kr' ? 3 : 1}
                className={r.id === 'kr' ? 'animate-[pulse-stroke_2s_ease-in-out_infinite]' : ''}
              />
              <text x={r.x + r.w / 2} y={r.y + 30} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1A1A2E">
                {r.emoji} {r.label}
              </text>
              <text x={r.x + r.w / 2} y={r.y + 52} textAnchor="middle" fontSize="10" fill="#6B7280">
                {r.status}
              </text>
              {/* Simplified continent silhouette */}
              {r.id === 'us' && (
                <ellipse cx={r.x + r.w / 2} cy={r.y + 120} rx="45" ry="55" fill="#DBEAFE" opacity="0.5" />
              )}
              {r.id === 'eu' && (
                <ellipse cx={r.x + r.w / 2} cy={r.y + 110} rx="30" ry="45" fill="#E5E7EB" opacity="0.5" />
              )}
              {r.id === 'asia' && (
                <ellipse cx={r.x + r.w / 2} cy={r.y + 115} rx="35" ry="50" fill="#FECACA" opacity="0.3" />
              )}
              {r.id === 'kr' && (
                <>
                  <ellipse cx={r.x + r.w / 2} cy={r.y + 140} rx="40" ry="65" fill="#BBF7D0" opacity="0.3" />
                  <text x={r.x + r.w / 2} y={r.y + r.h - 20} textAnchor="middle" fontSize="20" fontWeight="900" fill="#00FF88" opacity="0.8">
                    ★
                  </text>
                </>
              )}
            </g>
          ))}

          {/* Flow arrows */}
          {arrows.map((a, i) => (
            <line
              key={i}
              x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2}
              stroke={a.strong ? '#00FF88' : '#9CA3AF'}
              strokeWidth={a.strong ? 3 : 1.5}
              strokeDasharray={a.strong ? '0' : '6 4'}
              markerEnd={a.strong ? 'url(#fx-arrow)' : 'url(#fx-arrow-gray)'}
              className={!a.strong ? 'animate-[flow-dash_1s_linear_infinite]' : ''}
            />
          ))}
        </svg>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {analysis.map(a => (
          <div key={a.title} className="p-3 rounded-lg border" style={{ backgroundColor: a.bg, borderColor: a.border }}>
            <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">{a.title}</div>
            <ul className="space-y-1">
              {a.items.map((item, i) => (
                <li key={i} className="text-[10px] text-[var(--fx-text-secondary)] flex items-start gap-1">
                  <span className="text-[var(--fx-green)] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="fx-card-tip">
        💡 현재 Phase 1 정적 데이터입니다. 추후 실시간 자금 흐름 데이터와 연동됩니다.
      </div>
    </div>
  )
}
