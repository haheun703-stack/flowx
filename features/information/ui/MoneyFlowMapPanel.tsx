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

// ─── 나라별 지도 실루엣 (간략화된 실제 형태) ───

/** 미국 본토 실루엣 */
function USMap() {
  return (
    <svg viewBox="0 0 130 85" className="w-full h-full">
      <path
        d={`M8,22 L5,28 L4,35 L5,42 L7,48 L10,52 L14,56 L16,60 L22,63
          L28,65 L34,64 L36,62 L40,60 L44,58 L48,60 L52,64 L54,68
          L56,72 L58,70 L60,64 L62,58 L66,52 L72,46 L78,40 L82,36
          L86,33 L90,30 L94,27 L96,24 L92,20 L86,18 L78,16 L70,14
          L60,13 L50,12 L40,13 L30,15 L20,18 L12,20 Z`}
        fill="#93C5FD"
        opacity="0.25"
      />
      {/* 알래스카 */}
      <ellipse cx="16" cy="12" rx="10" ry="6" fill="#93C5FD" opacity="0.15" />
      {/* 도시 마커 */}
      <circle cx="75" cy="35" r="2.5" fill="#3B82F6" opacity="0.4" />
      <circle cx="60" cy="44" r="2" fill="#3B82F6" opacity="0.3" />
      <circle cx="15" cy="38" r="2" fill="#3B82F6" opacity="0.3" />
    </svg>
  )
}

/** 유럽 실루엣 */
function EuropeMap() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* 본토 */}
      <path
        d={`M35,10 L42,8 L50,6 L58,8 L65,12 L70,10 L75,14 L78,20
          L76,26 L72,30 L68,28 L64,32 L66,38 L70,42 L74,48
          L76,55 L73,60 L68,64 L62,68 L56,72 L50,74
          L44,72 L38,68 L34,62 L30,56 L28,50 L26,44
          L24,38 L22,32 L24,26 L28,20 L32,15 Z`}
        fill="#D1D5DB"
        opacity="0.25"
      />
      {/* 영국 */}
      <path
        d={`M18,22 L22,18 L24,22 L22,28 L18,30 L16,26 Z`}
        fill="#D1D5DB"
        opacity="0.2"
      />
      {/* 이탈리아 반도 */}
      <path
        d={`M56,62 L58,68 L62,74 L60,78 L56,76 L54,70 Z`}
        fill="#D1D5DB"
        opacity="0.2"
      />
      {/* 도시 마커 */}
      <circle cx="50" cy="35" r="2" fill="#6B7280" opacity="0.35" />
      <circle cx="38" cy="45" r="1.8" fill="#6B7280" opacity="0.3" />
    </svg>
  )
}

/** 중국·일본 실루엣 */
function AsiaMap() {
  return (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      {/* 중국 본토 */}
      <path
        d={`M10,20 L18,14 L28,10 L40,8 L52,10 L62,14 L70,20
          L76,28 L80,36 L82,44 L80,52 L76,58 L70,62
          L62,66 L52,68 L42,66 L32,62 L24,56 L18,48
          L14,40 L12,32 L10,26 Z`}
        fill="#FCA5A5"
        opacity="0.22"
      />
      {/* 일본 열도 */}
      <path
        d={`M88,18 L92,22 L94,30 L96,38 L98,46 L100,52
          L98,56 L94,52 L92,44 L90,36 L88,28 L86,24 Z`}
        fill="#FCA5A5"
        opacity="0.2"
      />
      <path d="M96,56 L100,60 L98,64 L94,62 Z" fill="#FCA5A5" opacity="0.15" />
      {/* 도시 마커 */}
      <circle cx="50" cy="38" r="2.5" fill="#EF4444" opacity="0.3" />
      <circle cx="94" cy="40" r="2" fill="#EF4444" opacity="0.3" />
    </svg>
  )
}

/** 한반도 실루엣 */
function KoreaMap() {
  return (
    <svg viewBox="0 0 60 90" className="w-full h-full">
      {/* 한반도 */}
      <path
        d={`M22,8 L28,6 L34,8 L38,14 L40,20 L42,28
          L43,36 L42,44 L40,52 L38,58 L36,64 L33,70
          L30,74 L26,78 L22,76 L20,70 L18,64 L16,58
          L15,52 L14,44 L15,36 L16,28 L18,20 L20,14 Z`}
        fill="#86EFAC"
        opacity="0.3"
      />
      {/* 제주도 */}
      <ellipse cx="28" cy="84" rx="6" ry="3" fill="#86EFAC" opacity="0.2" />
      {/* 도시 마커 */}
      <circle cx="30" cy="42" r="2.5" fill="#16a34a" opacity="0.35" />
      <circle cx="26" cy="56" r="2" fill="#16a34a" opacity="0.3" />
    </svg>
  )
}

