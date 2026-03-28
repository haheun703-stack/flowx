import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get('type') // 'index' | 'stock'
  const code = req.nextUrl.searchParams.get('code')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 50, 200)

  try {
    const sb = getSupabaseAdmin()

    // 최신 날짜
    const { data: latest } = await sb
      .from('ml_predictions')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return NextResponse.json({ data: [], date: null })
    }

    let q = sb
      .from('ml_predictions')
      .select('*')
      .eq('date', latest.date)
      .order('prob_up', { ascending: false })
      .limit(limit)

    if (type) q = q.eq('pred_type', type)
    if (code) q = q.eq('code', code)

    const { data, error } = await q

    if (error) {
      console.error('[ml-predictions] DB error:', error.message)
      return NextResponse.json({ data: [], date: null }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], date: latest.date })
  } catch (e) {
    console.error('[ml-predictions] error:', e)
    return NextResponse.json({ data: [], date: null }, { status: 500 })
  }
}
