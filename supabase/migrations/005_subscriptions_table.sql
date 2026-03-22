-- ============================================
-- 005: subscriptions 테이블 (Toss Payments 정기결제)
-- Supabase Dashboard → SQL Editor에서 실행
-- ============================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('SIGNAL', 'PRO', 'VIP')),
  billing_key TEXT,           -- Toss billingKey
  customer_key TEXT NOT NULL,  -- Toss customerKey (user_id 기반)
  amount INTEGER NOT NULL,     -- 결제 금액 (원)
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'FAILED')),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  last_payment_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 유저당 활성 구독 1개 제한
CREATE UNIQUE INDEX idx_subscriptions_active_user
  ON subscriptions (user_id)
  WHERE status = 'ACTIVE';

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_subscriptions_updated_at();

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- 유저 본인 구독만 조회
CREATE POLICY "users_read_own_subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- service_role은 전체 접근 (웹훅/cron에서 사용)
CREATE POLICY "service_all_subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
