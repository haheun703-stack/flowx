import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { readJsonFile } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

interface DashboardState {
  generated_at: string
  zone1: Record<string, unknown>
  zone2: Record<string, unknown>[]
  zone3: Record<string, unknown>
  zone4: Record<string, unknown>[]
  zone5: Record<string, unknown>
  zone6: Record<string, unknown>
  zone7?: Record<string, unknown>[]
}

export async function GET() {
  try {
    // 1차: Supabase quant_dashboard_state 테이블에서 최신 데이터
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from('quant_dashboard_state')
      .select('state')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (data?.state) {
      return NextResponse.json(data.state)
    }

    // 2차: 로컬 JSON 폴백
    const local = readJsonFile<DashboardState>('dashboard_state.json')
    if (local) return NextResponse.json(local)

    return NextResponse.json({ error: 'No dashboard data' }, { status: 404 })
  } catch {
    // 최종 폴백: public/data 파일
    try {
      const local = readJsonFile<DashboardState>('dashboard_state.json')
      if (local) return NextResponse.json(local)
    } catch { /* ignore */ }

    return NextResponse.json({ error: 'Dashboard unavailable' }, { status: 503 })
  }
}
