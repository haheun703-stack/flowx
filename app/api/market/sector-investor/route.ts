import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜의 전체 섹터 데이터
    const { data, error } = await supabase
      .from('sector_investor_flow')
      .select('*')
      .order('date', { ascending: false })
      .limit(24) // 24 sectors

    if (error) throw error

    // 가장 최근 날짜만 필터
    const latestDate = data?.[0]?.date
    const filtered = latestDate ? data?.filter((r: { date: string }) => r.date === latestDate) : []

    return NextResponse.json({ date: latestDate, sectors: filtered ?? [] })
  } catch {
    return NextResponse.json({ date: null, sectors: [] }, { status: 500 })
  }
}
