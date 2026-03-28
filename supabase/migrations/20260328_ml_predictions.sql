-- FLOWX ML 예측: ml_predictions
-- KISOpenAPI XGBoost 모델 예측 결과 (지수 + 개별종목)
-- stock_predictions.json + prediction_results.json 소스
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS ml_predictions (
    id TEXT PRIMARY KEY,          -- '{date}_{type}_{code}' e.g. '2026-03-20_index_KOSPI'
    date DATE NOT NULL,
    pred_type TEXT NOT NULL,       -- 'index' or 'stock'
    code TEXT NOT NULL,            -- 'KOSPI' / '005930' etc.
    name TEXT DEFAULT '',
    -- 예측
    prob_up REAL DEFAULT 0.5,
    prob_down REAL DEFAULT 0.5,
    decision TEXT DEFAULT '',      -- 매수(레버리지)/매수(인버스)/관망/상승관심/etc.
    -- 주요 지표 (SHAP 또는 correlation)
    top_factors JSONB DEFAULT '[]',
    -- 기준가
    base_price REAL DEFAULT 0,
    -- 적중 확인 (이후 업데이트)
    actual_result TEXT DEFAULT '',  -- 상승/하락/미확인
    success BOOLEAN DEFAULT NULL,
    -- 메타
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ml_predictions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read" ON ml_predictions
        FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE POLICY "Service write" ON ml_predictions
        FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_ml_pred_date
    ON ml_predictions (date DESC);

CREATE INDEX IF NOT EXISTS idx_ml_pred_type
    ON ml_predictions (pred_type, date DESC);

CREATE INDEX IF NOT EXISTS idx_ml_pred_prob
    ON ml_predictions (prob_up DESC);

SELECT 'ml_predictions' AS tbl, count(*) FROM ml_predictions;
