import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const CACHE_FILE = path.resolve(process.cwd(), '.cache', 'market-snapshot.json')

export async function GET() {
  // 1. Supabase에서 읽기 시도
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase
      .from('market_snapshots')
      .select('*')
      .eq('id', 'latest')
      .single()

    if (!error && data) {
      return NextResponse.json(data)
    }
  } catch { /* Supabase 실패 시 파일 fallback */ }

  // 2. 파일 캐시 fallback
  try {
    const raw = readFileSync(CACHE_FILE, 'utf-8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: 'No snapshot available' }, { status: 404 })
  }
}
