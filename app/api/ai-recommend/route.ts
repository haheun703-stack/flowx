import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// [업그레이드 5] Perplexity 실시간 검색으로 오늘 시장 이슈 수집
async function fetchPerplexityContext(today: string): Promise<string> {
  const apiKey = process.env.PERPLEXITY_API_KEY
  if (!apiKey) return ''

  try {
    const res = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [{
          role: 'user',
          content: `오늘(${today}) 한국 주식시장 주요 이슈와 주목할 종목을 간단히 정리해주세요. 200자 이내.`,
        }],
      }),
    })

    if (!res.ok) return ''
    const data = await res.json()
    return data.choices?.[0]?.message?.content ?? ''
  } catch {
    return ''
  }
}

export async function GET() {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        date: new Date().toISOString().split('T')[0],
        market_summary: 'API 키 미설정',
        picks: [],
      })
    }

    const today = new Date().toISOString().split('T')[0]

    // Perplexity 실시간 검색 (키 없으면 빈 문자열)
    const perplexityContext = await fetchPerplexityContext(today)
    const contextBlock = perplexityContext
      ? `\n\n=== 실시간 시장 이슈 (Perplexity 검색) ===\n${perplexityContext}`
      : ''

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `오늘 한국 주식시장 주요 뉴스와 관심 종목 Top 5를 아래 JSON 형식으로만 응답해줘. 다른 텍스트 없이 JSON만:
{
  "date": "${today}",
  "market_summary": "한줄 시장 요약",
  "picks": [
    {"name": "종목명", "code": "코드", "reason": "이유", "sentiment": "positive/neutral/negative"}
  ]
}${contextBlock}`,
          },
        ],
      }),
    })

    const data = await response.json()

    const textContent =
      data.content
        ?.filter((item: { type: string }) => item.type === 'text')
        ?.map((item: { text: string }) => item.text)
        ?.join('') || '{}'

    const clean = textContent.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return NextResponse.json(parsed)
  } catch (e) {
    console.error('ai-recommend error:', e)
    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      market_summary: '데이터 로딩 중...',
      picks: [],
    })
  }
}
