-- 봇 실행 로그 테이블
-- Supabase SQL Editor에서 실행

CREATE TABLE IF NOT EXISTS bot_run_logs (
  id          BIGSERIAL PRIMARY KEY,
  bot_name    TEXT NOT NULL,             -- 'update-market', 'info-bot', 'quant-bot', 'swing-bot', 'health'
  status      TEXT NOT NULL DEFAULT 'ok', -- 'ok', 'partial', 'error'
  duration_ms INTEGER,
  error_message TEXT,
  summary     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 봇별 최신 실행 빠르게 조회
CREATE INDEX IF NOT EXISTS idx_bot_run_logs_bot_created
  ON bot_run_logs (bot_name, created_at DESC);

-- 인덱스: 에러만 필터
CREATE INDEX IF NOT EXISTS idx_bot_run_logs_status
  ON bot_run_logs (status) WHERE status != 'ok';

-- 자동 정리: 30일 이상 된 로그 삭제 (pg_cron 사용 시)
-- SELECT cron.schedule('clean-bot-logs', '0 3 * * 0', $$
--   DELETE FROM bot_run_logs WHERE created_at < now() - interval '30 days'
-- $$);

-- RLS: service_role만 insert 가능 (cron routes는 service key 사용)
ALTER TABLE bot_run_logs ENABLE ROW LEVEL SECURITY;

-- service_role은 RLS 우회하므로 별도 policy 불필요
-- anon key로 읽기만 허용 (bot-status API용)
CREATE POLICY "bot_run_logs_read_all" ON bot_run_logs
  FOR SELECT USING (true);
