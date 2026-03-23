// 정보봇 — 오늘의 한 줄 판정 생성
// 수급+매크로+시나리오 종합 → Claude → intelligence_briefing

import { getSupabaseAdmin } from '@/lib/supabase'
import { callClaude } from '@/shared/lib/ai-clients'
import { todayKST } from '@/shared/lib/cron-auth'

export async function generateBriefing(): Promise<{ ok: boolean; verdict: string }> {
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // 오늘 데이터 가져오기
  const [supplyRes, scenarioRes, macroRes] = await Promise.all([
    supabase.from('intelligence_supply_demand').select('*').eq('date', date).limit(1).single(),
    supabase.from('intelligence_scenarios').select('*').eq('date', date).order('rank'),
    supabase.from('macro_data').select('vix').eq('date', date).limit(1).single(),
  ])

  const supply = supplyRes.data
  const scenarios = scenarioRes.data ?? []
  const vix = macroRes.data?.vix

  const context = [
    supply ? `수급: 외국인 ${supply.foreign_net?.toLocaleString()}, 기관 ${supply.inst_net?.toLocaleString()}, ${supply.summary}` : '',
    scenarios.length > 0
      ? `시나리오: ${scenarios.map((s: { scenario_label: string; probability: number }) => `${s.scenario_label}(${s.probability}%)`).join(', ')}`
      : '',
    vix ? `VIX: ${vix.price} (${vix.change > 0 ? '+' : ''}${vix.change}%)` : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = `당신은 한국 주식시장 전문 애널리스트입니다.
주어진 데이터를 종합하여 "오늘의 한 줄 판정"을 작성하세요.
형식: {"verdict":"한줄판정문장","sentiment":"BULLISH|BEARISH|NEUTRAL","confidence":1~5}
JSON만 출력하세요.`

  const raw = await callClaude(systemPrompt, `날짜: ${date}\n${context}`, 256)

  let verdict = '시장 데이터 분석 중...'
  let sentiment = 'NEUTRAL'
  let confidence = 3

  try {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      verdict = parsed.verdict ?? verdict
      sentiment = parsed.sentiment ?? sentiment
      confidence = parsed.confidence ?? confidence
    }
  } catch {
    // 파싱 실패 시 기본값 유지
  }

  // Supabase 저장
  const { error } = await supabase.from('intelligence_briefing').upsert({
    id: `briefing-${date}`,
    date,
    verdict,
    sentiment,
    confidence,
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(`briefing upsert: ${error.message}`)

  return { ok: true, verdict }
}
