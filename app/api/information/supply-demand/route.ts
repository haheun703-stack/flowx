import { getSupabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { safeString } from '@/shared/lib/safeJson'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const tier = searchParams.get('tier') ?? 'FREE'
  const days = Math.min(Number(searchParams.get('days')) || 1, 30)

  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('intelligence_supply_demand')
      .select('*')
      .order('date', { ascending: false })
      .limit(days)

    if (error) {
      console.error('[supply-demand] DB error:', error.message)
      return NextResponse.json({ error: '수급 데이터 조회 오류' }, { status: 500 })
    }
    if (!data?.length) return NextResponse.json({ error: 'No data' }, { status: 404 })

    // 봇 컬럼명 → 프론트엔드 타입 매핑
    const mapRow = (row: Record<string, unknown>) => ({
      id: row.id,
      date: row.date,
      foreign_net: row.foreign_net ?? 0,
      inst_net: row.inst_net ?? row.institution_net ?? 0,
      individual_net: row.individual_net ?? 0,
      foreign_streak: typeof row.foreign_streak === 'number' ? row.foreign_streak : 0,
      inst_streak: typeof row.inst_streak === 'number' ? row.inst_streak : 0,
      foreign_trend: typeof row.foreign_trend === 'string' ? row.foreign_trend : null,
      inst_trend: typeof row.institution_trend === 'string' ? row.institution_trend : null,
      sector_flows: tier === 'FREE' ? [] : (Array.isArray(row.sector_flows) ? row.sector_flows : []),
      summary: safeString(row.summary),
    })

    // 1일만 요청 → 기존 호환 (single object)
    if (days === 1) {
      return NextResponse.json(mapRow(data[0] as Record<string, unknown>))
    }

    // 여러 날 → 배열 반환 (최신→오래된 순)
    return NextResponse.json({
      items: data.map(r => mapRow(r as Record<string, unknown>)),
      count: data.length,
    })
  } catch {
    return NextResponse.json({ error: 'Supply-demand unavailable' }, { status: 503 })
  }
}
