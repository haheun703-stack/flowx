import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * macro_dashboard 테이블은 WIDE 구조 (1행에 모든 지표가 컬럼)
 * 프론트엔드는 TALL 구조 (지표당 1행, category/symbol/value)를 기대
 * 여기서 변환해줌
 */

interface MacroColumn {
  column: string
  chgColumn: string | null
  symbol: string
  name_ko: string
  category: string
  unit: string | null
  alert_threshold: number | null
  alert_direction: 'above' | 'below' | null
}

const MACRO_COLUMNS: MacroColumn[] = [
  // commodity
  { column: 'wti', chgColumn: 'wti_chg', symbol: 'WTI', name_ko: 'WTI유', category: 'commodity', unit: 'USD/bbl', alert_threshold: null, alert_direction: null },
  { column: 'brent', chgColumn: 'brent_chg', symbol: 'BRENT', name_ko: '브렌트유', category: 'commodity', unit: 'USD/bbl', alert_threshold: null, alert_direction: null },
  { column: 'natural_gas', chgColumn: 'ng_chg', symbol: 'NG', name_ko: '천연가스', category: 'commodity', unit: 'USD/MMBtu', alert_threshold: null, alert_direction: null },
  { column: 'gold', chgColumn: 'gold_chg', symbol: 'GOLD', name_ko: '금', category: 'commodity', unit: 'USD/oz', alert_threshold: null, alert_direction: null },
  { column: 'silver', chgColumn: 'silver_chg', symbol: 'SILVER', name_ko: '은', category: 'commodity', unit: 'USD/oz', alert_threshold: null, alert_direction: null },
  { column: 'copper', chgColumn: 'copper_chg', symbol: 'COPPER', name_ko: '구리', category: 'commodity', unit: 'USD/lb', alert_threshold: null, alert_direction: null },
  // grain
  { column: 'corn', chgColumn: 'corn_chg', symbol: 'CORN', name_ko: '옥수수', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  { column: 'wheat', chgColumn: 'wheat_chg', symbol: 'WHEAT', name_ko: '밀', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  { column: 'soybean', chgColumn: 'soybean_chg', symbol: 'SOYBEAN', name_ko: '대두', category: 'grain', unit: 'USd/bu', alert_threshold: null, alert_direction: null },
  // forex
  { column: 'usd_krw', chgColumn: 'usd_krw_chg', symbol: 'USD_KRW', name_ko: '원/달러', category: 'forex', unit: 'KRW', alert_threshold: 1400, alert_direction: 'above' },
  { column: 'dxy', chgColumn: 'dxy_chg', symbol: 'DXY', name_ko: '달러인덱스', category: 'forex', unit: null, alert_threshold: null, alert_direction: null },
  // rate
  { column: 'fed_funds', chgColumn: null, symbol: 'FED_FUNDS', name_ko: '기준금리', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  { column: 'us_10y', chgColumn: null, symbol: 'US10Y', name_ko: '미국 10년물', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  { column: 'us_2y', chgColumn: null, symbol: 'US2Y', name_ko: '미국 2년물', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  { column: 'us_10y_2y_spread', chgColumn: null, symbol: 'SPREAD_10Y2Y', name_ko: '장단기 스프레드', category: 'rate', unit: '%', alert_threshold: 0, alert_direction: 'below' },
  { column: 'hy_spread', chgColumn: null, symbol: 'HY_SPREAD', name_ko: 'HY 스프레드', category: 'rate', unit: '%', alert_threshold: 5, alert_direction: 'above' },
  { column: 'breakeven_5y', chgColumn: null, symbol: 'BEI_5Y', name_ko: 'BEI 5년', category: 'rate', unit: '%', alert_threshold: null, alert_direction: null },
  // sentiment
  { column: 'vix', chgColumn: 'vix_chg', symbol: 'VIX', name_ko: 'VIX', category: 'sentiment', unit: null, alert_threshold: 25, alert_direction: 'above' },
  { column: 'fear_greed', chgColumn: null, symbol: 'FNG', name_ko: '공포탐욕지수', category: 'sentiment', unit: null, alert_threshold: null, alert_direction: null },
  // index
  { column: 'kospi', chgColumn: 'kospi_chg', symbol: 'KOSPI', name_ko: 'KOSPI', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  { column: 'kosdaq', chgColumn: null, symbol: 'KOSDAQ', name_ko: 'KOSDAQ', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  { column: 'sp500', chgColumn: 'sp500_chg', symbol: 'SP500', name_ko: 'S&P 500', category: 'index', unit: 'pt', alert_threshold: null, alert_direction: null },
  // crypto
  { column: 'btc', chgColumn: 'btc_chg', symbol: 'BTC', name_ko: '비트코인', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
  { column: 'eth', chgColumn: null, symbol: 'ETH', name_ko: '이더리움', category: 'crypto', unit: 'USD', alert_threshold: null, alert_direction: null },
]

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data: row, error } = await sb
      .from('macro_dashboard')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error || !row) {
      return NextResponse.json({ date: null, items: [], categories: {} })
    }

    // WIDE → TALL 변환
    const items = MACRO_COLUMNS
      .filter(col => row[col.column] != null)
      .map(col => {
        const value = Number(row[col.column])
        const change_pct = col.chgColumn ? Number(row[col.chgColumn] ?? 0) : 0
        const alert_active = col.alert_threshold != null && col.alert_direction != null
          ? col.alert_direction === 'above' ? value >= col.alert_threshold : value <= col.alert_threshold
          : false

        return {
          id: `${row.date}-${col.symbol}`,
          date: row.date,
          category: col.category,
          symbol: col.symbol,
          name_ko: col.name_ko,
          value,
          change_pct,
          unit: col.unit,
          alert_threshold: col.alert_threshold,
          alert_direction: col.alert_direction,
          alert_active,
        }
      })

    // 카테고리별 그룹핑
    const categories: Record<string, typeof items> = {}
    for (const item of items) {
      if (!categories[item.category]) categories[item.category] = []
      categories[item.category].push(item)
    }

    return NextResponse.json({
      date: row.date,
      items,
      categories,
    })
  } catch (e) {
    console.error('[macro/daily]', e)
    return NextResponse.json({ date: null, items: [], categories: {} })
  }
}
