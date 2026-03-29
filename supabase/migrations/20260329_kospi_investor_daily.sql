-- KOSPI 투자자별 일별 순매수 (억원)
-- cron/update-market에서 매일 upsert
create table if not exists kospi_investor_daily (
  date        date primary key,
  foreign_net bigint not null default 0,   -- 외국인 순매수 (백만원)
  inst_net    bigint not null default 0,   -- 기관 순매수 (백만원)
  indiv_net   bigint not null default 0,   -- 개인 순매수 (백만원)
  created_at  timestamptz default now()
);

-- 최근 30일 빠르게 조회
create index if not exists idx_kospi_investor_date
  on kospi_investor_daily (date desc);

-- RLS
alter table kospi_investor_daily enable row level security;
create policy "public read" on kospi_investor_daily for select using (true);
