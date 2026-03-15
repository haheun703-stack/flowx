import { NextResponse } from 'next/server'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { getKISToken } from '@/shared/lib/kisAuth'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  KOREAN_STOCKS,
  fetchKISIndex,
  fetchKISPrice,
  fetchInvestorTrend,
  fetchSectorPrices,
} from '@/features/market-ticker/api/fetchKoreanTickers'

export const dynamic = 'force-dynamic'

const CACHE_DIR = path.resolve(process.cwd(), '.cache')
const CACHE_FILE = path.join(CACHE_DIR, 'market-snapshot.json')

function saveToFile(snapshot: Record<string, unknown>) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(CACHE_FILE, JSON.stringify(snapshot), 'utf-8')
  } catch { /* ignore */ }
}

export async function GET(req: Request) {
  // 인증: Vercel Cron 또는 외부 cron 서비스
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const token = await getKISToken()

    // 1. 지수 + 종목 현재가 병렬 조회
    const [kospi, kosdaq, ...stockResults] = await Promise.all([
      fetchKISIndex('0001', token),
      fetchKISIndex('1001', token),
      ...KOREAN_STOCKS.map(s => fetchKISPrice(s.code, token)),
    ])

    const stocks = KOREAN_STOCKS.map((s, i) => ({
      code: s.code,
      name: s.name,
      price: stockResults[i].price,
      change: stockResults[i].change,
      changePercent: stockResults[i].changePercent,
      volume: stockResults[i].volume,
    }))

    // 2. 투자자 매매동향 + 업종 등락률 병렬 조회
    const [foreignInst, sectors] = await Promise.all([
      fetchInvestorTrend(token),
      fetchSectorPrices(token),
    ])

    const snapshot = {
      id: 'latest',
      kospi_price: kospi.price,
      kospi_change: kospi.changePercent,
      kosdaq_price: kosdaq.price,
      kosdaq_change: kosdaq.changePercent,
      stocks,
      foreign_inst: foreignInst,
      sectors,
      updated_at: new Date().toISOString(),
    }

    // 3. 파일 캐시 저장 (항상)
    saveToFile(snapshot)

    // 4. Supabase에 upsert (테이블 존재 시)
    let supabaseOk = false
    try {
      const supabase = getSupabaseAdmin()
      const { error } = await supabase.from('market_snapshots').upsert(snapshot)
      if (!error) supabaseOk = true
      else console.warn('Supabase upsert skipped:', error.message)
    } catch { /* Supabase 테이블 미생성 시 무시 */ }

    return NextResponse.json({
      ok: true,
      supabase: supabaseOk,
      updated_at: snapshot.updated_at,
      kospi: kospi.price,
      kosdaq: kosdaq.price,
      stocks_count: stocks.length,
      stocks: stocks.map(s => `${s.name} ${s.price.toLocaleString()} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent}%)`),
      foreign_inst: foreignInst,
      sectors_count: sectors.length,
      sectors: sectors.slice(0, 5),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('cron/update-market error:', msg)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
