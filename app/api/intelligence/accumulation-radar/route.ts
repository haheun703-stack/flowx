import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_accumulation_radar')
      .select('date, stocks')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('[API /intelligence/accumulation-radar] Supabase error:', error.message)
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data })
  } catch (err) {
    console.error('[API /intelligence/accumulation-radar] error:', err)
    return NextResponse.json({ data: null })
  }
}
