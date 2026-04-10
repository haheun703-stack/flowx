import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function safeParse(val: unknown): unknown[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try { const parsed = JSON.parse(val); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
  }
  return []
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('market_52w_highs_lows')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (data) {
      data.top_highs = safeParse(data.top_highs)
      data.top_lows = safeParse(data.top_lows)
    }

    return NextResponse.json({ data })
  } catch {
    return NextResponse.json({ data: null }, { status: 500 })
  }
}
