// 정보봇 — 오늘의 한 줄 판정 생성
// 2026-04-20 업그레이드:
//   [P0] Supabase 데이터 컨텍스트 주입 (시장개요/공포탐욕/세력/섹터)
//   [P0] 생성-검증 2단계 파이프라인
//   [P1] Sonnet + Opus Advisor 패턴 적용

import { getSupabaseAdmin } from '@/lib/supabase'
import { callClaudeWithAdvisor, callClaudeVerify } from '@/shared/lib/ai-clients'
import { todayKST } from '@/shared/lib/cron-auth'

export async function generateBriefing(): Promise<{ ok: boolean; verdict: string }> {
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // [업그레이드 3] 풍부한 Supabase 컨텍스트 수집
  const [supplyRes, scenarioRes, macroRes, overviewRes, fearGreedRes, newsRes, rotationRes, smartMoneyRes] =
    await Promise.all([
      supabase.from('intelligence_supply_demand').select('*').eq('date', date).limit(1).maybeSingle(),
      supabase.from('intelligence_scenarios').select('*').eq('date', date).order('rank'),
      supabase.from('macro_data').select('vix').eq('date', date).limit(1).maybeSingle(),
      // 정보봇이 올린 추가 데이터
      supabase.from('market_overview').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('market_fear_greed').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('intelligence_news').select('title, summary, impact').eq('date', date).order('created_at', { ascending: false }).limit(5),
      supabase.from('sector_rotation').select('*').order('date', { ascending: false }).limit(5),
      supabase.from('dashboard_smart_money').select('*').order('date', { ascending: false }).order('score', { ascending: false }).limit(5),
    ])

  const supply = supplyRes.data
  const scenarios = scenarioRes.data ?? []
  const vix = macroRes.data?.vix
  const overview = overviewRes.data
  const fearGreed = fearGreedRes.data
  const news = newsRes.data ?? []
  const rotation = rotationRes.data ?? []
  const smartMoney = smartMoneyRes.data ?? []

  const contextParts: string[] = []

  // 기존 데이터
  if (supply) {
    contextParts.push(`수급: 외국인 ${supply.foreign_net?.toLocaleString()}, 기관 ${supply.inst_net?.toLocaleString()}, ${supply.summary}`)
  }
  if (scenarios.length > 0) {
    contextParts.push(`시나리오: ${scenarios.map((s: { scenario_label: string; probability: number }) => `${s.scenario_label}(${s.probability}%)`).join(', ')}`)
  }
  if (vix) contextParts.push(`VIX: ${vix.price} (${vix.change > 0 ? '+' : ''}${vix.change}%)`)

  // [업그레이드 3] 정보봇 수집 데이터 추가
  if (overview) contextParts.push(`시장 개요: ${JSON.stringify(overview)}`)
  if (fearGreed) contextParts.push(`공포/탐욕: ${fearGreed.label ?? ''}(${fearGreed.score ?? '-'}점)`)
  if (news.length > 0) {
    contextParts.push(`주요 뉴스:\n${news.map((n: { title: string; summary?: string }) => `- ${n.title}${n.summary ? ` (${n.summary})` : ''}`).join('\n')}`)
  }
  if (rotation.length > 0) {
    contextParts.push(`섹터 로테이션: ${rotation.map((r: { sector?: string; change_pct?: number }) => `${r.sector ?? '?'}(${r.change_pct ?? 0}%)`).join(', ')}`)
  }
  if (smartMoney.length > 0) {
    contextParts.push(`세력 포착: ${smartMoney.map((s: { name?: string; score?: number }) => `${s.name ?? '?'}(${s.score ?? 0}점)`).join(', ')}`)
  }

  const context = contextParts.filter(Boolean).join('\n')

  const systemPrompt = `당신은 한국 주식시장 전문 애널리스트입니다.
주어진 데이터를 종합하여 "오늘의 한 줄 판정"을 작성하세요.
형식: {"verdict":"한줄판정문장","sentiment":"BULLISH|BEARISH|NEUTRAL","confidence":1~5}
JSON만 출력하세요.
verdict는 구체적 수치와 근거를 포함해야 합니다.`

  // [업그레이드 2] Advisor 지시
  const advisorInstruction = `한 줄 판정을 내리기 전에 advisor에게 검증받으세요:
- 판정이 오늘 실제 시장 데이터와 일치하는지
- 반대 의견의 근거는 무엇인지
- 판정의 확신도(1-5)는 적절한지
advisor는 50단어 이내로만 응답하세요.`

  const userMessage = `날짜: ${date}\n\n=== 시장 데이터 (정보봇 수집) ===\n${context || '데이터 없음'}`

  // 1단계: Sonnet + Opus Advisor로 생성
  const raw = await callClaudeWithAdvisor(systemPrompt, userMessage, advisorInstruction, 512)

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

  // [업그레이드 4] 2단계: 품질 검증
  const verification = await callClaudeVerify(
    JSON.stringify({ verdict, sentiment, confidence }),
    `다음 시장 판정의 품질을 검증하세요.

검증 기준:
1. 판정이 구체적 수치/근거를 포함하는가?
2. sentiment가 verdict 내용과 일치하는가?
3. confidence가 데이터 양/질에 비례하는가?

결과: {"pass": true/false, "issues": ["이슈1", ...], "score": 1-10}`,
  )
  console.log(`[브리핑 검증] pass=${verification.pass}, score=${verification.score}`)

  if (!verification.pass && verification.issues.length > 0) {
    // FAIL → 이슈 포함해서 1회 재생성
    const retryMessage = `${userMessage}\n\n이전 판정에서 발견된 문제:\n${verification.issues.join('\n')}\n\n위 문제를 반영하여 다시 작성하세요.`
    const retryRaw = await callClaudeWithAdvisor(systemPrompt, retryMessage, advisorInstruction, 512)
    try {
      const match = retryRaw.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        verdict = parsed.verdict ?? verdict
        sentiment = parsed.sentiment ?? sentiment
        confidence = parsed.confidence ?? confidence
        console.log('[브리핑] 재생성 성공')
      }
    } catch {
      console.log('[브리핑] 재생성 파싱 실패, 1차 결과 사용')
    }
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
