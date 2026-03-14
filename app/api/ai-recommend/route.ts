import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [
          {
            role: 'user',
            content: `오늘 한국 주식시장 주요 뉴스와 관심 종목 Top 5를 아래 JSON 형식으로만 응답해줘. 다른 텍스트 없이 JSON만:
{
  "date": "${new Date().toISOString().split('T')[0]}",
  "market_summary": "한줄 시장 요약",
  "picks": [
    {"name": "종목명", "code": "코드", "reason": "이유", "sentiment": "positive/neutral/negative"}
  ]
}`,
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
  } catch {
    return NextResponse.json({
      date: new Date().toISOString().split('T')[0],
      market_summary: '데이터 로딩 중...',
      picks: [],
    })
  }
}
