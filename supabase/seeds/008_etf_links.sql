-- ============================================
-- ETF → 구성종목/관련종목 연결 추가
-- 기존에 없던 11개 섹터 + 반도체/방산 보강
-- stock_name은 sector_universe 기준 (영문명)
-- ============================================

-- ── 조선 (shipbuilding) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('shipbuilding','BOAT','Maersk','ETF 구성종목',1),
('shipbuilding','BOAT','ZIM Shipping','ETF 구성종목',1),
('shipbuilding','BDRY','HD한국조선','벌크 수혜',2),
('shipbuilding','BDRY','삼성중공업','벌크 수혜',2),
('shipbuilding','BDRY','한화오션','벌크 수혜',2);

-- ── 바이오 (bio) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('bio','XBI','Eli Lilly','ETF 구성종목',1),
('bio','XBI','Regeneron','ETF 구성종목',1),
('bio','XBI','Vertex','ETF 구성종목',1),
('bio','XBI','Gilead','ETF 구성종목',1),
('bio','IBB','Eli Lilly','ETF 구성종목',1),
('bio','IBB','AbbVie','ETF 구성종목',1),
('bio','IBB','Amgen','ETF 구성종목',1),
('bio','IBB','Novo Nordisk ADR','ETF 구성종목',1),
('bio','ARKG','BioNTech ADR','ETF 구성종목',1),
('bio','ARKG','Moderna','ETF 구성종목',1),
-- 글로벌→한국 크로스
('bio','Eli Lilly','삼성바이오로직스','CDMO 파트너',4),
('bio','Novo Nordisk ADR','셀트리온','바이오시밀러 경쟁',2);

-- ── 금융 (finance) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('finance','XLF','JPMorgan','ETF 구성종목',1),
('finance','XLF','Goldman Sachs','ETF 구성종목',1),
('finance','XLF','Morgan Stanley','ETF 구성종목',1),
('finance','XLF','Berkshire B','ETF 구성종목',1),
('finance','KBE','JPMorgan','ETF 구성종목',1),
('finance','KBE','Charles Schwab','ETF 구성종목',1),
-- 글로벌→한국 크로스
('finance','Goldman Sachs','KB금융','글로벌 IB 협력',2),
('finance','Morgan Stanley','신한지주','글로벌 IB 협력',2);

-- ── 자동차 (auto) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('auto','CARZ','Tesla','ETF 구성종목',1),
('auto','CARZ','Toyota ADR','ETF 구성종목',1),
('auto','CARZ','BYD (OTC)','ETF 구성종목',1),
('auto','DRIV','Tesla','ETF 구성종목',1),
('auto','DRIV','Aptiv','ETF 구성종목',1),
('auto','DRIV','BorgWarner','ETF 구성종목',1),
-- 글로벌→한국 크로스
('auto','Toyota ADR','현대차','글로벌 경쟁사',2),
('auto','BYD (OTC)','기아','EV 경쟁',2);

-- ── 로봇 (robot) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('robot','BOTZ','Intuitive Surgical','ETF 구성종목',1),
('robot','BOTZ','Fanuc ADR','ETF 구성종목',1),
('robot','BOTZ','ABB Ltd','ETF 구성종목',1),
('robot','BOTZ','Keyence','ETF 구성종목',1),
('robot','ROBO','Rockwell Auto','ETF 구성종목',1),
('robot','ROBO','Cognex','ETF 구성종목',1),
('robot','ROBO','Yaskawa','ETF 구성종목',1),
-- 글로벌→한국 크로스
('robot','Fanuc ADR','두산로보틱스','산업용 로봇 경쟁',2),
('robot','ABB Ltd','레인보우로보틱스','협동로봇 경쟁',2);

-- ── 에너지 (energy) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('energy','XLE','NextEra Energy','ETF 구성종목',1),
('energy','XLE','Constellation Energy','ETF 구성종목',1),
('energy','XLE','Vistra Corp','ETF 구성종목',1),
('energy','URA','Cameco','ETF 구성종목',1),
('energy','URA','BWX Technologies','ETF 구성종목',1),
('energy','ICLN','Enphase Energy','ETF 구성종목',1),
('energy','ICLN','First Solar','ETF 구성종목',1),
('energy','ICLN','Vestas Wind','ETF 구성종목',1),
-- 글로벌→한국 크로스
('energy','Cameco','두산에너빌리티','원전 수혜',3),
('energy','Constellation Energy','한국전력','원전 운영사',2),
('energy','Vestas Wind','씨에스윈드','풍력 타워 납품',4);

