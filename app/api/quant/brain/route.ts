import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('quant_market_brain')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn('[brain] DB:', error.message)
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[brain] error:', e)
    return NextResponse.json({ data: null })
  }
}
