import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    // 최신 날짜의 모든 섹터 데이터
    const { data: latest } = await sb
      .from('sector_rotation')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) {
      return NextResponse.json({ data: [], date: null })
    }

    const { data, error } = await sb
      .from('sector_rotation')
      .select('*')
      .eq('date', latest.date)
      .order('rank')

    if (error) {
      console.error('[sector-rotation] DB error:', error.message)
      return NextResponse.json({ data: [], date: null }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], date: latest.date })
  } catch (e) {
    console.error('[sector-rotation] error:', e)
    return NextResponse.json({ data: [], date: null }, { status: 500 })
  }
}
