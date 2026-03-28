-- FLOWX 섹터 로테이션: sector_rotation
-- KR 섹터 ETF 모멘텀 + 수급 + 트레이딩 시그널
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS sector_rotation (
    date DATE NOT NULL,
    sector TEXT NOT NULL,
    etf_code TEXT,
    category TEXT DEFAULT 'sector',
    -- 모멘텀
    momentum_score REAL DEFAULT 0,
    rank INT DEFAULT 0,
    rank_prev INT DEFAULT 0,
    rank_change INT DEFAULT 0,
    -- 수익률
    ret_5d REAL DEFAULT 0,
    ret_20d REAL DEFAULT 0,
    ret_60d REAL DEFAULT 0,
    -- 기술지표
    rsi_14 REAL DEFAULT 50,
    rel_strength REAL DEFAULT 0,
    vol_ratio REAL DEFAULT 1,
    -- 수급 (억원, 5일 누적)
    foreign_cum BIGINT DEFAULT 0,
    inst_cum BIGINT DEFAULT 0,
    -- 시그널
    signal TEXT DEFAULT '',
    signal_reason TEXT DEFAULT '',
    -- 메타
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (date, sector)
);

ALTER TABLE sector_rotation ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON sector_rotation
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service write" ON sector_rotation
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_sector_rotation_date
    ON sector_rotation (date DESC);

CREATE INDEX IF NOT EXISTS idx_sector_rotation_rank
    ON sector_rotation (date DESC, rank);

SELECT 'sector_rotation' AS tbl, count(*) FROM sector_rotation;
