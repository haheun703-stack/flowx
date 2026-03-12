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
  description: '외국인·기관 수급 X-Ray로 스마트머니를 추적하세요',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${dmSerif.variable} ${dmMono.variable} ${orbitron.variable} ${jetbrains.variable}`}>
      <body className="bg-[#080b10] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
