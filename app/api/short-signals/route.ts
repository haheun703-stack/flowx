import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    const supabase = getSupabaseAdmin()

    const { data: latest } = await supabase
      .from('short_signals')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) return NextResponse.json([])

    let query = supabase
      .from('short_signals')
      .select('*')
      .eq('date', latest.date)

    if (type === 'force') {
      // 세력 포착: volume_ratio 높은 것
      query = query.gte('volume_ratio', 1.5).order('volume_ratio', { ascending: false })
    } else if (type === 'watch') {
      // 스나이퍼 워치: FORCE_BUY + BUY만
      query = query.in('signal_type', ['FORCE_BUY', 'BUY']).order('total_score', { ascending: false })
    } else {
      // AI 추천 (전체): grade 순 정렬
      query = query.order('total_score', { ascending: false })
    }

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    console.error('short-signals error:', e)
    return NextResponse.json([])
  }
}
