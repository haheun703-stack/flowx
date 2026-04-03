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

// ─── 지역 카드 ───

function RegionCard({
  sublabel, label, changePct, flowDesc, note, isKorea, extraLines, cloudColor,
}: {
  sublabel: string; label: string; changePct: number; flowDesc: string; note: string;
  isKorea?: boolean; extraLines?: string[]; cloudColor: string;
}) {
  const color = changePct >= 0 ? '#16a34a' : '#dc2626'
  return (
    <div className={`relative rounded-xl p-4 border-2 flex-1 min-w-[145px] ${
      isKorea ? 'border-[#16a34a] bg-[#F0FDF4] shadow-md' : 'border-gray-200 bg-white'
    }`}>
      <div className="text-[10px] text-gray-400 font-semibold">{sublabel}</div>
      <div className="text-[15px] font-bold text-[#1A1A2E] mb-1.5">{label}</div>
      <div className="text-[20px] font-black mb-1" style={{ color }}>{fmt(changePct)}</div>
      <div className="text-[12px] font-semibold text-gray-600 mb-0.5">{flowDesc}</div>
      {extraLines?.map((line, i) => (
        <div key={i} className="text-[11px] text-gray-500">{line}</div>
      ))}
      <div className="text-[10px] text-gray-400 mt-1.5">{note}</div>
      <div className="absolute bottom-3 right-3 w-12 h-8 rounded-full opacity-15" style={{ backgroundColor: cloudColor }} />
    </div>
  )
}

// ─── 화살표 ───

function Arrow({ label, strong }: { label?: string; strong?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center shrink-0 w-8">
      {label && <div className="text-[9px] text-gray-400 whitespace-nowrap mb-0.5">{label}</div>}
      <div className={`text-[20px] leading-none ${strong ? 'text-[#16a34a] font-bold' : 'text-gray-300'}`}>→</div>
    </div>
  )
}

// ─── AI 분석 ───

