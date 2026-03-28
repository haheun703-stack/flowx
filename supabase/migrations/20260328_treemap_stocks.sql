-- FLOWX 트리맵: 전체 KR 종목 섹터 매핑 + 수급 데이터
-- 기존 정적 sector_stocks.json 대체
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS treemap_stocks (
    ticker TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL,
    market TEXT NOT NULL DEFAULT 'KOSPI',
    change_pct REAL DEFAULT 0,
    foreign_net BIGINT DEFAULT 0,
    institution_net BIGINT DEFAULT 0,
    price BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_treemap_sector
    ON treemap_stocks (sector);

CREATE INDEX IF NOT EXISTS idx_treemap_updated
    ON treemap_stocks (updated_at DESC);

SELECT 'treemap_stocks' AS tbl, count(*) FROM treemap_stocks;
