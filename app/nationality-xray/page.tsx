import { NationalityXrayView } from '@/features/nationality-xray/ui/NationalityXrayView'

export const metadata = {
  title: '국적별 수급 X-ray | FLOWX',
  description: 'TOP 200 종목 외국인 국적별 수급 픽토그램 차트 — 매일 장마감 후 자동 갱신',
}

export default function NationalityXrayPage() {
  return <NationalityXrayView />
}
