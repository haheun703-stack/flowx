import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const sectorParam = searchParams.get('sector')

    // 최신 날짜 조회
    const { data: latest } = await supabase
      .from('quant_sector_picks')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const date = latest?.date ?? null
    if (!date) {
      return NextResponse.json({ data: [], date: null })
    }

    let query = supabase
      .from('quant_sector_picks')
      .select('*')
      .eq('date', date)
      .order('buy_score', { ascending: false })

    if (sectorParam) {
      query = query.eq('sector', sectorParam)
    }

    const { data, error } = await query

    if (error) {
      console.error('[API /sector-picks] Supabase error:', error.message)
      return NextResponse.json({ error: '섹터 종목 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], date })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
