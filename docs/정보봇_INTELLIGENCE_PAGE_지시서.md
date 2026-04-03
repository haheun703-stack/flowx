# FLOWX 인텔리전스 페이지 — 정보봇 데이터 업로드 지시서

> **문서 목적**: 정보봇이 매일 Supabase에 업로드해야 하는 데이터의 **테이블 구조, 컬럼 스펙, 업로드 규칙**을 정의
> **대상 페이지**: `/information` (인텔리전스 대시보드)
> **최종 업데이트**: 2026-04-03

---

## 전체 구조 요약

```
정보봇 (매일 자동 실행)
  │
  ├─→ intelligence_news          → 뉴스 TOP3 + 핫이슈 패널
  ├─→ intelligence_supply_demand → 시장판정 + 수급흐름 + 자금플로우 + 시나리오
  └─→ macro_data                 → 매크로 게이지 + 자금플로우 + 시나리오
```

| 테이블 | 사용 패널 | 갱신 주기 |
|--------|----------|----------|
| `intelligence_news` | 뉴스 TOP3, 글로벌 핫이슈, 국내 핫이슈 | 매일 1회 (장 마감 후) |
| `intelligence_supply_demand` | 시장판정 히어로, 수급흐름, 자금플로우맵, 시나리오 | 매일 1회 (장 마감 후) |
| `macro_data` | 매크로 게이지, 자금플로우맵, 시나리오 | 매일 1회 (장 마감 후) |

---

## 1. `intelligence_news` 테이블

### 용도
- **뉴스 TOP 3 패널**: impact_score 상위 3건 자동 선별
- **글로벌 핫이슈 패널**: category='GLOBAL' 필터
- **국내 핫이슈 패널**: category='DOMESTIC' 필터

### DDL (이미 생성됨)

