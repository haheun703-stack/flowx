'use client'

import { useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  ArcElement, RadialLinearScale,
  Title, Tooltip, Legend, Filler,
  annotationPlugin,
)

// 전역 기본값
ChartJS.defaults.color = '#555'
ChartJS.defaults.borderColor = 'rgba(0,0,0,0.06)'
ChartJS.defaults.font.family = "'Noto Sans KR','JetBrains Mono',sans-serif"
ChartJS.defaults.font.size = 11
ChartJS.defaults.font.weight = 'bold'

interface MacroChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any
  height?: number
  className?: string
}

export function MacroChart({ config, height, className }: MacroChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current = new ChartJS(canvasRef.current, config)
    return () => { chartRef.current?.destroy() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', maxHeight: height ?? 460 }}
    />
  )
}

/* ── 카드 래퍼 ── */
interface CardProps {
  num?: string
  title?: string
  desc?: string
  source?: string
  insight?: string
  full?: boolean
  style?: React.CSSProperties
  className?: string
  children: React.ReactNode
}

export function MacroCard({ num, title, desc, source, insight, full, style, className, children }: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#e0ddd8] shadow-sm overflow-hidden relative ${full ? 'col-span-full' : ''} ${className ?? ''}`}
      style={{ padding: '28px', ...style }}
    >
      {num && (
        <div className="font-mono text-[10px] text-[#7c3aed] tracking-[3px] uppercase mb-1">
          {num}
        </div>
      )}
      {title && (
        <h2 className="text-[clamp(20px,2.8vw,28px)] font-black text-black leading-tight mb-1">
          {title}
        </h2>
      )}
      {desc && <div className="text-sm text-[#888] mb-5">{desc}</div>}
      {children}
      {insight && (
        <div
          className="mt-4 rounded-r-lg text-sm leading-relaxed text-[#1b5e20]"
          style={{
            background: 'rgba(57,255,20,0.12)',
            borderLeft: '4px solid #39ff14',
            padding: '12px 16px',
          }}
          dangerouslySetInnerHTML={{ __html: insight }}
        />
      )}
      {source && (
        <div className="text-[10px] text-[#aaa] mt-3 font-mono">{source}</div>
      )}
    </div>
  )
}

/* ── KPI 카드 ── */
interface KPIProps {
  value: string
  label: string
  color?: 'green' | 'red' | 'blue'
  borderColor?: string
}

export function KPICard({ value, label, color, borderColor }: KPIProps) {
  const colorClass = color === 'green' ? 'text-[#00c853]' : color === 'red' ? 'text-[#ff1744]' : 'text-[#1565c0]'
  return (
    <div className="text-center py-4 px-2.5 rounded-lg border border-[#e0ddd8]" style={borderColor ? { borderColor } : undefined}>
      <div className={`font-mono text-[clamp(20px,2.8vw,28px)] font-bold ${colorClass}`}>{value}</div>
      <div className="text-[11px] text-[#888] mt-0.5" dangerouslySetInnerHTML={{ __html: label }} />
    </div>
  )
}
