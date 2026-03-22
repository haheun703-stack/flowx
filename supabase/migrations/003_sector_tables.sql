-- ============================================
-- 003: Sector Universe + Supply Chain Links
-- FlowX 섹터맵 듀얼뷰 기반 테이블
-- ============================================

-- 1) 섹터 유니버스 (종목 마스터 — 13섹터 259종목)
CREATE TABLE IF NOT EXISTS sector_universe (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_key text NOT NULL,
  sector_name text NOT NULL,
  tier integer NOT NULL CHECK (tier BETWEEN 1 AND 5),
  stock_name text NOT NULL,
  ticker text NOT NULL,
  market text NOT NULL CHECK (market IN ('US','KR','EU','JP','CN','UK')),
  "desc" text,
  change_pct real DEFAULT 0,
  volume_ratio real DEFAULT 1,
  foreign_net bigint DEFAULT 0,
  institution_net bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sector ON sector_universe(sector_key);
CREATE INDEX IF NOT EXISTS idx_tier ON sector_universe(sector_key, tier);
CREATE INDEX IF NOT EXISTS idx_ticker ON sector_universe(ticker);

-- 2) 공급망 연결 (기업 간 관계)
CREATE TABLE IF NOT EXISTS sector_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_key text NOT NULL,
  from_stock text NOT NULL,
  to_stock text NOT NULL,
  relation text NOT NULL,
  strength integer DEFAULT 1 CHECK (strength BETWEEN 1 AND 5),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_links_sector ON sector_links(sector_key);
CREATE INDEX IF NOT EXISTS idx_links_from ON sector_links(from_stock);
CREATE INDEX IF NOT EXISTS idx_links_to ON sector_links(to_stock);
