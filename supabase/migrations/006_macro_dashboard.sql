-- ============================================================
-- 006_macro_dashboard.sql
-- 매크로 대시보드: macro_daily (27개 항목) + cost_floor (9종)
-- Supabase SQL Editor에서 실행
-- ============================================================

-- ── 1. macro_daily: 매일 16:25 UPSERT되는 매크로 지표 ──
CREATE TABLE IF NOT EXISTS macro_daily (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  date        date NOT NULL,
  category    text NOT NULL CHECK (category IN ('commodity','grain','forex','rate','sentiment','index','crypto')),
  symbol      text NOT NULL,
  name_ko     text NOT NULL,
  value       numeric NOT NULL,
  change_pct  numeric DEFAULT 0,
  unit        text,
  alert_threshold numeric,      -- VIX>25, USD/KRW>1400 등
  alert_direction text CHECK (alert_direction IN ('above','below')),
  alert_active boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(date, symbol)
);

CREATE INDEX IF NOT EXISTS idx_macro_daily_date ON macro_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_macro_daily_category ON macro_daily(category);

-- ── 2. cost_floor: 원가 바닥/천장 9종 ──
CREATE TABLE IF NOT EXISTS cost_floor (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol        text UNIQUE NOT NULL,
  name_ko       text NOT NULL,
  unit          text,
  floor_price   numeric NOT NULL,
  ceiling_price numeric NOT NULL,
  current_price numeric,
  position_pct  numeric,  -- (current - floor) / (ceiling - floor) * 100
  note          text,
  updated_at    timestamptz DEFAULT now()
);

-- ── 3. cost_floor 시드 데이터 (9종) ──
INSERT INTO cost_floor (symbol, name_ko, unit, floor_price, ceiling_price, note) VALUES
  ('GOLD',    '금',      'USD/oz',  1800, 2500, '채굴 원가 ~$1,200, 중앙은행 매수 지지선 $1,800'),
  ('SILVER',  '은',      'USD/oz',  20,   32,   '산업수요+태양광, 원가 ~$15'),
  ('COPPER',  '구리',    'USD/lb',  3.50, 5.20, '전기차·AI 데이터센터 수요, 원가 ~$2.50'),
  ('WTI',     'WTI유',   'USD/bbl', 60,   95,   'OPEC 감산 목표 $80, 셰일 손익분기 $55-65'),
  ('BRENT',   '브렌트유', 'USD/bbl', 65,  100,   'WTI 대비 프리미엄 $3-5'),
  ('NG',      '천연가스', 'USD/MMBtu', 1.80, 4.50, 'LNG 수출 증가, 계절성 강함'),
  ('CORN',    '옥수수',  'USd/bu',  380, 620,   '사료·에탄올 수요, 라니냐 영향'),
  ('WHEAT',   '밀',      'USd/bu',  500, 850,   '흑해 리스크, 기후 변동'),
  ('SOYBEAN', '대두',    'USd/bu',  950, 1500,  '중국 수입 의존도, 바이오디젤 수요')
ON CONFLICT (symbol) DO NOTHING;

-- ── 4. RLS ──
ALTER TABLE macro_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_floor ENABLE ROW LEVEL SECURITY;

-- 누구나 읽기 가능 (공개 데이터)
CREATE POLICY "macro_daily_read" ON macro_daily FOR SELECT USING (true);
CREATE POLICY "cost_floor_read" ON cost_floor FOR SELECT USING (true);

-- service_role만 쓰기 (cron용)
CREATE POLICY "macro_daily_write" ON macro_daily FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "cost_floor_write" ON cost_floor FOR ALL USING (auth.role() = 'service_role');

-- ── 5. updated_at 자동 트리거 (cost_floor용) ──
CREATE OR REPLACE FUNCTION update_cost_floor_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cost_floor_updated_at ON cost_floor;
CREATE TRIGGER cost_floor_updated_at
  BEFORE UPDATE ON cost_floor
  FOR EACH ROW EXECUTE FUNCTION update_cost_floor_updated_at();
