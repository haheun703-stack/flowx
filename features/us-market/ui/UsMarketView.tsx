'use client'

import { useEffect, useState } from 'react'

// ── 타입 ─────────────────────────────────────────────────────
interface UsMarketData {
  date: string
  sp500_close: number | null
  sp500_change: number | null
  nasdaq_close: number | null
  nasdaq_change: number | null
  dow_close: number | null
  dow_change: number | null
  vix: number | null
  fear_greed: number | null
  fear_greed_label: string | null
  us_3y_yield: number | null
  us_10y_yield: number | null
  spread_3y_10y: number | null
  spread_2y_10y: number | null
  dxy: number | null
  wti: number | null
  gold: number | null
  soxx_close: number | null
  soxx_change: number | null
  sector_etf: Record<string, number>
  kr_impact: string | null
  risk_flags: string[]
}

interface DaytradingData {
  date: string
  mode: string
  gap_signal: string
  gap_est_pct: number
  risk_level: number
  risk_score: number
  watch_sectors: string[]
  avoid_sectors: string[]
  reasons_good: string[]
  reasons_bad: string[]
  relay_picks: unknown[]
  risk_flags: string[]
}

interface QuantData {
  date: string
  /* v2 필드 */
  strategy_mode?: string
  macro_score?: number
  position_limit?: number
  hold_days_min?: number
  hold_days_max?: number
  sector_overweight?: string[]
  sector_underweight?: string[]
  yield_signal?: string
  yield_level?: number | null
  dollar_signal?: string
  dxy?: number | null
  vix_env?: string
  vix?: number | null
  weekly_outlook?: string
  entry_conditions?: Record<string, unknown>
  /* v1 하위 호환 */
  mode?: string
  score?: number
  slots?: number
  summary?: string
  indicators?: Record<string, unknown>
  sector_boost?: Record<string, unknown>
}

// ── 상수 ─────────────────────────────────────────────────────
const ETF_LIST = [
  { ticker: 'SPY',  name: 'S&P500',      category: '지수' },
  { ticker: 'QQQ',  name: '나스닥100',    category: '지수' },
  { ticker: 'DIA',  name: '다우존스',     category: '지수' },
  { ticker: 'TQQQ', name: '나스닥3배',    category: '레버리지' },
  { ticker: 'SQQQ', name: '나스닥인버스', category: '인버스' },
  { ticker: 'SOXX', name: '반도체',       category: '섹터' },
  { ticker: 'XLK',  name: '기술',         category: '섹터' },
  { ticker: 'XLF',  name: '금융',         category: '섹터' },
  { ticker: 'XLE',  name: '에너지',       category: '섹터' },
  { ticker: 'TLT',  name: '장기국채',     category: '채권' },
  { ticker: 'GLD',  name: '금',           category: '원자재' },
  { ticker: 'USO',  name: '원유',         category: '원자재' },
]

const SECTOR_INFO: Record<string, { name: string; emoji: string; kr: string }> = {
  XLK:  { name: '기술',       emoji: '\uD83D\uDCBB', kr: '삼성전자\u00B7SK하이닉스 연관' },
  SOXX: { name: '반도체',     emoji: '\uD83D\uDD2C', kr: '엔비디아\u00B7AMD\u00B7브로드컴' },
  XLC:  { name: '통신',       emoji: '\uD83D\uDCE1', kr: '알파벳\u00B7메타' },
  XLF:  { name: '금융',       emoji: '\uD83C\uDFE6', kr: 'JP모건\u00B7뱅크오브아메리카' },
  XLV:  { name: '헬스케어',   emoji: '\uD83C\uDFE5', kr: '존슨앤존슨\u00B7유나이티드' },
  XLI:  { name: '산업재',     emoji: '\uD83C\uDFD7\uFE0F', kr: '캐터필러\u00B7허니웰' },
  XLE:  { name: '에너지',     emoji: '\u26FD',        kr: '엑손모빌\u00B7셰브론' },
  XLY:  { name: '경기소비재', emoji: '\uD83D\uDECD\uFE0F', kr: '아마존\u00B7테슬라' },
  XLP:  { name: '필수소비재', emoji: '\uD83D\uDED2', kr: '코카콜라\u00B7P&G' },
  XLU:  { name: '유틸리티',   emoji: '\u26A1',        kr: '넥스트에라\u00B7듀크에너지' },
  XLB:  { name: '소재',       emoji: '\uD83E\uDEA8', kr: '린데\u00B7에어프로덕츠' },
  XLRE: { name: '부동산',     emoji: '\uD83C\uDFE0', kr: '프롤로지스\u00B7아메리칸타워' },
}

