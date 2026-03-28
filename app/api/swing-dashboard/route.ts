import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from('dashboard_swing')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('[API /swing-dashboard] Supabase error:', error.message)
      return NextResponse.json({ error: '스윙 데이터 조회 오류' }, { status: 500 })
    }

    if (!data) return NextResponse.json({ data: null })

    return NextResponse.json({ data, date: data.date })
  } catch (err) {
    console.error('[API /swing-dashboard] error:', err)
    return NextResponse.json({ error: '스윙 데이터 조회 오류' }, { status: 500 })
  }
}