```sql
CREATE TABLE intelligence_news (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  category    TEXT NOT NULL,        -- 'GLOBAL' | 'DOMESTIC'
  rank        INT NOT NULL,         -- 1부터 시작 (카테고리 내 순위)
  title       TEXT NOT NULL,
  impact      TEXT DEFAULT 'MEDIUM', -- 'HIGH' | 'MEDIUM' | 'LOW'
  impact_score INT DEFAULT 3,       -- 1~5 (5가 가장 높은 영향)
  kr_impact   TEXT,                 -- 한국 시장 영향 요약 (1~2문장)
  impact_description TEXT,          -- 상세 분석 (3~5문장)
  related_tickers JSONB DEFAULT '[]', -- 관련 종목
  sectors     TEXT[] DEFAULT '{}',  -- 영향 섹터 (예: {'반도체','자동차'})
  source      TEXT,                 -- 출처 (예: 'Reuters', 'Bloomberg')
  published_at TIMESTAMPTZ,         -- 원문 발행일시
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### 업로드 규칙

| 항목 | 규칙 |
|------|------|
| **날짜** | `date` = 오늘 날짜 (YYYY-MM-DD) |
| **카테고리** | 반드시 `'GLOBAL'` 또는 `'DOMESTIC'` 중 하나 |
| **rank** | 카테고리별로 1부터 순서대로 (영향도 순) |
| **impact** | `'HIGH'` / `'MEDIUM'` / `'LOW'` 중 하나 |
| **impact_score** | 1~5 정수. **프론트에서 4점 이상을 "호재"로 판정** |
| **related_tickers** | JSONB 배열: `[{"code":"005930","name":"삼성전자","change_pct":-1.2}, ...]` |
| **sectors** | PostgreSQL TEXT 배열: `{'반도체','자동차','바이오'}` |
| **중복 처리** | 같은 date+category+rank가 있으면 **UPSERT** (덮어쓰기) |
| **건수** | GLOBAL 최소 5건, DOMESTIC 최소 5건 (총 10건 이상 권장) |

### related_tickers 형식 (JSONB)

```json
[
  { "code": "005930", "name": "삼성전자", "change_pct": -1.2 },
  { "code": "000660", "name": "SK하이닉스", "change_pct": 2.5 }
]
```

- `code`: 종목코드 (6자리 문자열)
- `name`: 종목명
- `change_pct`: 당일 등락률 (%)

### 예시 INSERT

```sql
INSERT INTO intelligence_news (date, category, rank, title, impact, impact_score, kr_impact, impact_description, related_tickers, sectors, source, published_at)
VALUES (
  '2026-04-03',
  'GLOBAL',
  1,
  '미국 상호관세 발표 — 한국 25% 부과 확정',
  'HIGH',
  5,
  '수출주 직격탄. 반도체 면제 가능성은 남아있으나 자동차·철강 타격 불가피.',
  '트럼프 행정부가 한국산 제품에 대해 25% 상호관세를 공식 발표. 반도체는 별도 검토 대상으로 면제 가능성. 자동차(25%)와 철강(25%)은 즉시 적용. 한국 수출 비중 1위인 미국 시장에 직접 타격. 환율 1,470원대로 급등.',
  '[{"code":"005380","name":"현대차","change_pct":-4.2},{"code":"005930","name":"삼성전자","change_pct":-1.8}]',
  '{"자동차","반도체","철강"}',
  'Reuters',
  '2026-04-03T09:30:00Z'
);
```

---

## 2. `intelligence_supply_demand` 테이블

### 용도
- **시장 판정 히어로**: foreign_net + inst_net → BUY/SELL/HOLD 판정
- **수급 흐름 패널 (좌측 — 일별 수급흐름)**: 당일 외국인/기관/개인 수평 바차트 + 섹터별 TOP 5 + AI 요약
- **수급 누적흐름 패널 (우측 — 20일 누적 라인차트)**: 최근 20영업일 데이터를 누적 합산하여 외국인/기관/개인 3선 라인차트
- **자금 플로우 맵**: foreign_streak → 외국인 유입 조건 판정
- **시나리오 패널**: foreign_streak → 전환 조건 모니터링

### DDL (이미 생성됨)

```sql
CREATE TABLE intelligence_supply_demand (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date            DATE NOT NULL UNIQUE,  -- PK: 날짜 (1일 1행)
  foreign_net     BIGINT DEFAULT 0,      -- 외국인 순매수 (백만원)
  inst_net        BIGINT DEFAULT 0,      -- 기관 순매수 (백만원)
  individual_net  BIGINT DEFAULT 0,      -- 개인 순매수 (백만원)
  foreign_streak  INT DEFAULT 0,         -- 외국인 연속 매수일 (양수=매수, 음수=매도)
  inst_streak     INT DEFAULT 0,         -- 기관 연속 매수일
  foreign_trend   TEXT,                  -- 외국인 트렌드 설명 (예: "3일 연속 순매수 전환")
  inst_trend      TEXT,                  -- 기관 트렌드 설명
  sector_flows    JSONB DEFAULT '[]',    -- 섹터별 수급 상세
  summary         TEXT,                  -- AI 한 줄 요약
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 업로드 규칙

| 항목 | 규칙 |
|------|------|
| **날짜** | `date` = 오늘 날짜. **1일 1행** (UPSERT on date) |
| **금액 단위** | 모두 **백만원** (예: 외국인 +500억 → `foreign_net = 50000`) |
| **streak 계산** | 연속 순매수일수. 양수=매수, 음수=매도. (예: 3일 연속 순매수 → `foreign_streak = 3`) |
| **trend 텍스트** | 한 문장 설명 (예: "외국인 3일 연속 순매수, 반도체 중심") |
| **summary** | 당일 수급 종합 요약 1~2문장 |
| **히스토리 유지** | **최소 20영업일** 이상 행이 누적되어야 함 (누적 차트용) |
| **과거 삭제 금지** | 오늘 행만 UPSERT, 과거 행은 절대 삭제하지 않음 |

### sector_flows 형식 (JSONB)

```json
[
  {
    "sector": "반도체",
    "foreign_net": 15000,
    "inst_net": 8000,
    "net": 23000,
    "direction": "매수",
    "streak": 5
  },
  {
    "sector": "자동차",
    "foreign_net": -5000,
    "inst_net": -3000,
    "net": -8000,
    "direction": "매도",
    "streak": -2
  }
]
```

- `sector`: 업종명
- `foreign_net`: 외국인 순매수 (백만원)
- `inst_net`: 기관 순매수 (백만원)
- `net`: 합계 (foreign_net + inst_net)
- `direction`: "매수" | "매도"
- `streak`: 연속 매수/매도일

### 예시 UPSERT

```sql
INSERT INTO intelligence_supply_demand (date, foreign_net, inst_net, individual_net, foreign_streak, inst_streak, foreign_trend, inst_trend, sector_flows, summary)
VALUES (
  '2026-04-03',
  -32000,    -- 외국인 -320억
  15000,     -- 기관 +150억
  17000,     -- 개인 +170억
  -2,        -- 외국인 2일 연속 순매도
  3,         -- 기관 3일 연속 순매수
  '외국인 2일 연속 매도, 관세 우려로 반도체·자동차 집중 매도',
  '기관 3일 연속 매수 전환, 저가 매수 유입',
  '[{"sector":"반도체","foreign_net":-15000,"inst_net":8000,"net":-7000,"direction":"매도","streak":-2},{"sector":"자동차","foreign_net":-8000,"inst_net":-2000,"net":-10000,"direction":"매도","streak":-3},{"sector":"바이오","foreign_net":3000,"inst_net":5000,"net":8000,"direction":"매수","streak":4}]',
  '관세 이슈로 외국인 매도 지속. 기관은 저가 매수 유입 중. 반도체·바이오 양분화 뚜렷.'
)
ON CONFLICT (date) DO UPDATE SET
  foreign_net = EXCLUDED.foreign_net,
  inst_net = EXCLUDED.inst_net,
  individual_net = EXCLUDED.individual_net,
  foreign_streak = EXCLUDED.foreign_streak,
  inst_streak = EXCLUDED.inst_streak,
  foreign_trend = EXCLUDED.foreign_trend,
  inst_trend = EXCLUDED.inst_trend,
  sector_flows = EXCLUDED.sector_flows,
  summary = EXCLUDED.summary;
```

---

## 3. `macro_data` 테이블

### 용도
- **매크로 게이지 패널**: FNG, VIX, USDKRW, 기준금리 → 반원 게이지
- **자금 플로우 맵**: SPX, STOXX, HSI, KOSPI 등 글로벌 지수
- **시나리오 패널**: USDKRW, VIX → 전환 조건 판정

### DDL (이미 생성됨)

```sql
CREATE TABLE macro_data (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,  -- PK: 날짜 (1일 1행)
  indices     JSONB DEFAULT '[]',    -- 글로벌 지수
  commodities JSONB DEFAULT '[]',    -- 원자재
  forex       JSONB DEFAULT '[]',    -- 환율
  crypto      JSONB DEFAULT '[]',    -- 암호화폐
  bonds       JSONB DEFAULT '[]',    -- 채권
  vix         JSONB DEFAULT '{}',    -- VIX (단일 객체)
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### JSONB 배열 항목 형식

모든 JSONB 배열은 동일한 형식:
```json
{ "symbol": "SPX", "price": 5250.32, "change": -1.2 }
```

- `symbol`: 심볼 코드 (아래 표 참조)
- `price`: 현재가/종가
- `change`: 전일 대비 등락률 (%)

### VIX 형식 (단일 객체)

```json
{ "price": 22.5, "change": 3.2 }
```

### 필수 심볼 목록

#### indices (글로벌 지수) — JSONB 배열
| symbol | 설명 | 필수 |
|--------|------|------|
| `SPX` | S&P 500 | **필수** |
| `IXIC` | NASDAQ | **필수** |
| `DJI` | 다우존스 | 선택 |
| `N225` | 닛케이225 | 선택 |
| `HSI` | 항셍 | **필수** (자금플로우맵) |
| `SSEC` | 상해종합 | 선택 |
| `GDAXI` | DAX | 선택 |
| `FTSE` | FTSE100 | 선택 |
| `KOSPI` | KOSPI | **필수** |
| `KOSDAQ` | KOSDAQ | **필수** |
| `STOXX` | STOXX600 | **필수** (자금플로우맵) |

#### commodities (원자재) — JSONB 배열
| symbol | 설명 | 필수 |
|--------|------|------|
| `WTI` | WTI유 | **필수** |
| `GOLD` | 금 | **필수** |
| `SILVER` | 은 | 선택 |
| `COPPER` | 구리 | 선택 |

#### forex (환율) — JSONB 배열
| symbol | 설명 | 필수 |
|--------|------|------|
| `USDKRW` | 원/달러 | **필수** (게이지+시나리오 전환조건) |
| `DXY` | 달러인덱스 | **필수** |
| `USDJPY` | 엔/달러 | 선택 |
| `EURUSD` | 유로/달러 | 선택 |

#### crypto (암호화폐) — JSONB 배열
| symbol | 설명 | 필수 |
|--------|------|------|
| `BTC` | 비트코인 | **필수** |
| `ETH` | 이더리움 | 선택 |
| `SOL` | 솔라나 | 선택 |

#### bonds (채권) — JSONB 배열
| symbol | 설명 | 필수 |
|--------|------|------|
| `US10Y` | 미국 10년물 | **필수** |
| `US2Y` | 미국 2년물 | 선택 |

#### vix — 단일 JSONB 객체
| 필드 | 설명 | 필수 |
|------|------|------|
| `price` | VIX 현재값 | **필수** (게이지+시나리오 전환조건) |
| `change` | 전일 대비 등락률(%) | **필수** |

#### FNG (공포탐욕지수) — indices 배열에 포함
| symbol | 설명 | 필수 |
|--------|------|------|
| `FNG` | Fear & Greed Index (0~100) | **필수** (매크로 게이지) |

> FNG는 `indices` 배열에 포함하면 됩니다: `{"symbol":"FNG","price":45,"change":-3}`

### 예시 UPSERT

```sql
INSERT INTO macro_data (date, indices, commodities, forex, crypto, bonds, vix)
VALUES (
  '2026-04-03',
  '[
    {"symbol":"SPX","price":5250.32,"change":-1.2},
    {"symbol":"IXIC","price":16420.50,"change":-1.8},
    {"symbol":"DJI","price":39800.00,"change":-0.8},
    {"symbol":"KOSPI","price":2480.50,"change":-2.1},
    {"symbol":"KOSDAQ","price":720.30,"change":-2.8},
    {"symbol":"HSI","price":22100.00,"change":-0.5},
    {"symbol":"STOXX","price":510.20,"change":-0.9},
    {"symbol":"N225","price":38500.00,"change":-1.1},
    {"symbol":"SSEC","price":3150.00,"change":-0.3},
    {"symbol":"FNG","price":32,"change":-8}
  ]',
  '[
    {"symbol":"WTI","price":72.50,"change":1.2},
    {"symbol":"GOLD","price":2320.00,"change":0.8},
    {"symbol":"SILVER","price":27.50,"change":0.5},
    {"symbol":"COPPER","price":4.15,"change":-0.3}
  ]',
  '[
    {"symbol":"USDKRW","price":1468.50,"change":1.5},
    {"symbol":"DXY","price":104.2,"change":0.3},
    {"symbol":"USDJPY","price":151.20,"change":0.2},
    {"symbol":"EURUSD","price":1.0820,"change":-0.1}
  ]',
  '[
    {"symbol":"BTC","price":68500,"change":-2.1},
    {"symbol":"ETH","price":3420,"change":-3.5}
  ]',
  '[
    {"symbol":"US10Y","price":4.35,"change":0.02},
    {"symbol":"US2Y","price":4.72,"change":0.01}
  ]',
  '{"price":22.5,"change":3.2}'
)
ON CONFLICT (date) DO UPDATE SET
  indices = EXCLUDED.indices,
  commodities = EXCLUDED.commodities,
  forex = EXCLUDED.forex,
  crypto = EXCLUDED.crypto,
  bonds = EXCLUDED.bonds,
  vix = EXCLUDED.vix;
