import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    // 날짜 파라미터가 없으면 오늘(KST) 기준, 주말/공휴일은 최신 날짜로 폴백
    const today = dateParam || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    // 요청 날짜 이하에서 가장 최근 데이터 날짜 조회
    const { data: latestRow } = await supabase
      .from('nationality_charts')
      .select('date')
      .lte('date', today)
      .order('date', { ascending: false })
      .limit(1)
      .single()

    const date = latestRow?.date ?? today

    const { data: items, error } = await supabase
      .from('nationality_charts')
      .select('date,code,name,image_url,nat_score,nat_grade')
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
