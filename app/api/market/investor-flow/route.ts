import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('kospi_investor_daily')
      .select('date, foreign_net, inst_net, indiv_net')
      .order('date', { ascending: true })
      .limit(30)

    if (error) throw error

    return NextResponse.json(data ?? [])
  } catch (e) {
    console.error('investor-flow error:', e)
    return NextResponse.json([], { status: 500 })
  }
}
