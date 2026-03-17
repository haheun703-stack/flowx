# FLOWX Vercel 배포 기록

## 배포 날짜: 2026-03-14

---

## 1. 코드 준비 (완료)
- 데이터 번들링: `scripts/bundle-data.js`가 `_SPECS/data/`에서 핵심 12개 파일을 `public/data/`로 복사
- 경로 fallback: `dataReader.ts` + `stock-list/route.ts`가 로컬(`_SPECS/data/`) → Vercel(`public/data/`) 자동 전환
- OpenGraph 메타데이터: flowx.kr 기준 OG/Twitter 카드 설정 완료
- 빌드 통과: `npm run build` 성공 (24페이지, TS 에러 0개)

---

## 2. Vercel 프로젝트 생성 (완료)
- GitHub 연결: `haheun703-stack/flowx` 레포 Import
- Root Directory: `./` (레포 루트가 Next.js 프로젝트)
- Framework: Next.js (자동 감지)
- 첫 배포 성공: Error Rate 0%

---

## 3. 도메인 연결 (완료)
- **도메인 구매**: 가비아(gabia.com)에서 flowx.kr 구매 (16,500원, 만기 2029-03-14)
- **DNS 레코드 설정** (가비아 DNS 관리):

| 타입 | 호스트 | 값 |
|------|--------|------|
| A | @ | 216.198.79.1 |
| CNAME | www | 46169de38d53bcc0.vercel-dns-017.com. |

- **도메인 상태**: 3개 모두 Valid Configuration
  - flowx.kr
  - www.flowx.kr
  - flowx-gules.vercel.app

---

## 4. 환경변수 설정 (완료)
Vercel Settings → Environment Variables에 7개 추가 (All Environments):

| Key | 설명 |
|-----|------|
| KIS_APP_KEY | 한국투자증권 앱키 |
| KIS_APP_SECRET | 한국투자증권 시크릿 |
| KIS_ACCOUNT_NO | 계좌번호 (43879566-01) |
| KIS_ACCOUNT_PRODUCT | 상품코드 (01) |
| DART_API_KEY | 전자공시시스템 API 키 |
| SEC_API_KEY | sec-api.io API 키 |
| FINNHUB_API_KEY | Finnhub API 키 |

- 환경변수 추가 후 Redeploy 진행

---

## 5. 접속 URL
- **메인**: https://flowx.kr
- **www**: https://www.flowx.kr
- **Vercel 기본**: https://flowx-gules.vercel.app

---

## 6. 향후 운영
데이터 갱신 시:
```bash
cd signal-os
node scripts/bundle-data.js
git add public/data/ && git commit -m "data: update" && git push
```
→ Vercel 자동 재배포됨

---

## 7. 남은 작업
- [ ] Redeploy 완료 확인
- [ ] https://flowx.kr 접속 테스트
- [ ] https://flowx.kr/dashboard 대시보드 데이터 확인
- [ ] https://flowx.kr/api/dashboard/picks JSON 응답 확인
