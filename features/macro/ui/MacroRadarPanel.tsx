'use client'

import { useMacroDaily, type MacroItem } from '../api/useMacroDashboard'
import { FearGreedGauge } from './FearGreedGauge'

/* ── 카테고리 메타 ── */
const CATEGORY_META: Record<string, { title: string; icon: string; accentColor: string }> = {
  commodity: { title: '원자재', icon: '🛢️', accentColor: '#f59e0b' },
  grain:     { title: '곡물',   icon: '🌾', accentColor: '#84cc16' },
  forex:     { title: '환율',   icon: '💱', accentColor: '#2563eb' },
  rate:      { title: '금리',   icon: '📊', accentColor: '#8b5cf6' },
  sentiment: { title: '센티먼트', icon: '🧠', accentColor: '#ef4444' },
  index:     { title: '지수',   icon: '📈', accentColor: '#10b981' },
  crypto:    { title: '크립토', icon: '₿',  accentColor: '#f97316' },
}

/* ── 원자재 서브그룹 ── */
const COMMODITY_SUBGROUPS: { title: string; symbols: string[] }[] = [
  { title: '에너지', symbols: ['WTI', 'BRENT', 'NG'] },
  { title: '귀금속', symbols: ['GOLD', 'SILVER'] },
  { title: '산업금속', symbols: ['COPPER'] },
]
/* ── 금리 상태 판정 ── */
function getRateStatus(symbol: string, value: number): { text: string; color: string } | null {
  if (symbol === 'SPREAD_10Y2Y') {
    return value > 0
      ? { text: '정상', color: '#16a34a' }
      : { text: '역전 경고', color: '#dc2626' }
  }
  if (symbol === 'HY_SPREAD') {
    if (value < 3) return { text: '안심', color: '#16a34a' }
    if (value <= 5) return { text: '주의', color: '#d97706' }
    return { text: '위험', color: '#dc2626' }
  }
  if (symbol === 'BEI_5Y') {
    if (value < 2) return { text: '안정', color: '#16a34a' }
    if (value <= 3) return { text: '보통', color: '#d97706' }
    return { text: '경계', color: '#dc2626' }
  }
  return null
}

/* ── ERP 상태 판정 ── */
function getErpStatus(value: number): { text: string; color: string } {
  if (value > 4) return { text: '매력적', color: '#16a34a' }
  if (value >= 2) return { text: '보통', color: '#d97706' }
  return { text: '비싸다', color: '#dc2626' }
}

/* ── 알림 조건 체크 ── */
function isAlertTriggered(item: MacroItem): boolean {
  if (item.alert_threshold == null || !item.alert_direction) return false
  if (item.alert_direction === 'above') return item.value >= item.alert_threshold
  return item.value <= item.alert_threshold
}

