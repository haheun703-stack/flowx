import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 날짜 조회
    const { data: latest } = await supabase
      .from('quant_sector_fire')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const date = latest?.date ?? null
    if (!date) {
      return NextResponse.json({ data: [], date: null })
    }

    const { data, error } = await supabase
      .from('quant_sector_fire')
      .select('*')
      .eq('date', date)
      .order('fire_score', { ascending: false })

    if (error) {
      console.error('[API /sector-fire] Supabase error:', error.message)
      return NextResponse.json({ error: '섹터 발화 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], date })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
