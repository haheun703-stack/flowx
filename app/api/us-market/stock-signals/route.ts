import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get('limit')) || 100
    const sb = getSupabaseAdmin()
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await sb
      .from('us_stock_signals')
      .select('*')
      .gte('date', today)
      .order('score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return NextResponse.json({ stocks: data ?? [] })
  } catch (err) {
    console.error('[stock-signals]', err)
    return NextResponse.json({ stocks: [] })
  }
}