/* ── 가격 포맷 ── */
function fmtValue(item: MacroItem): string {
  if (item.symbol === 'SPREAD_10Y2Y' || item.symbol === 'HY_SPREAD') return item.value.toFixed(2) + '%p'
  if (item.symbol === 'BEI_5Y') return item.value.toFixed(2) + '%'
  if (item.symbol === 'ERP') return item.value.toFixed(2)
  if (item.symbol === 'ALERTS') return item.value + '건'
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

/* ── 일반 행 ── */
function MacroItemRow({ item }: { item: MacroItem }) {
  const isAlert = isAlertTriggered(item)
  const isUp = item.change_pct >= 0
  const isHighlight = Math.abs(item.change_pct) >= 3
  const changeColor = item.change_pct === 0 ? '#64748b' : isUp ? '#dc2626' : '#2563eb'
  const rateStatus = item.category === 'rate' ? getRateStatus(item.symbol, item.value) : null

  return (
    <div className={`flex items-center justify-between py-2.5 px-3 rounded transition-colors ${
      isAlert ? 'bg-red-50 border border-red-200' :
      isHighlight ? 'bg-[var(--bg-row)]' : 'hover:bg-[var(--bg-row)]'
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm text-[var(--text-primary)] font-medium truncate">{item.name_ko}</span>
        {isAlert && <span className="text-xs text-[var(--up)] font-bold animate-pulse">!</span>}
        {rateStatus && (
          <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ color: rateStatus.color, backgroundColor: rateStatus.color + '15' }}>
            {rateStatus.text}
          </span>
        )}
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

/* ── 카테고리 카드 ── */
function CategoryCard({ title, icon, accentColor, items }: {
  title: string; icon: string; accentColor: string; items: MacroItem[]
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">{icon}</span>
        <span className="text-lg font-bold" style={{ color: accentColor }}>{title}</span>
        <span className="text-xs text-[var(--text-muted)]">{items.length}개</span>
      </div>
      <div className="p-3 space-y-0.5">
        {items.map(item => <MacroItemRow key={item.symbol} item={item} />)}
      </div>
    </div>
  )
}

/* ── 원자재 서브그룹 카드 ── */
function CommodityGroupCard({ items, grainItems }: { items: MacroItem[]; grainItems: MacroItem[] }) {
  const meta = CATEGORY_META.commodity
  const allItems = [...items, ...grainItems]

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">{meta.icon}</span>
        <span className="text-lg font-bold" style={{ color: meta.accentColor }}>{meta.title}</span>
        <span className="text-xs text-[var(--text-muted)]">{allItems.length}개</span>
      </div>
      <div className="p-3 space-y-1">
        {COMMODITY_SUBGROUPS.map(group => {
          const groupItems = group.symbols
            .map(s => items.find(i => i.symbol === s))
            .filter((i): i is MacroItem => !!i)
          if (groupItems.length === 0) return null
          return (
            <div key={group.title}>
              <p className="text-[10px] text-[var(--text-muted)] font-bold px-3 pt-1 pb-0.5">{group.title}</p>
              {groupItems.map(item => <MacroItemRow key={item.symbol} item={item} />)}
            </div>
          )
        })}
        {grainItems.length > 0 && (
          <div>
            <p className="text-[10px] text-[var(--text-muted)] font-bold px-3 pt-1 pb-0.5">농산물</p>
            {grainItems.map(item => <MacroItemRow key={item.symbol} item={item} />)}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 센티먼트 섹션 (ERP + ALERTS) ── */
function SentimentCard({ items }: { items: MacroItem[] }) {
  const meta = CATEGORY_META.sentiment
  const erpItem = items.find(i => i.symbol === 'ERP')
  const alertItem = items.find(i => i.symbol === 'ALERTS')
  // FNG, VIX는 FearGreedGauge에서 렌더링 → 여기서는 ERP, ALERTS만
  const normalItems = items.filter(i => !['FNG', 'FEAR_GREED', 'VIX', 'ERP', 'ALERTS'].includes(i.symbol))

  const alertCount = alertItem ? Math.round(alertItem.value) : 0
  const alertIcon = alertCount === 0 ? '🟢' : alertCount <= 2 ? '🟡' : '🔴'

  return (
    <div className="bg-white rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]/50">
        <span className="text-lg">{meta.icon}</span>
        <span className="text-lg font-bold" style={{ color: meta.accentColor }}>{meta.title}</span>
        <span className="text-xs text-[var(--text-muted)]">{items.length}개</span>
      </div>
      <div className="p-3 space-y-1">
        {/* 일반 센티먼트 항목 (FNG, VIX 제외) */}
        {normalItems.map(item => <MacroItemRow key={item.symbol} item={item} />)}

        {/* ERP 주식 매력도 */}
        {erpItem && (() => {
          const status = getErpStatus(erpItem.value)
          return (
            <div className="flex items-center justify-between py-2.5 px-3 rounded hover:bg-[var(--bg-row)] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--text-primary)] font-medium">{erpItem.name_ko}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                  style={{ color: status.color, backgroundColor: status.color + '15' }}>
                  {status.text}
                </span>
              </div>
              <span className="text-base font-bold tabular-nums" style={{ color: status.color }}>
                {erpItem.value.toFixed(2)}
              </span>
            </div>
          )
        })()}

        {/* ALERTS 위험 신호등 */}
        {alertItem && (
          <div className={`px-3 py-2.5 rounded ${alertCount >= 3 ? 'bg-red-50 border border-red-200' : alertCount > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[var(--text-primary)]">{alertIcon} {alertItem.name_ko}</span>
              <span className="text-base font-bold tabular-nums" style={{
                color: alertCount >= 3 ? '#dc2626' : alertCount > 0 ? '#d97706' : '#16a34a'
              }}>
                {alertCount}건
              </span>
            </div>
            {alertItem.signals && alertItem.signals.length > 0 && (
              <div className="space-y-0.5 mt-1">
                {alertItem.signals.map((sig, i) => (
                  <div key={i} className="text-xs text-[var(--text-dim)] pl-1">
                    {i < alertItem.signals!.length - 1 ? '├' : '└'} {sig}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── 메인 패널 ── */
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

  if (Object.keys(categories).length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-[var(--text-muted)]">
        매크로 데이터 없음 — Supabase macro_data 테이블에 데이터 업로드 필요
      </div>
    )
  }

  const commodityItems = categories['commodity'] ?? []
  const grainItems = categories['grain'] ?? []
  const forexItems = categories['forex'] ?? []
  const rateItems = categories['rate'] ?? []
  const sentimentItems = categories['sentiment'] ?? []
  const indexItems = categories['index'] ?? []
  const cryptoItems = categories['crypto'] ?? []

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📡</span>
        <span className="text-base font-bold text-[var(--text-primary)] tracking-wider">매크로 레이더</span>
        <span className="text-xs text-[var(--text-dim)]">{data?.date}</span>
        <span className="text-xs text-[var(--text-muted)] ml-auto">3% 이상 변동은 하이라이트</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Column 1: 원자재 (에너지/귀금속/산업/농산물) + 공포&탐욕 게이지 */}
        <div className="space-y-3">
          <CommodityGroupCard items={commodityItems} grainItems={grainItems} />
          <FearGreedGauge />
        </div>

        {/* Column 2: 환율 + 크립토 */}
        <div className="space-y-3">
          {forexItems.length > 0 && (
            <CategoryCard title="환율" icon="💱" accentColor="#2563eb" items={forexItems} />
          )}
          {cryptoItems.length > 0 && (
            <CategoryCard title="크립토" icon="₿" accentColor="#f97316" items={cryptoItems} />
          )}
        </div>

        {/* Column 3: 금리 + 센티먼트 */}
        <div className="space-y-3">
          {rateItems.length > 0 && (
            <CategoryCard title="금리" icon="📊" accentColor="#8b5cf6" items={rateItems} />
          )}
          {sentimentItems.length > 0 && (
            <SentimentCard items={sentimentItems} />
          )}
        </div>

        {/* Column 4: 지수 */}
        <div className="space-y-3">
          {indexItems.length > 0 && (
            <CategoryCard title="지수" icon="📈" accentColor="#10b981" items={indexItems} />
          )}
        </div>
      </div>
    </div>
  )
}
