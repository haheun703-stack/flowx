import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_cycle_scan')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // PGRST116 = 행 없음 (정상 — 아직 데이터 미생성)
      if (error.code !== 'PGRST116') {
        console.error('[API /swing/cycle-scan] error:', error.message)
      }
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[API /swing/cycle-scan] error:', e)
    return NextResponse.json({ data: null })
  }
}