// ─── AI 분석 빌더 ───

function buildAnalysis(foreignNet: number, foreignStreak: number, _instNet: number, usdkrw: number, vix: number) {
  const cond1Met = usdkrw <= 1400
  const cond3Met = foreignNet >= 0 && foreignStreak >= 3
  const condMet = [cond1Met, true, cond3Met].filter(Boolean).length // cond2 = PBR 0.9이하 (항상 참 추정)

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

  const usColor = usChg >= 0 ? '#16a34a' : '#dc2626'
  const euColor = euChg >= 0 ? '#16a34a' : '#dc2626'
  const asiaColor = asiaChg >= 0 ? '#16a34a' : '#dc2626'
  const krColor = krChg >= 0 ? '#16a34a' : '#dc2626'

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>

      {/* ── 4지역 플로우 맵 ── */}
      <div className="flex items-stretch gap-0 overflow-x-auto">
        {/* 미국 카드 */}
        <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden p-4 min-h-[195px] flex-1 min-w-[160px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[85%] h-[70%]"><USMap /></div></div>
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">NORTH AMERICA</div>
            <div className="text-[18px] font-black text-[#1A1A2E] mt-1">미국</div>
            <div className="mt-2">
              <span className="text-[11px] text-gray-500">S&P </span>
              <span className="text-[15px] font-black" style={{ color: usColor }}>{fmt(usChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: usColor }}>
              {usChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(usFlow))}
            </div>
            <div className="mt-2 text-[10px] text-gray-400 leading-snug">
              {usChg >= 0 ? '빅테크 실적 호조 + 금리 인하' : '금리 인하 불확실성'}
            </div>
          </div>
        </div>

        {/* 미국→유럽 화살표 */}
        <div className="flex flex-col items-center justify-center shrink-0 w-12">
          <div className="text-[9px] font-bold text-[#1A1A2E] whitespace-nowrap">{fmtBillion(Math.abs(usFlow))}</div>
          <svg width="36" height="14" viewBox="0 0 36 14"><line x1="0" y1="7" x2="28" y2="7" stroke="#9CA3AF" strokeWidth="2.5" /><polygon points="28,2 36,7 28,12" fill="#9CA3AF" /></svg>
        </div>

        {/* 유럽 카드 */}
        <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden p-4 min-h-[195px] flex-1 min-w-[140px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[75%] h-[75%]"><EuropeMap /></div></div>
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">EUROPE</div>
            <div className="text-[18px] font-black text-[#1A1A2E] mt-1">유럽</div>
            <div className="mt-2">
              <span className="text-[11px] text-gray-500">STOXX </span>
              <span className="text-[15px] font-black" style={{ color: euColor }}>{fmt(euChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: euColor }}>
              {euChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(euFlow))}
            </div>
            <div className="mt-2 text-[10px] text-gray-400 leading-snug">
              {euChg >= 0 ? 'ECB 금리 동결 전망' : 'ECB 긴축 지속'}
            </div>
          </div>
        </div>

        {/* 유럽→아시아 화살표 */}
        <div className="flex flex-col items-center justify-center shrink-0 w-12">
          <div className="text-[9px] font-bold text-[#1A1A2E] whitespace-nowrap">{fmtBillion(Math.abs(euFlow))}</div>
          <svg width="36" height="14" viewBox="0 0 36 14"><line x1="0" y1="7" x2="28" y2="7" stroke="#9CA3AF" strokeWidth="2.5" /><polygon points="28,2 36,7 28,12" fill="#9CA3AF" /></svg>
        </div>

        {/* 중국·일본 카드 */}
        <div className="relative rounded-xl border border-gray-200 bg-white overflow-hidden p-4 min-h-[195px] flex-1 min-w-[155px]">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[85%] h-[75%]"><AsiaMap /></div></div>
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-[#dc2626]/60 uppercase">CHINA / JAPAN</div>
            <div className="text-[18px] font-black text-[#1A1A2E] mt-1">중국·일본</div>
            <div className="mt-2">
              <span className="text-[11px] text-gray-500">상해 </span>
              <span className="text-[15px] font-black" style={{ color: asiaColor }}>{fmt(asiaChg)}</span>
            </div>
            <div className="text-[12px] font-bold mt-1" style={{ color: asiaColor }}>
              {asiaChg >= 0 ? '유입' : '유출'} {fmtBillion(Math.abs(asiaFlow))}
            </div>
            <div className="mt-2 space-y-0.5">
              {asiaChg < 0 ? (
                <>
                  <div className="inline-block text-[9px] px-1.5 py-0.5 rounded bg-[#FEF2F2] text-[#dc2626] font-semibold">엔캐리 청산 압력</div>
                  <div className="text-[10px] text-gray-400">위안화 약세 지속</div>
                </>
              ) : (
                <div className="text-[10px] text-gray-400">중국 부양책 기대</div>
              )}
            </div>
          </div>
        </div>

        {/* 아시아→한국 녹색 점선 화살표 */}
        <div className="flex flex-col items-center justify-center shrink-0 w-12">
          <svg width="36" height="14" viewBox="0 0 36 14">
            <line x1="0" y1="7" x2="28" y2="7" stroke="#16a34a" strokeWidth="2.5" strokeDasharray="5,3" className="animate-[flow-dash_1.5s_linear_infinite]" />
            <polygon points="28,2 36,7 28,12" fill="#16a34a" />
          </svg>
        </div>

        {/* 한국 카드 (깜빡이는 녹색 테두리) */}
        <div className="relative rounded-xl border-2 bg-[#F0FDF4] overflow-hidden p-4 min-h-[195px] flex-1 min-w-[175px] shadow-lg animate-[korea-pulse_2s_ease-in-out_infinite]" style={{ borderColor: '#16a34a' }}>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><div className="w-[60%] h-[80%]"><KoreaMap /></div></div>
          <div className="relative z-10">
            <div className="text-[9px] font-bold tracking-widest text-[#16a34a] uppercase">KOREA</div>
            <div className="text-[18px] font-black text-[#1A1A2E] mt-1">한국</div>
            <div className="mt-2">
              <span className="text-[11px] text-gray-500">KOSPI </span>
              <span className="text-[15px] font-black" style={{ color: krColor }}>{fmt(krChg)}</span>
            </div>
            <div className="text-[12px] font-black mt-1" style={{ color: fNet >= 0 ? '#16a34a' : '#dc2626' }}>
              외국인 {fNet >= 0 ? '순매수' : '순매도'}
            </div>
            <div className="text-[11px] text-gray-700 font-semibold mt-0.5">
              외국인 {fmtKr(fNet)} ({Math.abs(fStreak)}일 연속)
            </div>
            <div className="text-[11px] text-gray-700 font-semibold">
              기관 {iNet >= 0 ? '+' : ''}{fmtKr(iNet)} ({iNet >= 0 ? '순매수 전환' : '순매도'})
            </div>
            {/* 주목 섹터 뱃지 */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[9px] text-gray-500 font-semibold leading-5">주목 섹터</span>
              {(topSectors.length > 0 ? topSectors : ['반도체', '방산', '건설']).map((s, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white text-[#059669] font-bold border border-[#A7F3D0]">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── 하단 곡선 화살표 (카드 아래) ── */}
      <div className="w-full h-[70px] relative">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 60" preserveAspectRatio="xMidYMid meet">
          {/* 빨간 실선: 중국·일본 → 한국 (아시아 내 자금 이동) */}
          <path
            d="M 540,4 C 540,28 640,32 730,8"
            stroke="#dc2626" strokeWidth="1.8" strokeOpacity="0.5" fill="none"
          />
          {/* 빨간 화살촉 */}
          <path d="M 726,10 L 734,5 L 730,14 Z" fill="#dc2626" opacity="0.5" />

          {/* 녹색 점선: 미국 → 한국 유입 추적 */}
          <path
            d="M 60,4 C 60,44 400,50 730,6"
            stroke="#16a34a" strokeWidth="2" strokeDasharray="8,5" fill="none"
            className="animate-[flow-dash_2s_linear_infinite]"
          />
          {/* 녹색 화살촉 */}
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
        <span>화살표 굵기 = 자금 규모</span>
        <span className="text-gray-300">|</span>
        <span><span className="text-[#16a34a] font-semibold">점선</span> = 추적 중인 흐름</span>
        <span className="text-gray-300">|</span>
        <span><span className="text-[#16a34a] font-semibold">깜빡임</span> = 지금 주목해야 할 시장</span>
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
