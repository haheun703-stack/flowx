export function ImagePlaceholder({
  label = '장중 스크린샷 대기중',
  aspectRatio = '16/9',
  className = '',
}: {
  label?: string
  aspectRatio?: string
  className?: string
}) {
  return (
    <div
      className={`relative rounded-2xl bg-[#1A1A2E] border border-[#2D2D44] overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      {/* 화면 느낌의 도트 그리드 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* 상단 브라우저 바 */}
      <div className="absolute top-0 inset-x-0 h-8 bg-[#12121f] flex items-center gap-1.5 px-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
      </div>
      {/* 라벨 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white/30 text-sm font-mono">{label}</span>
      </div>
    </div>
  )
}
