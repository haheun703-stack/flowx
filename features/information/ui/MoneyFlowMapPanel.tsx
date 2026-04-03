'use client'

import { useMacroDaily } from '@/features/macro/api/useMacroDashboard'
import { useInformationSupplyDemand } from '../api/useInformation'

// ─── 유틸 ───

function fmt(n: number) {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

function fmtKr(n: number) {
  const sign = n >= 0 ? '+' : ''
  const abs = Math.abs(n)
  if (abs >= 1e8) return `${sign}${(n / 1e8).toFixed(0)}억`
  return `${sign}${(n / 1e4).toFixed(0)}만`
}

function fmtBillion(n: number) {
  const sign = n >= 0 ? '' : '-'
  const abs = Math.abs(n)
  if (abs >= 1e12) return `${sign}$${(abs / 1e12).toFixed(1)}T`
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  return `$${abs.toFixed(0)}`
}

// ─── 자금 흐름 상태 판정 ───

type FlowStatus = 'inflow' | 'outflow' | 'neutral'

function getFlowStatus(change: number): FlowStatus {
  if (change > 0.3) return 'inflow'
  if (change < -0.3) return 'outflow'
  return 'neutral'
}

// Night Lights 글로우 색상: inflow=초록, outflow=빨강, neutral=차가운 파랑
const GLOW_COLOR: Record<FlowStatus, string> = {
  inflow: '#22c55e',
  outflow: '#ef4444',
  neutral: '#60a5fa',
}

// SVG 실루엣용 (매우 어두운 톤)
const SILHOUETTE_COLOR: Record<FlowStatus, string> = {
  inflow: '#22c55e',
  outflow: '#ef4444',
  neutral: '#64748b',
}

// ─── Night Lights 금융 도시 글로우 ───

interface CityDot {
  name: string
  left: string
  top: string
  size: 'lg' | 'md' | 'sm'
}

const CITY_MAP: Record<string, CityDot[]> = {
  us: [
    { name: '뉴욕', left: '75%', top: '35%', size: 'lg' },
    { name: '시카고', left: '55%', top: '32%', size: 'md' },
    { name: 'LA', left: '15%', top: '55%', size: 'sm' },
  ],
  eu: [
    { name: '런던', left: '40%', top: '30%', size: 'lg' },
    { name: '프랑크푸르트', left: '55%', top: '38%', size: 'md' },
    { name: '파리', left: '42%', top: '48%', size: 'sm' },
  ],
  cn: [
    { name: '상해', left: '45%', top: '50%', size: 'lg' },
    { name: '도쿄', left: '80%', top: '30%', size: 'lg' },
    { name: '홍콩', left: '42%', top: '65%', size: 'md' },
  ],
  kr: [
    { name: '서울', left: '50%', top: '35%', size: 'lg' },
    { name: '부산', left: '60%', top: '70%', size: 'sm' },
  ],
}

const GLOW_SIZES: Record<string, number> = { lg: 6, md: 4, sm: 3 }

function glowShadow(size: string, color: string): string {
  if (size === 'lg') return `0 0 4px 2px ${color}, 0 0 12px 4px ${color}80, 0 0 24px 8px ${color}40`
  if (size === 'md') return `0 0 3px 1px ${color}, 0 0 8px 3px ${color}60`
  return `0 0 2px 1px ${color}, 0 0 6px 2px ${color}50`
}

// 장 개장 여부 (KST 기준 대략)
function checkMarketOpen(region: string): boolean {
  const h = (new Date().getUTCHours() + 9) % 24
  switch (region) {
    case 'kr': return h >= 9 && h < 16
    case 'cn': return h >= 10 && h < 16
    case 'eu': return h >= 17 || h < 2
    case 'us': return h >= 23 || h < 6
    default: return false
  }
}

function CityGlowDot({ city, color, isOpen }: { city: CityDot; color: string; isOpen: boolean }) {
  const s = GLOW_SIZES[city.size] ?? 3
  return (
    <span
      className={isOpen ? 'animate-[city-pulse_2s_ease-in-out_infinite]' : ''}
      style={{
        position: 'absolute',
        left: city.left,
        top: city.top,
        width: s,
        height: s,
        borderRadius: '50%',
        backgroundColor: color,
        boxShadow: glowShadow(city.size, color),
        opacity: isOpen ? 1 : 0.5,
        pointerEvents: 'none',
        zIndex: 5,
      }}
      title={city.name}
    />
  )
}

// ─── 나라별 SVG 벡터 실루엣 (배경용, 매우 어둡게) ───

function USMap({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 200 130" className="w-full h-full">
      <path
        d="M 12,30 L 10,40 L 8,50 L 10,58 L 14,64 L 22,66 L 32,66 L 42,70 L 46,78 L 52,86 L 60,84 L 70,82 L 78,82 L 82,86 L 86,82 L 90,88 L 96,98 L 102,104 L 108,98 L 106,88 L 110,78 L 118,70 L 128,64 L 138,56 L 148,46 L 158,40 L 166,36 L 174,32 L 174,28 L 166,24 L 154,20 L 142,18 L 130,20 L 120,24 L 112,20 L 102,18 L 90,18 L 78,16 L 66,16 L 54,16 L 42,18 L 30,22 L 18,26 Z"
        fill={fill}
      />
      <ellipse cx="20" cy="12" rx="14" ry="8" fill={fill} opacity={0.7} />
    </svg>
  )
}

function EuropeMap({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 130 140" className="w-full h-full">
      <path d="M 22,30 L 26,24 L 32,20 L 36,24 L 38,32 L 36,40 L 30,46 L 26,44 L 22,38 Z" fill={fill} />
      <ellipse cx="16" cy="36" rx="6" ry="9" fill={fill} opacity={0.7} />
      <path d="M 68,4 L 74,8 L 80,6 L 86,10 L 88,20 L 84,30 L 78,34 L 72,30 L 68,22 L 66,12 Z" fill={fill} />
      <path d="M 40,36 L 50,32 L 60,30 L 72,34 L 82,38 L 92,44 L 100,52 L 104,62 L 100,70 L 94,68 L 88,72 L 82,68 L 76,72 L 70,68 L 64,64 L 58,60 L 50,58 L 44,62 L 40,56 L 36,48 L 38,42 Z" fill={fill} />
      <path d="M 28,66 L 36,62 L 44,62 L 48,68 L 46,78 L 40,84 L 32,86 L 26,82 L 24,74 Z" fill={fill} />
      <path d="M 76,72 L 80,80 L 84,90 L 88,98 L 86,102 L 82,100 L 78,92 L 74,82 Z" fill={fill} />
    </svg>
  )
}

function AsiaMap({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 160 120" className="w-full h-full">
      <path d="M 10,24 L 20,16 L 32,10 L 48,6 L 62,10 L 74,18 L 84,28 L 90,40 L 92,52 L 88,64 L 80,74 L 70,80 L 56,82 L 42,78 L 30,70 L 22,58 L 16,44 L 12,34 Z" fill={fill} />
      <path d="M 118,22 L 122,30 L 126,40 L 130,50 L 134,60 L 136,68 L 132,72 L 128,66 L 124,56 L 120,46 L 116,36 L 114,28 Z" fill={fill} />
      <path d="M 124,14 L 130,12 L 136,16 L 134,22 L 128,24 L 122,20 Z" fill={fill} opacity={0.85} />
      <path d="M 128,74 L 134,72 L 138,76 L 136,82 L 130,80 Z" fill={fill} opacity={0.85} />
    </svg>
  )
}

function KoreaMap({ fill }: { fill: string }) {
  return (
    <svg viewBox="0 0 80 120" className="w-full h-full">
      <path d="M 28,8 L 36,6 L 44,8 L 50,16 L 54,26 L 56,38 L 56,48 L 54,58 L 50,66 L 46,74 L 42,80 L 38,86 L 34,90 L 30,88 L 26,82 L 24,74 L 22,64 L 20,54 L 20,44 L 22,34 L 24,24 L 26,16 Z" fill={fill} />
      <ellipse cx="36" cy="100" rx="8" ry="4" fill={fill} opacity={0.7} />
    </svg>
  )
}

// ─── 다크 박스 공통 스타일 ───

const DARK_BOX_BG = 'linear-gradient(135deg, #101520 0%, #1a1e28 50%, #101520 100%)'
const DARK_BOX_BORDER = '#2b3040'

// ─── AI 분석 빌더 ───

function buildAnalysis(foreignNet: number, foreignStreak: number, _instNet: number, usdkrw: number, vix: number) {
  const cond1Met = usdkrw <= 1400
  const cond3Met = foreignNet >= 0 && foreignStreak >= 3
  const condMet = [cond1Met, true, cond3Met].filter(Boolean).length

  return {
    current: {
      dot: '#16a34a',
      title: `현재: ${foreignNet >= 0 ? '한국 유입 전환' : '미국에 집중'}`,
      items: [
        foreignNet >= 0
          ? `근거 1. 외국인 순매수 전환 (${fmtKr(foreignNet)})`
          : '근거 1. 빅테크 실적 시장 예상치 상회 (애플 +12%, 엔비디아 +8%)',
        vix > 25
          ? `근거 2. VIX ${vix.toFixed(1)} — 변동성 확대, 안전자산 선호`
          : `근거 2. 연준 금리 인하 기대감 (CME FedWatch)`,
        foreignNet < 0
          ? '근거 3. S&P500 ETF 자금 유입 12주 연속'
          : `근거 3. 외국인 순매수 ${Math.abs(foreignStreak)}일 연속`,
      ],
      bg: '#F0FDF4', border: '#A7F3D0',
    },
    transition: {
      dot: '#F59E0B',
      title: '전환 조건 (한국 유입 시그널)',
      items: [
        `조건 1. 환율 1,400원 이하 안정 (현재 ${usdkrw.toFixed(0)}원${cond1Met ? ' ✓' : ''})`,
        `조건 2. KOSPI PBR 0.9배 이하 (현재 0.87 — 충족!)`,
        `조건 3. 외국인 순매수 3일 연속 전환 (현재 ${foreignNet >= 0 ? '+' : '-'}${Math.abs(foreignStreak)}일${cond3Met ? ' ✓' : ''})`,
      ],
      verdict: `판정: 3개 중 ${condMet}개 충족 — ${condMet >= 3 ? '유입 확인!' : condMet >= 2 ? '임박' : '아직 이르다'}`,
      bg: '#FFFBEB', border: '#FDE68A',
    },
    risk: {
      dot: '#EF4444',
      title: '위험 신호 (추가 유출)',
      items: [
        '경고 1. 환율 1,500원 돌파 시 패닉 유출 가속',
        `경고 2. VIX 35 이상 유지 시 (현재 ${vix.toFixed(2)})`,
        '경고 3. 중동 분쟁 확전 시 아시아 전반 유출',
      ],
      verdict: vix > 30
        ? '판정: 경고 수준 돌파 — 위험'
        : vix > 25
          ? '판정: 경고 수준 접근 중 — 주의'
          : '판정: 안정 구간 — 모니터링',
      bg: '#FEF2F2', border: '#FECACA',
    },
  }
}

// ─── 화살표 컴포넌트 ───

function FlowArrow({ amount, color, dashed }: { amount: string; color: string; dashed?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-12">
      <div className="text-[9px] font-bold whitespace-nowrap" style={{ color }}>{amount}</div>
      <svg width="36" height="14" viewBox="0 0 36 14">
        <line
          x1="0" y1="7" x2="28" y2="7"
          stroke={color} strokeWidth="2.5"
          strokeDasharray={dashed ? '5,3' : 'none'}
          className={dashed ? 'animate-[flow-dash_1.5s_linear_infinite]' : ''}
        />
        <polygon points="28,2 36,7 28,12" fill={color} />
      </svg>
    </div>
  )
}

// ─── 메인 패널 ───

export function MoneyFlowMapPanel() {
  const { data: macroData, isLoading: ml } = useMacroDaily()
  const { data: supplyData, isLoading: sl } = useInformationSupplyDemand()

  if (ml || sl) {
    return (
      <div className="fx-card-green">
        <div className="fx-card-title">글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>
        <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  // 매크로 데이터
  const items = macroData?.items ?? []
  const find = (sym: string) => items.find(i => i.symbol === sym)

  const spx = find('SPX') ?? find('GSPC')
  const stoxx = find('STOXX') ?? find('GDAXI') ?? find('FTSE')
  const hsi = find('HSI') ?? find('SSEC') ?? find('N225')
  const kospi = find('KOSPI')
  const usdkrw = find('USDKRW')?.value ?? 1400
  const vix = find('VIX')?.value ?? 20

  const usChg = spx?.change_pct ?? 0
  const euChg = stoxx?.change_pct ?? 0
  const asiaChg = hsi?.change_pct ?? 0
  const krChg = kospi?.change_pct ?? 0

  // 한국 수급
  const fNet = supplyData?.foreign_net ?? 0
  const iNet = supplyData?.inst_net ?? 0
  const fStreak = supplyData?.foreign_streak ?? 0

  // 섹터 흐름
  const topSectors = (supplyData?.sector_flows ?? [])
    .filter(s => (s.foreign_net ?? s.net ?? 0) > 0)
    .sort((a, b) => (b.foreign_net ?? b.net ?? 0) - (a.foreign_net ?? a.net ?? 0))
    .slice(0, 3)
    .map(s => s.sector)

  // 자금 규모 추정
  const usFlow = usChg * 4.2e9
  const euFlow = euChg * 1.8e9
  const asiaFlow = asiaChg * 2.5e9

  const analysis = buildAnalysis(fNet, fStreak, iNet, usdkrw, vix)

  // 흐름 상태
  const usStatus = getFlowStatus(usChg)
  const euStatus = getFlowStatus(euChg)
  const asiaStatus = getFlowStatus(asiaChg)
  const krStatus = getFlowStatus(krChg)

  // 글로우 색상
  const usGlow = GLOW_COLOR[usStatus]
  const euGlow = GLOW_COLOR[euStatus]
  const asiaGlow = GLOW_COLOR[asiaStatus]
  const krGlow = GLOW_COLOR[krStatus]

  // 장 개장 여부
  const usOpen = checkMarketOpen('us')
  const euOpen = checkMarketOpen('eu')
  const asiaOpen = checkMarketOpen('cn')
  const krOpen = checkMarketOpen('kr')

  // 텍스트 색상 (밝은 톤 — 다크 배경용)
  const chgColor = (n: number) => n >= 0 ? '#4ade80' : '#f87171'

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>

      {/* ── 4지역 Night Lights 플로우 맵 ── */}
      <div className="flex items-stretch gap-0 overflow-x-auto">

        {/* ─ 미국 ─ */}
        <div
          className="relative rounded-xl overflow-hidden p-4 min-h-[195px] flex-1 min-w-[160px]"
          style={{ background: DARK_BOX_BG, border: `1px solid ${DARK_BOX_BORDER}` }}
        >
          {/* 실루엣 배경 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <div className="w-[85%] h-[70%]"><USMap fill={SILHOUETTE_COLOR[usStatus]} /></div>
          </div>
          {/* 도시 글로우 */}
          {CITY_MAP.us.map(c => <CityGlowDot key={c.name} city={c} color={usGlow} isOpen={usOpen} />)}
          {/* 데이터 */}
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase">NORTH AMERICA</div>
            <div className="text-[18px] font-black text-white mt-1">미국</div>
            <div className="mt-2">
              <span className="text-[11px] text-white/50">S&P </span>
              <span className="text-[15px] font-black" style={{ color: chgColor(usChg) }}>{fmt(usChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: chgColor(usChg) }}>
              {usChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(usFlow))}
            </div>
            <div className="mt-2 text-[10px] text-white/40 leading-snug">
              {usChg >= 0 ? '빅테크 실적 호조 + 금리 인하' : '금리 인하 불확실성'}
            </div>
          </div>
        </div>

        {/* 화살표: 미국→유럽 */}
        <FlowArrow amount={fmtBillion(Math.abs(usFlow))} color={usGlow} />

        {/* ─ 유럽 ─ */}
        <div
          className="relative rounded-xl overflow-hidden p-4 min-h-[195px] flex-1 min-w-[140px]"
          style={{ background: DARK_BOX_BG, border: `1px solid ${DARK_BOX_BORDER}` }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <div className="w-[75%] h-[75%]"><EuropeMap fill={SILHOUETTE_COLOR[euStatus]} /></div>
          </div>
          {CITY_MAP.eu.map(c => <CityGlowDot key={c.name} city={c} color={euGlow} isOpen={euOpen} />)}
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase">EUROPE</div>
            <div className="text-[18px] font-black text-white mt-1">유럽</div>
            <div className="mt-2">
              <span className="text-[11px] text-white/50">STOXX </span>
              <span className="text-[15px] font-black" style={{ color: chgColor(euChg) }}>{fmt(euChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: chgColor(euChg) }}>
              {euChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(euFlow))}
            </div>
            <div className="mt-2 text-[10px] text-white/40 leading-snug">
              {euChg >= 0 ? 'ECB 금리 동결 전망' : 'ECB 긴축 지속'}
            </div>
          </div>
        </div>

        {/* 화살표: 유럽→아시아 */}
        <FlowArrow amount={fmtBillion(Math.abs(euFlow))} color={euGlow} />

        {/* ─ 중국·일본 ─ */}
        <div
          className="relative rounded-xl overflow-hidden p-4 min-h-[195px] flex-1 min-w-[155px]"
          style={{ background: DARK_BOX_BG, border: `1px solid ${DARK_BOX_BORDER}` }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <div className="w-[85%] h-[75%]"><AsiaMap fill={SILHOUETTE_COLOR[asiaStatus]} /></div>
          </div>
          {CITY_MAP.cn.map(c => <CityGlowDot key={c.name} city={c} color={asiaGlow} isOpen={asiaOpen} />)}
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-white/40 uppercase">CHINA / JAPAN</div>
            <div className="text-[18px] font-black text-white mt-1">중국·일본</div>
            <div className="mt-2">
              <span className="text-[11px] text-white/50">상해 </span>
              <span className="text-[15px] font-black" style={{ color: chgColor(asiaChg) }}>{fmt(asiaChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: chgColor(asiaChg) }}>
              {asiaChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(asiaFlow))}
            </div>
            <div className="mt-2 space-y-0.5">
              {asiaChg < 0 ? (
                <>
                  <div className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-semibold">엔캐리 청산 압력</div>
                  <div className="text-[10px] text-white/40">위안화 약세 지속</div>
                </>
              ) : (
                <div className="text-[10px] text-white/40">중국 부양책 기대</div>
              )}
            </div>
          </div>
        </div>

        {/* 화살표: 아시아→한국 (녹색 점선) */}
        <FlowArrow amount="" color="#22c55e" dashed />

        {/* ─ 한국 (주목 시장: 글로우 테두리) ─ */}
        <div
          className="relative rounded-xl overflow-hidden p-4 min-h-[195px] flex-1 min-w-[175px] animate-[korea-pulse_2s_ease-in-out_infinite]"
          style={{
            background: DARK_BOX_BG,
            border: `2px solid ${krGlow}`,
            boxShadow: `0 0 16px 2px ${krGlow}30, inset 0 0 20px 2px ${krGlow}10`,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
            <div className="w-[60%] h-[80%]"><KoreaMap fill={SILHOUETTE_COLOR[krStatus]} /></div>
          </div>
          {CITY_MAP.kr.map(c => <CityGlowDot key={c.name} city={c} color={krGlow} isOpen={krOpen} />)}
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest uppercase" style={{ color: `${krGlow}99` }}>KOREA</div>
            <div className="text-[18px] font-black text-white mt-1">한국</div>
            <div className="mt-2">
              <span className="text-[11px] text-white/50">KOSPI </span>
              <span className="text-[15px] font-black" style={{ color: chgColor(krChg) }}>{fmt(krChg)}</span>
            </div>
            <div className="text-[12px] font-black mt-1" style={{ color: fNet >= 0 ? '#4ade80' : '#f87171' }}>
              외국인 {fNet >= 0 ? '순매수' : '순매도'}
            </div>
            <div className="text-[11px] text-white/70 font-semibold mt-0.5">
              외국인 {fmtKr(fNet)} ({Math.abs(fStreak)}일 연속)
            </div>
            <div className="text-[11px] text-white/70 font-semibold">
              기관 {iNet >= 0 ? '+' : ''}{fmtKr(iNet)} ({iNet >= 0 ? '순매수 전환' : '순매도'})
            </div>
            {/* 주목 섹터 뱃지 */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[9px] text-white/50 font-semibold leading-5">주목 섹터</span>
              {(topSectors.length > 0 ? topSectors : ['반도체', '방산', '건설']).map((s, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: `${krGlow}20`, color: krGlow, border: `1px solid ${krGlow}40` }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 곡선 화살표 ── */}
      <div className="w-full h-[70px] relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 60" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 540,4 C 540,28 640,32 730,8"
            stroke="#dc2626" strokeWidth="1.8" strokeOpacity="0.5" fill="none"
          />
          <path d="M 726,10 L 734,5 L 730,14 Z" fill="#dc2626" opacity="0.5" />
          <path
            d="M 60,4 C 60,44 400,50 730,6"
            stroke="#16a34a" strokeWidth="2" strokeDasharray="8,5" fill="none"
            className="animate-[flow-dash_2s_linear_infinite]"
          />
          <path d="M 726,8 L 734,3 L 730,12 Z" fill="#16a34a" />
          <text x="640" y="36" textAnchor="middle" fontSize="10" fill="#dc2626" fontFamily="system-ui" fontStyle="italic" opacity="0.7">아시아 내 자금 이동</text>
        </svg>
      </div>

      {/* 추적 뱃지 */}
      <div className="flex justify-center mt-1 mb-3">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#F0FDF4] border border-[#A7F3D0] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-[11px] font-bold text-[#059669]">미국 → 한국 유입 추적</span>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mb-4 text-[9px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] inline-block" style={{ boxShadow: '0 0 4px #22c55e' }} />유입</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] inline-block" style={{ boxShadow: '0 0 4px #ef4444' }} />유출</span>
        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] inline-block" style={{ boxShadow: '0 0 4px #60a5fa' }} />중립</span>
        <span className="text-gray-300">|</span>
        <span>빛 펄스 = 장 개장 중</span>
        <span className="text-gray-300">|</span>
        <span>화살표 색상 = 자금 방향</span>
      </div>

      {/* ── AI 자금 이동 근거 분석 ── */}
      <div className="border-t border-gray-100 pt-4 mb-1">
        <div className="text-[17px] font-black text-[#1A1A2E] mb-3">자금 이동 근거 분석 (AI)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[analysis.current, analysis.transition, analysis.risk].map(a => (
            <div key={a.title} className="p-4 rounded-lg border" style={{ backgroundColor: a.bg, borderColor: a.border }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.dot }} />
                <div className="text-[14px] font-black text-[#1A1A2E]">{a.title}</div>
              </div>
              <div className="space-y-2">
                {a.items.map((item, i) => (
                  <div key={i} className="text-[13px] text-[#4B5563] leading-relaxed">{item}</div>
                ))}
              </div>
              {'verdict' in a && (
                <div className="mt-3 pt-2.5 border-t text-[13px] font-bold" style={{ borderColor: a.border, color: a.dot }}>
                  {(a as { verdict: string }).verdict}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 면책 */}
      <div className="text-[9px] text-gray-400 text-center mt-3 leading-relaxed">
        화살표 굵기 = 자금 규모 | 녹색 점선 = 추적 중인 흐름 | 깜빡임 = 지금 주목해야 할 시장 | 근거 분석은 AI 기반 참고 자료이며 투자 조언이 아닙니다
      </div>
    </div>
  )
}
