import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Mono, Orbitron, JetBrains_Mono } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-dm-mono',
})

const orbitron = Orbitron({
  weight: ['700', '900'],
  subsets: ['latin'],
  variable: '--font-orbitron',
})

const jetbrains = JetBrains_Mono({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-jetbrains',
})

export const metadata: Metadata = {
  title: 'FLOWX — 한국 주식 수급 레이더',
  description: '외국인·기관 수급 X-Ray로 스마트머니를 추적하세요. AI 종목추천, 세력 포착, 섹터 모멘텀, ETF 시그널까지.',
  metadataBase: new URL('https://flowx.kr'),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'FLOWX — 한국 주식 수급 레이더',
    description: '외국인·기관 수급 X-Ray로 스마트머니를 추적하세요. AI 종목추천, 세력 포착, 섹터 모멘텀, ETF 시그널까지.',
    url: 'https://flowx.kr',
    siteName: 'FLOWX',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: '/logo.svg', width: 512, height: 512, alt: 'FLOWX 로고' }],
  },
  twitter: {
    card: 'summary',
    title: 'FLOWX — 한국 주식 수급 레이더',
    description: '외국인·기관 수급 X-Ray로 스마트머니를 추적하세요.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${dmSerif.variable} ${dmMono.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <body className="bg-[var(--bg-base)] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
