import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const revalidate = 300

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get('source') // DART | EDGAR | null(전체)
  const dateStr = searchParams.get('date')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '30', 10), 100)

  try {
    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('intelligence_disclosures')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (source) query = query.eq('source', source)
    if (dateStr) query = query.eq('date', dateStr)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      date: data?.[0]?.date ?? null,
      items: data ?? [],
      count: data?.length ?? 0,
    })
  } catch {
    return NextResponse.json({ error: 'Disclosures unavailable' }, { status: 503 })
  }
}
