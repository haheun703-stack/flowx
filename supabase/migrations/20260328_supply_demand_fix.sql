-- intelligence_supply_demand 테이블에 updated_at 컬럼 추가
-- collectSupplyDemand.ts에서 upsert 시 갱신 시간 기록용
-- Supabase SQL Editor에서 실행

ALTER TABLE intelligence_supply_demand
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
