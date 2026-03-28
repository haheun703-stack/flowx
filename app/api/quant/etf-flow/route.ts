import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('quant_etf_fund_flow')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('[etf-flow] DB error:', error.message)
      return NextResponse.json({ data: null }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[etf-flow] error:', e)
    return NextResponse.json({ data: null }, { status: 500 })
  }
}
