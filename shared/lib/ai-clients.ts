// Claude API 직접 호출 (Anthropic SDK 없이)
// Vercel Cron 봇에서 시나리오/브리핑 생성용

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

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
      model: 'claude-sonnet-4-20250514',
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
