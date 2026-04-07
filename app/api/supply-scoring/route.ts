import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜의 데이터만 가져오기
    const { data, error } = await supabase
      .from('supply_scoring')
      .select('*')
      .order('date', { ascending: false })
      .order('score', { ascending: false })
      .limit(50)

    if (error) throw error

    // 최신 날짜 필터링 (가장 최근 날짜만)
    const latest = data?.[0]?.date
    const filtered = (data ?? []).filter(r => r.date === latest)

    return NextResponse.json({ date: latest, items: filtered })
  } catch (e) {
    console.error('supply-scoring error:', e)
    return NextResponse.json({ date: null, items: [] }, { status: 500 })
  }
}
