export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-[640px] bg-[#0f1117] rounded-xl border border-gray-800">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-gray-500 text-sm">로딩 중...</div>
      </div>
    </div>
  )
}
