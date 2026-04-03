import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/sector-momentum?date=today
 * 정보봇이 매일 16:58 sector_rotation → sector_momentum 테이블에 upsert
 * PK: (sector, date)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const dateParam = searchParams.get('date')

    const sb = getSupabaseAdmin()

    let query = sb
      .from('sector_momentum')
      .select('*')
      .order('momentum_score', { ascending: false })

    if (dateParam === 'today') {
      const today = new Date().toISOString().slice(0, 10)
      query = query.eq('date', today)
    } else if (dateParam) {
      query = query.eq('date', dateParam)
    } else {
      // 날짜 미지정 시 최신 날짜 데이터
      const { data: latest } = await sb
        .from('sector_momentum')
        .select('date')
        .order('date', { ascending: false })
        .limit(1)
        .single()

      if (latest?.date) {
        query = query.eq('date', latest.date)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('[sector-momentum] DB error:', error.message)
      return NextResponse.json({ date: null, sectors: [] })
    }

    const date = data?.[0]?.date ?? null
    return NextResponse.json({ date, sectors: data ?? [] })
  } catch (e) {
    console.error('[sector-momentum] error:', e)
    return NextResponse.json({ date: null, sectors: [] })
  }
}
