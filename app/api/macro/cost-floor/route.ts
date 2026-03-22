import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('cost_floor')
      .select('*')
      .order('symbol')

    if (error) throw error

    return NextResponse.json({ items: data ?? [] })
  } catch (e) {
    console.error('[macro/cost-floor]', e)
    return NextResponse.json({ items: [] })
  }
}
