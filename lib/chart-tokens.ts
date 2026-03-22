export const CHART_COLORS = {
  up: '#E24B4A',
  down: '#378ADD',
  neutral: '#888780',
  info: '#1D9E75',
  short: '#D85A30',
  quant: '#7F77DD',
  heatmap: {
    strongUp: '#E24B4A',
    mildUp: '#F09595',
    flat: '#B4B2A9',
    mildDown: '#85B7EB',
    strongDown: '#378ADD',
  },
  bg: 'transparent',
  grid: 'rgba(136, 135, 128, 0.15)',
  tooltip: 'rgba(44, 44, 42, 0.95)',
}

export const TIER_COLORS: Record<number, { bg: string; border: string; text: string; badge: string; light: string }> = {
  5: { bg: '#EEEDFE', border: '#AFA9EC', text: '#3C3489', badge: '#534AB7', light: '#C8C3FF' },
  4: { bg: '#E6F1FB', border: '#85B7EB', text: '#0C447C', badge: '#185FA5', light: '#9DC8F5' },
  3: { bg: '#E1F5EE', border: '#5DCAA5', text: '#085041', badge: '#0F6E56', light: '#7DDDBB' },
  2: { bg: '#FAEEDA', border: '#FAC775', text: '#633806', badge: '#854F0B', light: '#FFD98A' },
  1: { bg: '#FAECE7', border: '#F0997B', text: '#712B13', badge: '#993C1D', light: '#FFAD8F' },
}

export const CONNECTION_COLOR = '#7F77DD'

export const TIER_LABELS: Record<number, { label: string; sub: string }> = {
  5: { label: 'ETF', sub: '글로벌 벤치마크' },
  4: { label: 'Global', sub: '글로벌 대장주' },
  3: { label: 'Suppliers', sub: '소부장/장비' },
  2: { label: 'KR 대형', sub: '한국 대형주' },
  1: { label: 'KR 소부장', sub: '한국 소부장' },
}

export const SECTOR_LIST = [
  { key: 'semiconductor', name: '반도체', icon: 'chip' },
  { key: 'shipbuilding', name: '조선', icon: 'ship' },
  { key: 'defense', name: '방산', icon: 'shield' },
  { key: 'construction', name: '건설', icon: 'building' },
  { key: 'bio', name: '바이오', icon: 'dna' },
  { key: 'finance', name: '금융', icon: 'bank' },
  { key: 'auto', name: '자동차', icon: 'car' },
  { key: 'robot', name: '로봇', icon: 'robot' },
  { key: 'energy', name: '에너지', icon: 'bolt' },
  { key: 'game', name: '게임', icon: 'gamepad' },
  { key: 'entertainment', name: '엔터', icon: 'music' },
  { key: 'logistics', name: '유통', icon: 'truck' },
  { key: 'food', name: '식품', icon: 'utensils' },
] as const
