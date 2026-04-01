import { WorldIndex } from '../types'

const CATEGORY_LABELS: Record<string, string> = {
  index: '지수',
  commodity: '원자재',
  forex: '환율',
  crypto: '크립토',
  bond: '채권',
}

const US_FIXED = new Set(['SPX', 'IXIC', 'DJI'])

function IndexChip({ index }: { index: WorldIndex }) {
  const isPositive = index.changePercent >= 0
  const color = isPositive ? 'text-[var(--up)]' : 'text-[var(--down)]'
  const sign = isPositive ? '+' : ''

  const fmtPrice = index.category === 'forex' || index.category === 'bond'
    ? index.price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : index.category === 'crypto'
    ? index.price.toLocaleString('ko-KR', { maximumFractionDigits: index.price >= 100 ? 0 : 2 })
    : new Intl.NumberFormat('ko-KR', { maximumFractionDigits: index.currency === 'JPY' ? 0 : 2 }).format(index.price)

  return (
    <div className="flex items-center gap-2 px-3.5 h-11 border-r border-[#D1D5DB]/30 whitespace-nowrap hover:bg-[#F0EDE8] transition-colors cursor-default shrink-0">
      <span className="text-[11px] text-[#6B7280]">{index.name}</span>
      <span className="text-[12px] font-bold text-[#1A1A2E] tabular-nums">{fmtPrice}</span>
      <span className={`text-[11px] font-bold tabular-nums ${color}`}>
        {sign}{index.changePercent.toFixed(2)}%
      </span>
    </div>
  )
}

function CategorySeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-1 px-1.5 shrink-0">
      <div className="w-px h-4 bg-[#D1D5DB]/40" />
      <span className="text-[9px] text-[#9CA3AF] font-bold uppercase tracking-widest">{label}</span>
      <div className="w-px h-4 bg-[#D1D5DB]/40" />
    </div>
  )
}

export function WorldIndexRow({ indices }: { indices: WorldIndex[] }) {
  if (!indices.length) return null

  const fixedIndices = indices.filter(idx => US_FIXED.has(idx.symbol))
  const scrollIndices = indices.filter(idx => !US_FIXED.has(idx.symbol))

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
    <div className="flex items-center h-11 border-b border-[#ECEAE4] leading-none">
      {/* LIVE + 글로벌 */}
      <div className="flex items-center gap-2 px-4 h-full border-r border-[#ECEAE4] shrink-0">
        <span className="w-[6px] h-[6px] rounded-full bg-[#00FF88] animate-pulse shrink-0" />
        <span className="text-[11px] font-black text-[#00CC6A] tracking-wide">LIVE</span>
        <span className="text-[11px] font-semibold text-[#6B7280]">글로벌</span>
      </div>

      {/* 고정: S&P, NASDAQ, DOW */}
      <div className="flex shrink-0">
        {fixedIndices.map(idx => <IndexChip key={idx.symbol} index={idx} />)}
      </div>

      <div className="w-px h-5 bg-[#D1D5DB]/40 shrink-0" />

      {/* 스크롤: 기타 지수 */}
      <div className="flex overflow-hidden relative flex-1 group">
        <div className="flex animate-ticker group-hover:[animation-play-state:paused]">
          {[...chips, ...chips].map((chip, i) =>
            chip.type === 'sep'
              ? <CategorySeparator key={`${chip.key}-${i}`} label={chip.label!} />
              : <IndexChip key={`${chip.key}-${i}`} index={chip.index!} />
          )}
        </div>
      </div>
    </div>
  )
}
