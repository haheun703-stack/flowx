# FLOWX 웹봇 — 다음 세션 이어가기 (2026-03-30~)

## Git 상태
- **최신 커밋**: `17f4806` — related_tickers ticker→code 매핑 수정
- **브랜치**: main, pushed
- **Vercel**: www.flowx.kr 자동배포 완료

## 오늘(3/29) 완료된 작업
1. **Information 페이지 UI 전면 개편** (`7321512`)
   - ScenarioAnalysisPanel: 가로 카드, regime 한글 매핑, topic_type 레이블
   - SupplyDemandPanel: 좌우 2분할 (일별 수평바 + 20일 누적 라인차트)
   - HotIssuesPanel: 클릭→상세 모달 (AI분석, 시장영향, 섹터, 관련종목)
   - API: supply-demand ?days=20 지원, news impact_description 추가

2. **related_tickers 버그 수정** (`17f4806`)
   - DB가 `{ticker: "005930"}` 전송 → 프론트엔드 `t.code` 기대
   - news API route에서 `ticker` → `code` 정규화 매핑

3. **DNS 이전**: flowx.kr Gabia→Vercel DNS 설정 완료
4. **주식 상세 에러 수정**: top_factors JSON 파싱 (`fdcf987`)
5. **KOSPI 차트 투자자 흐름선**: 외국인/기관/개인 dashed lines (`e8dc56a`)
6. **Swing 페이지 퀀트봇 연동**: 레이아웃 개편 (`53532b5`)

## 라이브 API 테스트 결과 (3/29)
| API | 상태 | 비고 |
|-----|------|------|
| /information (페이지) | 200 OK | |
| /api/information/scenarios | OK | regime 데이터 정상 |
| /api/information/supply-demand | OK | 5일치만 존재 (20일 미달) |
| /api/information/supply-demand?days=20 | OK | 가용 데이터만 반환 |
| /api/information/news?scope=GLOBAL | OK | related_tickers code 필드 정상 |
| /api/information/news?scope=DOMESTIC | OK | |

## 발견된 이슈 (정보봇 측 — 웹봇 대응 불필요)
1. **영어 헤드라인**: 3/27~28 Reuters 뉴스가 한국어 번역 없이 올라옴
2. **supply-demand 단위 불일치**: 3/20 foreign_net=-12,306,144 vs 3/27 foreign_net=-38,786 (단위 10만배 차이)
3. **supply-demand 데이터 부족**: 20일 요청했으나 5일치만 존재

## 라이트 테마 전환 계획 (미착수)
- 상세 계획: `.claude/plans/lucky-plotting-naur.md`
- Phase 1: 디자인 시스템 (globals.css, card-styles, layout, navbar)
- Phase 2: 대시보드 15개 컴포넌트
- Phase 3: 시장 페이지 + 시장개요 통합
- Phase 4: 나머지 30+ 컴포넌트

## Treemap C案 (미착수)
- 정보봇 NEXT_SESSION.md에 상세 스펙 있음
- `treemap_stocks` 테이블 기반 섹터 히트맵
- 정보봇이 SQL + 데이터 생성 완료 후 웹봇에서 페이지 구현

## 단타봇 VPS 이슈 (웹봇 무관)
- **409 Conflict**: 로컬+VPS 동시실행으로 텔레그램 폴링 충돌 → 로컬 끄면 해결
- **git 미배포**: VPS 6커밋 뒤처짐 → `git pull && systemctl restart` 필요

## 다음 세션 우선순위 제안
1. 정보봇 추가 스캐너 확인 (새 테이블 있으면 API+페이지 추가)
2. 라이트 테마 전환 Phase 1 착수
3. Treemap C案 구현 (정보봇 데이터 준비 확인 후)
