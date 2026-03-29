-- ============================================
-- /swing 하위 탭 6개 테이블 마이그레이션
-- 실행: Supabase SQL Editor에서 전체 복사+실행
-- ============================================

-- 1. quant_market_brain (BRAIN 판단)
CREATE TABLE IF NOT EXISTS quant_market_brain (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quant_market_brain_date ON quant_market_brain(date DESC);
ALTER TABLE quant_market_brain ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quant_market_brain_read" ON quant_market_brain FOR SELECT USING (true);

-- 2. quant_sector_flow (섹터수급)
CREATE TABLE IF NOT EXISTS quant_sector_flow (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quant_sector_flow_date ON quant_sector_flow(date DESC);
ALTER TABLE quant_sector_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quant_sector_flow_read" ON quant_sector_flow FOR SELECT USING (true);

-- 3. quant_sector_momentum (섹터모멘텀)
CREATE TABLE IF NOT EXISTS quant_sector_momentum (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quant_sector_momentum_date ON quant_sector_momentum(date DESC);
ALTER TABLE quant_sector_momentum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quant_sector_momentum_read" ON quant_sector_momentum FOR SELECT USING (true);

-- 4. sector_rotation (섹터로테이션 — 다중행, 날짜+섹터별 1행)
CREATE TABLE IF NOT EXISTS sector_rotation (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  sector TEXT NOT NULL,
  etf_code TEXT,
  category TEXT,
  momentum_score REAL DEFAULT 0,
  rank INT DEFAULT 0,
  rank_prev INT DEFAULT 0,
  rank_change INT DEFAULT 0,
  ret_5d REAL DEFAULT 0,
  ret_20d REAL DEFAULT 0,
  ret_60d REAL DEFAULT 0,
  rsi_14 REAL DEFAULT 50,
  rel_strength REAL DEFAULT 0,
  vol_ratio REAL DEFAULT 1,
  foreign_cum REAL DEFAULT 0,
  inst_cum REAL DEFAULT 0,
  signal TEXT,
  signal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sector_rotation_date ON sector_rotation(date DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sector_rotation_date_sector ON sector_rotation(date, sector);
ALTER TABLE sector_rotation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sector_rotation_read" ON sector_rotation FOR SELECT USING (true);

-- 5. quant_etf_fund_flow (ETF수급)
CREATE TABLE IF NOT EXISTS quant_etf_fund_flow (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quant_etf_fund_flow_date ON quant_etf_fund_flow(date DESC);
ALTER TABLE quant_etf_fund_flow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quant_etf_fund_flow_read" ON quant_etf_fund_flow FOR SELECT USING (true);

-- 6. quant_etf_recommendation (ETF추천)
CREATE TABLE IF NOT EXISTS quant_etf_recommendation (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date DATE NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quant_etf_recommendation_date ON quant_etf_recommendation(date DESC);
ALTER TABLE quant_etf_recommendation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quant_etf_recommendation_read" ON quant_etf_recommendation FOR SELECT USING (true);

-- service_role용 INSERT/UPDATE 정책 (봇 업로드용)
CREATE POLICY "quant_market_brain_write" ON quant_market_brain FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quant_sector_flow_write" ON quant_sector_flow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quant_sector_momentum_write" ON quant_sector_momentum FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sector_rotation_write" ON sector_rotation FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quant_etf_fund_flow_write" ON quant_etf_fund_flow FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quant_etf_recommendation_write" ON quant_etf_recommendation FOR ALL USING (true) WITH CHECK (true);
