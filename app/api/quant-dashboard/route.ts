import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { readJsonFile } from '@/shared/lib/dataReader'

export const dynamic = 'force-dynamic'

const SUPABASE_TIMEOUT = 8_000

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

function isValidDashboard(s: unknown): s is DashboardState {
  if (!s || typeof s !== 'object') return false
  const o = s as Record<string, unknown>
  return 'zone1' in o && 'zone2' in o && 'zone3' in o && 'zone4' in o && 'zone5' in o && 'zone6' in o
}

export async function GET() {
  try {
    // 1차: Supabase quant_dashboard_state 테이블에서 최신 데이터 (타임아웃 적용)
    const supabase = getSupabaseAdmin()
    const { data } = await Promise.race([
      supabase
        .from('quant_dashboard_state')
        .select('state')
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase timeout')), SUPABASE_TIMEOUT)
      ),
    ])

    if (data?.state && isValidDashboard(data.state)) {
      return NextResponse.json(data.state)
    }

    // 2차: 로컬 JSON 폴백
    const local = readJsonFile<DashboardState>('dashboard_state.json')
    if (local && isValidDashboard(local)) return NextResponse.json(local)

    return NextResponse.json({ error: 'No dashboard data' }, { status: 404 })
  } catch (err) {
    console.error('quant-dashboard error:', err)
    // 최종 폴백: 로컬 파일
    try {
      const local = readJsonFile<DashboardState>('dashboard_state.json')
      if (local && isValidDashboard(local)) return NextResponse.json(local)
    } catch { /* ignore */ }

    return NextResponse.json({ error: 'Dashboard unavailable' }, { status: 503 })
  }
}
