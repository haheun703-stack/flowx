-- FLOWX 시장 개요: market_overview
-- 시장 지수 + 체온(breadth) + 투자자 동향
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS market_overview (
    date DATE PRIMARY KEY,
    -- 한국 지수
    kospi_close INT DEFAULT 0,
    kospi_change_pct NUMERIC DEFAULT 0,
    kosdaq_close INT DEFAULT 0,
    kosdaq_change_pct NUMERIC DEFAULT 0,
    -- 미국 지수
    sp500_close NUMERIC DEFAULT 0,
    sp500_change_pct NUMERIC DEFAULT 0,
    nasdaq_close NUMERIC DEFAULT 0,
    nasdaq_change_pct NUMERIC DEFAULT 0,
    -- 시장 체온
    stocks_up INT DEFAULT 0,
    stocks_down INT DEFAULT 0,
    stocks_flat INT DEFAULT 0,
    breadth NUMERIC DEFAULT 0.5,
    -- 투자자 동향 (억원)
    foreign_net BIGINT DEFAULT 0,
    inst_net BIGINT DEFAULT 0,
    individual_net BIGINT DEFAULT 0,
    foreign_trend TEXT DEFAULT '',
    -- 메타
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE market_overview ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service key full access"
    ON market_overview FOR ALL
    USING (true) WITH CHECK (true);

CREATE POLICY "Anon read access"
    ON market_overview FOR SELECT
    USING (true);

CREATE INDEX IF NOT EXISTS idx_market_overview_date
    ON market_overview (date DESC);
