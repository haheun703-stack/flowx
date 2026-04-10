import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // KST 기준 오늘 날짜
    const kstDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    // 오늘자 데이터 조회 — confirmed 우선 (알파벳순 c < p)
    const { data: rows, error } = await supabase
      .from('intelligence_daytrading_picks')
      .select('*')
      .eq('date', kstDate)
      .order('mode', { ascending: true })

    if (error) {
      console.error('[API /daytrading-picks] Supabase error:', error.message)
      return NextResponse.json({ error: '단타 TOP픽 데이터 조회 오류' }, { status: 500 })
    }

    // confirmed 있으면 우선, 없으면 preview, 둘 다 없으면 null
    const data = rows && rows.length > 0 ? rows[0] : null

    return NextResponse.json({ data, date: kstDate })
  } catch (err) {
    console.error('[API /daytrading-picks] error:', err)
    return NextResponse.json({ error: '단타 TOP픽 데이터 조회 오류' }, { status: 500 })
  }
}
