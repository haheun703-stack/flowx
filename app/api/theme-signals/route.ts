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

    const date = data?.[0]?.date ?? dateParam ?? null

    return NextResponse.json({ data: data ?? [], date })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