function buildAnalysis(foreignNet: number, foreignStreak: number, instNet: number, usdkrw: number, vix: number) {
  return {
    current: {
      title: `현재: ${foreignNet >= 0 ? '한국 유입 전환' : '미국에 집중'}`,
      items: [
        foreignNet >= 0
          ? `외국인 순매수 전환 (${fmtKr(foreignNet)})`
          : `외국인 ${Math.abs(foreignStreak)}일 연속 순매도`,
        vix > 25
          ? `VIX ${vix.toFixed(1)} — 변동성 확대, 안전자산 선호`
          : `VIX ${vix.toFixed(1)} — 비교적 안정적 환경`,
        usdkrw > 1400
          ? `환율 ${usdkrw.toFixed(0)}원 — 달러 강세, 신흥국 유출 압력`
          : `환율 ${usdkrw.toFixed(0)}원 — 원화 안정, 유입 우호적`,
      ],
      bg: '#F0FDF4', border: '#A7F3D0',
    },
    transition: {
      title: '전환 조건: 한국 유입 가능성',
      items: [
        `환율 ${usdkrw > 1400 ? '1,400원 이하 안정 시' : `현재 ${usdkrw.toFixed(0)}원 (양호)`}`,
        'KOSPI PBR 0.9배 이하(현 저평가 구간)',
        `외국인 ${foreignNet < 0 ? '순매도 반전' : '순매수 지속'} + 3일 연속 시 유입 확인`,
      ],
      bg: '#FFFBEB', border: '#FDE68A',
    },
    risk: {
      title: `위험 신호: ${vix > 30 ? '변동성 경고' : '추가 유출 가능'}`,
      items: [
        `환율 1,500원 돌파 시 + VIX ${vix > 30 ? `${vix.toFixed(0)} (이미 경고)` : '35 이상'}`,
        '중동 분쟁 확전 시 아시아 전반 자금 유출 가속',
        '글로벌 채권금리 급등 시 위험자산 회피',
      ],
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
  const gdaxi = find('GDAXI') ?? find('FTSE')
  const hsi = find('HSI') ?? find('N225') ?? find('SSEC')
  const usdkrw = find('USDKRW')?.value ?? 1400
  const vix = find('VIX')?.value ?? 20

  const usChg = spx?.change_pct ?? 0
  const euChg = gdaxi?.change_pct ?? 0
  const asiaChg = hsi?.change_pct ?? 0

  // 한국 수급
  const fNet = supplyData?.foreign_net ?? 0
  const iNet = supplyData?.inst_net ?? 0
  const fStreak = supplyData?.foreign_streak ?? 0

  // 섹터 흐름
  const topSectors = (supplyData?.sector_flows ?? [])
    .filter(s => (s.foreign_net ?? s.net ?? 0) > 0)
    .sort((a, b) => (b.foreign_net ?? b.net ?? 0) - (a.foreign_net ?? a.net ?? 0))
    .slice(0, 2)
    .map(s => s.sector)

  const krExtra = [
    `${Math.abs(fStreak)}일 연속 ${fNet >= 0 ? '순매수' : '순매도'}`,
    `기관 ${iNet >= 0 ? '순매수 전환' : '순매도'} ${fmtKr(iNet)}`,
    ...(topSectors.length > 0 ? [`${topSectors.join(' · ')} 섹터 유입 조짐`] : []),
  ]

  const analysis = buildAnalysis(fNet, fStreak, iNet, usdkrw, vix)

  return (
    <div className="fx-card-green">
      <div className="fx-card-title">글로벌 자금 플로우 맵 — 돈은 지금 어디에?</div>

      {/* 4지역 플로우 맵 */}
      <div className="flex items-stretch gap-0 overflow-x-auto pb-2">
        <RegionCard
          sublabel="North America" label="미국" changePct={usChg} cloudColor="#93C5FD"
          flowDesc={usChg >= 0 ? '자금 유입 지속' : '자금 유출 조짐'}
          note={usChg >= 0 ? '빅테크 실적 호조' : '금리 인하 불확실성'}
        />
        <Arrow label={euChg >= 0 ? '유입' : ''} strong={euChg >= 0} />

        <RegionCard
          sublabel="Europe" label="유럽" changePct={euChg} cloudColor="#D1D5DB"
          flowDesc={euChg >= 0 ? '완만한 유입' : '소폭 유출'}
          note={euChg >= 0 ? '재정 확대 기대' : 'ECB 긴축 지속'}
        />
        <Arrow label={asiaChg >= 0 ? '유입' : ''} strong={asiaChg >= 0} />

        <RegionCard
          sublabel="East Asia" label="중국·일본" changePct={asiaChg} cloudColor="#FCA5A5"
          flowDesc={asiaChg >= 0 ? '유동성 확대 수혜' : '엔캐리 청산 압력'}
          note={asiaChg < 0 ? '위안화 약세 부담' : '중국 부양책 기대'}
        />
        <Arrow label={fNet >= 0 ? '유입 전환?' : ''} strong={fNet >= 0} />

        <RegionCard
          sublabel="Korea" label="한국" changePct={0} isKorea cloudColor="#86EFAC"
          flowDesc={`외국인 ${fNet >= 0 ? '순매수' : '순매도'} ${fmtKr(fNet)}`}
          note={supplyData?.summary?.slice(0, 30) ?? '수급 데이터 연동'}
          extraLines={krExtra}
        />
      </div>

      {/* AI 분석 */}
      <div className="mt-4 mb-1">
        <div className="text-[13px] font-bold text-[#1A1A2E] mb-2">자금 이동 근거 분석 (AI)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[analysis.current, analysis.transition, analysis.risk].map(a => (
            <div key={a.title} className="p-3 rounded-lg border" style={{ backgroundColor: a.bg, borderColor: a.border }}>
              <div className="text-[12px] font-bold text-[#1A1A2E] mb-2">{a.title}</div>
              <div className="space-y-1.5">
                {a.items.map((item, i) => (
                  <div key={i} className="text-[12px] text-[#4B5563] leading-relaxed">{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
