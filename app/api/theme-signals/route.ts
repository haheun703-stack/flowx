import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    let query = supabase
      .from('us_kr_theme_signals')
      .select('*')
      .order('signal_strength', { ascending: false })

    if (dateParam) {
      query = query.eq('date', dateParam)
    } else {
      // 최신 날짜 가져오기
      const { data: latest } = await supabase
        .from('us_kr_theme_signals')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (latest?.date) {
        query = query.eq('date', latest.date)
      }
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // JSONB 컬럼이 string으로 반환되는 경우 파싱
    const safeJson = (v: unknown) => {
      if (typeof v === 'string') { try { return JSON.parse(v) } catch { return null } }
      return v
    }
    const rows = data ?? []
    for (const row of rows) {
      const r = row as Record<string, unknown>
      r.us_stocks = safeJson(r.us_stocks) ?? []
      r.kr_stocks = safeJson(r.kr_stocks) ?? []
      r.kr_actual_change = safeJson(r.kr_actual_change) ?? null
      r.market_data = safeJson(r.market_data) ?? null
      r.fair_value = safeJson(r.fair_value) ?? null
    }

    const date = (rows[0] as Record<string, unknown>)?.date ?? dateParam ?? null

    return NextResponse.json({ data: rows, date })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
