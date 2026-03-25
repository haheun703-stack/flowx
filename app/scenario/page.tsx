'use client'

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useUserProfile } from '@/shared/lib/useUserProfile'
import { PaywallBlur } from '@/shared/ui/PaywallBlur'

interface ScenarioObj {
  name: string
  probability: number
  narrative_3m: string
  narrative_6m: string
  inflow_sectors: string[]
  outflow_sectors: string[]
  trigger_events: string[]
  historical_analogy: string
}

interface ScenarioData {
  date: string
  session: string
  flowx_html: string
  one_thing_title: string
  one_thing_body: string
  one_thing_category?: string
  scenario_main: ScenarioObj
  scenario_sub: ScenarioObj
  scenario_tail: ScenarioObj
  money_inflow: string
  money_outflow: string
  picks: string[]
  avoid: string[]
  checkpoints: string[]
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
          sandbox="allow-same-origin allow-scripts"
        />
      </div>

      {/* 우 40%: 텍스트 필드 */}
      <div style={{ padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 1. 오늘의 핵심 */}
        <Section label="오늘의 핵심" color={C.green}>
          <p style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.7 }}>{data.one_thing_title}</p>
          {data.one_thing_body && <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 8, whiteSpace: 'pre-wrap' }}>{data.one_thing_body}</p>}
        </Section>

        {/* 2. 시나리오 3종 */}
        <ScenarioCard scenario={data.scenario_main} color={C.blue} />
        <ScenarioCard scenario={data.scenario_sub} color={C.green} />
        <ScenarioCard scenario={data.scenario_tail} color={C.red} />

        {/* 3. 자금 흐름 */}
        {data.money_inflow && (
          <Section label="자금 유입" color={C.green}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.money_inflow}</p>
          </Section>
        )}
        {data.money_outflow && (
          <Section label="자금 유출" color={C.red}>
            <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{data.money_outflow}</p>
          </Section>
        )}

        {/* 4. 관심 / 회피 종목 */}
        {data.picks?.length > 0 && (
          <Section label="관심 종목" color={C.amber}>
            <ul style={{ fontSize: 13, color: C.text, lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              {data.picks.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </Section>
        )}
        {data.avoid?.length > 0 && (
          <Section label="회피 종목" color={C.red}>
            <ul style={{ fontSize: 13, color: C.text, lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              {data.avoid.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </Section>
        )}

        {/* 5. 체크포인트 */}
        {data.checkpoints?.length > 0 && (
          <Section label="체크포인트" color={C.purple}>
            <ul style={{ fontSize: 13, color: C.text, lineHeight: 1.7, paddingLeft: 16, margin: 0 }}>
              {data.checkpoints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </Section>
        )}
      </div>
    </div>
  )
}

function ScenarioCard({ scenario, color }: { scenario: ScenarioObj; color: string }) {
  return (
    <Section label={`${scenario.name} (${scenario.probability}%)`} color={color}>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
        <strong style={{ color }}>3개월:</strong> {scenario.narrative_3m}
      </p>
      <p style={{ fontSize: 13, color: C.text, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 8 }}>
        <strong style={{ color }}>6개월:</strong> {scenario.narrative_6m}
      </p>
      {scenario.trigger_events?.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>트리거:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {scenario.trigger_events.map((t, i) => (
              <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${color}15`, border: `1px solid ${color}30`, color }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {scenario.historical_analogy && (
        <p style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>
          유사 사례: {scenario.historical_analogy}
        </p>
      )}
    </Section>
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
