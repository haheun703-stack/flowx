import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const sb = getSupabaseAdmin()

    // 최신 날짜의 데이터만
    const { data: latestDate } = await sb
      .from('macro_dashboard')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latestDate) {
      return NextResponse.json({ date: null, items: [], categories: {} })
    }

    const { data: items, error } = await sb
      .from('macro_dashboard')
      .select('*')
      .eq('date', latestDate.date)
      .order('category')

    if (error) throw error

    // 카테고리별 그룹핑
    const categories: Record<string, typeof items> = {}
    for (const item of items ?? []) {
      if (!categories[item.category]) categories[item.category] = []
      categories[item.category].push(item)
    }

    return NextResponse.json({
      date: latestDate.date,
      items: items ?? [],
      categories,
    })
  } catch (e) {
    console.error('[macro/daily]', e)
    return NextResponse.json({ date: null, items: [], categories: {} })
  }
}
