'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

/* ═══ Types ═══ */
interface ApiSector {
  sector_id: string
  sector_name: string
  role_in_theme: string
  story: string
  stocks: { ticker: string; name: string; reason: string; key_metric: string }[]
}
interface ApiTheme {
  theme_id: string
  theme_name: string
  analysis_date: string
  narrative: string
  investment_flow: string | null
  risk_factors: string[]
  sectors: ApiSector[]
  source: string
}

/* ═══ Static metadata (SECTOR_UNIVERSE 기반) ═══ */
interface ThemeMeta {
  id: string
  name: string
  color: string
  desc: string
  investmentFlow: string
}

const THEMES: ThemeMeta[] = [
  { id: 'ai-datacenter', name: 'AI 데이터센터', color: '#2563EB', desc: 'AI 인프라 구축을 위한 반도체·전력·냉각·SW 밸류체인', investmentFlow: 'AI 수요 폭증 → GPU/HBM 투자 → 전력소비 급증 → 변압기·냉각 수혜 → 원전 르네상스' },
  { id: 'decarbonization', name: '탈탄소·에너지전환', color: '#16A34A', desc: '전기차·원전·신재생·LNG 등 탄소중립 에너지 밸류체인', investmentFlow: '탄소중립 정책 → EV·배터리 투자 → 전력수요 급증 → 원전·SMR 부활 → LNG 전환수요' },
  { id: 'geopolitics-security', name: '지정학·안보', color: '#DC2626', desc: '글로벌 안보 재편에 따른 방산·조선·공급망 안보 밸류체인', investmentFlow: '지정학 긴장 → 국방비 증액 → K-방산 수출 급증 → 해군력 강화 → 공급망 리쇼어링' },
  { id: 'digital-transformation', name: '디지털전환', color: '#7C3AED', desc: 'AI·로봇·핀테크로 산업과 일상을 혁신하는 디지털 전환', investmentFlow: 'AI 기술 성숙 → 기업 디지털화 → 로봇·자동화 → 핀테크 확산 → 플랫폼 경제' },
  { id: 'domestic-consumption', name: '내수·소비', color: '#F59E0B', desc: 'K-뷰티·K-콘텐츠·금융·건설 등 내수·한류 소비 밸류체인', investmentFlow: '금리 인하 기대 → 소비 회복 → K-뷰티·K-콘텐츠 확장 → 건설 반등 → 금융 수혜' },
]

const THEME_FLOWS = [
  { from: 'ai-datacenter', to: 'decarbonization', label: 'AI 전력수요 → 원전·신재생 투자' },
  { from: 'ai-datacenter', to: 'digital-transformation', label: 'AI 인프라 → 기업 디지털전환 가속' },
  { from: 'decarbonization', to: 'geopolitics-security', label: '에너지 안보 → 핵심광물 공급망 경쟁' },
  { from: 'geopolitics-security', to: 'ai-datacenter', label: '반도체 공급망 안보 → 리쇼어링 투자' },
  { from: 'digital-transformation', to: 'domestic-consumption', label: '핀테크·AI → 소비 경험 혁신' },
  { from: 'domestic-consumption', to: 'digital-transformation', label: 'K-콘텐츠 IP → 디지털 플랫폼 확장' },
]

/* ═══ Fallback sub-sectors (API 데이터 없을 때) ═══ */
interface FbStock { ticker: string; name: string; role: string }
interface FbSector { id: string; name: string; keyword: string; stocks: FbStock[] }

