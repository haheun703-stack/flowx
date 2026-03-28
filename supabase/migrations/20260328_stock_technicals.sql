-- FLOWX 기술적 지표: stock_technicals
-- 개별 종목 RSI/MACD/BB/Stoch/ATR/ADX 등
-- KISOpenAPI stock_data_daily 소스 → 매일 갱신
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS stock_technicals (
    ticker TEXT PRIMARY KEY,
    name TEXT,
    date DATE,
    -- 가격
    price BIGINT DEFAULT 0,
    open_price BIGINT DEFAULT 0,
    high_price BIGINT DEFAULT 0,
    low_price BIGINT DEFAULT 0,
    volume BIGINT DEFAULT 0,
    -- 이동평균
    ma5 REAL DEFAULT 0,
    ma20 REAL DEFAULT 0,
    ma60 REAL DEFAULT 0,
    ma120 REAL DEFAULT 0,
    -- 추세/모멘텀
    rsi REAL DEFAULT 50,
    macd REAL DEFAULT 0,
    macd_signal REAL DEFAULT 0,
    macd_histogram REAL DEFAULT 0,
    adx REAL DEFAULT 0,
    -- 볼린저밴드
    bb_upper REAL DEFAULT 0,
    bb_lower REAL DEFAULT 0,
    bb_pct REAL DEFAULT 50,
    -- 스토캐스틱
    stoch_k REAL DEFAULT 50,
    stoch_d REAL DEFAULT 50,
    -- 변동성
    atr REAL DEFAULT 0,
    -- 거래량
    obv BIGINT DEFAULT 0,
    volume_ratio REAL DEFAULT 1,
    -- TRIX
    trix REAL DEFAULT 0,
    trix_signal REAL DEFAULT 0,
    -- 종합 시그널 (scanner가 판단)
    tech_signal TEXT DEFAULT '',
    tech_score REAL DEFAULT 0,
    -- 메타
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE stock_technicals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON stock_technicals
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service write" ON stock_technicals
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_stock_tech_signal
    ON stock_technicals (tech_signal);

CREATE INDEX IF NOT EXISTS idx_stock_tech_rsi
    ON stock_technicals (rsi);

CREATE INDEX IF NOT EXISTS idx_stock_tech_updated
    ON stock_technicals (updated_at DESC);

SELECT 'stock_technicals' AS tbl, count(*) FROM stock_technicals;
