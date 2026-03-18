-- ============================================
-- FLOWX Phase C: 정보봇 + 퀀트봇 + 단타봇 테이블
-- 실행: Supabase Dashboard → SQL Editor에서 실행
-- ============================================

-- 1. 모닝 브리핑 (정보봇이 매일 08:00 upsert)
CREATE TABLE IF NOT EXISTS morning_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  market_status text NOT NULL DEFAULT 'NEUTRAL',  -- BULL / BEAR / NEUTRAL / CAUTION
  us_summary text,
  kr_summary text,
  news_picks jsonb DEFAULT '[]',       -- [{"ticker":"005930","title":"HBM4 수주 확대"}]
  sector_focus jsonb DEFAULT '[]',     -- ["반도체","방산"]
  kospi_close numeric(10,2),
  kosdaq_close numeric(10,2),
  created_at timestamptz DEFAULT now()
);

-- 2. 시그널 (퀀트봇/단타봇이 시그널 발생 시 INSERT)
CREATE TABLE IF NOT EXISTS signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_type text NOT NULL DEFAULT 'QUANT',          -- QUANT / DAYTRADING
  ticker text NOT NULL,
  ticker_name text NOT NULL,
  signal_type text NOT NULL DEFAULT 'BUY',          -- BUY / SELL
  grade text,                                        -- AA / A / B / C
  score integer DEFAULT 0,                           -- 0–100
  entry_price integer NOT NULL,
  target_price integer,
  stop_loss integer,
  current_price integer,
  return_pct numeric(6,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'OPEN',               -- OPEN / CLOSED / STOPPED
  signal_date date NOT NULL,
  close_date date,
  close_reason text,                                 -- TARGET_HIT / STOP_LOSS / TIME_LIMIT / DAILY_CLOSE
  created_at timestamptz DEFAULT now()
);

-- 3. 성적표 (집계봇이 매일 16:30 upsert)
CREATE TABLE IF NOT EXISTS scoreboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_type text NOT NULL,                            -- QUANT / DAYTRADING
  period integer NOT NULL,                           -- 30 / 60 / 90
  total_signals integer DEFAULT 0,
  win_count integer DEFAULT 0,
  loss_count integer DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0,
  avg_return numeric(6,2) DEFAULT 0,
  best_return numeric(6,2) DEFAULT 0,
  worst_return numeric(6,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bot_type, period)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_signals_bot_type ON signals(bot_type);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_signals_signal_date ON signals(signal_date DESC);
CREATE INDEX IF NOT EXISTS idx_morning_briefings_date ON morning_briefings(date DESC);

-- RLS (서비스 키로 접근하므로 일단 비활성)
ALTER TABLE morning_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoreboard ENABLE ROW LEVEL SECURITY;

-- 서비스 키(service_role)는 RLS 우회, anon 키는 읽기만 허용
CREATE POLICY "anon_read_briefings" ON morning_briefings FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_signals" ON signals FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_scoreboard" ON scoreboard FOR SELECT TO anon USING (true);
CREATE POLICY "service_all_briefings" ON morning_briefings FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_signals" ON signals FOR ALL TO service_role USING (true);
CREATE POLICY "service_all_scoreboard" ON scoreboard FOR ALL TO service_role USING (true);
