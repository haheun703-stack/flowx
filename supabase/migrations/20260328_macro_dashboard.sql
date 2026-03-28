-- ============================================================
-- FLOWX Macro Dashboard + Cost Floor — Supabase Migration
-- 2026-03-22  |  구독자용 원자재/환율/금리/센티먼트 대시보드
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ── 1. macro_dashboard — 매일 1행, 전체 매크로 스냅샷 ────────

CREATE TABLE IF NOT EXISTS macro_dashboard (
    date DATE PRIMARY KEY,

    -- 원자재 (6종)
    wti REAL,
    brent REAL,
    natural_gas REAL,
    gold REAL,
    silver REAL,
    copper REAL,

    -- 곡물 (3종)
    corn REAL,
    wheat REAL,
    soybean REAL,

    -- 환율
    usd_krw REAL,
    dxy REAL,

    -- 금리
    fed_funds REAL,
    us_10y REAL,
    us_2y REAL,
    us_10y_2y_spread REAL,
    hy_spread REAL,
    breakeven_5y REAL,

    -- 센티먼트
    vix REAL,
    fear_greed REAL,
    fear_greed_label TEXT,    -- 'Fear', 'Greed', 'Neutral' 등

    -- 지수
    kospi REAL,
    kosdaq REAL,
    sp500 REAL,

    -- 크립토
    btc REAL,
    eth REAL,

    -- 전일 대비 변동률 (%)
    wti_chg REAL,
    brent_chg REAL,
    ng_chg REAL,
    gold_chg REAL,
    silver_chg REAL,
    copper_chg REAL,
    corn_chg REAL,
    wheat_chg REAL,
    soybean_chg REAL,
    usd_krw_chg REAL,
    dxy_chg REAL,
    vix_chg REAL,
    kospi_chg REAL,
    sp500_chg REAL,
    btc_chg REAL,

    -- 추세 (5일 기준)
    wti_trend TEXT CHECK (wti_trend IN ('UP','DOWN','FLAT')),
    gold_trend TEXT CHECK (gold_trend IN ('UP','DOWN','FLAT')),
    usd_krw_trend TEXT CHECK (usd_krw_trend IN ('UP','DOWN','FLAT')),
    vix_trend TEXT CHECK (vix_trend IN ('UP','DOWN','FLAT')),

    -- 연속 상승/하락일
    wti_streak TEXT,
    gold_streak TEXT,
    usd_krw_streak TEXT,
    vix_streak TEXT,

    -- 경고 플래그
    alert_flags JSONB DEFAULT '[]'::jsonb,
    -- 예: ["VIX_HIGH", "USD_KRW_HIGH", "OIL_SURGE"]

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_macro_dash_date
    ON macro_dashboard(date DESC);

ALTER TABLE macro_dashboard ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read" ON macro_dashboard
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Service write" ON macro_dashboard
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ── 2. cost_floor — 원자재/종목 바닥-천장 게이지 ─────────────

CREATE TABLE IF NOT EXISTS cost_floor (
    name TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('commodity','stock')),
    ticker TEXT NOT NULL,

    -- 바닥/천장
    floor_name TEXT NOT NULL,
    floor_price REAL NOT NULL,
    ceiling_name TEXT NOT NULL,
    ceiling_price REAL NOT NULL,

    -- 현재 상태 (매일 갱신)
    current_price REAL,
    position_pct REAL,  -- 0~100% (바닥=0%, 천장=100%)
    change_pct REAL,     -- 전일 대비 변동률

    -- 종목 전용 필드
    sector TEXT,
    catalyst TEXT,

    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_floor_category
    ON cost_floor(category);

ALTER TABLE cost_floor ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read" ON cost_floor
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
    CREATE POLICY "Service write" ON cost_floor
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================
-- 검증 쿼리
-- ============================================================
SELECT 'macro_dashboard' AS tbl, count(*) FROM macro_dashboard
UNION ALL
SELECT 'cost_floor', count(*) FROM cost_floor;
