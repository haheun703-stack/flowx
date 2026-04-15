import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    const { data: latest } = await sb
      .from('sector_rotation')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return NextResponse.json({ date: null, sectors: [] })
    }

    const { data, error } = await sb
      .from('sector_rotation')
      .select('*')
      .eq('date', latest.date)
      .order('rank')

    if (error) {
      console.error('[dashboard/sector] DB error:', error.message)
      return NextResponse.json({ error: '섹터 데이터 조회 오류' }, { status: 500 })
    }

    return NextResponse.json({ date: latest.date, sectors: data ?? [] })
  } catch {
    return NextResponse.json({ error: 'sector data unavailable' }, { status: 500 })
  }
}
