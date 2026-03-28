-- FLOWX 밸류에이션: stock_valuations
-- KISOpenAPI financial_analysis summary.json + quarterly 재무제표 기반
-- 적정가(5모델), ROE, D/E, 실적 트렌드 → 매주 갱신
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS stock_valuations (
    ticker TEXT PRIMARY KEY,
    name TEXT,
    date DATE,
    -- 현재가 / 시총
    price BIGINT DEFAULT 0,
    market_cap BIGINT DEFAULT 0,
    -- 밸류에이션 모델 (적정가 합의)
    fair_value_1yr REAL DEFAULT 0,
    fair_value_2yr REAL DEFAULT 0,
    fair_value_3yr REAL DEFAULT 0,
    safety_margin REAL DEFAULT 0,
    -- 개별 모델 결과
    per_value REAL DEFAULT 0,
    dcf_value REAL DEFAULT 0,
    rim_value REAL DEFAULT 0,
    peg_value REAL DEFAULT 0,
    ev_ebitda_value REAL DEFAULT 0,
    -- 펀더멘탈
    roe REAL DEFAULT 0,
    debt_to_equity REAL DEFAULT 0,
    per_5yr_avg REAL DEFAULT 0,
    eps_ttm REAL DEFAULT 0,
    -- 성장 / 안정성
    revenue_growth REAL DEFAULT 0,
    earnings_stability REAL DEFAULT 0,
    -- 최근 분기 실적
    latest_q_revenue BIGINT DEFAULT 0,
    latest_q_op_income BIGINT DEFAULT 0,
    latest_q_net_income BIGINT DEFAULT 0,
    op_margin REAL DEFAULT 0,
    -- 분기 트렌드 (최근 4분기 매출 YoY 성장률)
    revenue_yoy REAL DEFAULT 0,
    op_income_yoy REAL DEFAULT 0,
    -- 종합 시그널
    valuation_signal TEXT DEFAULT '',
    valuation_score REAL DEFAULT 0,
    -- 메타
    data_source TEXT DEFAULT 'KISOpenAPI',
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_valuations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON stock_valuations
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service write" ON stock_valuations
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_valuation_signal
    ON stock_valuations (valuation_signal);

CREATE INDEX IF NOT EXISTS idx_valuation_safety
    ON stock_valuations (safety_margin DESC);

CREATE INDEX IF NOT EXISTS idx_valuation_roe
    ON stock_valuations (roe DESC);

CREATE INDEX IF NOT EXISTS idx_valuation_updated
    ON stock_valuations (updated_at DESC);

SELECT 'stock_valuations' AS tbl, count(*) FROM stock_valuations;
