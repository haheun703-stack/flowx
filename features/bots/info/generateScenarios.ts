// 정보봇 — AI 시나리오 생성
// 2026-04-20 업그레이드:
//   [P0] Supabase 데이터 컨텍스트 주입 (시장개요/공포탐욕/뉴스/섹터/세력)
//   [P0] 생성-검증 2단계 파이프라인 (FAIL 시 1회 재생성)
//   [P1] Sonnet + Opus Advisor 패턴 적용

import { getSupabaseAdmin } from '@/lib/supabase'
import { callClaudeWithAdvisor, callClaudeVerify } from '@/shared/lib/ai-clients'
import { todayKST } from '@/shared/lib/cron-auth'

interface Scenario {
  label: string
  probability: number
  rationale: string
}

const FALLBACK_SCENARIOS: Scenario[] = [
  { label: '상승', probability: 33, rationale: 'AI 분석 오류 — 기본값' },
  { label: '횡보', probability: 34, rationale: 'AI 분석 오류 — 기본값' },
  { label: '하락', probability: 33, rationale: 'AI 분석 오류 — 기본값' },
]

// ── Supabase 데이터 컨텍스트 수집 ──
async function collectMarketContext(date: string): Promise<string> {
  const supabase = getSupabaseAdmin()

  const [supplyRes, newsRes, macroRes, overviewRes, fearGreedRes, rotationRes, smartMoneyRes] =
    await Promise.all([
      supabase.from('intelligence_supply_demand').select('*').eq('date', date).limit(1).maybeSingle(),
      supabase.from('intelligence_news').select('title, category, summary').eq('date', date).order('created_at', { ascending: false }).limit(10),
      supabase.from('macro_data').select('*').eq('date', date).limit(1).maybeSingle(),
      // [업그레이드 3] 정보봇이 올린 추가 데이터
      supabase.from('market_overview').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('market_fear_greed').select('*').order('date', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('sector_rotation').select('*').order('date', { ascending: false }).limit(5),
      supabase.from('dashboard_smart_money').select('*').order('date', { ascending: false }).order('score', { ascending: false }).limit(5),
    ])

  const supply = supplyRes.data
  const news = newsRes.data ?? []
  const macro = macroRes.data
  const overview = overviewRes.data
  const fearGreed = fearGreedRes.data
  const rotation = rotationRes.data ?? []
  const smartMoney = smartMoneyRes.data ?? []

  const parts: string[] = []

  // 기존 데이터
  if (supply) {
    parts.push(`수급: 외국인 ${supply.foreign_net > 0 ? '+' : ''}${supply.foreign_net}, 기관 ${supply.inst_net > 0 ? '+' : ''}${supply.inst_net}`)
  }
  if (macro?.vix) parts.push(`VIX: ${macro.vix.price}`)
  if (news.length > 0) {
    parts.push(`주요뉴스:\n${news.slice(0, 5).map((n: { title: string; summary?: string }) => `- ${n.title}${n.summary ? ` (${n.summary})` : ''}`).join('\n')}`)
  }

  // [업그레이드 3] 정보봇 수집 데이터 추가
  if (overview) {
    parts.push(`시장 개요: ${JSON.stringify(overview)}`)
  }
  if (fearGreed) {
    parts.push(`공포/탐욕 지수: ${fearGreed.label ?? ''}(${fearGreed.score ?? '-'}점)`)
  }
  if (rotation.length > 0) {
    parts.push(`섹터 로테이션 상위: ${rotation.map((r: { sector?: string; change_pct?: number }) => `${r.sector ?? '?'}(${r.change_pct ?? 0}%)`).join(', ')}`)
  }
  if (smartMoney.length > 0) {
    parts.push(`세력 포착 상위: ${smartMoney.map((s: { name?: string; score?: number }) => `${s.name ?? '?'}(${s.score ?? 0}점)`).join(', ')}`)
  }

  return parts.filter(Boolean).join('\n')
}

// ── 시나리오 JSON 파싱 ──
function parseScenarios(raw: string): Scenario[] | null {
  try {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) {
      const parsed = JSON.parse(match[0]) as Scenario[]
      if (Array.isArray(parsed) && parsed.length >= 2) return parsed
    }
  } catch { /* 파싱 실패 */ }
  return null
}

