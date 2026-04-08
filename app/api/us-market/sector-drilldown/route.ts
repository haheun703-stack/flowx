import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await sb
      .from('us_sector_drilldown')
      .select('*')
      .gte('date', today)
      .order('etf_change', { ascending: false })
      .order('score', { ascending: false })

    if (error) throw error
    return NextResponse.json({ stocks: data ?? [] })
  } catch (err) {
    console.error('[sector-drilldown]', err)
    return NextResponse.json({ stocks: [] })
  }
}
