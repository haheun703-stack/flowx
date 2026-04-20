// Claude API 직접 호출 (Anthropic SDK 없이)
// Vercel Cron 봇에서 시나리오/브리핑 생성용
// 2026-04-20: Advisor 패턴 + 검증 파이프라인 추가

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

// ── 기본 Sonnet 호출 (기존) ──
export async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 1024,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }] satisfies ClaudeMessage[],
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Claude API ${res.status}: ${text}`)
  }

  const json = await res.json()
  const block = json.content?.[0]
  return block?.type === 'text' ? block.text : ''
}

// ── Sonnet + Opus Advisor 호출 ──
export async function callClaudeWithAdvisor(
  systemPrompt: string,
  userMessage: string,
  advisorInstruction: string,
  maxTokens = 4000,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY 미설정')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'advisor-tool-2026-03-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6-20250514',
        max_tokens: maxTokens,
        system: `${systemPrompt}\n\n${advisorInstruction}`,
        messages: [{ role: 'user', content: userMessage }] satisfies ClaudeMessage[],
        tools: [{
          type: 'advisor_20260301',
          name: 'advisor',
          model: 'claude-opus-4-7-20250506',
          max_uses: 1,
        }],
      }),
    })

    if (!res.ok) {
      console.warn(`[Advisor] API ${res.status}, Sonnet 단독 폴백`)
      return callClaude(systemPrompt, userMessage, maxTokens)
    }

    const json = await res.json()
    // Advisor 응답: content 배열에 text/server_tool_use/advisor_tool_result 혼재
    const text = json.content
      ?.filter((b: { type: string }) => b.type === 'text')
      ?.map((b: { text: string }) => b.text)
      ?.join('') ?? ''

    if (!text) {
      console.warn('[Advisor] 텍스트 응답 없음, Sonnet 단독 폴백')
      return callClaude(systemPrompt, userMessage, maxTokens)
    }

    return text
  } catch (err) {
    console.warn('[Advisor] 호출 실패, Sonnet 단독 폴백:', err)
    return callClaude(systemPrompt, userMessage, maxTokens)
  }
}

// ── 검증 호출 (Sonnet 단독, 저비용) ──
interface VerifyResult {
  pass: boolean
  issues: string[]
  score: number
}

export async function callClaudeVerify(
  content: string,
  verifyPrompt: string,
): Promise<VerifyResult> {
  try {
    const raw = await callClaude(
      '당신은 품질 검증 전문가입니다. JSON으로만 응답하세요.',
      `${verifyPrompt}\n\n검증 대상:\n${content}`,
      512,
    )
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0])
      return {
        pass: parsed.pass ?? true,
        issues: Array.isArray(parsed.issues) ? parsed.issues : [],
        score: typeof parsed.score === 'number' ? parsed.score : 5,
      }
    }
  } catch {
    // 검증 파싱 실패 → PASS 처리 (검증 실패가 생성을 막으면 안 됨)
  }
  return { pass: true, issues: [], score: 5 }
}
