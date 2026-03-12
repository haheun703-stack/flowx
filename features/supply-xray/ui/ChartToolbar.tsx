'use client'

export interface ChartOptions {
  ma5: boolean
  ma20: boolean
  ma60: boolean
  bollinger: boolean
}

interface Props {
  options: ChartOptions
  onChange: (key: keyof ChartOptions) => void
}

const BUTTONS: { key: keyof ChartOptions; label: string; color: string }[] = [
  { key: 'ma5',       label: 'MA5',   color: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/10' },
  { key: 'ma20',      label: 'MA20',  color: 'text-blue-400 border-blue-400/40 bg-blue-400/10' },
  { key: 'ma60',      label: 'MA60',  color: 'text-purple-400 border-purple-400/40 bg-purple-400/10' },
  { key: 'bollinger', label: 'BB',    color: 'text-gray-300 border-gray-500/40 bg-gray-500/10' },
]

export function ChartToolbar({ options, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800">
      <span className="text-xs text-gray-600 mr-1">지표</span>
      {BUTTONS.map(btn => (
        <button
          key={btn.key}
          onClick={() => onChange(btn.key)}
          className={`text-xs px-2.5 py-1 rounded border font-medium transition-opacity ${btn.color} ${
            options[btn.key] ? 'opacity-100' : 'opacity-30'
          }`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  )
}
