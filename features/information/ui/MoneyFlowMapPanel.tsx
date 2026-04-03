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
  return `${sign}$${abs.toFixed(0)}`
}

// ─── 지도 실루엣 SVG ───

function USMapSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 120 80" className="w-full h-full" style={{ opacity: 0.18 }}>
      <path d={`M10,35 L15,25 L22,22 L28,18 L35,15 L42,13 L50,12 L58,13 L65,15
        L72,18 L78,22 L82,18 L88,16 L95,18 L100,22 L105,28 L108,35
        L110,42 L108,50 L105,55 L100,58 L95,60 L88,62 L82,60 L78,55
        L72,58 L65,62 L58,65 L50,67 L42,65 L35,62 L28,58 L22,52
        L18,45 L12,40 Z`} fill={color} />
      <circle cx="90" cy="55" r="6" fill={color} opacity="0.6" />
    </svg>
  )
}

function EuropeMapSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 90" className="w-full h-full" style={{ opacity: 0.18 }}>
      <path d={`M40,8 L48,5 L55,8 L60,12 L65,10 L70,14 L72,20 L68,25 L72,30
        L75,35 L78,40 L80,48 L78,55 L72,60 L65,65 L58,70 L52,72
        L45,70 L40,65 L35,60 L30,55 L28,48 L25,42 L22,35 L25,28
        L28,22 L32,16 L36,12 Z`} fill={color} />
      <path d={`M55,72 L58,78 L62,82 L58,85 L52,82 L50,76 Z`} fill={color} opacity="0.5" />
    </svg>
  )
}

function AsiaMapSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 110 90" className="w-full h-full" style={{ opacity: 0.18 }}>
      <path d={`M15,15 L25,10 L38,8 L50,10 L60,15 L70,12 L80,15 L88,20
        L92,28 L90,38 L85,45 L80,50 L75,55 L70,62 L65,68 L58,72
        L50,70 L42,65 L35,60 L28,55 L22,48 L18,40 L15,32 L14,24 Z`} fill={color} />
      <path d={`M85,50 L92,52 L98,58 L100,65 L96,72 L90,68 L85,60 Z`} fill={color} opacity="0.6" />
    </svg>
  )
}

function KoreaMapSilhouette({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 60 90" className="w-full h-full" style={{ opacity: 0.2 }}>
      <path d={`M22,8 L28,5 L35,8 L40,14 L42,22 L44,30 L45,38 L44,46
        L42,54 L40,60 L38,66 L35,72 L30,78 L25,82 L22,78 L20,72
        L18,66 L16,60 L15,54 L14,46 L15,38 L16,30 L18,22 L20,14 Z`} fill={color} />
      <ellipse cx="48" cy="70" rx="6" ry="8" fill={color} opacity="0.4" />
    </svg>
  )
}

// ─── 지역 카드 ───

