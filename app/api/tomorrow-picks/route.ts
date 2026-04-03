import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tomorrow-picks
 * 정보봇이 매일 16:57 treemap_stocks → tomorrow_picks 테이블에 외인 순매수 TOP 10 upsert
 */
export async function GET() {
  try {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('tomorrow_picks')
      .select('*')
      .order('rank', { ascending: true })
      .limit(10)

    if (error) {
      console.error('[tomorrow-picks] DB error:', error.message)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    console.error('[tomorrow-picks] error:', e)
    return NextResponse.json({ data: [] })
  }
}
