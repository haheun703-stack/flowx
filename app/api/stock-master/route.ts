import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const ticker = req.nextUrl.searchParams.get('ticker')?.trim()
  const sector = req.nextUrl.searchParams.get('sector')
  const market = req.nextUrl.searchParams.get('market')
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 100, 500)

  try {
    const sb = getSupabaseAdmin()

    // 단일 종목 조회
    if (ticker) {
      const { data, error } = await sb
        .from('stock_master')
        .select('*')
        .eq('ticker', ticker)
        .single()

      if (error) {
        return NextResponse.json({ data: null }, { status: 404 })
      }
      return NextResponse.json({ data })
    }

    // 목록 조회
    let q = sb
      .from('stock_master')
      .select('*')
      .order('market_cap', { ascending: false })
      .limit(limit)

    if (sector) q = q.eq('sector', sector)
    if (market) q = q.eq('market', market)

    const { data, error } = await q

    if (error) {
      console.error('[stock-master] DB error:', error.message)
      return NextResponse.json({ data: [] }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [] })
  } catch (e) {
    console.error('[stock-master] error:', e)
    return NextResponse.json({ data: [] }, { status: 500 })
  }
}
