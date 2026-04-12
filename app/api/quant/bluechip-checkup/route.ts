import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_bluechip_checkup')
      .select('date,data')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /quant/bluechip-checkup]', error.message)
      return NextResponse.json({ error: '대형주 점검 데이터 조회 오류' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ data: null })
    }

    const payload = data.data as Record<string, unknown>

    return NextResponse.json({
      data: {
        date: data.date,
        bluechips: payload.bluechips ?? [],
        smallcaps: payload.smallcaps ?? [],
        summary: payload.summary ?? null,
      },
    })
  } catch (err) {
    console.error('[API /quant/bluechip-checkup] error:', err)
    return NextResponse.json({ error: '대형주 점검 데이터 조회 오류' }, { status: 500 })
  }
}
