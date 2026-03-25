import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('intelligence_conviction_notes')
      .select('*')
      .eq('session', 'PM')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'No scenario data' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Scenario unavailable' }, { status: 503 })
  }
}
