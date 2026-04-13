import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    // 날짜 파라미터가 없으면 오늘(KST) 기준
    const date = dateParam || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    const { data: items, error } = await supabase
      .from('nationality_charts')
      .select('date,code,name,image_url,nat_score,nat_grade,updated_at')
      .eq('date', date)
      .order('nat_score', { ascending: false })
      .limit(200)

    if (error) {
      console.error('[API /nationality-charts] Supabase error:', error.message)
      return NextResponse.json({ error: '국적별 수급 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ items: items ?? [], date })
  } catch (err) {
    console.error('[API /nationality-charts] error:', err)
    return NextResponse.json({ error: '국적별 수급 데이터 조회 오류' }, { status: 500 })
  }
}
