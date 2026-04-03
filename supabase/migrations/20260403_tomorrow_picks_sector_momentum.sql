-- tomorrow_picks: 외인 순매수 TOP 종목 (시장 페이지 5행 우)
-- 정보봇이 매일 16:57 treemap_stocks 갱신 후 자동 생성
CREATE TABLE IF NOT EXISTS tomorrow_picks (
  ticker          TEXT NOT NULL,
  name            TEXT NOT NULL,
  close           NUMERIC,          -- 현재가
  price_change    NUMERIC,          -- 등락률 (%)
  foreign_5d      BIGINT,           -- 외국인 5일 누적 순매수
  inst_5d         BIGINT,           -- 기관 5일 누적 순매수
  rank            INTEGER,          -- 순위 (1~10)
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (ticker)
);

-- RLS
ALTER TABLE tomorrow_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tomorrow_picks" ON tomorrow_picks FOR SELECT USING (true);

-- sector_momentum: 섹터 히트맵용 모멘텀 데이터 (시장 페이지 5행 좌)
-- 정보봇이 매일 16:58 sector_rotation 갱신 후 자동 생성
CREATE TABLE IF NOT EXISTS sector_momentum (
  sector          TEXT NOT NULL,
  ret_5           NUMERIC,          -- 5일 수익률 (%)
  momentum_score  NUMERIC,          -- 모멘텀 점수 (0~100)
  category        TEXT DEFAULT 'sector',
  date            DATE NOT NULL,
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (sector, date)
);

-- RLS
ALTER TABLE sector_momentum ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sector_momentum" ON sector_momentum FOR SELECT USING (true);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_sector_momentum_date ON sector_momentum (date DESC);
CREATE INDEX IF NOT EXISTS idx_tomorrow_picks_rank ON tomorrow_picks (rank ASC);
