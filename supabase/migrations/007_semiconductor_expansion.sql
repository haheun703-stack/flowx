-- 007_semiconductor_expansion.sql
-- 반도체 섹터 95종목 확장: sub_category + theme_tags 컬럼 추가

-- 1. sector_universe에 새 컬럼 추가
ALTER TABLE sector_universe ADD COLUMN IF NOT EXISTS sub_category text;
ALTER TABLE sector_universe ADD COLUMN IF NOT EXISTS theme_tags text[] DEFAULT '{}';

-- 2. 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_sub_category ON sector_universe(sector_key, sub_category);
CREATE INDEX IF NOT EXISTS idx_theme_tags ON sector_universe USING GIN(theme_tags);
