import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FLOWX — 로그인 / 회원가입',
  description: 'FLOWX 계정으로 로그인하거나 무료로 시작하세요.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
