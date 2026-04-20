// AI 업그레이드 5종 검증 스크립트
// 실행: node scripts/test-ai-upgrade.mjs

import { readFileSync } from 'fs'

// .env.local 수동 파싱 (dotenv 미설치)
try {
  const envContent = readFileSync('.env.local', 'utf-8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch { /* .env.local 없으면 무시 */ }

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const PERPLEXITY_KEY = process.env.PERPLEXITY_API_KEY

if (!ANTHROPIC_KEY) { console.log('FAIL: ANTHROPIC_API_KEY 없음'); process.exit(1) }
console.log('API키 확인: OK (' + ANTHROPIC_KEY.slice(0, 12) + '...)')
console.log('Perplexity키:', PERPLEXITY_KEY ? 'OK' : '없음')
console.log('')

// ── 1. Sonnet 4.6 기본 호출 ──
async function testSonnet() {
  console.log('=== 1. callClaude (Sonnet 4.6) ===')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 64,
      system: 'JSON으로만 응답하세요.',
      messages: [{ role: 'user', content: '한국 KOSPI 지수가 보통 몇 포인트대인지 알려줘. {"range":"숫자~숫자"}' }],
    }),
  })
  const json = await res.json()
  if (res.ok) {
    console.log('응답:', json.content?.[0]?.text)
    console.log('결과: PASS')
  } else {
    console.log('FAIL:', res.status, JSON.stringify(json).slice(0, 300))
  }
}

// ── 2. Advisor 패턴 (Sonnet + Opus) ──
async function testAdvisor() {
  console.log('\n=== 2. callClaudeWithAdvisor (Sonnet + Opus Advisor) ===')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'advisor-tool-2026-03-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `한국 주식시장 전문가입니다.
시나리오를 작성하기 전에 advisor에게 논리적 근거가 충분한지 검증받으세요.
advisor는 50단어 이내로 응답하세요.
최종 응답은 JSON으로만: [{"label":"상승","probability":숫자,"rationale":"근거"}]`,
      messages: [{ role: 'user', content: '오늘 2026-04-20 시장 시나리오 3가지를 제시하세요. 확률 합계 100.' }],
      tools: [{
        type: 'advisor_20260301',
        name: 'advisor',
        model: 'claude-opus-4-7',
        max_uses: 1,
      }],
    }),
  })
  const json = await res.json()
  if (res.ok) {
    const contentTypes = json.content?.map(b => b.type) ?? []
    const texts = json.content?.filter(b => b.type === 'text')?.map(b => b.text)?.join('') ?? ''
    const advisorUsed = contentTypes.includes('server_tool_use')
    console.log('content types:', contentTypes.join(', '))
    console.log('Advisor 호출:', advisorUsed ? 'YES' : 'NO')
    console.log('텍스트 응답:', texts.slice(0, 300))
    console.log('결과:', advisorUsed ? 'PASS (Advisor 작동 확인)' : 'WARN (Advisor 미호출, Sonnet 단독)')
  } else {
    console.log('FAIL:', res.status, JSON.stringify(json).slice(0, 300))
  }
}

// ── 3. 검증 파이프라인 (callClaudeVerify 시뮬레이션) ──
async function testVerify() {
  console.log('\n=== 3. 검증 파이프라인 (callClaudeVerify) ===')
  const testScenario = JSON.stringify([
    { label: '상승', probability: 45, rationale: '외국인 순매수 전환 기대' },
    { label: '횡보', probability: 35, rationale: '실적 시즌 관망' },
    { label: '하락', probability: 20, rationale: '미중 무역갈등 리스크' },
  ])

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: '당신은 품질 검증 전문가입니다. JSON으로만 응답하세요.',
      messages: [{
        role: 'user',
        content: `다음 시장 시나리오의 품질을 검증하세요.

검증 기준:
1. 수치가 구체적인가?
2. 근거가 있는가?
3. 확률 합이 100%인가?
4. 한국 시장 특수 요인이 반영되었는가?

결과: {"pass": true/false, "issues": ["이슈1", ...], "score": 1-10}

검증 대상:
${testScenario}`,
      }],
    }),
  })
  const json = await res.json()
  if (res.ok) {
    const text = json.content?.[0]?.text ?? ''
    console.log('검증 응답:', text.slice(0, 300))
    try {
      const match = text.match(/\{[\s\S]*\}/)
      if (match) {
        const parsed = JSON.parse(match[0])
        console.log('pass:', parsed.pass, '| score:', parsed.score, '| issues:', parsed.issues?.length ?? 0)
        console.log('결과: PASS (검증 파이프라인 작동)')
      }
    } catch { console.log('결과: WARN (JSON 파싱 실패, 폴백 처리됨)') }
  } else {
    console.log('FAIL:', res.status)
  }
}

// ── 4. Perplexity 실시간 검색 ──
async function testPerplexity() {
  console.log('\n=== 4. Perplexity sonar-pro ===')
  if (!PERPLEXITY_KEY) { console.log('SKIP: API 키 없음'); return }

  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${PERPLEXITY_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'sonar-pro',
      messages: [{ role: 'user', content: '오늘 2026-04-20 한국 주식시장 주요 이슈 1가지만. 50자 이내.' }],
    }),
  })
  const json = await res.json()
  if (res.ok) {
    console.log('응답:', json.choices?.[0]?.message?.content?.slice(0, 200))
    console.log('결과: PASS')
  } else {
    console.log('FAIL:', res.status, JSON.stringify(json).slice(0, 200))
  }
}

// ── 5. Supabase 컨텍스트 쿼리 테스트 ──
async function testSupabaseContext() {
  console.log('\n=== 5. Supabase 컨텍스트 데이터 조회 ===')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) { console.log('SKIP: Supabase 키 없음'); return }

  const tables = ['market_overview', 'market_fear_greed', 'intelligence_news', 'sector_rotation', 'dashboard_smart_money']
  for (const table of tables) {
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*&order=date.desc&limit=1`, {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` },
      })
      const data = await res.json()
      const hasData = Array.isArray(data) && data.length > 0
      const date = hasData ? data[0].date : '-'
      console.log(`  ${table}: ${hasData ? 'OK' : 'EMPTY'} (최신: ${date})`)
    } catch {
      console.log(`  ${table}: ERROR`)
    }
  }
  console.log('결과: 위 테이블에서 OK인 것만 컨텍스트에 포함됨')
}

// ── 실행 ──
async function main() {
  console.log('========================================')
  console.log('AI 업그레이드 5종 검증 시작')
  console.log('날짜: 2026-04-20(월) 12:54')
  console.log('========================================\n')

  await testSonnet()
  await testAdvisor()
  await testVerify()
  await testPerplexity()
  await testSupabaseContext()

  console.log('\n========================================')
  console.log('검증 완료')
  console.log('========================================')
}

main().catch(e => { console.error('치명적 오류:', e); process.exit(1) })
