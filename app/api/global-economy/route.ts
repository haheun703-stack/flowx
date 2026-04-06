import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FRED_KEY = process.env.FRED_API_KEY
const FRED = 'https://api.stlouisfed.org/fred/series/observations'

/* ── 시리즈 정의 ── */
interface SDef {
  id: string; name: string; unit: string; color: string
  transform?: 'pc1' | 'chg'   // pc1=YoY%, chg=MoM변화
}
interface SectionDef {
  id: string; title: string; icon: string; desc: string
  series: SDef[]
}

const SECTIONS: SectionDef[] = [
  {
    id: 'rates', title: '미국 금리', icon: '🏦', desc: '연준 기준금리와 국채 수익률 추이',
    series: [
      { id: 'FEDFUNDS', name: '기준금리', unit: '%', color: '#1d4ed8' },
      { id: 'DGS10', name: '10년 국채', unit: '%', color: '#2563eb' },
      { id: 'DGS2', name: '2년 국채', unit: '%', color: '#60a5fa' },
      { id: 'T10Y2Y', name: '10Y-2Y 스프레드', unit: '%p', color: '#f59e0b' },
      { id: 'T10Y3M', name: '10Y-3M 스프레드', unit: '%p', color: '#f97316' },
    ],
  },
  {
    id: 'inflation', title: '인플레이션', icon: '📈', desc: '소비자물가와 시장 기대인플레이션',
    series: [
      { id: 'CPIAUCSL', name: 'CPI (YoY)', unit: '%', color: '#dc2626', transform: 'pc1' },
      { id: 'PCEPILFE', name: 'Core PCE (YoY)', unit: '%', color: '#ef4444', transform: 'pc1' },
      { id: 'T5YIE', name: '5년 BEI (기대인플레)', unit: '%', color: '#f59e0b' },
      { id: 'T10YIE', name: '10년 BEI (기대인플레)', unit: '%', color: '#d97706' },
    ],
  },
  {
    id: 'employment', title: '고용', icon: '👷', desc: '실업률, 비농업 고용, 구인 동향',
    series: [
      { id: 'UNRATE', name: '실업률', unit: '%', color: '#2563eb' },
      { id: 'PAYEMS', name: '비농업 고용 (MoM)', unit: '천명', color: '#16a34a', transform: 'chg' },
      { id: 'ICSA', name: '주간 실업청구', unit: '천건', color: '#dc2626' },
      { id: 'JTSJOL', name: 'JOLTS 구인수', unit: '천건', color: '#8b5cf6' },
    ],
  },
  {
    id: 'credit', title: '신용 스프레드', icon: '💳', desc: '하이일드/투자등급 크레딧 리스크',
    series: [
      { id: 'BAMLH0A0HYM2', name: '하이일드 OAS', unit: '%p', color: '#dc2626' },
      { id: 'BAMLC0A0CM', name: '투자등급 OAS', unit: '%p', color: '#2563eb' },
    ],
  },
  {
    id: 'liquidity', title: '유동성', icon: '💧', desc: 'M2 통화량, 연준 대차대조표, 역RP',
    series: [
      { id: 'M2SL', name: 'M2 통화량 (YoY)', unit: '%', color: '#2563eb', transform: 'pc1' },
      { id: 'WALCL', name: '연준 총자산', unit: '조$', color: '#7c3aed' },
      { id: 'RRPONTSYD', name: '역RP 잔고', unit: '십억$', color: '#0d9488' },
    ],
  },
  {
    id: 'housing', title: '주택 · 소비', icon: '🏠', desc: '주택가격, 착공, 소비자심리, 소매판매',
    series: [
      { id: 'CSUSHPISA', name: 'Case-Shiller 주택 (YoY)', unit: '%', color: '#ea580c', transform: 'pc1' },
      { id: 'HOUST', name: '주택착공', unit: '천호', color: '#f97316' },
      { id: 'UMCSENT', name: '소비자심리(미시간)', unit: '', color: '#2563eb' },
      { id: 'RSAFS', name: '소매판매 (YoY)', unit: '%', color: '#16a34a', transform: 'pc1' },
    ],
  },
  {
    id: 'market', title: '시장 지표', icon: '🌐', desc: 'VIX, 달러, 원유, 환율',
    series: [
      { id: 'VIXCLS', name: 'VIX (공포지수)', unit: '', color: '#dc2626' },
      { id: 'DTWEXBGS', name: '달러 인덱스', unit: '', color: '#2563eb' },
      { id: 'DCOILWTICO', name: 'WTI 원유', unit: '$/bbl', color: '#78716c' },
      { id: 'DEXKOUS', name: 'USD/KRW', unit: '원', color: '#0d9488' },
      { id: 'SP500', name: 'S&P 500', unit: '', color: '#16a34a' },
    ],
  },
]

