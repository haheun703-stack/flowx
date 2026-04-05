import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * macro_data 테이블 (JSONB 구조) → 프론트엔드 TALL 구조로 변환
 * 봇이 indices/commodities/forex/crypto/bonds/vix JSONB로 저장
 */

interface SymbolMeta {
  name_ko: string
  category: string
  unit: string | null
  alert_threshold: number | null
  alert_direction: 'above' | 'below' | null
}

const SYMBOL_META: Record<string, SymbolMeta> = {
  // indices
  SPX:   { name_ko: 'S&P 500', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  IXIC:  { name_ko: 'NASDAQ', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  DJI:   { name_ko: '다우존스', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  N225:  { name_ko: '닛케이225', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  HSI:   { name_ko: '항셍', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  GDAXI: { name_ko: 'DAX', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  SSEC:  { name_ko: '상해종합', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  FTSE:  { name_ko: 'FTSE100', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  KOSPI: { name_ko: 'KOSPI', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  KOSDAQ:{ name_ko: 'KOSDAQ', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  STOXX: { name_ko: 'STOXX600', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  // commodities — 에너지
  WTI:    { name_ko: 'WTI유', category: 'commodity', unit: 'USD/bbl', alert_threshold: null, alert_direction: null },
  BRENT:  { name_ko: '브렌트유', category: 'commodity', unit: 'USD/bbl', alert_threshold: null, alert_direction: null },
  NG:     { name_ko: '천연가스', category: 'commodity', unit: 'USD/MMBtu', alert_threshold: null, alert_direction: null },
  // commodities — 귀금속
  GOLD:   { name_ko: '금', category: 'commodity', unit: 'USD/oz', alert_threshold: null, alert_direction: null },
  SILVER: { name_ko: '은', category: 'commodity', unit: 'USD/oz', alert_threshold: null, alert_direction: null },
  // commodities — 산업금속
  COPPER: { name_ko: '구리', category: 'commodity', unit: 'USD/lb', alert_threshold: null, alert_direction: null },
  // commodities — 농산물
  CORN:    { name_ko: '옥수수', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  SOYBEAN: { name_ko: '대두', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  WHEAT:   { name_ko: '밀', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  // forex
  USDKRW: { name_ko: '원/달러', category: 'forex', unit: 'KRW', alert_threshold: 1400, alert_direction: 'above' },
  DXY:    { name_ko: '달러인덱스', category: 'forex', unit: null, alert_threshold: null, alert_direction: null },
  USDJPY: { name_ko: '엔/달러', category: 'forex', unit: null, alert_threshold: null, alert_direction: null },
  EURUSD: { name_ko: '유로/달러', category: 'forex', unit: null, alert_threshold: null, alert_direction: null },
  USDCNY: { name_ko: '위안/달러', category: 'forex', unit: null, alert_threshold: null, alert_direction: null },
  // crypto
  BTC:  { name_ko: '비트코인', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  ETH:  { name_ko: '이더리움', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  SOL:  { name_ko: '솔라나', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  XRP:  { name_ko: '리플', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  DOGE: { name_ko: '도지코인', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  ADA:  { name_ko: '에이다', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  AVAX: { name_ko: '아발란체', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  // bonds
  US10Y: { name_ko: '미국 10년물', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  US2Y:  { name_ko: '미국 2년물', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  BOK_RATE: { name_ko: '한국 기준금리', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  FED_RATE: { name_ko: '미국 기준금리', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  SPREAD_10Y2Y: { name_ko: '장단기 금리차', category: 'rate', unit: '%p', alert_threshold: 0, alert_direction: 'below' },
  HY_SPREAD:    { name_ko: '회사채 위험도', category: 'rate', unit: '%p', alert_threshold: 5, alert_direction: 'above' },
  BEI_5Y:       { name_ko: '기대 인플레', category: 'rate', unit: '%', alert_threshold: 3, alert_direction: 'above' },
  // sentiment
  VIX: { name_ko: 'VIX', category: 'sentiment', unit: null, alert_threshold: 25, alert_direction: 'above' },
  FNG: { name_ko: '공포탐욕지수', category: 'sentiment', unit: null, alert_threshold: null, alert_direction: null },
  FEAR_GREED: { name_ko: '공포탐욕지수', category: 'sentiment', unit: null, alert_threshold: null, alert_direction: null },
  ERP:    { name_ko: '주식 매력도', category: 'sentiment', unit: null, alert_threshold: null, alert_direction: null },
  ALERTS: { name_ko: '위험 신호등', category: 'sentiment', unit: null, alert_threshold: null, alert_direction: null },
}

interface JsonbItem { symbol: string; name?: string; price: number; change: number; label?: string; signals?: string[] }

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data: row, error } = await sb
      .from('macro_data')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('[macro/daily] DB error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    if (!row) {
      return NextResponse.json({ date: null, items: [], categories: {} })
    }

    const items: {
      id: string; date: string; category: string; symbol: string;
      name_ko: string; value: number; change_pct: number;
      unit: string | null; alert_threshold: number | null;
      alert_direction: string | null; alert_active: boolean;
      label?: string; signals?: string[];
    }[] = []

    // JSONB 배열 카테고리 처리
    const jsonbFields: (keyof typeof row)[] = ['indices', 'commodities', 'forex', 'crypto', 'bonds', 'sentiment']
    for (const field of jsonbFields) {
      const arr = row[field]
      if (!Array.isArray(arr)) continue
      for (const item of arr as JsonbItem[]) {
        const meta = SYMBOL_META[item.symbol]
        if (!meta) continue
        const value = Number(item.price)
        const change_pct = Number(item.change ?? 0)
        const alert_active = meta.alert_threshold != null && meta.alert_direction != null
          ? meta.alert_direction === 'above' ? value >= meta.alert_threshold : value <= meta.alert_threshold
          : false

        items.push({
          id: `${row.date}-${item.symbol}`,
          date: row.date,
          category: meta.category,
          symbol: item.symbol,
          name_ko: meta.name_ko,
          value,
          change_pct,
          unit: meta.unit,
          alert_threshold: meta.alert_threshold,
          alert_direction: meta.alert_direction,
          alert_active,
          ...(item.label ? { label: item.label } : {}),
          ...(item.signals ? { signals: item.signals } : {}),
        })
      }
    }

    // VIX (단일 객체)
    if (row.vix && typeof row.vix === 'object') {
      const vix = row.vix as { price: number; change: number }
      const meta = SYMBOL_META.VIX
      const value = Number(vix.price)
      items.push({
        id: `${row.date}-VIX`,
        date: row.date,
        category: meta.category,
        symbol: 'VIX',
        name_ko: meta.name_ko,
        value,
        change_pct: Number(vix.change ?? 0),
        unit: meta.unit,
        alert_threshold: meta.alert_threshold,
        alert_direction: meta.alert_direction,
        alert_active: meta.alert_threshold != null ? value >= meta.alert_threshold : false,
      })
    }

    // 카테고리별 그룹핑
    const categories: Record<string, typeof items> = {}
    for (const item of items) {
      if (!categories[item.category]) categories[item.category] = []
      categories[item.category].push(item)
    }

    return NextResponse.json({ date: row.date, items, categories })
  } catch (e) {
    console.error('[macro/daily]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
