import { WorldIndex } from '../types'

const CATEGORY_LABELS: Record<string, string> = {
  index: '지수',
  commodity: '원자재',
  forex: '환율',
  crypto: '크립토',
  bond: '채권',
}

const US_FIXED = new Set(['SPX', 'IXIC', 'DJI'])

function IndexChip({ index, compact }: { index: WorldIndex; compact?: boolean }) {
  const isPositive = index.changePercent >= 0
  const color = isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPositive ? '+' : ''

  const fmtPrice = index.category === 'forex' || index.category === 'bond'
    ? index.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : index.category === 'crypto'
    ? index.price.toLocaleString('ko-KR', { maximumFractionDigits: index.price >= 100 ? 0 : 2 })
    : new Intl.NumberFormat('ko-KR', { maximumFractionDigits: index.currency === 'JPY' ? 0 : 2 }).format(index.price)

  return (
    <div className={`flex items-center border-r border-[#D1D5DB]/30 whitespace-nowrap hover:bg-[#F0EDE8] transition-colors cursor-default shrink-0 ${
      compact ? 'gap-1.5 px-2.5 h-10' : 'gap-2.5 px-4 h-14'
    }`}>
      <span className={`font-semibold text-[#6B7280] ${compact ? 'text-[11px]' : 'text-[14px]'}`}>{index.name}</span>
      <span className={`font-bold text-[#1A1A2E] tabular-nums ${compact ? 'text-[12px]' : 'text-[15px]'}`}>{fmtPrice}</span>
      <span className={`font-bold tabular-nums ${color} ${compact ? 'text-[11px]' : 'text-[14px]'}`}>
        {sign}{index.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

function CategorySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-1.5 shrink-0">
      <div className="w-px h-4 bg-[#D1D5DB]/40" />
      <span className="text-[12px] text-[#9CA3AF] font-bold uppercase tracking-widest">{label}</span>
      <div className="w-px h-4 bg-[#D1D5DB]/40" />
    </div>
  )
}

export function WorldIndexRow({ indices }: { indices: WorldIndex[] }) {
  if (!indices.length) return null

  const fixedIndices = indices.filter(idx => US_FIXED.has(idx.symbol))
  const scrollIndices = indices.filter(idx => !US_FIXED.has(idx.symbol))

  // 모바일용: 전체 인덱스를 스크롤에 포함
  const allChips: { type: 'chip' | 'sep'; index?: WorldIndex; label?: string; key: string }[] = []
  let lastCat = ''
  for (const idx of indices) {
    if (idx.category !== lastCat) {
      const label = CATEGORY_LABELS[idx.category] ?? idx.category
      if (lastCat !== '') allChips.push({ type: 'sep', label, key: `sep-all-${idx.category}` })
      lastCat = idx.category
    }
    allChips.push({ type: 'chip', index: idx, key: `all-${idx.symbol}` })
  }

  // 데스크톱용: 고정 제외 스크롤
  const desktopChips: typeof allChips = []
  let lastCategory = ''
  for (const idx of scrollIndices) {
    if (idx.category !== lastCategory) {
      const label = CATEGORY_LABELS[idx.category] ?? idx.category
      if (lastCategory !== '') desktopChips.push({ type: 'sep', label, key: `sep-${idx.category}` })
      lastCategory = idx.category
    }
    desktopChips.push({ type: 'chip', index: idx, key: idx.symbol })
  }

  return (
    <div className="flex items-center h-10 md:h-14 border-b border-[#ECEAE4] leading-none">
      {/* LIVE + 글로벌 */}
      <div className="flex items-center gap-1.5 md:gap-2.5 px-3 md:px-5 h-full border-r border-[#ECEAE4] shrink-0">
        <span className="w-[6px] h-[6px] md:w-[8px] md:h-[8px] rounded-full bg-[#00FF88] animate-pulse shrink-0" />
        <span className="text-[11px] md:text-[14px] font-bold text-[#00CC6A] tracking-wide">LIVE</span>
        <span className="hidden sm:inline text-[14px] font-bold text-[#4B5563]">글로벌</span>
      </div>

      {/* 데스크톱: 고정 인덱스 */}
      <div className="hidden md:flex shrink-0">
        {fixedIndices.map(idx => <IndexChip key={idx.symbol} index={idx} />)}
      </div>
      <div className="hidden md:block w-px h-5 bg-[#D1D5DB]/40 shrink-0" />

      {/* 모바일: 전체 스크롤 */}
      <div className="md:hidden flex overflow-hidden relative flex-1">
        <div className="flex animate-ticker">
          {[...allChips, ...allChips].map((chip, i) =>
            chip.type === 'sep'
              ? <CategorySeparator key={`${chip.key}-${i}`} label={chip.label!} />
              : <IndexChip key={`${chip.key}-${i}`} index={chip.index!} compact />
          )}
        </div>
      </div>

      {/* 데스크톱: 기타 스크롤 */}
      <div className="hidden md:flex overflow-hidden relative flex-1 group">
        <div className="flex animate-ticker group-hover:[animation-play-state:paused]">
          {[...desktopChips, ...desktopChips].map((chip, i) =>
            chip.type === 'sep'
              ? <CategorySeparator key={`${chip.key}-${i}`} label={chip.label!} />
              : <IndexChip key={`${chip.key}-${i}`} index={chip.index!} />
          )}
        </div>
      </div>
    </div>
  )
}
