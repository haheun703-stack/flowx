import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('quant_alpha_scanner')
      .select('date,data,created_at')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /alpha-scanner]', error.message)
      return NextResponse.json({ error: '알파 스캐너 데이터 조회 오류' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ data: null })
    }

    const payload = data.data as Record<string, unknown>

    return NextResponse.json({
      data: {
        date: data.date,
        created_at: data.created_at,
        ...payload,
      },
    })
  } catch (err) {
    console.error('[API /alpha-scanner] error:', err)
    return NextResponse.json({ error: '알파 스캐너 데이터 조회 오류' }, { status: 500 })
  }
}
