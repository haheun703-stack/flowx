import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('quant_sector_momentum')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.warn('[sector-momentum] DB:', error.message)
      return NextResponse.json({ data: null })
    }

    const payload = data?.data ? { date: data.date, ...data.data } : data
    return NextResponse.json({ data: payload })
  } catch (e) {
    console.error('[sector-momentum] error:', e)
    return NextResponse.json({ data: null })
  }
}
