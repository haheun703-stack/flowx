import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_nxt_picks')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /nxt-picks] Supabase error:', error.message)
      return NextResponse.json({ error: 'NXT TOP 5 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /nxt-picks] error:', err)
    return NextResponse.json({ error: 'NXT TOP 5 데이터 조회 오류' }, { status: 500 })
  }
}
