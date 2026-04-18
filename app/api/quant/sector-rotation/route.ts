import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('sector_rotation')
      .select('*')
      .order('rank', { ascending: true })

    if (error) {
      console.error('[API /sector-rotation] Supabase error:', error.message)
      return NextResponse.json({ error: '섹터 로테이션 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (err) {
    console.error('[API /sector-rotation] error:', err)
    return NextResponse.json({ error: '섹터 로테이션 데이터 조회 오류' }, { status: 500 })
  }
}
