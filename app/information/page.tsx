import { InformationTabsView } from '@/features/information/ui/InformationTabsView'

export const metadata = {
  title: 'FLOWX — 인포메이션',
  description: '시그널, 수급 스코어링, DART 공시, EDGAR 공시',
}

export default function InformationPage() {
  return <InformationTabsView />
}
