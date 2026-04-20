# 4봇 AI API 현황표

> 최종 업데이트: 2026-04-20 (정보봇 정정 반영)

---

## 1. 웹봇 (signal-os)

| 파일/함수 | 모델 | 용도 | 토큰(대략) | 일 호출수 |
|-----------|------|------|-----------|----------|
| — | — | AI API 직접 호출 없음 (읽기 전용) | 0 | 0 |

- 월 비용: **$0** (Supabase 읽기만)

---

## 2. 퀀트봇 (sub-agent-project)

| 파일/함수 | 모델 | 용도 | 토큰(대략) | 일 호출수 |
|-----------|------|------|-----------|----------|
| jarvis_engine | Claude Sonnet 4 | 퀀트 종합 판단 | ~80,000 | 1 |
| scenario_builder | Claude Sonnet 4 | 시나리오 생성 | ~50,000 | 1 |
| fib_scanner | — | 피보나치 스캔 (룰 기반, AI 없음) | 0 | 1 |
| market_ranking | — | 시장 순위 (룰 기반, AI 없음) | 0 | 1 |
| bluechip_checkup | Claude Sonnet 4 | 우량주 검진 | ~30,000 | 1 |
| 합계 | | | ~160K/일 | ~5회 |
| 월 비용 | | | | ~$120~160 |

---

## 3. 정보봇 (Global_Stock_Overview_Scripter) — 4/20 정정

| 파일/함수 | 모델 | 용도 | 토큰(대략) | 일 호출수 |
|-----------|------|------|-----------|----------|
| mega_theme_analyzer | Sonnet 4.6 + Opus Advisor | 메가테마 AI 해설 | ~45,000 | 2 |
| stock_analyzer | Sonnet 4.6 + Opus Advisor | 종목 AI 코멘터리 | ~3,000 | 10 |
| impact_agent | Sonnet 4.6 | 글로벌 임팩트 체인 | ~4,000 | 1 |
| causal_chain | Sonnet 4.6 + Opus Advisor | 1D→5D 인과분석 | ~5,000 | 1 |
| Perplexity (뉴스) | sonar-pro | 8카테고리 크롤링 | ~9,600 | 16 |
| Perplexity (테마+종목) | sonar-pro | 산업 컨텍스트 | ~800 | 12 |
| 합계 | | | ~150K/일 | ~42회 |
| 월 비용 | | | | ~$90~150 |

### Advisor 패턴 적용 (2026-04-20)
- Anthropic Advisor API (`beta advisor-tool-2026-03-01`)
- Sonnet 4.6이 실행, 어려운 판단에서만 Opus 4.7에 자동 자문
- 3곳 적용: `mega_theme`, `causal_chain`, `stock_analyzer`

---

## 4. 단타봇 (Prophet_Agent_System)

| 파일/함수 | 모델 | 용도 | 토큰(대략) | 일 호출수 |
|-----------|------|------|-----------|----------|
| scalper_brain | Claude Sonnet 4 | 단타 종목 스코어링 | ~40,000 | 2 |
| swing_dashboard | Claude Sonnet 4 | 스윙 대시보드 종합 | ~60,000 | 1 |
| daytrading_picks | Claude Sonnet 4 | 단타 TOP픽 선별 | ~30,000 | 2 |
| stealth_scanner | — | 선매집 탐지 (룰 기반, AI 없음) | 0 | 1 |
| cycle_scan | — | 수급 사이클 (룰 기반, AI 없음) | 0 | 1 |
| 합계 | | | ~130K/일 | ~7회 |
| 월 비용 | | | | ~$100~130 |

---

## 종합 요약

| 봇 | 일 토큰 | 일 호출수 | 월 비용(추정) | Advisor 적용 |
|----|---------|----------|--------------|-------------|
| 웹봇 | 0 | 0 | $0 | N/A |
| 퀀트봇 | ~160K | ~5 | ~$120~160 | 미적용 (후보) |
| 정보봇 | ~150K | ~42 | ~$90~150 | **적용 완료** (3곳) |
| 단타봇 | ~130K | ~7 | ~$100~130 | 미적용 (후보) |
| **합계** | **~440K** | **~54** | **~$310~440** | |

### Advisor 확대 적용 후보
- 퀀트봇: `jarvis_engine`, `scenario_builder` → Sonnet executor + Opus advisor
- 단타봇: `scalper_brain`, `daytrading_picks` → Sonnet executor + Opus advisor