```

---

## 4. 프론트엔드에서의 데이터 활용 상세

### 패널별 데이터 매핑

| # | 패널 | 테이블 | API 호출 | 핵심 필드 |
|---|------|--------|---------|----------|
| 1 | **시장 판정 히어로** | `intelligence_supply_demand` | `/api/information/supply-demand?tier=FREE` (1일) | `foreign_net`, `inst_net`, `foreign_streak`, `inst_streak` |
| 2 | **뉴스 TOP 3** | `intelligence_news` | `/api/information/news?tier=SIGNAL` | `impact_score` 내림차순 상위 3건 |
| 3 | **매크로 게이지** | `macro_data` | `/api/macro/daily` | `FNG`, `VIX`, `USDKRW` (indices 배열 내 FNG 포함) |
| 4 | **글로벌 자금 플로우** | `macro_data` + `intelligence_supply_demand` | 위 2개 API 동시 사용 | SPX/STOXX/HSI/KOSPI change + foreign_net/streak |
| 5a | **수급 흐름 (좌: 일별)** | `intelligence_supply_demand` | `/api/information/supply-demand?tier=FREE` (1일) | `foreign_net`, `inst_net`, `individual_net`, `sector_flows`, `foreign_trend`, `inst_trend`, `summary` |
| 5b | **수급 누적흐름 (우: 20일 차트)** | `intelligence_supply_demand` | `/api/information/supply-demand?days=20` (20일) | 20행의 `foreign_net`, `inst_net`, `individual_net` → 프론트에서 누적합산 |
| 6 | **시나리오 확률** | `macro_data` + `intelligence_supply_demand` | 위 2개 API 동시 사용 | `USDKRW`, `VIX`, `foreign_streak` |
| 7 | **핫이슈** | `intelligence_news` | `/api/information/news?scope=GLOBAL` + `?scope=DOMESTIC` | category별 전체 목록 |

### 수급 흐름 패널 상세 동작

**좌측: 일별 수급흐름 (`/api/information/supply-demand?tier=FREE`, 1일)**
```
┌─────────────────────────────────┐
│ 📊 일별 수급흐름                  │
│                                 │
│ 외국인  매도 2일째  -320억  ████  │
│ 기관    매수 3일째  +150억  ██    │
│ 개인              +170억  ███   │
│                                 │
│ ── 섹터별 외국인 순매수 ──        │
│ 반도체  ▲ +150억                │
│ 자동차  ▼ -80억                 │
│ 바이오  ▲ +30억                 │
│ 철강    ▼ -50억                 │
│ 2차전지 ▲ +20억                 │
│                                 │
│ 외국인: 2일 연속 매도, 관세 우려  │
│ 기관: 3일 연속 매수 전환         │
│                                 │
│ AI 한 줄 요약                    │
│ 관세 이슈로 외국인 매도 지속...   │
└─────────────────────────────────┘
```

- `foreign_net`, `inst_net`, `individual_net` → 수평 바차트 (백만원 단위)
- `foreign_streak`, `inst_streak` → "매수/매도 N일째" 뱃지
- `sector_flows` → 외국인 순매수 기준 상위 5개 업종
- `foreign_trend`, `inst_trend` → 트렌드 텍스트 표시
- `summary` → AI 한 줄 요약 박스

**우측: 수급 누적흐름 (`/api/information/supply-demand?days=20`, 20일)**
```
┌─────────────────────────────────┐
│ 📈 수급 누적흐름 (20일)           │
│                                 │
│  +8000 ─┐                       │
│         │    ╱─── 기관(보라)     │
│      0 ─┤───╱──────────────     │
│         │  ╱  ╲                  │
│  -8000 ─┤───────╲── 외국인(빨강) │
│         │         ╲── 개인(초록) │
│         └─────────────────      │
│         03/15   03/25   04/03   │
└─────────────────────────────────┘
```

- 20행 데이터를 오래된→최신 순으로 정렬
- 각 날짜별 `foreign_net`, `inst_net`, `individual_net`을 **누적 합산**
- 외국인(빨강), 기관(보라), 개인(초록) 3선 라인차트
- **핵심: 과거 데이터를 절대 삭제하지 마세요! 20일치가 쌓여야 차트가 의미있음**

### 판정 로직 (프론트엔드 하드코딩)

**시장 판정 히어로:**
- foreign_net > 0 AND inst_net > 0 → "매수 우위" (녹색)
- foreign_net < 0 AND inst_net < 0 → "매도 우위" (빨강)
- 그 외 → "관망" (주황)

**뉴스 영향 판정:**
- impact_score >= 4 → "호재" (녹색)
- impact = 'HIGH' → "악재" (빨강)
- 그 외 → "중립" (회색)

**시나리오 전환 조건:**
- 외국인 매수 전환: `foreign_streak >= 3` → 충족
- 환율 안정: `USDKRW <= 1400` → 충족
- VIX 기준: `VIX price` 참조

**자금 유입 판정:**
- 3개 조건(환율≤1400, PBR≤0.9, 외국인3일매수) 중 충족 개수로 판정

---

## 5. 실행 스케줄 (권장)

```
매일 장 마감 후 순서:

