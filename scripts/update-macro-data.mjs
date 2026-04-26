#!/usr/bin/env node
/**
 * 거시경제 대시보드 자동 업데이트 스크립트
 *
 * 데이터 소스:
 *   - Yahoo Finance API (무료, API 키 불필요): 주가지수, 환율, 원유
 *   - FRED API (무료, API 키 필요): Fed 금리, CPI
 *
 * 사용법:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_KEY=xxx node scripts/update-macro-data.mjs
 *   또는: .env.local에 설정 후 실행
 *
 * 스케줄 (정보봇 또는 cron):
 *   0 7 * * 1-5  (매 평일 07:00 KST — 미국 장 마감 후)
 *
 * 출력: macro_dashboard 테이블에 당일 JSONB 업서트
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/* ── 환경 변수 로드 ── */
function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const lines = readFileSync(envPath, 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx < 0) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const val = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch { /* .env.local 없으면 환경변수에서 읽기 */ }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const FRED_API_KEY = process.env.FRED_API_KEY // 선택: https://fred.stlouisfed.org/docs/api/api_key.html

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL / SUPABASE_SERVICE_KEY 환경변수 필요')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/* ── Yahoo Finance 헬퍼 ── */
async function yahooQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (FLOWX-Macro-Bot/1.0)' },
    })
    if (!res.ok) throw new Error(`Yahoo ${symbol}: ${res.status}`)
    const json = await res.json()
    const meta = json.chart?.result?.[0]?.meta
    return {
      price: meta?.regularMarketPrice ?? null,
      prevClose: meta?.chartPreviousClose ?? null,
      currency: meta?.currency ?? null,
    }
  } catch (e) {
    console.warn(`⚠️ Yahoo ${symbol} 실패:`, e.message)
    return { price: null, prevClose: null, currency: null }
  }
}

async function yahooYtdReturn(symbol) {
  // 1y 범위에서 연초 가격 추출
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1mo`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (FLOWX-Macro-Bot/1.0)' },
    })
    if (!res.ok) return null
    const json = await res.json()
    const result = json.chart?.result?.[0]
    const closes = result?.indicators?.quote?.[0]?.close
    const meta = result?.meta
    if (!closes || !meta?.regularMarketPrice) return null
    const janClose = closes[0] // 연초 종가
    const now = meta.regularMarketPrice
    if (!janClose) return null
    return Number((((now - janClose) / janClose) * 100).toFixed(1))
  } catch {
    return null
  }
}

/* ── FRED API 헬퍼 ── */
async function fredLatest(seriesId) {
  if (!FRED_API_KEY) return null
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&sort_order=desc&limit=1&api_key=${FRED_API_KEY}&file_type=json`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const val = json.observations?.[0]?.value
    return val && val !== '.' ? parseFloat(val) : null
  } catch {
    return null
  }
}

/* ── 데이터 수집 ── */
async function collectData() {
  console.log('📊 거시경제 데이터 수집 시작...')

  // 병렬 fetch
  const [
    sp500, usdKrw, usdJpy, wti, brent,
    sp500Ytd,
    fredFundsRate, fredCpi,
  ] = await Promise.all([
    yahooQuote('^GSPC'),          // S&P 500
    yahooQuote('KRW=X'),          // USD/KRW
    yahooQuote('JPY=X'),          // USD/JPY
    yahooQuote('CL=F'),           // WTI 원유
    yahooQuote('BZ=F'),           // 브렌트 원유
    yahooYtdReturn('^GSPC'),      // S&P 500 YTD 수익률
    fredLatest('FEDFUNDS'),       // Fed Funds Rate
    fredLatest('CPIAUCSL'),       // US CPI (index, not YoY%)
  ])

  const today = new Date().toISOString().slice(0, 10)

  const data = {
    // ── 시장 ──
    market: {
      sp500_price: sp500.price,
      sp500_ytd_pct: sp500Ytd,
      // Mag-7 개별 수익률은 어닝시즌 수동 입력 또는 별도 로직 필요
    },

    // ── 환율 ──
    fx: {
      usd_krw: usdKrw.price ? Math.round(usdKrw.price) : null,
      usd_jpy: usdJpy.price ? Number(usdJpy.price.toFixed(2)) : null,
    },

    // ── 원유 ──
    energy: {
      wti: wti.price ? Number(wti.price.toFixed(2)) : null,
      brent: brent.price ? Number(brent.price.toFixed(2)) : null,
    },

    // ── 금리 (FRED) ──
    rates: {
      fed_funds: fredFundsRate,
      // BOK 기준금리는 한국은행 API 또는 수동 입력
      bok_base: null,
    },

    // ── CPI (FRED — index값, YoY% 계산은 12개월 전 대비 필요) ──
    inflation: {
      us_cpi_index: fredCpi,
      // YoY%는 12개월 전 데이터도 필요하므로 별도 로직
    },

    // ── 메타 ──
    _meta: {
      collected_at: new Date().toISOString(),
      sources: ['Yahoo Finance', FRED_API_KEY ? 'FRED' : null].filter(Boolean),
    },
  }

  console.log('✅ 수집 완료:', JSON.stringify(data, null, 2))
  return { date: today, data }
}

/* ── Supabase 업서트 ── */
async function upsert(row) {
  const { error } = await supabase
    .from('macro_dashboard')
    .upsert(row, { onConflict: 'date' })

  if (error) {
    console.error('❌ Supabase 업서트 실패:', error.message)
    process.exit(1)
  }
  console.log(`✅ macro_dashboard 업서트 완료: ${row.date}`)
}

/* ── 메인 ── */
async function main() {
  const row = await collectData()
  await upsert(row)
  console.log('🏁 거시경제 데이터 업데이트 완료')
}

main().catch(e => {
  console.error('❌ 실행 오류:', e)
  process.exit(1)
})
