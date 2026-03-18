-- ============================================
-- FLOWX Phase C: 정보봇 + 퀀트봇 + 단타봇 테이블
-- 실행: Supabase Dashboard → SQL Editor에서 실행
-- ============================================

-- 1. 모닝 브리핑 (정보봇이 매일 08:00 upsert)
CREATE TABLE IF NOT EXISTS morning_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  market_status text NOT NULL DEFAULT 'NEUTRAL'
    CHECK (market_status IN ('BULL','BEAR','NEUTRAL','CAUTION')),
  us_summary text,
  kr_summary text,
  full_report text,                        -- 전문 보고서 (PAID 전용)
  news_picks jsonb DEFAULT '[]',           -- [{"ticker":"005930","title":"HBM4 수주 확대"}]
  sector_focus jsonb DEFAULT '[]',         -- ["반도체","방산"]
  kospi_close numeric(10,2),
  kosdaq_close numeric(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. 시그널 (퀀트봇/단타봇이 시그널 발생 시 INSERT)
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_type text NOT NULL DEFAULT 'QUANT'
    CHECK (bot_type IN ('QUANT','DAYTRADING')),
  ticker text NOT NULL,
  ticker_name text NOT NULL,
  signal_type text NOT NULL DEFAULT 'BUY'
    CHECK (signal_type IN ('BUY','SELL')),
  grade text CHECK (grade IN ('AA','A+','A','B+','B','C')),
  score integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  multiplier numeric(4,2) DEFAULT 1.00,    -- 배팅 배수
  entry_price integer NOT NULL,
  target_price integer,
  stop_price integer,                      -- 손절가 (stop_loss → stop_price)
  current_price integer,
  return_pct numeric(6,2) DEFAULT 0,
  max_return_pct numeric(6,2) DEFAULT 0,   -- 최대 도달 수익률
  status text NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','CLOSED','STOPPED')),
  memo text,                               -- 봇 코멘트
  signal_date date NOT NULL,
  close_date date,
  close_reason text
    CHECK (close_reason IS NULL OR close_reason IN (
      'TARGET_HIT','STOP_LOSS','TIME_LIMIT','DAILY_CLOSE','MANUAL'
    )),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. 성적표 (집계봇이 매일 16:30 upsert)
CREATE TABLE IF NOT EXISTS scoreboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_type text NOT NULL
    CHECK (bot_type IN ('QUANT','DAYTRADING')),
  period text NOT NULL
    CHECK (period IN ('30D','60D','90D','ALL')),
  total_signals integer DEFAULT 0,
  win_count integer DEFAULT 0,
  loss_count integer DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  avg_return numeric(6,2) DEFAULT 0,
  avg_win_pct numeric(6,2) DEFAULT 0,     -- 평균 수익 수익률
  avg_lose_pct numeric(6,2) DEFAULT 0,    -- 평균 손실 수익률
  best_return numeric(6,2) DEFAULT 0,
  worst_return numeric(6,2) DEFAULT 0,
  best_signal jsonb,                       -- {"ticker":"005930","name":"삼성전자","return_pct":12.5}
  worst_signal jsonb,                      -- {"ticker":"000660","name":"SK하이닉스","return_pct":-5.2}
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bot_type, period)
);

-- ── 인덱스 ──
CREATE INDEX IF NOT EXISTS idx_signals_bot_type ON signals(bot_type);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_signal_date ON signals(signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_signals_bot_status ON signals(bot_type, status);
CREATE INDEX IF NOT EXISTS idx_morning_briefings_date ON morning_briefings(date DESC);

-- ── updated_at 자동갱신 트리거 ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_briefings_updated_at
  BEFORE UPDATE ON morning_briefings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_signals_updated_at
  BEFORE UPDATE ON signals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_scoreboard_updated_at
  BEFORE UPDATE ON scoreboard
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── RLS ──
ALTER TABLE morning_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoreboard ENABLE ROW LEVEL SECURITY;

-- anon = 읽기만, service_role = 전체
CREATE POLICY "anon_read_briefings" ON morning_briefings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_signals" ON signals FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_scoreboard" ON scoreboard FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_briefings" ON morning_briefings FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_signals" ON signals FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_scoreboard" ON scoreboard FOR ALL TO service_role USING (true);
