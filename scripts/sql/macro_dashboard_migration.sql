-- macro_dashboard: 거시경제 대시보드 자동 업데이트 데이터
-- 패턴: 봇(정보봇 or cron) → Supabase → 웹봇 API → UI
-- 1일 1회 업데이트, date PK, data JSONB

CREATE TABLE IF NOT EXISTS macro_dashboard (
  date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS: 읽기 공개, 쓰기 service_role만
ALTER TABLE macro_dashboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "macro_dashboard_read" ON macro_dashboard
  FOR SELECT USING (true);

-- 인덱스: 최신 조회 최적화
CREATE INDEX IF NOT EXISTS idx_macro_dashboard_date
  ON macro_dashboard (date DESC);

COMMENT ON TABLE macro_dashboard IS '거시경제 대시보드 자동 업데이트 데이터 (1일 1행)';
COMMENT ON COLUMN macro_dashboard.data IS 'JSONB: market/inflation/rates/fx/geopolitics 섹션별 지표';
