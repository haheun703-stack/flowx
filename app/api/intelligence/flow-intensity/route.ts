import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_flow_intensity')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /intelligence/flow-intensity] Supabase error:', error.message)
      return NextResponse.json({ error: '수급 강도 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? null })
  } catch (err) {
    console.error('[API /intelligence/flow-intensity] error:', err)
    return NextResponse.json({ error: '수급 강도 조회 오류' }, { status: 500 })
  }
}
