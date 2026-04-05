import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('ai_signal_scorecard')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (e) {
    console.error('[API /dashboard/ai-scorecard] error:', e)
    return NextResponse.json(null, { status: 500 })
  }
}
