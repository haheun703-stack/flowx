import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('quant_sector_flow')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn('[sector-flow] DB:', error.message)
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[sector-flow] error:', e)
    return NextResponse.json({ data: null })
  }
}
