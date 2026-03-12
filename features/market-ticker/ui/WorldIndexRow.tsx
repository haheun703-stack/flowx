import { WorldIndex } from '../types'

const SYMBOL_FLAG: Record<string, string> = {
  SPX: 'us', IXIC: 'us', DJI: 'us',
  N225: 'jp', HSI: 'hk', GDAXI: 'de',
}

function IndexChip({ index }: { index: WorldIndex }) {
  const isPositive = index.changePercent >= 0
  const color = isPositive ? 'text-red-400' : 'text-blue-400'
  const sign = isPositive ? '+' : ''
  const flagCode = SYMBOL_FLAG[index.symbol]

  const fmtPrice = new Intl.NumberFormat('ko-KR', {
    maximumFractionDigits: index.currency === 'JPY' ? 0 : 2,
  }).format(index.price)

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-r border-gray-800/60 whitespace-nowrap hover:bg-gray-800/30 transition-colors cursor-default">
      {flagCode && <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt={flagCode.toUpperCase()} width={20} height={14} className="inline-block" />}
      <span className="text-gray-400 text-xs font-medium">{index.name}</span>
      <span className="text-white text-xs font-mono">{fmtPrice}</span>
      <span className={`text-xs font-mono font-medium ${color}`}>
        {sign}{index.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

export function WorldIndexRow({ indices }: { indices: WorldIndex[] }) {
  if (!indices.length) return null

  return (
    <div className="flex items-center border-b border-gray-800/60 bg-[#080b10] overflow-x-auto scrollbar-none">
      {/* 고정 라벨 */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-r border-gray-700/60 shrink-0">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">글로벌</span>
      </div>
      {/* 지수 목록 */}
      <div className="flex overflow-x-auto scrollbar-none">
        {indices.map(index => (
          <IndexChip key={index.symbol} index={index} />
        ))}
      </div>
    </div>
  )
}
