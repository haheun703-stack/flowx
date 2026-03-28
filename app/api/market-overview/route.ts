import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('market_overview')
      .select('*')
      .order('date', { ascending: false })
      .limit(5)

    if (error) {
      console.error('[market-overview] DB error:', error.message)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    if (!data?.length) {
      return NextResponse.json({ latest: null, history: [] })
    }

    return NextResponse.json({
      latest: data[0],
      history: data,
    })
  } catch (e) {
    console.error('[market-overview]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
