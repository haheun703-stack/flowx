import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data, error } = await sb
      .from('sector_leaders')
      .select('*')
      .order('sector')
      .order('leader_ticker')

    if (error) {
      console.error('[sector-leaders] DB error:', error.message)
      return NextResponse.json({ rows: [] }, { status: 500 })
    }

    return NextResponse.json({
      rows: data ?? [],
      meta: { total: data?.length ?? 0, updatedAt: data?.[0]?.updated_at ?? null },
    })
  } catch (e) {
    console.error('[sector-leaders] error:', e)
    return NextResponse.json({ rows: [] }, { status: 500 })
  }
}
