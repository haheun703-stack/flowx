import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // quant_fib_scanner 최신 1건
    const { data, error } = await supabase
      .from('quant_fib_scanner')
      .select('date,data')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /quant/fib-scanner]', error.message)
      return NextResponse.json({ error: '피보나치 스캐너 데이터 조회 오류' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ data: null })
    }

    const payload = data.data as Record<string, unknown>

    return NextResponse.json({
      data: {
        date: data.date,
        fib_stocks: payload.fib_stocks ?? [],
        fib_leaders: payload.fib_leaders ?? [],
        sector_rotation: payload.sector_rotation ?? [],
        summary: payload.summary ?? null,
      },
    })
  } catch (err) {
    console.error('[API /quant/fib-scanner] error:', err)
    return NextResponse.json({ error: '피보나치 스캐너 데이터 조회 오류' }, { status: 500 })
  }
}
