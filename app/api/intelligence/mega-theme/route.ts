import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최근 10건 → theme_id별 최신 1건만 유지 (5테마 × 2일 버퍼)
    const { data, error } = await supabase
      .from('mega_theme_analysis')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[API /intelligence/mega-theme] Supabase error:', error.message)
      return NextResponse.json({ error: '메가테마 조회 오류' }, { status: 500 })
    }

    // theme_id별 최신 1건만 유지
    const latest = new Map<string, (typeof data)[0]>()
    for (const row of data ?? []) {
      if (!latest.has(row.theme_id)) {
        latest.set(row.theme_id, row)
      }
    }

    return NextResponse.json({ data: Array.from(latest.values()) })
  } catch (err) {
    console.error('[API /intelligence/mega-theme] error:', err)
    return NextResponse.json({ error: '메가테마 조회 오류' }, { status: 500 })
  }
}
