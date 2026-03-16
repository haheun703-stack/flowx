import { WorldIndex } from '../types'

// 국기 매핑
const FLAG_ICONS: Record<string, string> = {
  us: 'us', jp: 'jp', hk: 'hk', de: 'de', cn: 'cn', gb: 'gb', kr: 'kr', eu: 'eu',
}

// 카테고리 라벨
const CATEGORY_LABELS: Record<string, string> = {
  index: '지수',
  commodity: '원자재',
  forex: '환율',
  crypto: '크립토',
  bond: '채권',
}

// 카테고리별 아이콘 심볼
const CATEGORY_SYMBOLS: Record<string, string> = {
  oil: '🛢', gold: '🥇', silver: '🥈', copper: '🔶',
  btc: '₿', eth: 'Ξ', xrp: '✕',
  bond: '📊', vix: '⚡',
}

// 미국 3대 지수 고정 표시
const US_FIXED = new Set(['SPX', 'IXIC', 'DJI'])

function IndexChip({ index }: { index: WorldIndex }) {
  const isPositive = index.changePercent >= 0
  const color = isPositive ? 'text-[#ff3b5c]' : 'text-[#0ea5e9]'
  const sign = isPositive ? '+' : ''
  const flagCode = FLAG_ICONS[index.icon ?? '']
  const catSymbol = CATEGORY_SYMBOLS[index.icon ?? '']

  // 가격 포맷: 암호화폐/지수는 소수점 줄임, 환율은 소수점 유지
  const fmtPrice = index.category === 'forex' || index.category === 'bond'
    ? index.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : index.category === 'crypto'
    ? index.price.toLocaleString('ko-KR', { maximumFractionDigits: index.price >= 100 ? 0 : 2 })
    : new Intl.NumberFormat('ko-KR', { maximumFractionDigits: index.currency === 'JPY' ? 0 : 2 }).format(index.price)

  return (
    <div className="flex items-center gap-2 px-4 h-11 border-r border-gray-800/40 whitespace-nowrap hover:bg-gray-800/30 transition-colors cursor-default shrink-0">
      {/* 아이콘: 국기 또는 카테고리 심볼 */}
      {flagCode ? (
        <img src={`https://flagcdn.com/w20/${flagCode}.png`} alt={flagCode.toUpperCase()} width={16} height={11} className="inline-block opacity-70" />
      ) : catSymbol ? (
        <span className="text-sm">{catSymbol}</span>
      ) : null}
      <span className="text-gray-400 text-sm font-medium">{index.name}</span>
      <span className="text-white text-sm font-mono font-bold">{fmtPrice}</span>
      <span className={`text-sm font-mono font-bold ${color}`}>
        {sign}{index.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

function CategorySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-2 shrink-0">
      <div className="w-px h-5 bg-gray-600/40" />
      <span className="text-[10px] text-gray-500/70 font-bold uppercase tracking-widest">{label}</span>
      <div className="w-px h-5 bg-gray-600/40" />
    </div>
  )
}

export function WorldIndexRow({ indices }: { indices: WorldIndex[] }) {
  if (!indices.length) return null

  // 미국 3대 지수 고정 vs 나머지 스크롤
  const fixedIndices = indices.filter(idx => US_FIXED.has(idx.symbol))
  const scrollIndices = indices.filter(idx => !US_FIXED.has(idx.symbol))

  // 스크롤용: 카테고리별 구분선 삽입
  const chips: { type: 'chip' | 'sep'; index?: WorldIndex; label?: string; key: string }[] = []
  let lastCategory = ''
  for (const idx of scrollIndices) {
    if (idx.category !== lastCategory) {
      const label = CATEGORY_LABELS[idx.category] ?? idx.category
      if (lastCategory !== '') {
        chips.push({ type: 'sep', label, key: `sep-${idx.category}` })
      }
      lastCategory = idx.category
    }
    chips.push({ type: 'chip', index: idx, key: idx.symbol })
  }

  return (
    <div className="flex items-center h-11 border-b border-gray-800/60 bg-[#080b10] leading-none">
      {/* 고정 라벨 */}
      <div className="flex items-center gap-1.5 px-4 h-full border-r border-gray-700/60 shrink-0">
        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span className="text-sm text-gray-300 font-bold uppercase tracking-wider">GLOBAL</span>
      </div>

      {/* 미국 3대 지수 고정 */}
      <div className="flex border-r border-gray-700/60 shrink-0">
        {fixedIndices.map(idx => <IndexChip key={idx.symbol} index={idx} />)}
      </div>

      {/* 구분선 */}
      <div className="w-px h-6 bg-gray-700/40 shrink-0" />

      {/* 나머지 마퀴 스크롤 영역 */}
      <div className="flex overflow-hidden relative flex-1 group">
        <div className="flex animate-ticker group-hover:[animation-play-state:paused]">
          {/* 2배 복제 → 끊김 없는 무한 루프 */}
          {[...chips, ...chips].map((chip, i) => (
            chip.type === 'sep'
              ? <CategorySeparator key={`${chip.key}-${i}`} label={chip.label!} />
              : <IndexChip key={`${chip.key}-${i}`} index={chip.index!} />
          ))}
        </div>
      </div>
    </div>
  )
}
