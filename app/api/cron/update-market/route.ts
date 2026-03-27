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
import { botTimer, checkEnvVars } from '@/shared/lib/botLogger'

export const dynamic = 'force-dynamic'

const CACHE_DIR = '/tmp/.cache'
const CACHE_FILE = path.join(CACHE_DIR, 'market-snapshot.json')

function saveToFile(snapshot: Record<string, unknown>) {
  try {
    mkdirSync(CACHE_DIR, { recursive: true })
    writeFileSync(CACHE_FILE, JSON.stringify(snapshot), 'utf-8')
  } catch { /* Vercel serverless에서 /tmp 외 쓰기 불가 시 무시 */ }
}

export async function GET(req: Request) {
  const timer = botTimer('update-market')

  // 인증: Vercel Cron 또는 외부 cron 서비스
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    await timer.end('error', { error: 'Unauthorized — CRON_SECRET 불일치 또는 미설정' })
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 환경변수 사전 검증
  const missing = checkEnvVars()
  if (missing.length > 0) {
    const msg = `환경변수 누락: ${missing.join(', ')}`
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
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

    // 1-1. 전체 가격이 0이면 API 장애 — 기존 데이터 보호
    const validStocks = stocks.filter(s => s.price > 0)
    if (validStocks.length === 0 && kospi.price === 0) {
      await timer.end('error', { error: 'All prices returned 0 — KIS API 장애 의심' })
      return NextResponse.json({ ok: false, error: 'All prices returned 0, skipping save to protect existing data' }, { status: 502 })
    }

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

    const result = {
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
    }

    await timer.end('ok', { summary: { kospi: kospi.price, kosdaq: kosdaq.price, stocks: stocks.length, supabase: supabaseOk } })
    return NextResponse.json(result)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    await timer.end('error', { error: msg })
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
