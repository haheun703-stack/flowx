import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const FRED_API_KEY = process.env.FRED_API_KEY
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations'

/* ── FRED 시리즈 정의 ── */
interface SeriesDef {
  id: string
  name: string
  category: 'rate' | 'inflation' | 'employment' | 'market'
  unit: string
  /** FRED units 파라미터: pc1=YoY%, chg=변화량, lin=원값 */
  transform: 'lin' | 'pc1' | 'chg'
  /** 값 소수점 자리수 */
  decimals: number
}

const FRED_SERIES: SeriesDef[] = [
  // 미국 금리
  { id: 'FEDFUNDS', name: '미국 기준금리', category: 'rate', unit: '%', transform: 'lin', decimals: 2 },
  { id: 'DGS10', name: '미국 10년 국채', category: 'rate', unit: '%', transform: 'lin', decimals: 2 },
  { id: 'DGS2', name: '미국 2년 국채', category: 'rate', unit: '%', transform: 'lin', decimals: 2 },
  { id: 'T10Y2Y', name: '장단기 스프레드 (10Y-2Y)', category: 'rate', unit: '%p', transform: 'lin', decimals: 2 },
  // 인플레이션 (YoY %)
  { id: 'CPIAUCSL', name: 'CPI (소비자물가 YoY)', category: 'inflation', unit: '%', transform: 'pc1', decimals: 2 },
  { id: 'PCEPILFE', name: 'Core PCE (YoY)', category: 'inflation', unit: '%', transform: 'pc1', decimals: 2 },
  // 고용
  { id: 'UNRATE', name: '실업률', category: 'employment', unit: '%', transform: 'lin', decimals: 1 },
  { id: 'PAYEMS', name: '비농업 고용 (MoM 변화)', category: 'employment', unit: '천명', transform: 'chg', decimals: 0 },
  // 시장 지표
  { id: 'VIXCLS', name: 'VIX (공포지수)', category: 'market', unit: '', transform: 'lin', decimals: 2 },
  { id: 'DTWEXBGS', name: '달러 인덱스', category: 'market', unit: '', transform: 'lin', decimals: 2 },
  { id: 'DCOILWTICO', name: 'WTI 원유', category: 'market', unit: '$/bbl', transform: 'lin', decimals: 2 },
  { id: 'DEXKOUS', name: 'USD/KRW 환율', category: 'market', unit: '원', transform: 'lin', decimals: 1 },
]

/* ── FRED 단일 시리즈 페치 ── */
async function fetchFred(def: SeriesDef) {
  try {
    const params = new URLSearchParams({
      series_id: def.id,
      api_key: FRED_API_KEY!,
      file_type: 'json',
      sort_order: 'desc',
      limit: '2',
      ...(def.transform !== 'lin' ? { units: def.transform } : {}),
    })
    const res = await fetch(`${FRED_BASE}?${params}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    const obs = json.observations?.filter((o: { value: string }) => o.value !== '.')
    if (!obs || obs.length === 0) return null

    const latest = obs[0]
    const prev = obs.length > 1 ? obs[1] : null
    const value = parseFloat(latest.value)
    if (isNaN(value)) return null
    const prevValue = prev ? parseFloat(prev.value) : null

    const change = prevValue != null ? value - prevValue : null
    const changePct =
      prevValue != null && prevValue !== 0
        ? ((value - prevValue) / Math.abs(prevValue)) * 100
        : null

    return {
      id: def.id,
      name: def.name,
      category: def.category,
      unit: def.unit,
      value: Number(value.toFixed(def.decimals)),
      prev_value: prevValue != null ? Number(prevValue.toFixed(def.decimals)) : null,
      change: change != null ? Number(change.toFixed(def.decimals)) : null,
      change_pct: changePct != null ? Number(changePct.toFixed(2)) : null,
      date: latest.date as string,
    }
  } catch {
    return null
  }
}

/* ── 카테고리 메타 ── */
const CATEGORY_META: Record<string, { title: string; icon: string }> = {
  rate: { title: '미국 금리', icon: '🏦' },
  inflation: { title: '인플레이션', icon: '📈' },
  employment: { title: '고용', icon: '👷' },
  market: { title: '시장 지표', icon: '🌐' },
}

export async function GET() {
  if (!FRED_API_KEY) {
    return NextResponse.json({ error: 'FRED_API_KEY not configured' }, { status: 500 })
  }

  try {
    const results = await Promise.all(FRED_SERIES.map(fetchFred))
    const indicators = results.filter(Boolean)

    // 카테고리별 그룹핑
    const categories: Record<string, { meta: { title: string; icon: string }; items: typeof indicators }> = {}
    for (const ind of indicators) {
      if (!ind) continue
      if (!categories[ind.category]) {
        categories[ind.category] = {
          meta: CATEGORY_META[ind.category] ?? { title: ind.category, icon: '📊' },
          items: [],
        }
      }
      categories[ind.category].items.push(ind)
    }

    return NextResponse.json({
      categories,
      total: indicators.length,
      updated_at: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[global-economy] error:', e)
    return NextResponse.json({ error: 'Failed to fetch economic data' }, { status: 500 })
  }
}
