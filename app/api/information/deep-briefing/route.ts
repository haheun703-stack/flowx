import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 1건 (주말/공휴일 대응: 날짜 내림차순)
    const { data, error } = await supabase
      .from('deep_briefing')
      .select('*')
      .order('date', { ascending: false })
      .order('session', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // PGRST116 = no rows
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null })
      }
      console.error('[API /deep-briefing] Supabase error:', error.message)
      return NextResponse.json({ error: '심층 브리핑 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[API /deep-briefing] error:', err)
    return NextResponse.json({ error: '심층 브리핑 조회 오류' }, { status: 500 })
  }
}
