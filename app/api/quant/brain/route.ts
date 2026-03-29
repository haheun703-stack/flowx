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

    // date + data(jsonb) 패턴: data 컬럼을 언래핑
    const payload = data?.data ? { date: data.date, ...data.data } : data
    return NextResponse.json({ data: payload })
  } catch (e) {
    console.error('[brain] error:', e)
    return NextResponse.json({ data: null })
  }
}
