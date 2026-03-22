import Link from 'next/link'
import { FlowxLogo } from '@/shared/ui/logo'

export const metadata = { title: '회원가입 — FLOWX' }

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#080b10] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <Link href="/">
          <FlowxLogo variant="small" />
        </Link>
        <h1 className="text-xl font-bold text-white mt-6 mb-2">회원가입</h1>
        <p className="text-sm text-gray-500 mb-8">준비 중입니다. 곧 만나요!</p>
        <Link href="/" className="text-[#00ff88] text-sm hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