-- ── 게임 (game) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('game','HERO','NVIDIA(GPU)','ETF 구성종목',1),
('game','HERO','Sony ADR','ETF 구성종목',1),
('game','HERO','EA','ETF 구성종목',1),
('game','HERO','Nintendo ADR','ETF 구성종목',1),
('game','ESPO','Microsoft(Xbox)','ETF 구성종목',1),
('game','ESPO','Tencent(OTC)','ETF 구성종목',1),
('game','ESPO','Take-Two','ETF 구성종목',1),
('game','ESPO','Roblox','ETF 구성종목',1),
-- 글로벌→한국 크로스
('game','Tencent(OTC)','크래프톤','PUBG 퍼블리싱',4),
('game','Sony ADR','넷마블','게임 투자',2);

-- ── 엔터 (entertainment) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('entertainment','PEJ','Walt Disney','ETF 구성종목',1),
('entertainment','PEJ','Netflix','ETF 구성종목',1),
('entertainment','PEJ','Live Nation','ETF 구성종목',1),
('entertainment','PEJ','Warner Bros','ETF 구성종목',1),
-- 글로벌→한국 크로스
('entertainment','Universal Music','HYBE','음반 유통',4),
('entertainment','Spotify','SM','음원 스트리밍',3),
('entertainment','Netflix','스튜디오드래곤','콘텐츠 제작',4),
('entertainment','Walt Disney','CJ ENM','콘텐츠 경쟁',2);

-- ── 유통 (logistics) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('logistics','IYT','FedEx','ETF 구성종목',1),
('logistics','IYT','UPS','ETF 구성종목',1),
('logistics','IYT','Delta Air','ETF 구성종목',1),
('logistics','SEA','Maersk','ETF 구성종목',1),
('logistics','SEA','ZIM Shipping','ETF 구성종목',1),
-- 글로벌→한국 크로스
('logistics','Maersk','HMM','해운 얼라이언스',3),
('logistics','FedEx','CJ대한통운','물류 경쟁',2),
('logistics','Delta Air','대한항공','스카이팀 동맹',4);

-- ── 식품 (food) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('food','XLP','Nestle ADR','ETF 구성종목',1),
('food','XLP','PepsiCo','ETF 구성종목',1),
('food','XLP','Coca-Cola','ETF 구성종목',1),
('food','XLP','Mondelez','ETF 구성종목',1),
('food','PBJ','Tyson Foods','ETF 구성종목',1),
('food','PBJ','Archer-Daniels','ETF 구성종목',1),
-- 글로벌→한국 크로스
('food','Nestle ADR','CJ제일제당','K-푸드 경쟁',2),
('food','PepsiCo','농심','스낵 글로벌 경쟁',2),
('food','Danone','매일유업','유제품 경쟁',1);

-- ── 건설 (construction) ETF 연결 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('construction','XHB','D.R. Horton','ETF 구성종목',1),
('construction','XHB','Lennar','ETF 구성종목',1),
('construction','ITB','D.R. Horton','ETF 구성종목',1),
('construction','ITB','Caterpillar','ETF 구성종목',1),
-- 글로벌→한국 크로스
('construction','Caterpillar','현대건설','건설장비 경쟁',2),
('construction','Vinci','대우건설','글로벌 건설 경쟁',1),
('construction','Holcim','GS건설','시멘트/건자재',1);

-- ── 반도체 (semiconductor) ETF 보강 — 기존 누락분 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','SOXX','Lam Research','ETF 구성종목',1),
('semiconductor','SOXX','Applied Materials','ETF 구성종목',1),
('semiconductor','SOXX','KLA Corp','ETF 구성종목',1),
('semiconductor','SOXX','Micron','ETF 구성종목',1),
('semiconductor','SOXX','ASML ADR','ETF 구성종목',1),
('semiconductor','SMH','Micron','ETF 구성종목',1),
('semiconductor','SMH','Lam Research','ETF 구성종목',1),
('semiconductor','SMH','KLA Corp','ETF 구성종목',1),
('semiconductor','XSD','NVIDIA','ETF 구성종목',1),
('semiconductor','XSD','AMD','ETF 구성종목',1),
('semiconductor','XSD','Broadcom','ETF 구성종목',1);

-- ── 방산 (defense) ETF 보강 ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('defense','ITA','BAE Systems','ETF 구성종목',1),
('defense','PPA','Lockheed Martin','ETF 구성종목',1),
('defense','PPA','RTX Corp','ETF 구성종목',1),
('defense','PPA','Northrop Grumman','ETF 구성종목',1),
('defense','XAR','Lockheed Martin','ETF 구성종목',1),
('defense','XAR','L3Harris','ETF 구성종목',1),
-- 글로벌→한국 크로스
('defense','BAE Systems','한화에어로스페이스','K2 전차 협력',3),
('defense','Rheinmetall','현대로템','장갑차 협력',3);

-- ============================================
-- 완료: ~120 ETF→구성종목/관련종목 연결 추가
-- ============================================
