import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    // 최신 1건 + 최근 30일 추이
    const [latestRes, historyRes] = await Promise.all([
      supabase
        .from('market_fear_greed')
        .select('*')
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('market_fear_greed')
        .select('date, score, label')
        .order('date', { ascending: false })
        .limit(30),
    ])

    if (latestRes.error) throw latestRes.error
    if (historyRes.error) throw historyRes.error

    return NextResponse.json({
      latest: latestRes.data,
      history: historyRes.data ?? [],
    })
  } catch {
    return NextResponse.json({ latest: null, history: [] }, { status: 500 })
  }
}
