// 정보봇 — AI 시나리오 생성
// 수급+매크로+뉴스 기반 Claude 시나리오 확률 생성

import { getSupabaseAdmin } from '@/lib/supabase'
import { callClaude } from '@/shared/lib/ai-clients'
import { todayKST } from '@/shared/lib/cron-auth'

interface Scenario {
  label: string
  probability: number
  rationale: string
}

export async function generateScenarios(): Promise<{ ok: boolean; count: number }> {
  const supabase = getSupabaseAdmin()
  const date = todayKST()

  // 오늘 수집된 데이터 가져오기
  const [supplyRes, newsRes, macroRes] = await Promise.all([
    supabase.from('intelligence_supply_demand').select('*').eq('date', date).limit(1).single(),
    supabase.from('intelligence_news').select('title, category').eq('date', date).limit(20),
    supabase.from('macro_data').select('*').eq('date', date).limit(1).single(),
  ])

  const supply = supplyRes.data
  const news = newsRes.data ?? []
  const macro = macroRes.data

  const context = [
    supply ? `수급: 외국인 ${supply.foreign_net > 0 ? '+' : ''}${supply.foreign_net}, 기관 ${supply.inst_net > 0 ? '+' : ''}${supply.inst_net}` : '수급: 데이터 없음',
    macro?.vix ? `VIX: ${macro.vix.price}` : '',
    news.length > 0 ? `주요뉴스: ${news.slice(0, 5).map((n: { title: string }) => n.title).join(' / ')}` : '',
  ].filter(Boolean).join('\n')

  const systemPrompt = `당신은 한국 주식시장 전문 애널리스트입니다.
주어진 시장 데이터를 분석하여 내일 시장 시나리오 3가지를 JSON으로 제시하세요.
반드시 아래 JSON 형식만 출력하세요 (설명 텍스트 없이):
[{"label":"상승","probability":40,"rationale":"근거"},{"label":"횡보","probability":35,"rationale":"근거"},{"label":"하락","probability":25,"rationale":"근거"}]
확률 합계는 100이어야 합니다.`

  const raw = await callClaude(systemPrompt, `오늘 날짜: ${date}\n${context}`, 512)

  // JSON 파싱
  let scenarios: Scenario[] = []
  try {
    const match = raw.match(/\[[\s\S]*\]/)
    if (match) scenarios = JSON.parse(match[0])
  } catch {
    scenarios = [
      { label: '상승', probability: 33, rationale: 'AI 분석 오류 — 기본값' },
      { label: '횡보', probability: 34, rationale: 'AI 분석 오류 — 기본값' },
      { label: '하락', probability: 33, rationale: 'AI 분석 오류 — 기본값' },
    ]
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

  // 기존 오늘 데이터 삭제 후 삽입
  await supabase.from('intelligence_scenarios').delete().eq('date', date).eq('session', 'PM')
  const { error } = await supabase.from('intelligence_scenarios').insert(rows)
  if (error) throw new Error(`scenarios insert: ${error.message}`)

  return { ok: true, count: rows.length }
}
