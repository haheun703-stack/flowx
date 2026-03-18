-- ============================================
-- FLOWX Phase C-3: 인텔리전스 페이지 테이블 4개
-- 실행: Supabase Dashboard → SQL Editor에서 실행
-- ============================================

-- 1. 글로벌/국내 핫이슈
CREATE TABLE IF NOT EXISTS intelligence_news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  scope text NOT NULL CHECK (scope IN ('GLOBAL','DOMESTIC')),
  rank integer NOT NULL CHECK (rank >= 1 AND rank <= 20),
  title text NOT NULL,
  impact text NOT NULL DEFAULT 'MEDIUM'
    CHECK (impact IN ('HIGH','MEDIUM','LOW')),
  impact_score integer DEFAULT 3 CHECK (impact_score >= 1 AND impact_score <= 5),
  kr_impact text,                          -- 한국 영향 1줄 요약
  related_tickers jsonb DEFAULT '[]',      -- [{"code":"005930","name":"삼성전자","change_pct":5.7}]
  sectors jsonb DEFAULT '[]',              -- ["반도체","자동차"]
  source text,                             -- GDELT / Finnhub / JGIS
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, scope, rank)
);

-- 2. DART + EDGAR 공시
CREATE TABLE IF NOT EXISTS intelligence_disclosures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  source text NOT NULL CHECK (source IN ('DART','EDGAR')),
  ticker text,
  ticker_name text,
  title text NOT NULL,
  category text,                           -- 수주계약 / 최대주주변경 / 자사주 / 유상증자 / 실적 / 13F / 10-K / 8-K
  sentiment text DEFAULT 'NEUTRAL'
    CHECK (sentiment IN ('POSITIVE','CAUTION','NEUTRAL')),
  ai_summary text,                         -- AI 해석 (사람 말로)
  tags jsonb DEFAULT '[]',                 -- ["#반도체","#HBM","#설비투자"]
  original_url text,
  created_at timestamptz DEFAULT now()
);

-- 3. CHAIN MAP 시나리오 (킬러 콘텐츠)
CREATE TABLE IF NOT EXISTS intelligence_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  title text NOT NULL,                     -- "구리 선물 급등의 나비 효과"
  trigger_event text NOT NULL,             -- 트리거 이벤트 1줄
  chain_steps jsonb NOT NULL DEFAULT '[]', -- ["구리 급등","전선 원가 상승","광산주 수혜"]
  beneficiary_sectors jsonb DEFAULT '[]',  -- ["비철금속","2차전지 소재"]
  watch_tickers jsonb DEFAULT '[]',        -- [{"code":"103140","name":"풍산"},...]
  confidence integer DEFAULT 3
    CHECK (confidence >= 1 AND confidence <= 5),
  time_frame text DEFAULT 'MID'
    CHECK (time_frame IN ('SHORT','MID','LONG')),  -- 단기/중기/장기
  reasoning text,                          -- 상세 설명
  status text DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE','EXPIRED','HIT','MISS')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. 수급 흐름 종합
CREATE TABLE IF NOT EXISTS intelligence_supply_demand (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  foreign_net bigint DEFAULT 0,            -- 외국인 순매수 (억원)
  inst_net bigint DEFAULT 0,               -- 기관 순매수
  individual_net bigint DEFAULT 0,         -- 개인 순매수
  foreign_streak integer DEFAULT 0,        -- 연속 순매수일 (+) / 순매도일 (-)
  inst_streak integer DEFAULT 0,
  sector_flows jsonb DEFAULT '[]',         -- [{"sector":"반도체","foreign_net":823,"streak":3}]
  summary text,                            -- AI 요약 1줄
  created_at timestamptz DEFAULT now()
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_intel_news_date ON intelligence_news(date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_news_scope ON intelligence_news(scope, date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_disc_date ON intelligence_disclosures(date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_disc_source ON intelligence_disclosures(source, date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_scenario_date ON intelligence_scenarios(date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_scenario_status ON intelligence_scenarios(status);
CREATE INDEX IF NOT EXISTS idx_intel_supply_date ON intelligence_supply_demand(date DESC);

-- ── updated_at 트리거 (scenarios) ──
CREATE TRIGGER trg_intel_scenarios_updated_at
  BEFORE UPDATE ON intelligence_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE intelligence_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_supply_demand ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_intel_news" ON intelligence_news FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_intel_disc" ON intelligence_disclosures FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_intel_scenarios" ON intelligence_scenarios FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_intel_supply" ON intelligence_supply_demand FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_intel_news" ON intelligence_news FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_intel_disc" ON intelligence_disclosures FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_intel_scenarios" ON intelligence_scenarios FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_intel_supply" ON intelligence_supply_demand FOR ALL TO service_role USING (true);
