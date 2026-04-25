import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const themeId = searchParams.get('theme_id')
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    if (!themeId) {
      return NextResponse.json({ error: 'theme_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('us_kr_theme_signals')
      .select('date, signal_strength, signal_grade, us_avg_change, hit_count, total_kr_count')
      .eq('theme_id', themeId)
      .order('date', { ascending: false })
      .limit(days)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
