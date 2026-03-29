import { redirect } from 'next/navigation'

export const metadata = {
  title: 'FLOWX — 시장 개요',
  description: '주요 지수, 시장 체온(Breadth), 투자자 동향 일간 요약',
}

export default function MarketOverviewPage() {
  redirect('/market')
}