// ── 헬퍼 ─────────────────────────────────────────────────────
const f2 = (v: number | null, d = 2) =>
  v == null ? '\u2014' : v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })

const changeColor = (v: number | null) =>
  v == null ? '#888' : v > 0 ? '#D62728' : v < 0 ? '#1565C0' : '#888'

const changeStr = (v: number | null) =>
  v == null ? '\u2014' : `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`

// ── 스켈레톤 ─────────────────────────────────────────────────
function Sk({ h = 'h-4', w = 'w-full', className = '' }: { h?: string; w?: string; className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E8E6E0] ${h} ${w} ${className}`} />
}

// ══════════════════════════════════════════════════════════════
// 서브 컴포넌트
// ══════════════════════════════════════════════════════════════

function EtfBar({ sectorEtf }: { sectorEtf: Record<string, number> }) {
  const getCategoryBg = (cat: string) => ({
    '지수':     'bg-[#FFF1F1] border-[#FFBBBB]',
    '레버리지': 'bg-[#F5F0FF] border-[#D4AAFF]',
    '인버스':   'bg-[#EEF4FF] border-[#AACCFF]',
    '섹터':     'bg-[#FFF8F0] border-[#FFDDAA]',
    '채권':     'bg-[#F0FFF4] border-[#AADDBB]',
    '원자재':   'bg-[#FFFBF0] border-[#FFE4A0]',
  }[cat] ?? 'bg-[#F8F7F3] border-[#E8E6E0]')

  return (
    <div className="fx-card px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[17px] font-bold text-[#1A1A2E]">주요 ETF 현황</span>
        <span className="text-[12px] text-[#888]">레버리지 \u00B7 섹터 \u00B7 안전자산 한눈에</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {ETF_LIST.map(({ ticker, name, category }) => {
          const chg = sectorEtf[ticker] ?? null
          return (
            <div key={ticker} className={`border rounded-lg px-2 py-2 text-center ${getCategoryBg(category)}`}>
              <div className="text-[11px] font-bold text-[#888] mb-0.5">{category}</div>
              <div className="text-[14px] font-black text-[#1A1A2E]">{ticker}</div>
              <div className="text-[12px] text-[#888] mb-1">{name}</div>
              <div className="text-[16px] font-black" style={{ color: changeColor(chg) }}>
                {changeStr(chg)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-3 text-[12px] text-[#888]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFBBBB] inline-block" />지수</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#D4AAFF] inline-block" />레버리지</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#AACCFF] inline-block" />인버스</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFDDAA] inline-block" />섹터</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#AADDBB] inline-block" />채권</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-[#FFE4A0] inline-block" />원자재</span>
      </div>
    </div>
  )
}

function IndexCards({ data }: { data: UsMarketData }) {
  const cards = [
    { name: 'S&P 500', sub: '미국 대형주 500개', close: data.sp500_close, change: data.sp500_change, note: '시장 전체 체온' },
    { name: '나스닥 100', sub: '기술주 중심 지수', close: data.nasdaq_close, change: data.nasdaq_change, note: 'AI \u00B7 반도체 주도' },
    { name: '다우존스', sub: '전통 대형주 30개', close: data.dow_close, change: data.dow_change, note: '제조 \u00B7 금융 중심' },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(card => (
        <div key={card.name} className="fx-card px-4 py-4" style={{ borderTop: `3px solid ${changeColor(card.change)}` }}>
          <div className="text-[16px] font-bold text-[#1A1A2E] tracking-wide">{card.name}</div>
          <div className="text-[12px] text-[#888] mb-2">{card.sub}</div>
          <div className="text-[36px] font-black leading-none" style={{ color: changeColor(card.change) }}>
            {changeStr(card.change)}
          </div>
          <div className="text-[22px] font-bold text-[#1A1A2E] mt-1 font-mono">{f2(card.close, 0)}</div>
          <div className="text-[12px] text-[#888] mt-2">{card.note}</div>
        </div>
      ))}
    </div>
  )
}

function MarketVitals({ data }: { data: UsMarketData }) {
  const vixColor = data.vix == null ? '#888' : data.vix >= 30 ? '#D62728' : data.vix >= 25 ? '#B07D00' : '#00843D'
  const fgColor = data.fear_greed == null ? '#888' : data.fear_greed <= 25 ? '#D62728' : data.fear_greed <= 45 ? '#B07D00' : data.fear_greed >= 75 ? '#9333ea' : '#00843D'
  const yieldColor = data.us_3y_yield == null ? '#888' : data.us_3y_yield >= 4.5 ? '#D62728' : data.us_3y_yield >= 4.0 ? '#B07D00' : '#00843D'

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="fx-card px-4 py-4">
        <div className="text-[16px] font-bold text-[#1A1A2E] mb-1">VIX 공포지수</div>
        <div className="text-[12px] text-[#888] mb-3">20 이하 = 안심 / 30 이상 = 공포</div>
        <div className="text-[32px] font-black font-mono" style={{ color: vixColor }}>{f2(data.vix)}</div>
        <div className="h-2 bg-[#F0EEE8] rounded-full overflow-hidden mt-2 mb-1">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((data.vix ?? 0) / 50 * 100, 100)}%`, background: vixColor }} />
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: vixColor }}>
          {data.vix == null ? '\u2014' : data.vix >= 30 ? '\u26A0\uFE0F 패닉구간 \u2014 신중하게' : data.vix >= 25 ? '\u26A0\uFE0F 주의구간 \u2014 비중 조절' : '\u2705 안정 \u2014 정상 매매'}
        </div>
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[16px] font-bold text-[#1A1A2E] mb-1">공포 \u00B7 탐욕 지수</div>
        <div className="text-[12px] text-[#888] mb-3">0 극단공포 \u2194 100 극단탐욕</div>
        <div className="text-[32px] font-black font-mono" style={{ color: fgColor }}>{data.fear_greed ?? '\u2014'}</div>
        <div className="text-[13px] font-bold mt-1" style={{ color: fgColor }}>{data.fear_greed_label ?? '\u2014'}</div>
        <div className="text-[12px] text-[#888] mt-1">
          {data.fear_greed == null ? '' : data.fear_greed <= 25 ? '저가매수 기회일 수도 있어요' : data.fear_greed >= 75 ? '과열 \u2014 차익실현 타이밍' : '중립 구간 \u2014 수급 보고 결정'}
        </div>
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[16px] font-bold text-[#1A1A2E] mb-1">3년물 금리 \u2605핵심</div>
        <div className="text-[12px] text-[#888] mb-3">높을수록 성장주 \u00B7 기술주 부담</div>
        <div className="text-[32px] font-black font-mono" style={{ color: yieldColor }}>
          {data.us_3y_yield != null ? `${data.us_3y_yield.toFixed(2)}%` : '\u2014'}
        </div>
        <div className="text-[12px] font-bold mt-1" style={{ color: yieldColor }}>
          {data.us_3y_yield == null ? '\u2014' : data.us_3y_yield >= 4.5 ? '\u26A0\uFE0F 고금리 \u2014 기술주 밸류에이션 부담' : data.us_3y_yield >= 4.0 ? '\u26A0\uFE0F 주의 \u2014 보수적 운영 권장' : '\u2705 안정 \u2014 성장주 우호 환경'}
        </div>
        {data.spread_3y_10y != null && data.spread_3y_10y < 0 && (
          <div className="text-[12px] text-[#D62728] font-bold mt-1">\u26A0\uFE0F 장단기 금리 역전 중</div>
        )}
      </div>

      <div className="fx-card px-4 py-4">
        <div className="text-[16px] font-bold text-[#1A1A2E] mb-1">달러 DXY</div>
        <div className="text-[12px] text-[#888] mb-3">높을수록 달러 강세 = 신흥국 약세</div>
        <div className="text-[32px] font-black font-mono" style={{ color: data.dxy == null ? '#888' : data.dxy >= 104 ? '#D62728' : data.dxy <= 100 ? '#00843D' : '#888' }}>
          {f2(data.dxy)}
        </div>
        <div className="mt-2 space-y-0.5">
          {[
            { label: 'WTI 유가', value: data.wti, suffix: '$' },
            { label: '금', value: data.gold, suffix: '$' },
          ].map(({ label, value, suffix }) => (
            <div key={label} className="flex justify-between text-[12px]">
              <span className="text-[#888]">{label}</span>
              <span className="font-bold text-[#1A1A2E]">{value != null ? `${suffix}${f2(value, 0)}` : '\u2014'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectorHeatmap({ sectorEtf }: { sectorEtf: Record<string, number> }) {
  const sorted = Object.entries(SECTOR_INFO).map(([ticker, info]) => ({
    ticker, ...info, change: sectorEtf[ticker] ?? null,
  })).sort((a, b) => (b.change ?? -99) - (a.change ?? -99))

  const getBg = (chg: number | null) => {
    if (chg == null) return 'bg-[#F8F7F3] border-[#E8E6E0]'
    if (chg >= 2)    return 'bg-[#FFDDDD] border-[#FF9999]'
    if (chg >= 0.5)  return 'bg-[#FFEEEE] border-[#FFBBBB]'
    if (chg >= -0.5) return 'bg-[#F8F7F3] border-[#DDDBD3]'
    if (chg >= -2)   return 'bg-[#EEF4FF] border-[#BBCCEE]'
    return 'bg-[#E0EAFF] border-[#99AADD]'
  }

  return (
    <div className="fx-card px-4 py-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[20px] font-bold text-[#1A1A2E]">어떤 섹터가 뜨나?</div>
        <div className="text-[12px] text-[#888]">S&P 500 섹터 ETF 등락률 \u2014 진한 빨강일수록 강세</div>
      </div>
      <div className="text-[13px] text-[#888] mb-4">빨강 섹터 = 오늘 돈이 몰리는 곳 / 파랑 섹터 = 자금 이탈 중</div>
      <div className="grid grid-cols-4 gap-2">
        {sorted.map(({ ticker, name, emoji, kr, change }) => (
          <div key={ticker} className={`border rounded-xl px-3 py-3 ${getBg(change)}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[20px]">{emoji}</span>
              <span className="text-[12px] font-bold text-[#888]">{ticker}</span>
            </div>
            <div className="text-[16px] font-black text-[#1A1A2E]">{name}</div>
            <div className="text-[26px] font-black font-mono my-1" style={{ color: changeColor(change) }}>
              {changeStr(change)}
            </div>
            <div className="text-[11px] text-[#888] leading-tight">{kr}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SystemPanels({ dt, qt }: { dt: DaytradingData | null; qt: QuantData | null }) {
  const modeColor: Record<string, string> = {
    AGGRESSIVE: '#00843D', NORMAL: '#1565C0', DEFENSIVE: '#B07D00', HALT: '#D62728',
    BULL_AGGRESSIVE: '#00843D', BULL_NORMAL: '#1565C0', BEAR_DEFENSIVE: '#B07D00', BEAR_CASH: '#D62728',
  }
  const stratLabel: Record<string, string> = {
    BULL_AGGRESSIVE: '공격 매수', BULL_NORMAL: '기본 운영',
    NEUTRAL: '선별 진입', BEAR_DEFENSIVE: '방어 운영', BEAR_CASH: '현금 보유',
    AGGRESSIVE: '공격 매수', NORMAL: '기본 운영', DEFENSIVE: '방어 운영', HALT: '거래 중지',
  }

  const qMode = qt?.strategy_mode ?? qt?.mode ?? null
  const qScore = qt?.macro_score ?? qt?.score ?? null
  const qSlots = qt?.position_limit ?? qt?.slots ?? null
  const qHoldMin = qt?.hold_days_min ?? null
  const qHoldMax = qt?.hold_days_max ?? null
  const qOverweight = qt?.sector_overweight ?? []
  const qUnderweight = qt?.sector_underweight ?? []
  const qOutlook = qt?.weekly_outlook ?? qt?.summary ?? null

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* 스윙시스템 */}
      <div className="fx-card px-4 py-4">
        <div className="text-[20px] font-black text-[#1A1A2E]">스윙시스템</div>
        <div className="text-[13px] text-[#888] mb-4">단기 1~3일 트레이딩 신호</div>
        {dt ? (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[13px] text-[#888] font-bold">진입 모드</div>
                <div className="text-[30px] font-black font-mono" style={{ color: modeColor[dt.mode] ?? '#888' }}>{dt.mode}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#888] font-bold">위험점수</div>
                <div className="text-[30px] font-black font-mono text-[#1A1A2E]">
                  {dt.risk_score}<span className="text-[15px] text-[#aaa]">/100</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#F0FFF4] rounded-lg p-3">
                <div className="text-[12px] font-black text-[#1A1A2E] mb-2">\u2705 좋은 신호</div>
                {dt.reasons_good?.slice(0, 3).map((r, i) => (
                  <div key={i} className="text-[12px] text-[#555] leading-tight mb-1">\u2022 {r}</div>
                ))}
              </div>
              <div className="bg-[#FFF8F8] rounded-lg p-3">
                <div className="text-[12px] font-black text-[#1A1A2E] mb-2">\u26A0 주의 신호</div>
                {dt.reasons_bad?.slice(0, 3).map((r, i) => (
                  <div key={i} className="text-[12px] text-[#555] leading-tight mb-1">\u2022 {r}</div>
                ))}
              </div>
            </div>
            {dt.risk_flags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {dt.risk_flags.map((f, i) => (
                  <span key={i} className="text-[12px] font-bold bg-[#FFEEEE] text-[#C0392B] px-2 py-0.5 rounded-full">{f}</span>
                ))}
              </div>
            )}
            <div className="bg-[#F0F7FF] rounded-xl p-3 border-l-4" style={{ borderColor: modeColor[dt.mode] ?? '#888' }}>
              <div className="text-[13px] font-black text-[#1A1A2E]">오늘 전략</div>
              <div className="text-[13px] text-[#444] mt-1 leading-relaxed">
                {(dt.mode === 'AGGRESSIVE' || dt.mode === 'BULL_AGGRESSIVE') && 'VIX 안정, 시장 우호적. 수급 좋은 종목 적극 진입.'}
                {(dt.mode === 'NORMAL' || dt.mode === 'BULL_NORMAL') && 'VIX 주의구간. 수급 확인 후 포지션 50% 이내로.'}
                {(dt.mode === 'DEFENSIVE' || dt.mode === 'BEAR_DEFENSIVE') && '시장 불안정. A+ 수급 종목만, 손절 타이트하게.'}
                {(dt.mode === 'HALT' || dt.mode === 'BEAR_CASH') && '극단 위험. 신규 진입 금지. 현금 보유 권장.'}
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center text-[14px] text-[#888]">
            스윙시스템 데이터 로딩 중...<br />
            <span className="text-[12px] text-[#aaa]">단타봇 실행 후 표시됩니다</span>
          </div>
        )}
      </div>

      {/* 퀀트시스템 */}
      <div className="fx-card px-4 py-4">
        <div className="text-[20px] font-black text-[#1A1A2E]">퀀트시스템</div>
        <div className="text-[13px] text-[#888] mb-4">중기 5~10일 스윙 매크로 분석</div>
        {qt ? (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[13px] text-[#888] font-bold">이번 주 전략</div>
                <div className="text-[24px] font-black text-[#1A1A2E]">{stratLabel[qMode ?? ''] ?? qMode ?? '\u2014'}</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#888] font-bold">최대 보유</div>
                <div className="text-[24px] font-black text-[#1A1A2E]">{qSlots ?? '\u2014'}종목</div>
                {qHoldMin != null && qHoldMax != null && (
                  <div className="text-[12px] text-[#888]">{qHoldMin}~{qHoldMax}일</div>
                )}
              </div>
            </div>
            {qScore != null && (
              <div className="mb-4">
                <div className="flex justify-between text-[13px] font-black text-[#1A1A2E] mb-1">
                  <span>매크로 환경 점수</span>
                  <span className="font-mono">{qScore}/100</span>
                </div>
                <div className="h-3 bg-[#F0EEE8] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${qScore}%`, background: qScore >= 65 ? '#00843D' : qScore >= 45 ? '#888' : '#B07D00' }} />
                </div>
                <div className="flex justify-between text-[11px] text-[#bbb] mt-1">
                  <span>현금보유</span><span>방어</span><span>중립</span><span>기본</span><span>공격</span>
                </div>
              </div>
            )}
            {qt.yield_signal && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: '3년물 금리', value: qt.yield_level != null ? `${qt.yield_level.toFixed(2)}%` : '\u2014', signal: qt.yield_signal },
                  { label: 'DXY 달러', value: qt.dxy != null ? qt.dxy.toFixed(1) : '\u2014', signal: qt.dollar_signal ?? '' },
                  { label: 'VIX 공포', value: qt.vix != null ? qt.vix.toFixed(1) : '\u2014', signal: qt.vix_env ?? '' },
                ].map(({ label, value, signal }) => (
                  <div key={label} className="bg-[#F8F7F3] rounded-lg p-2 text-center">
                    <div className="text-[12px] font-black text-[#1A1A2E]">{label}</div>
                    <div className="text-[20px] font-black font-mono text-[#1A1A2E]">{value}</div>
                    <div className="text-[11px] text-[#888] truncate">{signal}</div>
                  </div>
                ))}
              </div>
            )}
            {qOverweight.length > 0 && (
              <div className="mb-2">
                <div className="text-[12px] font-black text-[#00843D] mb-1">\u25B2 비중 확대 섹터</div>
                <div className="flex flex-wrap gap-1">
                  {qOverweight.map((s: string) => (
                    <span key={s} className="text-[12px] font-bold bg-[#E6F9EE] text-[#00843D] px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {qUnderweight.length > 0 && (
              <div className="mb-3">
                <div className="text-[12px] font-black text-[#D62728] mb-1">\u25BC 회피 섹터</div>
                <div className="flex flex-wrap gap-1">
                  {qUnderweight.map((s: string) => (
                    <span key={s} className="text-[12px] font-bold bg-[#FFEEEE] text-[#C0392B] px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {qOutlook && (
              <div className="bg-[#F8F7F3] rounded-lg p-3 text-[13px] text-[#444] leading-relaxed">{qOutlook}</div>
            )}
          </>
        ) : (
          <div className="py-6 text-center text-[14px] text-[#888]">
            퀀트시스템 데이터 로딩 중...<br />
            <span className="text-[12px] text-[#aaa]">퀀트봇 실행 후 표시됩니다</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
// 메인 뷰
// ══════════════════════════════════════════════════════════════
export function UsMarketView() {
  const [market, setMarket] = useState<UsMarketData | null>(null)
  const [dt, setDt] = useState<DaytradingData | null>(null)
  const [qt, setQt] = useState<QuantData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        const [mRes, dRes, qRes] = await Promise.allSettled([
          fetch('/api/us-market/daily', { signal: controller.signal }),
          fetch('/api/us-overnight', { signal: controller.signal }),
          fetch('/api/us-quant-macro', { signal: controller.signal }),
        ])
        if (mRes.status === 'fulfilled' && mRes.value.ok) {
          const json = await mRes.value.json()
          if (json.date) setMarket(json)
        }
        if (dRes.status === 'fulfilled' && dRes.value.ok) {
          const json = await dRes.value.json()
          if (json.date) setDt(json)
        }
        if (qRes.status === 'fulfilled' && qRes.value.ok) {
          const json = await qRes.value.json()
          if (json.date) setQt(json)
        }
      } catch {
        /* abort */
      } finally {
        setLoading(false)
      }
    })()
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-4">
        <Sk h="h-8" w="w-48" />
        <Sk h="h-20" />
        <div className="grid grid-cols-6 gap-2">{Array.from({ length: 12 }).map((_, i) => <Sk key={i} h="h-24" />)}</div>
        <div className="grid grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <Sk key={i} h="h-36" />)}</div>
      </div>
    )
  }

  if (!market) {
    return (
      <div className="max-w-[1400px] mx-auto px-6 py-10 text-center">
        <div className="text-[#D62728] text-sm font-bold">미국장 데이터 없음</div>
        <div className="text-[#888] text-xs mt-1">정보봇 실행 후 다시 확인해주세요</div>
      </div>
    )
  }

  const nqChg = market.nasdaq_change ?? 0
  const overallUp = nqChg >= 0.5
  const overallDn = nqChg <= -0.5

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-[14px]">
      {/* 히어로 배너 */}
      <div className="bg-white rounded-xl border-2 border-[#00FF88] px-5 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-[13px] font-black text-[#888] tracking-widest uppercase">오늘 미국장 한줄 요약</div>
            <div className="text-[22px] font-black text-[#1A1A2E] mt-1">
              {overallUp ? `나스닥 ${nqChg >= 0 ? '+' : ''}${nqChg.toFixed(1)}% 상승, ${market.soxx_change && market.soxx_change > 0 ? '반도체 강세' : '기술주 주도'}`
               : overallDn ? `나스닥 ${nqChg.toFixed(1)}% 하락, 시장 조정 중`
               : '나스닥 보합, 방향 탐색 중'}
              <span className={`text-[14px] px-3 py-1 rounded-full font-black ml-3 ${
                overallUp ? 'bg-[#E6F9EE] text-[#00843D]'
                : overallDn ? 'bg-[#FFEEEE] text-[#C0392B]'
                : 'bg-[#F1F0EA] text-[#555]'}`}>
                {overallUp ? '\u2191 긍정' : overallDn ? '\u2193 주의' : '\u2192 중립'}
              </span>
            </div>
            <div className="text-[13px] text-[#777] mt-1">
              S&P500 {changeStr(market.sp500_change)} \u00B7 나스닥 {changeStr(market.nasdaq_change)} \u00B7 SOXX {changeStr(market.soxx_change)}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] text-[#888]">{market.date} 기준</div>
          <div className="text-[13px] font-black text-[#00843D] mt-1">\u25CF 정보봇 자동수집</div>
        </div>
      </div>

      <EtfBar sectorEtf={market.sector_etf} />
      <IndexCards data={market} />
      <MarketVitals data={market} />
      <SectorHeatmap sectorEtf={market.sector_etf} />
      <SystemPanels dt={dt} qt={qt} />

      <div className="text-center text-[12px] text-[#bbb] py-1">
        본 정보는 투자 권유가 아니며 최종 판단은 투자자 본인에게 있습니다 \u00B7 FLOWX 정보봇 자동수집
      </div>
    </div>
  )
}
