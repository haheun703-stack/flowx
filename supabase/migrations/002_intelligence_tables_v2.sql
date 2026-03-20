-- ============================================
-- FLOWX Phase C-3: 인텔리전스 페이지 테이블
-- intelligence_scenarios는 003에서 별도 생성
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
  kr_impact text,
  related_tickers jsonb DEFAULT '[]',
  sectors jsonb DEFAULT '[]',
  source text,
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
  category text,
  sentiment text DEFAULT 'NEUTRAL'
    CHECK (sentiment IN ('POSITIVE','CAUTION','NEUTRAL')),
  ai_summary text,
  tags jsonb DEFAULT '[]',
  original_url text,
  created_at timestamptz DEFAULT now()
);

-- 3. 수급 흐름 종합
CREATE TABLE IF NOT EXISTS intelligence_supply_demand (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  foreign_net bigint DEFAULT 0,
  inst_net bigint DEFAULT 0,
  individual_net bigint DEFAULT 0,
  foreign_streak integer DEFAULT 0,
  inst_streak integer DEFAULT 0,
  sector_flows jsonb DEFAULT '[]',
  summary text,
  created_at timestamptz DEFAULT now()
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_intel_news_date ON intelligence_news(date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_news_scope ON intelligence_news(scope, date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_disc_date ON intelligence_disclosures(date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_disc_source ON intelligence_disclosures(source, date DESC);
CREATE INDEX IF NOT EXISTS idx_intel_supply_date ON intelligence_supply_demand(date DESC);

-- ── RLS ──
ALTER TABLE intelligence_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_disclosures ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligence_supply_demand ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_read_intel_news" ON intelligence_news FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_intel_disc" ON intelligence_disclosures FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "anon_read_intel_supply" ON intelligence_supply_demand FOR SELECT TO anon USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_all_intel_news" ON intelligence_news FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_all_intel_disc" ON intelligence_disclosures FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "service_all_intel_supply" ON intelligence_supply_demand FOR ALL TO service_role USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
