import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * cost_floor 테이블 실제 컬럼:
 *   name, category, ticker, floor_name, floor_price, ceiling_name, ceiling_price,
 *   current_price, position_pct, change_pct, sector, catalyst, updated_at
 *
 * 프론트엔드 CostFloorItem 기대 컬럼:
 *   id, symbol, name_ko, unit, floor_price, ceiling_price, current_price, position_pct, note, updated_at
 */

const UNIT_MAP: Record<string, string> = {
  'CL=F': 'USD/bbl',
  'BZ=F': 'USD/bbl',
  'NG=F': 'USD/MMBtu',
  'GC=F': 'USD/oz',
  'SI=F': 'USD/oz',
  'HG=F': 'USD/lb',
  'ZC=F': 'USd/bu',
  'ZW=F': 'USd/bu',
  'ZS=F': 'USd/bu',
}

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('cost_floor')
      .select('*')
      .order('name')

    if (error) throw error

    // 프론트엔드 형식으로 변환
    const items = (data ?? []).map(row => ({
      id: row.ticker ?? row.name,
      symbol: row.name,
      name_ko: row.name,
      unit: UNIT_MAP[row.ticker] ?? null,
      floor_price: row.floor_price,
      floor_name: row.floor_name ?? null,
      ceiling_price: row.ceiling_price,
      ceiling_name: row.ceiling_name ?? null,
      current_price: row.current_price,
      position_pct: row.position_pct,
      note: [row.floor_name, row.ceiling_name].filter(Boolean).join(' → '),
      updated_at: row.updated_at,
    }))

    return NextResponse.json({ items })
  } catch (e) {
    console.error('[macro/cost-floor]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