// ── 검증 프롬프트 ──
const VERIFY_PROMPT = `다음 시장 시나리오의 품질을 검증하세요.

검증 기준:
1. 수치가 구체적인가? (X: "상승 예상" → O: "2-3% 상승 예상")
2. 근거가 있는가? (X: "좋아질 것" → O: "FOMC 동결 기대감으로")
3. 시나리오 간 확률 합이 100%인가?
4. 한국 시장 특수 요인이 반영되었는가?
5. 실행 가능한 액션이 포함되었는가?

결과: {"pass": true/false, "issues": ["이슈1", ...], "score": 1-10}`

// ── 메인 함수 ──
export async function generateScenarios(): Promise<{ ok: boolean; count: number }> {
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // [업그레이드 3] 풍부한 Supabase 컨텍스트 수집
  const context = await collectMarketContext(date)

  const systemPrompt = `당신은 한국 주식시장 전문 애널리스트입니다.
주어진 시장 데이터를 분석하여 내일 시장 시나리오 3가지를 JSON으로 제시하세요.
반드시 아래 JSON 형식만 출력하세요 (설명 텍스트 없이):
[{"label":"상승","probability":40,"rationale":"근거"},{"label":"횡보","probability":35,"rationale":"근거"},{"label":"하락","probability":25,"rationale":"근거"}]
확률 합계는 100이어야 합니다.
rationale에는 반드시 구체적 수치와 근거를 포함하세요.`

  // [업그레이드 1] Advisor 지시
  const advisorInstruction = `시나리오를 작성하기 전에 advisor에게 다음을 검증받으세요:
- 확률 배분의 논리적 근거가 충분한지
- 빠뜨린 리스크 시나리오가 없는지
- 한국 시장 특수 요인이 반영되었는지
advisor는 100단어 이내, 열거 형태로만 응답하세요.`

  const userMessage = `오늘 날짜: ${date}\n\n=== 시장 데이터 (정보봇 수집) ===\n${context || '데이터 없음'}`

  // 1단계: Sonnet + Opus Advisor로 생성
  const raw = await callClaudeWithAdvisor(systemPrompt, userMessage, advisorInstruction, 2048)
  let scenarios = parseScenarios(raw)

  if (!scenarios) {
    scenarios = FALLBACK_SCENARIOS
  } else {
    // [업그레이드 4] 2단계: 품질 검증
    const verification = await callClaudeVerify(JSON.stringify(scenarios), VERIFY_PROMPT)
    console.log(`[시나리오 검증] pass=${verification.pass}, score=${verification.score}, issues=${verification.issues.length}`)

    if (!verification.pass && verification.issues.length > 0) {
      // FAIL → 이슈 포함해서 1회 재생성
      const retryMessage = `${userMessage}\n\n이전 생성 결과에서 다음 문제가 발견되었습니다:\n${verification.issues.join('\n')}\n\n위 문제를 반영하여 다시 작성하세요.`
      const retryRaw = await callClaudeWithAdvisor(systemPrompt, retryMessage, advisorInstruction, 2048)
      const retryScenarios = parseScenarios(retryRaw)
      if (retryScenarios) {
        scenarios = retryScenarios
        console.log('[시나리오] 재생성 성공')
      } else {
        console.log('[시나리오] 재생성 파싱 실패, 1차 결과 사용')
      }
    }
  }

  // Supabase 저장
  const rows = scenarios.map((s, i) => ({
    date,
    session: 'PM',
    scenario_label: s.label,
    probability: s.probability,
    rationale: s.rationale,
    rank: i + 1,
    created_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('intelligence_scenarios').insert(rows)
  if (error) throw new Error(`scenarios insert: ${error.message}`)
  await supabase.from('intelligence_scenarios').delete().eq('date', date).eq('session', 'PM').lt('created_at', rows[0].created_at)

  return { ok: true, count: rows.length }
}
