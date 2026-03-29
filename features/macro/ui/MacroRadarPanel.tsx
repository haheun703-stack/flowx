'use client'

import { useMacroDaily, type MacroItem } from '../api/useMacroDashboard'

const CATEGORY_META: Record<string, { title: string; icon: string; accentColor: string }> = {
  commodity: { title: '원자재', icon: '🛢️', accentColor: '#f59e0b' },
  grain:     { title: '곡물',   icon: '🌾', accentColor: '#84cc16' },
  forex:     { title: '환율',   icon: '💱', accentColor: '#2563eb' },
  rate:      { title: '금리',   icon: '📊', accentColor: '#8b5cf6' },
  sentiment: { title: '센티먼트', icon: '🧠', accentColor: '#ef4444' },
  index:     { title: '지수',   icon: '📈', accentColor: '#10b981' },
  crypto:    { title: '크립토', icon: '₿',  accentColor: '#f97316' },
}

/** 알림 조건 체크 */
function isAlertTriggered(item: MacroItem): boolean {
  if (item.alert_threshold == null || !item.alert_direction) return false
  if (item.alert_direction === 'above') return item.value >= item.alert_threshold
  return item.value <= item.alert_threshold
}

/** 가격 포맷 */
function fmtValue(item: MacroItem): string {
  if (item.category === 'sentiment') return item.value.toFixed(1)
  if (item.category === 'rate') return item.value.toFixed(2) + '%'
  if (item.category === 'crypto') {
    return item.value >= 10000
      ? '$' + Math.round(item.value).toLocaleString()
      : '$' + item.value.toFixed(2)
  }
  if (item.category === 'forex' && item.symbol === 'DXY') return item.value.toFixed(2)
  if (item.category === 'forex') return item.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
  return item.value.toLocaleString('ko-KR', { maximumFractionDigits: 2 })
}

function MacroItemRow({ item }: { item: MacroItem }) {
  const isAlert = isAlertTriggered(item)
  const isUp = item.change_pct >= 0
  const isHighlight = Math.abs(item.change_pct) >= 3
  const changeColor = item.change_pct === 0 ? '#64748b' : isUp ? '#dc2626' : '#2563eb'

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded transition-colors ${
      isAlert ? 'bg-red-50 border border-red-200' :
      isHighlight ? 'bg-gray-100' : 'hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-[var(--text-primary)] font-medium truncate">{item.name_ko}</span>
        {isAlert && <span className="text-xs text-[var(--up)] font-bold animate-pulse">!</span>}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-base text-[var(--text-primary)] font-bold tabular-nums">{fmtValue(item)}</span>
        <span className={`text-sm font-bold tabular-nums w-16 text-right ${
          isHighlight ? 'animate-pulse' : ''
        }`} style={{ color: changeColor }}>
          {isUp ? '+' : ''}{item.change_pct.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

function CategoryCard({ category, items }: { category: string; items: MacroItem[] }) {
  const meta = CATEGORY_META[category] ?? { title: category, icon: '📦', accentColor: '#64748b' }

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">{meta.icon}</span>
        <span className="text-lg font-bold" style={{ color: meta.accentColor }}>{meta.title}</span>
        <span className="text-xs text-[var(--text-muted)]">{items.length}개</span>
      </div>
      <div className="p-3 space-y-0.5">
        {items.map(item => <MacroItemRow key={item.symbol} item={item} />)}
      </div>
    </div>
  )
}

export function MacroRadarPanel() {
  const { data, isLoading, isError } = useMacroDaily()

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 bg-white border border-[var(--border)] rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-[var(--up)]/70 text-sm">
        매크로 데이터 로드 실패 — 잠시 후 다시 시도해주세요
      </div>
    )
  }

  const categories = data?.categories ?? {}
  // 4분할 순서: 원자재+곡물 | 환율+금리 | 센티먼트+지수 | 크립토
  const quadrants = [
    ['commodity', 'grain'],
    ['forex', 'rate'],
    ['sentiment', 'index'],
    ['crypto'],
  ]

  if (Object.keys(categories).length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-[var(--text-muted)]">
        매크로 데이터 없음 — Supabase macro_dashboard 테이블에 데이터 업로드 필요
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📡</span>
        <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">매크로 레이더</span>
        <span className="text-xs text-[var(--text-dim)]">{data?.date}</span>
        <span className="text-xs text-[var(--text-muted)] ml-auto">3% 이상 변동은 하이라이트</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quadrants.map((cats, qi) => (
          <div key={qi} className="space-y-3">
            {cats.map(cat => {
              const items = categories[cat]
              if (!items?.length) return null
              return <CategoryCard key={cat} category={cat} items={items} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