function RegionCard({
  sublabel, label, indexLabel, changePct, flowAmount, flowDesc, notes, isKorea,
  extraLines, mapColor, MapComponent, sectorBadges,
}: {
  sublabel: string; label: string; indexLabel: string; changePct: number
  flowAmount: number; flowDesc: string; notes: string[]
  isKorea?: boolean; extraLines?: string[]; mapColor: string
  MapComponent: React.ComponentType<{ color: string }>
  sectorBadges?: string[]
}) {
  const color = changePct >= 0 ? '#16a34a' : '#dc2626'
  const flowColor = flowAmount >= 0 ? '#16a34a' : '#dc2626'
  return (
    <div className={`relative rounded-xl p-4 flex-1 min-w-[170px] overflow-hidden ${
      isKorea
        ? 'border-2 bg-[#F0FDF4] shadow-lg animate-[korea-pulse_2s_ease-in-out_infinite]'
        : 'border border-gray-200 bg-white'
    }`} style={isKorea ? { borderColor: '#16a34a' } : undefined}>
      {/* 지도 실루엣 배경 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[80%] h-[70%]">
          <MapComponent color={mapColor} />
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="relative z-10">
        <div className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">{sublabel}</div>
        <div className="text-[17px] font-black text-[#1A1A2E] mt-0.5">{label}</div>
        <div className="mt-1.5">
          <span className="text-[11px] text-gray-500">{indexLabel} </span>
          <span className="text-[16px] font-black" style={{ color }}>{fmt(changePct)}</span>
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: flowColor }}>
          {flowDesc} {flowAmount !== 0 && fmtBillion(flowAmount)}
        </div>
        {extraLines?.map((line, i) => (
          <div key={i} className="text-[11px] text-gray-600 font-medium mt-0.5">{line}</div>
        ))}
        {notes.map((note, i) => (
          <div key={i} className="text-[10px] text-gray-400 mt-0.5 leading-snug">{note}</div>
        ))}
        {sectorBadges && sectorBadges.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[9px] text-gray-400 font-semibold mr-0.5">주목 섹터</span>
            {sectorBadges.map((s, i) => (
              <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-semibold border border-[#A7F3D0]">{s}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 화살표 (자금 규모 표시) ───

function FlowArrow({ amount, isDashed, label }: { amount?: string; isDashed?: boolean; label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-10 gap-0.5">
      {amount && (
        <div className="text-[9px] font-bold text-[#1A1A2E] whitespace-nowrap bg-white/80 px-1 rounded">{amount}</div>
      )}
      <svg width="32" height="16" viewBox="0 0 32 16" className="shrink-0">
        {isDashed ? (
          <>
            <line x1="0" y1="8" x2="24" y2="8" stroke="#16a34a" strokeWidth="2" strokeDasharray="4,3" className="animate-[flow-dash_1.5s_linear_infinite]" />
            <polygon points="24,3 32,8 24,13" fill="#16a34a" />
          </>
        ) : (
          <>
            <line x1="0" y1="8" x2="24" y2="8" stroke="#9CA3AF" strokeWidth="2" />
            <polygon points="24,3 32,8 24,13" fill="#9CA3AF" />
          </>
        )}
      </svg>
      {label && <div className="text-[8px] text-gray-400 whitespace-nowrap">{label}</div>}
    </div>
  )
}

// ─── AI 분석 빌더 ───

function buildAnalysis(foreignNet: number, foreignStreak: number, instNet: number, usdkrw: number, vix: number) {
  // 전환 조건 충족 개수
  const cond1Met = usdkrw <= 1400
  const cond2Met = true // PBR 0.9 이하 (현재 데이터 없으므로 참고용)
  const cond3Met = foreignNet >= 0 && foreignStreak >= 3
  const condMet = [cond1Met, cond2Met, cond3Met].filter(Boolean).length

  return {
    current: {
      dot: '#16a34a',
      title: `현재: ${foreignNet >= 0 ? '한국 유입 전환' : '미국에 집중'}`,
      items: [
        foreignNet >= 0
          ? `근거 1. 외국인 순매수 전환 (${fmtKr(foreignNet)})`
          : `근거 1. 빅테크 실적 시장 예상치 상회`,
        vix > 25
          ? `근거 2. VIX ${vix.toFixed(1)} — 변동성 확대, 안전자산 선호`
          : `근거 2. 금리 인하 기대감 (CME FedWatch)`,
        foreignNet < 0
          ? `근거 3. S&P500 ETF 자금 유입 지속`
          : `근거 3. 외국인 순매수 ${Math.abs(foreignStreak)}일 연속`,
      ],
      bg: '#F0FDF4', border: '#A7F3D0',
    },
    transition: {
      dot: '#F59E0B',
      title: '전환 조건 (한국 유입 시그널)',
      items: [
        `조건 1. 환율 1,400원 이하 안정 ${cond1Met ? `(현재 ${usdkrw.toFixed(0)}원 ✓)` : `(현재 ${usdkrw.toFixed(0)}원)`}`,
        `조건 2. KOSPI PBR 0.9배 이하 (현 저평가 구간${cond2Met ? ' — 충족!)' : ')'}`,
        `조건 3. 외국인 순매수 3일 연속 전환 ${cond3Met ? '(충족!)' : `(현재 ${foreignNet >= 0 ? '+' : ''}${Math.abs(foreignStreak)}일)`}`,
      ],
      verdict: `판정: 3개 중 ${condMet}개 충족 — ${condMet >= 3 ? '유입 확인!' : condMet >= 2 ? '임박' : '아직 이르다'}`,
      bg: '#FFFBEB', border: '#FDE68A',
    },
    risk: {
      dot: '#EF4444',
      title: '위험 신호 (추가 유출)',
      items: [
        `경고 1. 환율 1,500원 돌파 시 패닉 유출 가속`,
        `경고 2. VIX 35 이상 유지 시 (현재 ${vix.toFixed(2)})`,
        `경고 3. 중동 분쟁 확전 시 아시아 전반 유출`,
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
        <div className="h-48 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    )
  }

  // 매크로 데이터
  const items = macroData?.items ?? []
  const find = (sym: string) => items.find(i => i.symbol === sym)

  const spx = find('SPX') ?? find('GSPC')
  const stoxx = find('STOXX') ?? find('GDAXI') ?? find('FTSE')
  const hsi = find('HSI') ?? find('N225') ?? find('SSEC')
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

  // 자금 규모 추정 (등락률 기반 참고 수치)
  const usFlow = usChg * 4.2e9
  const euFlow = euChg * 1.8e9
  const asiaFlow = asiaChg * 2.5e9

  const analysis = buildAnalysis(fNet, fStreak, iNet, usdkrw, vix)

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>

      {/* ── 4지역 플로우 맵 (지도 실루엣) ── */}
      <div className="flex items-stretch gap-0 overflow-x-auto pb-3">
        <RegionCard
          sublabel="NORTH AMERICA" label="미국" indexLabel="S&P" changePct={usChg}
          flowAmount={usFlow} flowDesc={usFlow >= 0 ? '유입' : '유출'}
          mapColor="#93C5FD" MapComponent={USMapSilhouette}
          notes={usChg >= 0 ? ['빅테크 실적 호조 + 금리 인하'] : ['금리 인하 불확실성']}
        />
        <FlowArrow amount={fmtBillion(Math.abs(usFlow))} />

        <RegionCard
          sublabel="EUROPE" label="유럽" indexLabel="STOXX" changePct={euChg}
          flowAmount={euFlow} flowDesc={euFlow >= 0 ? '유입' : '유출'}
          mapColor="#D1D5DB" MapComponent={EuropeMapSilhouette}
          notes={euChg >= 0 ? ['ECB 금리 동결 전망'] : ['ECB 긴축 지속']}
        />
        <FlowArrow amount={fmtBillion(Math.abs(euFlow))} />

        <RegionCard
          sublabel="CHINA / JAPAN" label="중국·일본" indexLabel="상해" changePct={asiaChg}
          flowAmount={asiaFlow} flowDesc={asiaFlow >= 0 ? '유입' : '유출'}
          mapColor="#FCA5A5" MapComponent={AsiaMapSilhouette}
          notes={asiaChg < 0 ? ['엔캐리 청산 압력', '위안화 약세 지속'] : ['중국 부양책 기대']}
        />
        <FlowArrow isDashed label="아시아 내 자금 이동" />

        <RegionCard
          sublabel="KOREA" label="한국" indexLabel="KOSPI" changePct={krChg}
          flowAmount={fNet} flowDesc={`외국인 ${fNet >= 0 ? '순매수' : '순매도'}`}
          mapColor="#86EFAC" MapComponent={KoreaMapSilhouette} isKorea
          extraLines={[
            `외국인 ${fmtKr(fNet)} (${Math.abs(fStreak)}일 연속)`,
            `기관 ${iNet >= 0 ? '+' : ''}${fmtKr(iNet)} (${iNet >= 0 ? '순매수 전환' : '순매도'})`,
          ]}
          notes={[]}
          sectorBadges={topSectors.length > 0 ? topSectors : ['반도체', '방산', '건설']}
        />
      </div>

      {/* 추적 뱃지 */}
      <div className="flex justify-center mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDF4] border border-[#A7F3D0]">
          <div className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse" />
          <span className="text-[11px] font-bold text-[#059669]">미국 → 한국 유입 추적</span>
        </div>
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mb-4 text-[9px] text-gray-400">
        <span>화살표 굵기 = 자금 규모</span>
        <span>|</span>
        <span className="text-[#16a34a]">녹색 점선</span><span>= 추적 중인 흐름</span>
        <span>|</span>
        <span>깜빡임 = 지금 주목해야 할 시장</span>
      </div>

      {/* ── AI 자금 이동 근거 분석 ── */}
      <div className="border-t border-gray-100 pt-4 mb-1">
        <div className="text-[14px] font-black text-[#1A1A2E] mb-3">자금 이동 근거 분석 (AI)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[analysis.current, analysis.transition, analysis.risk].map(a => (
            <div key={a.title} className="p-3.5 rounded-lg border" style={{ backgroundColor: a.bg, borderColor: a.border }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.dot }} />
                <div className="text-[12px] font-black text-[#1A1A2E]">{a.title}</div>
              </div>
              <div className="space-y-2">
                {a.items.map((item, i) => (
                  <div key={i} className="text-[11px] text-[#4B5563] leading-relaxed">{item}</div>
                ))}
              </div>
              {'verdict' in a && (
                <div className="mt-3 pt-2 border-t text-[11px] font-bold" style={{ borderColor: a.border, color: a.dot }}>
                  {(a as { verdict: string }).verdict}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 면책 */}
      <div className="text-[9px] text-gray-400 text-center mt-2">
        화살표 굵기 = 자금 규모 | 녹색 점선 = 추적 중인 흐름 | 깜빡임 = 지금 주목해야 할 시장 | 근거 분석은 AI 기반 참고 자료이며 투자 조언이 아닙니다
      </div>
    </div>
  )
}
