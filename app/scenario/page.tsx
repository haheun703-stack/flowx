'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useUserProfile } from '@/shared/lib/useUserProfile'
import { PaywallBlur } from '@/shared/ui/PaywallBlur'

interface ScenarioData {
  date: string
  session: string
  flowx_html: string
  one_thing_title: string
  scenario_main: string
  scenario_sub: string
  scenario_tail: string
  picks: string
}

function useScenario() {
  return useQuery<ScenarioData>({
    queryKey: ['scenario'],
    queryFn: () => axios.get('/api/scenario').then(r => r.data),
    staleTime: 1000 * 60 * 5,
  })
}

const C = {
  bg: '#0a0c10', bg2: '#0f1218', bg3: '#161b24',
  border: '#1e2736',
  text: '#e2e8f0', muted: '#5a6a82',
  green: '#00e59b', amber: '#f5a623', red: '#ff4d6d',
  blue: '#38bdf8', purple: '#a78bfa',
} as const

const MONO = "'Space Mono', monospace"

function Skeleton() {
  return (
    <div style={{ padding: 24 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ height: 120, background: C.bg3, borderRadius: 6, marginBottom: 16, animation: 'pulse 2s infinite' }} />
      ))}
    </div>
  )
}

function ScenarioContent({ data }: { data: ScenarioData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 0, minHeight: 'calc(100vh - 120px)' }}>
      {/* 좌 60%: HTML 렌더링 */}
      <div style={{ borderRight: `1px solid ${C.border}`, overflow: 'hidden' }}>
        <iframe
          srcDoc={data.flowx_html}
          title="시나리오 분석"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: C.bg,
            minHeight: 'calc(100vh - 120px)',
          }}
          sandbox="allow-same-origin"
        />
      </div>

      {/* 우 40%: 텍스트 필드 */}
      <div style={{ padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 오늘의 핵심 */}
        <Section label="오늘의 핵심" color={C.green}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.7 }}>{data.one_thing_title}</p>
        </Section>

        {/* 기본 시나리오 */}
        <Section label="기본 시나리오" color={C.blue}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.scenario_main}</p>
        </Section>

        {/* 상방 시나리오 */}
        <Section label="상방 시나리오" color={C.green}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.scenario_sub}</p>
        </Section>

        {/* 하방 시나리오 */}
        <Section label="하방 시나리오" color={C.red}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.scenario_tail}</p>
        </Section>

        {/* 관심 종목 */}
        <Section label="관심 종목" color={C.amber}>
          <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.picks}</p>
        </Section>
      </div>
    </div>
  )
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 6, overflow: 'hidden' }}>
      <div style={{ padding: '8px 14px', background: C.bg3, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
        <span style={{ fontFamily: MONO, fontSize: 11, color, letterSpacing: '0.08em' }}>{label}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>{children}</div>
    </div>
  )
}

export default function ScenarioPage() {
  const { data, isLoading } = useScenario()
  const { data: profile } = useUserProfile()
  const userTier = profile?.tier ?? 'FREE'

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Noto Sans KR', sans-serif", color: C.text }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${C.border}`, background: C.bg2, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 15, color: C.green, letterSpacing: '0.1em' }}>시나리오 분석</span>
          <span style={{ fontFamily: MONO, fontSize: 10, padding: '2px 8px', borderRadius: 3, border: `1px solid ${C.green}40`, color: C.green, background: `${C.green}10` }}>SIGNAL</span>
        </div>
        {data && (
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.muted }}>{data.date} PM</span>
        )}
      </header>

      {/* 본문 */}
      {isLoading || !data ? (
        <Skeleton />
      ) : (
        <PaywallBlur requiredTier="SIGNAL" userTier={userTier} className="min-h-[80vh]">
          <ScenarioContent data={data} />
        </PaywallBlur>
      )}
    </div>
  )
}
