-- treemap_stocks — 트리맵용 전종목 (500+)
-- 정보봇이 매일 16:52 upsert
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS treemap_stocks (
    ticker TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    market_cap REAL DEFAULT 0,
    change_pct REAL DEFAULT 0,
    trading_value REAL DEFAULT 0,
    close REAL DEFAULT 0,
    volume BIGINT DEFAULT 0,
    market TEXT DEFAULT 'KR',
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_treemap_stocks_sector
    ON treemap_stocks(sector);

ALTER TABLE treemap_stocks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON treemap_stocks
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Service write" ON treemap_stocks
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
