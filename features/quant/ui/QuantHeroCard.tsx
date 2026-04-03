'use client'

// ─── 1행: 오늘의 작전 — 퀀트 히어로 (보라 테마) ───
// 4칸 액션 박스: 레버리지 / 인버스 / 금·달러 ETF / 섹터 ETF

interface QuantHeroCardProps {
  verdict?: string
  regime?: string
  recommendation?: string
  vix?: number
  vixGrade?: string
  cashPct?: number
  dangerMode?: string
  brainScore?: number
  hotSectors?: { sector: string; ret_5: number }[]
  coldSectors?: { sector: string; ret_5: number }[]
  date?: string | null
}

// ─── 액션 타입 ───

type ActionLevel = 'ban' | 'wait' | 'buy' | 'full'

interface ActionBox {
  label: string
  symbol: string
  level: ActionLevel
  reason: string
}

const ACTION_STYLES: Record<ActionLevel, { bg: string; border: string; text: string }> = {
  ban:  { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626' },
  wait: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706' },
  buy:  { bg: '#E8F5E9', border: '#A7F3D0', text: '#16A34A' },
  full: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
}

const LEVEL_LABEL: Record<ActionLevel, string> = {
  ban: '✕ 대기',
  wait: '△ 관망',
  buy: '○ 매수',
  full: '◎ FULL',
}

// ─── 데이터 → 4칸 액션 자동 매핑 ───

function deriveActions(props: QuantHeroCardProps): ActionBox[] {
  const { vix = 0, dangerMode, regime = '', cashPct = 0, hotSectors = [] } = props
  const isDanger = !!dangerMode && dangerMode !== 'NONE'
  const isBear = regime.toLowerCase().includes('bear') || regime.includes('위험') || regime.includes('약세')
  const isBull = regime.toLowerCase().includes('bull') || regime.includes('상승') || regime.includes('강세')

  // 1. 레버리지
  let leverage: ActionBox
  if (vix >= 30 || isDanger) {
    leverage = { label: '레버리지', symbol: '✕', level: 'ban', reason: `VIX ${vix.toFixed(0)} 금지` }
  } else if (vix >= 25 || isBear) {
    leverage = { label: '레버리지', symbol: '△', level: 'wait', reason: `VIX ${vix.toFixed(0)} 주의` }
  } else if (vix < 18 && isBull) {
    leverage = { label: '레버리지', symbol: '◎', level: 'full', reason: '강세장 진입' }
  } else if (vix < 22) {
    leverage = { label: '레버리지', symbol: '○', level: 'buy', reason: '소량 진입 가능' }
  } else {
    leverage = { label: '레버리지', symbol: '△', level: 'wait', reason: '시장 관찰' }
  }

  // 2. 인버스
  let inverse: ActionBox
  if (vix >= 30 || isDanger) {
    inverse = { label: '인버스', symbol: '○', level: 'buy', reason: `VIX ${vix.toFixed(0)} 헤지` }
  } else if (vix >= 25 && isBear) {
    inverse = { label: '인버스', symbol: '◎', level: 'full', reason: '하락 대비 풀' }
  } else if (vix >= 25) {
    inverse = { label: '인버스', symbol: '△', level: 'wait', reason: '조건부 대기' }
  } else {
    inverse = { label: '인버스', symbol: '✕', level: 'ban', reason: '불필요' }
  }

  // 3. 금/달러 ETF
  let goldUsd: ActionBox
  if (isDanger || cashPct >= 50) {
    goldUsd = { label: '금/달러 ETF', symbol: '◎', level: 'full', reason: '안전자산 확대' }
  } else if (cashPct >= 30 || isBear) {
    goldUsd = { label: '금/달러 ETF', symbol: '○', level: 'buy', reason: '안전자산 유지' }
  } else if (cashPct >= 15) {
    goldUsd = { label: '금/달러 ETF', symbol: '△', level: 'wait', reason: '비중 유지' }
  } else {
    goldUsd = { label: '금/달러 ETF', symbol: '✕', level: 'ban', reason: '축소 검토' }
  }

  // 4. 섹터 ETF
  let sectorEtf: ActionBox
  const topHot = hotSectors[0]
  if (hotSectors.length > 0 && isBull) {
    sectorEtf = { label: '섹터 ETF', symbol: '◎', level: 'full', reason: `${topHot?.sector ?? 'HOT'} FULL` }
  } else if (hotSectors.length > 0) {
    sectorEtf = { label: '섹터 ETF', symbol: '○', level: 'buy', reason: `${topHot?.sector ?? 'HOT'} 섹터` }
  } else if (isBear || isDanger) {
    sectorEtf = { label: '섹터 ETF', symbol: '✕', level: 'ban', reason: '진입 금지' }
  } else {
    sectorEtf = { label: '섹터 ETF', symbol: '△', level: 'wait', reason: '관찰 중' }
  }

  return [leverage, inverse, goldUsd, sectorEtf]
}

// ─── 메인 ───

export default function QuantHeroCard(props: QuantHeroCardProps) {
  const { verdict, recommendation, brainScore, date, hotSectors, coldSectors } = props
  const actions = deriveActions(props)

  const summary = recommendation ?? verdict ?? '관망'

  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: '#F0F0FF', border: '1px solid #C7D2FE' }}
    >
      {/* 상단: 타이틀 + 날짜 */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[15px] font-bold text-[#1A1A2E]">
          오늘의 작전 — {date ?? new Date().toISOString().slice(0, 10)} 08:00
        </h2>
        {brainScore != null && (
          <span
            className="text-[13px] font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: brainScore >= 0 ? '#E8F5E9' : '#FEF2F2',
              color: brainScore >= 0 ? '#16A34A' : '#DC2626',
            }}
          >
            BRAIN {brainScore > 0 ? '+' : ''}{brainScore}점
          </span>
        )}
      </div>

      {/* 요약 한 줄 */}
      <p className="text-[13px] font-bold text-[#4C1D95] mb-4">
        {summary}
        {verdict && verdict !== summary ? ` — ${verdict}` : ''}
      </p>

      {/* 4칸 액션 박스 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((a) => {
          const s = ACTION_STYLES[a.level]
          return (
            <div
              key={a.label}
              className="rounded-xl p-3 text-center"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
            >
              <p className="text-[11px] font-bold text-[#6B7280] mb-1">{a.label}</p>
              <p className="text-[22px] font-bold leading-none mb-1" style={{ color: s.text }}>
                {LEVEL_LABEL[a.level]}
              </p>
              <p className="text-[10px] font-medium" style={{ color: s.text }}>
                {a.reason}
              </p>
            </div>
          )
        })}
      </div>

      {/* HOT / COLD 뱃지 */}
      {((hotSectors?.length ?? 0) > 0 || (coldSectors?.length ?? 0) > 0) && (
        <div className="flex flex-wrap gap-4 mt-4">
          {hotSectors && hotSectors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#059669]">HOT</span>
              {hotSectors.slice(0, 5).map((s) => (
                <span
                  key={s.sector}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#059669] font-medium"
                >
                  {s.sector} +{s.ret_5.toFixed(1)}%
                </span>
              ))}
            </div>
          )}
          {coldSectors && coldSectors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-[#DC2626]">COLD</span>
              {coldSectors.slice(0, 5).map((s) => (
                <span
                  key={s.sector}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626] font-medium"
                >
                  {s.sector} {s.ret_5.toFixed(1)}%
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
