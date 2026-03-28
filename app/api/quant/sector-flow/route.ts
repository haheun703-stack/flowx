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
      console.error('[sector-flow] DB error:', error.message)
      return NextResponse.json({ data: null }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (e) {
    console.error('[sector-flow] error:', e)
    return NextResponse.json({ data: null }, { status: 500 })
  }
}