const FB: Record<string, FbSector[]> = {
  'ai-datacenter': [
    { id: 'hbm-ai-chip', name: 'HBM·AI반도체', keyword: 'GPU 1기당 HBM 8장, AI 학습 메모리 병목', stocks: [
      { ticker: '000660', name: 'SK하이닉스', role: 'HBM3E 글로벌 점유율 53%' },
      { ticker: '005930', name: '삼성전자', role: 'HBM3E 양산 + GAA 파운드리' },
      { ticker: '042700', name: '한미반도체', role: 'HBM TC본더 글로벌 독점' },
    ]},
    { id: 'semiconductor-equipment', name: '반도체 장비·소재', keyword: '첨단 공정 투자 확대, EUV·증착·식각', stocks: [
      { ticker: '036930', name: '주성엔지니어링', role: 'ALD 증착장비' },
      { ticker: '240810', name: '원익IPS', role: 'CVD/ALD 장비' },
      { ticker: '084370', name: '유진테크', role: '퍼니스 장비' },
    ]},
    { id: 'power-equipment', name: '전력장비', keyword: '데이터센터 변압기 수주 폭증, 납기 3년', stocks: [
      { ticker: '267260', name: 'HD현대일렉트릭', role: '초고압 변압기 Top5' },
      { ticker: '298040', name: '효성중공업', role: '초고압 변압기·STATCOM' },
      { ticker: '010120', name: 'LS ELECTRIC', role: '배전반·UPS' },
      { ticker: '062040', name: '산일전기', role: '154kV 변압기 1위' },
      { ticker: '103590', name: '일진전기', role: '변압기·전력케이블' },
    ]},
    { id: 'cooling-infra', name: '냉각·DC인프라', keyword: '액침냉각 시장 연 40% 성장', stocks: [
      { ticker: '034020', name: '두산에너빌리티', role: '가스터빈·냉각 솔루션' },
      { ticker: '057050', name: '아진산업', role: '정밀 냉각 부품' },
    ]},
    { id: 'ai-platform-sw', name: 'AI 플랫폼·SW', keyword: '클라우드 AI, 엔터프라이즈 AI 도입', stocks: [
      { ticker: '035420', name: '네이버', role: 'HyperCLOVA X' },
      { ticker: '035720', name: '카카오', role: '카나나 AI' },
      { ticker: '018260', name: '삼성SDS', role: 'Brity AI' },
    ]},
  ],
  'decarbonization': [
    { id: 'battery-cell', name: '배터리셀', keyword: '글로벌 EV 배터리 3사 과점', stocks: [
      { ticker: '373220', name: 'LG에너지솔루션', role: '글로벌 배터리 2위' },
      { ticker: '006400', name: '삼성SDI', role: '46파이 배터리' },
      { ticker: '096770', name: 'SK이노베이션', role: 'SK on' },
    ]},
    { id: 'cathode-material', name: '양극재·소재', keyword: '하이니켈 양극재 기술 선도, 리사이클링', stocks: [
      { ticker: '247540', name: '에코프로비엠', role: '하이니켈 NCA' },
      { ticker: '003670', name: '포스코퓨처엠', role: '양극재+음극재 수직계열화' },
      { ticker: '066970', name: '엘앤에프', role: 'NCMA 양극재' },
      { ticker: '365340', name: '성일하이텍', role: '폐배터리 리사이클링' },
    ]},
    { id: 'nuclear-smr', name: '원전·SMR', keyword: 'AI 전력 수요로 원전 르네상스, SMR 2030', stocks: [
      { ticker: '034020', name: '두산에너빌리티', role: '원전 기자재 국내 독점' },
      { ticker: '052690', name: '한전기술', role: 'APR1400 원전 설계' },
      { ticker: '083650', name: '비에이치아이', role: '원전 보일러' },
    ]},
    { id: 'renewable-energy', name: '풍력·태양광', keyword: '해상풍력 확대, RE100 의무화', stocks: [
      { ticker: '112610', name: '씨에스윈드', role: '풍력타워 글로벌 1위' },
      { ticker: '322000', name: 'HD현대에너지솔루션', role: '태양광 모듈' },
    ]},
    { id: 'lng-carrier', name: 'LNG 운반선', keyword: 'LNG선 수주 한국 3사 독점', stocks: [
      { ticker: '009540', name: 'HD한국조선', role: 'LNG선 글로벌 1위' },
      { ticker: '010140', name: '삼성중공업', role: 'LNG FPSO' },
      { ticker: '033500', name: '동성화인텍', role: 'LNG 탱크 단열재' },
    ]},
  ],
  'geopolitics-security': [
    { id: 'missile-guided', name: '미사일·유도무기', keyword: '천궁·현무 수출, 폴란드 $17B', stocks: [
      { ticker: '012450', name: '한화에어로스페이스', role: '항공엔진·방산' },
      { ticker: '079550', name: 'LIG넥스원', role: '천궁II 미사일' },
      { ticker: '103140', name: '풍산', role: '탄약 글로벌 공급' },
    ]},
    { id: 'aerospace', name: '항공·우주', keyword: 'KF-21 양산, 우주발사체, UAM', stocks: [
      { ticker: '047810', name: '한국항공우주', role: 'KF-21 전투기' },
      { ticker: '272210', name: '한화시스템', role: 'AESA 레이더' },
    ]},
    { id: 'ground-naval', name: '지상·해양 무기', keyword: 'K2 전차·K9 자주포 수출', stocks: [
      { ticker: '064350', name: '현대로템', role: 'K2 전차' },
      { ticker: '042660', name: '한화오션', role: '잠수함·호위함' },
    ]},
    { id: 'naval-shipbuilding', name: '해군 함정', keyword: '해군력 증강, 동맹국 함정 수출', stocks: [
      { ticker: '009540', name: 'HD한국조선', role: '해군 함정' },
      { ticker: '267250', name: 'HD현대중공업', role: '해군 특수선' },
    ]},
    { id: 'supply-chain-security', name: '공급망 안보', keyword: '반도체 리쇼어링, 핵심광물 확보', stocks: [
      { ticker: '047050', name: '포스코인터내셔널', role: '핵심광물 확보' },
      { ticker: '011070', name: 'LG이노텍', role: '애플 공급망 핵심' },
    ]},
  ],
  'digital-transformation': [
    { id: 'ai-platform', name: 'AI 플랫폼·LLM', keyword: '한국형 LLM, 기업용 AI 에이전트', stocks: [
      { ticker: '035420', name: '네이버', role: 'HyperCLOVA X' },
      { ticker: '035720', name: '카카오', role: '카나나 AI' },
      { ticker: '304100', name: '솔트룩스', role: 'LUXIA LLM' },
    ]},
    { id: 'enterprise-sw', name: '엔터프라이즈 SW', keyword: 'SaaS 전환, AI 업무 자동화', stocks: [
      { ticker: '018260', name: '삼성SDS', role: '기업 IT서비스' },
      { ticker: '012510', name: '더존비즈온', role: 'ERP·회계 SaaS' },
      { ticker: '030520', name: '한글과컴퓨터', role: '오피스SW' },
    ]},
    { id: 'robot-automation', name: '로봇·자동화', keyword: '휴머노이드, 협동로봇, 스마트팩토리', stocks: [
      { ticker: '277810', name: '레인보우로보틱스', role: '휴머노이드 HUBO' },
      { ticker: '454910', name: '두산로보틱스', role: '협동로봇 Top5' },
      { ticker: '108490', name: '로보티즈', role: '서보 액추에이터' },
    ]},
    { id: 'fintech-payment', name: '핀테크·결제', keyword: '간편결제, 토큰증권, 디지털 자산', stocks: [
      { ticker: '377300', name: '카카오페이', role: '간편결제·송금' },
      { ticker: '035600', name: 'KG이니시스', role: 'PG 1위' },
      { ticker: '064260', name: '다날', role: '휴대폰 결제' },
    ]},
  ],
  'domestic-consumption': [
    { id: 'k-beauty', name: 'K-뷰티', keyword: '중국·일본·미국 수출 급증, 인디브랜드', stocks: [
      { ticker: '090430', name: '아모레퍼시픽', role: '글로벌 K-뷰티 대표' },
      { ticker: '192820', name: '코스맥스', role: '글로벌 ODM 1위' },
      { ticker: '161890', name: '한국콜마', role: 'ODM 2위' },
      { ticker: '237880', name: '클리오', role: '색조 K-뷰티' },
    ]},
    { id: 'k-content', name: 'K-콘텐츠', keyword: 'K-POP·K-드라마 글로벌 팬덤, IP 사업', stocks: [
      { ticker: '352820', name: 'HYBE', role: 'BTS·세븐틴' },
      { ticker: '035900', name: 'JYP Ent.', role: '스트레이키즈' },
      { ticker: '253450', name: '스튜디오드래곤', role: 'K-드라마 1위' },
      { ticker: '035760', name: 'CJ ENM', role: '콘텐츠·커머스' },
    ]},
    { id: 'finance-insurance', name: '금융·보험', keyword: '밸류업 프로그램, 배당 확대, 금리 인하', stocks: [
      { ticker: '105560', name: 'KB금융', role: '금융지주 1위' },
      { ticker: '055550', name: '신한지주', role: '디지털 전환 리더' },
      { ticker: '138040', name: '메리츠금융', role: 'ROE 최고' },
      { ticker: '005830', name: 'DB손보', role: '손해보험' },
    ]},
    { id: 'construction-infra', name: '건설·인프라', keyword: 'GTX, 3기 신도시, 해외 플랜트', stocks: [
      { ticker: '000720', name: '현대건설', role: '해외 플랜트' },
      { ticker: '006360', name: 'GS건설', role: '주택·인프라' },
      { ticker: '375500', name: 'DL이앤씨', role: '플랜트·토목' },
    ]},
  ],
}

