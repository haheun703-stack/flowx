import { SectorData } from '../types'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * 섹터 히트맵 데이터 — Supabase sector_rotation 테이블
 * 최신 날짜의 섹터별 5일 수익률을 히트맵 기준으로 사용
 */
export async function fetchSectorHeatmap(): Promise<SectorData[]> {
  try {
    const sb = getSupabaseAdmin()

    // 최신 날짜 조회
    const { data: latest } = await sb
      .from('sector_rotation')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    if (!latest) return []

    const { data, error } = await sb
      .from('sector_rotation')
      .select('*')
      .eq('date', latest.date)
      .order('rank')

    if (error || !data) return []

    return data
      .filter((s: Record<string, unknown>) => (s.category ?? 'sector') === 'sector')
      .slice(0, 9)
      .map((s: Record<string, unknown>) => ({
        name: (s.sector ?? '') as string,
        changePercent: Number(s.ret_5d ?? 0),
        count: 0,
      }))
  } catch {
    return []
  }
}