16:30  macro_data         ← 글로벌 지수/환율/원자재/VIX 수집
16:45  intelligence_supply_demand  ← 당일 수급 집계 (외국인/기관/개인)
17:00  intelligence_news   ← AI 뉴스 분석 + 영향도 채점

※ 각 테이블은 UPSERT (ON CONFLICT date)로 중복 방지
※ 주말/공휴일에는 업로드 생략 (또는 직전 영업일 유지)
```

---

## 6. 데이터 품질 체크리스트

- [ ] `intelligence_news`: GLOBAL + DOMESTIC 각 5건 이상
- [ ] `intelligence_news`: impact_score가 1~5 범위
- [ ] `intelligence_news`: related_tickers가 유효한 JSONB 배열
- [ ] `intelligence_supply_demand`: 금액 단위가 백만원
- [ ] `intelligence_supply_demand`: streak가 정수 (양수=매수, 음수=매도)
- [ ] `intelligence_supply_demand`: sector_flows가 최소 5개 업종
- [ ] `macro_data`: 필수 심볼 누락 없음 (SPX, KOSPI, USDKRW, VIX, FNG 등)
- [ ] `macro_data`: price > 0, change는 % 단위
- [ ] 모든 테이블: date가 오늘 날짜
- [ ] UPSERT 사용 (중복 INSERT 방지)

---

## 7. 컬럼명 호환성 참조

API가 자동 매핑하는 별칭 (봇이 어느 쪽을 써도 호환):

| 봇이 사용 가능한 컬럼명 | 프론트 기대값 |
|------------------------|-------------|
| `institution_net` | → `inst_net` |
| `institution_trend` | → `inst_trend` |
| `impact_level` | → `impact` |
| `impact_sectors` | → `sectors` |
| `category` | → `scope` |
| `ticker` (related_tickers 내) | → `code` |
| `summary` (뉴스) | → `kr_impact` |

---

## 8. 현재 인텔리전스 페이지 상태 (2026-04-03)

### 완료된 UI 업그레이드

| # | 패널 | 상태 | 비고 |
|---|------|------|------|
| 1 | 시장 판정 히어로 | **완료** | BUY/SELL/HOLD 자동 판정 |
| 2 | 뉴스 TOP 3 | **완료** | 클릭 → 상세 모달 |
| 3 | 매크로 게이지 | **완료** | CSS conic-gradient 반원 게이지 (FNG/VIX/환율/금리) |
| 4 | 글로벌 자금 플로우 | **완료** | 4지역 실루엣 + AI 분석 |
| 5 | 수급 흐름 | **완료** | 당일 바차트 + 20일 라인차트 |
| 6 | 시나리오 확률 | **완료 (NEW)** | 3탭(시장/FOMC/관세) + 플로우트리 SVG + 전환조건 모니터링 |
| 7 | 핫이슈 | **완료** | GLOBAL/DOMESTIC 분리, 히어로+서브+리스트 |

### 데이터 의존성 우선순위

```
[필수 — 이것 없으면 페이지 빈칸]
1순위: macro_data           → 매크로 게이지가 비어버림
2순위: intelligence_supply_demand → 시장판정+수급흐름 전부 빈칸
3순위: intelligence_news    → 뉴스+핫이슈 섹션 빈칸
```

---

**끝. 이 지시서대로 매일 3개 테이블을 업데이트하면 인텔리전스 페이지가 자동으로 최신 데이터를 표시합니다.**
