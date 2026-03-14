'use client'

import Link from 'next/link'
import { FlowxIcon } from './logo/FlowxIcon'

export function MobileGate({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* 모바일: 데스크톱 안내 */}
      <div className="flex sm:hidden flex-col items-center justify-center min-h-screen bg-[#131722] px-6 text-center gap-6">
        <FlowxIcon size={48} />
        <h2 className="text-xl font-bold text-white">데스크톱에서 이용해주세요</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Bloomberg 스타일 대시보드는<br />
          넓은 화면에서 최적화되어 있습니다.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[#00ff88] text-black font-bold text-sm rounded-xl font-mono"
        >
          홈으로 이동
        </Link>
      </div>

      {/* 데스크톱: 정상 렌더링 */}
      <div className="hidden sm:block">
        {children}
      </div>
    </>
  )
}
