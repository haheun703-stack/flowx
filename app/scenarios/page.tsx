import ScenarioDashboardView from '@/features/scenarios/ui/ScenarioDashboard'

export const metadata = {
  title: 'FLOWX \u2014 시나리오 대시보드 (PRO)',
  description: '거시경제 시나리오 추적, 원자재 원가갭, 섹터별 HOT/COLD, ETF 매핑',
}

export default function ScenariosPage() {
  return <ScenarioDashboardView />
}
