import EtfSignalsView from '@/features/etf-signals/ui/EtfSignalsView'

export const metadata = {
  title: 'FLOWX — ETF 자금흐름 시그널',
  description: '24개 섹터 ETF 자금유입/유출 시그널 추적',
}

export default function EtfSignalsPage() {
  return <EtfSignalsView />
}
