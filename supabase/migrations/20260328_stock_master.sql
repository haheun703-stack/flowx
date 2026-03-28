-- FLOWX 종목 기본정보: stock_master
-- 모든 페이지에서 ticker → name, sector, market 매핑용
-- 소스: all_tickers.csv + treemap_stocks (2544+종목)
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS stock_master (
    ticker TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    sector TEXT DEFAULT '',
    market TEXT DEFAULT '',        -- KOSPI / KOSDAQ / US
    market_cap BIGINT DEFAULT 0,   -- 억원 (KR) / M USD (US)
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_master ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON stock_master
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service write" ON stock_master
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_stock_master_sector
    ON stock_master (sector);

CREATE INDEX IF NOT EXISTS idx_stock_master_market
    ON stock_master (market);

SELECT 'stock_master' AS tbl, count(*) FROM stock_master;
