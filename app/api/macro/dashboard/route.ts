import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('macro_dashboard')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null })
      }
      console.error('[API /macro/dashboard] Supabase error:', error.message)
      return NextResponse.json({ error: '거시경제 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[API /macro/dashboard] error:', err)
    return NextResponse.json({ error: '거시경제 데이터 조회 오류' }, { status: 500 })
  }
}