/* ── 수익률 곡선용 만기별 시리즈 ── */
const YIELD_MATURITIES = [
  { id: 'DGS1MO', label: '1M' }, { id: 'DGS3MO', label: '3M' },
  { id: 'DGS6MO', label: '6M' }, { id: 'DGS1', label: '1Y' },
  { id: 'DGS2', label: '2Y' }, { id: 'DGS3', label: '3Y' },
  { id: 'DGS5', label: '5Y' }, { id: 'DGS7', label: '7Y' },
  { id: 'DGS10', label: '10Y' }, { id: 'DGS20', label: '20Y' },
  { id: 'DGS30', label: '30Y' },
]

/* ── 5년 전 날짜 ── */
function fiveYearsAgo(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 5)
  return d.toISOString().slice(0, 10)
}

/* ── FRED 페치 (월별 5년) ── */
async function fetchHistory(seriesId: string, transform?: string) {
  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: FRED_KEY!,
    file_type: 'json',
    observation_start: fiveYearsAgo(),
    frequency: 'm',
    aggregation_method: 'avg',
    sort_order: 'asc',
    ...(transform ? { units: transform } : {}),
  })
  const res = await fetch(`${FRED}?${params}`, { next: { revalidate: 21600 } }) // 6시간 캐시
  if (!res.ok) return null
  const json = await res.json()
  const obs = json.observations?.filter((o: { value: string }) => o.value !== '.')
  if (!obs || obs.length === 0) return null
  return obs.map((o: { date: string; value: string }) => ({
    d: o.date.slice(0, 7), // "2021-04"
    v: parseFloat(o.value),
  })).filter((p: { v: number }) => !isNaN(p.v))
}

/* ── 최근값 추출 ── */
function extractCurrent(history: { d: string; v: number }[] | null) {
  if (!history || history.length === 0) return null
  const latest = history[history.length - 1]
  const prev = history.length > 1 ? history[history.length - 2] : null
  return {
    value: latest.v,
    date: latest.d,
    prev_value: prev?.v ?? null,
    change: prev ? +(latest.v - prev.v).toFixed(4) : null,
  }
}

export async function GET() {
  if (!FRED_KEY) {
    return NextResponse.json({ error: 'FRED_API_KEY not configured' }, { status: 500 })
  }

  try {
    // 1) 모든 시리즈 히스토리 병렬 페치
    const allDefs = SECTIONS.flatMap(s => s.series)
    const yieldIds = YIELD_MATURITIES.map(m => m.id)
    // 중복 제거 (DGS2, DGS10 등은 rates에도 있음)
    const uniqueIds = [...new Set([...allDefs.map(d => d.id), ...yieldIds])]
    const defMap = new Map(allDefs.map(d => [d.id, d]))

    const historyMap = new Map<string, { d: string; v: number }[]>()
    const results = await Promise.all(
      uniqueIds.map(async (id) => {
        const def = defMap.get(id)
        const hist = await fetchHistory(id, def?.transform)
        return { id, hist }
      })
    )
    for (const { id, hist } of results) {
      if (hist) historyMap.set(id, hist)
    }

    // 2) 섹션별 응답 구성
    const sections = SECTIONS.map(sec => ({
      id: sec.id,
      title: sec.title,
      icon: sec.icon,
      desc: sec.desc,
      series: sec.series.map(s => {
        const hist = historyMap.get(s.id) ?? []
        const cur = extractCurrent(hist)
        return {
          id: s.id,
          name: s.name,
          unit: s.unit,
          color: s.color,
          current: cur,
          history: hist,
        }
      }).filter(s => s.current !== null),
    }))

    // 3) 수익률 곡선 (현재 + 1년전)
    const yieldCurve = {
      current: YIELD_MATURITIES.map(m => {
        const hist = historyMap.get(m.id)
        const cur = hist ? hist[hist.length - 1] : null
        return { maturity: m.label, value: cur?.v ?? null, date: cur?.d ?? null }
      }),
      year_ago: YIELD_MATURITIES.map(m => {
        const hist = historyMap.get(m.id)
        if (!hist) return { maturity: m.label, value: null }
        // 12개월 전 찾기
        const target = hist.length > 12 ? hist[hist.length - 13] : hist[0]
        return { maturity: m.label, value: target?.v ?? null }
      }),
    }

    return NextResponse.json({
      sections,
      yield_curve: yieldCurve,
      updated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[global-economy] error:', e)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