/* ═══ Helpers ═══ */
const themeName = (id: string) => THEMES.find(t => t.id === id)?.name ?? id
const themeColor = (id: string) => THEMES.find(t => t.id === id)?.color ?? '#6B7280'

const SOURCE_LABEL: Record<string, string> = {
  'claude+perplexity': 'AI 심층분석',
  'claude_only': 'AI 분석',
  'rule_based': '규칙 기반',
}

/* ═══ Component ═══ */
export default function MegaThemeFishboneView() {
  const [selected, setSelected] = useState('ai-datacenter')
  const [apiData, setApiData] = useState<Record<string, ApiTheme>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ac = new AbortController()
    fetch('/api/intelligence/mega-theme', { signal: ac.signal })
      .then(r => r.json())
      .then(res => {
        const map: Record<string, ApiTheme> = {}
        for (const item of res.data ?? []) map[item.theme_id] = item
        setApiData(map)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [])

  const theme = THEMES.find(t => t.id === selected)!
  const api = apiData[selected]

  /* 서브섹터: API 우선 → 폴백 */
  const sectors = Array.isArray(api?.sectors)
    ? api.sectors.map(s => ({
        id: s.sector_id,
        name: s.sector_name,
        desc: s.story || s.role_in_theme,
        stocks: s.stocks.map(st => ({ ticker: st.ticker, name: st.name, role: st.reason || st.key_metric })),
      }))
    : (FB[selected] ?? []).map(s => ({
        id: s.id,
        name: s.name,
        desc: s.keyword,
        stocks: s.stocks,
      }))

  /* 투자 흐름 단계 분리 */
  const flowText = api?.investment_flow ?? theme.investmentFlow
  const flowSteps = flowText.split(/\s*→\s*/).filter(Boolean)

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      {/* ── 헤더 ── */}
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-1">메가테마 피쉬본</h1>
      <p className="text-sm text-[#6B7280] mb-6">
        5대 메가테마 · 23개 서브섹터 · 69개 핵심 종목의 투자 연결고리
      </p>

      {/* ── 테마 탭 ── */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {THEMES.map(t => {
          const isActive = selected === t.id
          const hasApi = !!apiData[t.id]
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`shrink-0 px-4 py-3 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'bg-white shadow-md'
                  : 'bg-[#FAFAF8] border-transparent hover:border-[#E8E6E0]'
              }`}
              style={{ borderColor: isActive ? t.color : undefined }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className={`text-sm font-bold ${isActive ? 'text-[#1A1A2E]' : 'text-[#6B7280]'}`}>
                  {t.name}
                </span>
                {hasApi && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#E8F5E9] text-[#16A34A] font-semibold">
                    AI
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-[#6B7280]">데이터 로딩 중...</div>
      ) : (
        <>
          {/* ── 테마 상세 ── */}
          <div className="mb-8">
            {/* 테마 헤더 */}
            <div
              className="border-l-4 pl-4 mb-6"
              style={{ borderLeftColor: theme.color }}
            >
              <h2 className="text-xl font-bold text-[#1A1A2E]">{theme.name}</h2>
              <p className="text-sm text-[#6B7280] mt-1">{theme.desc}</p>
            </div>

            {/* 투자 흐름 */}
            <div className="bg-[#FAFAF8] rounded-lg p-4 mb-6">
              <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-3">
                투자 흐름 (Investment Flow)
              </h3>
              <div className="flex items-center gap-1 flex-wrap">
                {flowSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <span
                      className="text-sm font-semibold px-3 py-1.5 rounded-full text-white"
                      style={{ backgroundColor: theme.color }}
                    >
                      {step}
                    </span>
                    {i < flowSteps.length - 1 && (
                      <span className="text-[#9CA3AF] text-lg font-bold">&rarr;</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* AI 분석 내러티브 */}
            {api?.narrative && (
              <div className="bg-white border border-[#E8E6E0] rounded-lg p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-bold text-[#1A1A2E]">AI 분석 코멘터리</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#7C3AED] font-semibold">
                    {SOURCE_LABEL[api.source] ?? api.source}
                  </span>
                  <span className="text-[11px] text-[#9CA3AF]">{api.analysis_date}</span>
                </div>
                <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-line">
                  {api.narrative}
                </p>
              </div>
            )}

            {/* 리스크 팩터 */}
            {api?.risk_factors && api.risk_factors.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs font-bold text-[#DC2626]">RISK</span>
                {api.risk_factors.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 서브섹터 피쉬본 ── */}
          <div className="mb-10">
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">
              서브섹터 · 핵심 종목
              <span className="text-[#9CA3AF] font-normal ml-2">
                {sectors.length}개 섹터 · {sectors.reduce((n, s) => n + s.stocks.length, 0)}개 종목
              </span>
            </h3>

            {/* 피쉬본 레이아웃: 중앙 스파인 + 좌우 카드 */}
            <div className="relative">
              {/* 중앙 스파인 라인 */}
              <div
                className="absolute left-1/2 top-0 bottom-0 w-0.5 hidden md:block"
                style={{ backgroundColor: theme.color, opacity: 0.2 }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectors.map((sec, idx) => (
                  <div
                    key={sec.id}
                    className={`bg-white border border-[#E8E6E0] rounded-lg overflow-hidden ${
                      idx % 2 === 0 ? 'md:pr-4' : 'md:pl-4'
                    }`}
                  >
                    {/* 섹터 헤더 */}
                    <div
                      className="px-4 py-3 border-b border-[#F3F4F6]"
                      style={{ borderLeftWidth: 4, borderLeftColor: theme.color }}
                    >
                      <h4 className="text-sm font-bold text-[#1A1A2E]">{sec.name}</h4>
                      <p className="text-xs text-[#6B7280] mt-0.5">{sec.desc}</p>
                    </div>

                    {/* 종목 리스트 */}
                    <div className="divide-y divide-[#F9FAFB]">
                      {sec.stocks.map(stock => (
                        <Link
                          key={stock.ticker}
                          href={`/stock/${stock.ticker}`}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-[#F9FAFB] transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-semibold text-[#1A1A2E] group-hover:text-[#2563EB] transition-colors">
                              {stock.name}
                            </span>
                            <span className="text-[11px] text-[#9CA3AF] shrink-0">{stock.ticker}</span>
                          </div>
                          <span className="text-xs text-[#6B7280] text-right ml-2 shrink-0 max-w-[180px] truncate">
                            {stock.role}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── 테마 간 연결 ── */}
          <div className="bg-[#FAFAF8] rounded-lg p-5">
            <h3 className="text-sm font-bold text-[#1A1A2E] mb-4">
              테마 간 연결 (Mega Theme Connections)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEME_FLOWS.map(flow => (
                <div
                  key={`${flow.from}-${flow.to}`}
                  className="bg-white rounded-lg px-4 py-3 border border-[#E8E6E0] flex items-start gap-3"
                >
                  <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: themeColor(flow.from) }}
                    />
                    <span className="text-[#9CA3AF] text-xs">&rarr;</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: themeColor(flow.to) }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-[#6B7280]">
                      <span className="font-semibold" style={{ color: themeColor(flow.from) }}>
                        {themeName(flow.from)}
                      </span>
                      {' → '}
                      <span className="font-semibold" style={{ color: themeColor(flow.to) }}>
                        {themeName(flow.to)}
                      </span>
                    </div>
                    <p className="text-sm text-[#374151] mt-0.5">{flow.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI 데이터 없을 때 안내 */}
          {!api && (
            <div className="mt-6 text-center text-sm text-[#9CA3AF] py-4">
              AI 분석 데이터 대기 중 — 정보봇이 매일 장후 2개 테마씩 순환 생성합니다
            </div>
          )}
        </>
      )}
    </div>
  )
}
