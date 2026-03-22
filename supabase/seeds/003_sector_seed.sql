-- ============================================
-- Sector Universe + Links Seed Data
-- 13 sectors, 259 stocks, 88 supply chain links
-- Source: FLOWX_SECTOR_UNIVERSE.json
-- ============================================

-- Idempotent: safe to re-run
DELETE FROM sector_links;
DELETE FROM sector_universe;

-- ═══════════════════════════════════════
-- 1. SECTOR UNIVERSE (259 stocks)
-- ═══════════════════════════════════════

-- ── 반도체 (semiconductor) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('semiconductor','반도체',5,'SOXX','SOXX','US','iShares Semiconductor ETF'),
('semiconductor','반도체',5,'SMH','SMH','US','VanEck Semiconductor ETF'),
('semiconductor','반도체',5,'XSD','XSD','US','SPDR S&P Semiconductor'),
('semiconductor','반도체',4,'NVIDIA','NVDA','US',NULL),
('semiconductor','반도체',4,'TSMC ADR','TSM','US',NULL),
('semiconductor','반도체',4,'Broadcom','AVGO','US',NULL),
('semiconductor','반도체',4,'ASML ADR','ASML','US',NULL),
('semiconductor','반도체',4,'Micron','MU','US',NULL),
('semiconductor','반도체',4,'AMD','AMD','US',NULL),
('semiconductor','반도체',4,'Lam Research','LRCX','US',NULL),
('semiconductor','반도체',4,'Applied Materials','AMAT','US',NULL),
('semiconductor','반도체',4,'Intel','INTC','US',NULL),
('semiconductor','반도체',4,'KLA Corp','KLAC','US',NULL),
('semiconductor','반도체',3,'Marvell','MRVL','US',NULL),
('semiconductor','반도체',3,'ON Semiconductor','ON','US',NULL),
('semiconductor','반도체',3,'Entegris','ENTG','US',NULL),
('semiconductor','반도체',3,'Monolithic Power','MPWR','US',NULL),
('semiconductor','반도체',3,'Lattice Semi','LSCC','US',NULL),
('semiconductor','반도체',3,'Tokyo Electron','8035.T','JP',NULL),
('semiconductor','반도체',2,'SK하이닉스','000660','KR',NULL),
('semiconductor','반도체',2,'삼성전자','005930','KR',NULL),
('semiconductor','반도체',2,'DB하이텍','000990','KR',NULL),
('semiconductor','반도체',2,'리노공업','058470','KR',NULL),
('semiconductor','반도체',1,'주성엔지니어링','036930','KR',NULL),
('semiconductor','반도체',1,'한미반도체','042700','KR',NULL),
('semiconductor','반도체',1,'원익IPS','240810','KR',NULL),
('semiconductor','반도체',1,'유진테크','084370','KR',NULL),
('semiconductor','반도체',1,'한화비전','014090','KR',NULL),
('semiconductor','반도체',1,'ISC','095340','KR',NULL),
('semiconductor','반도체',1,'피에스케이','319660','KR',NULL),
('semiconductor','반도체',1,'테크윙','089030','KR',NULL),
('semiconductor','반도체',1,'파크시스템스','140860','KR',NULL),
('semiconductor','반도체',1,'와이씨','232140','KR',NULL);

-- ── 조선 (shipbuilding) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('shipbuilding','조선',5,'BOAT','BOAT','US','SonicShares Global Shipping ETF'),
('shipbuilding','조선',5,'BDRY','BDRY','US','Breakwave Dry Bulk Shipping'),
('shipbuilding','조선',4,'Caterpillar Marine','CAT','US',NULL),
('shipbuilding','조선',4,'Wartsila','WRT1V.HE','EU',NULL),
('shipbuilding','조선',4,'Rolls-Royce','RYCEY','UK',NULL),
('shipbuilding','조선',3,'MAN Energy','R6C.DE','EU',NULL),
('shipbuilding','조선',3,'Alfa Laval','ALFA.ST','EU',NULL),
('shipbuilding','조선',3,'CSSC (중국)','600150.SS','CN',NULL),
('shipbuilding','조선',2,'HD한국조선','009540','KR',NULL),
('shipbuilding','조선',2,'삼성중공업','010140','KR',NULL),
('shipbuilding','조선',2,'한화오션','042660','KR',NULL),
('shipbuilding','조선',1,'HD현대중공업','267250','KR',NULL),
('shipbuilding','조선',1,'한화엔진','082740','KR',NULL),
('shipbuilding','조선',1,'동성화인텍','033500','KR',NULL),
('shipbuilding','조선',1,'세진중공업','075580','KR',NULL),
('shipbuilding','조선',1,'HD현대마린솔루션','443060','KR',NULL),
('shipbuilding','조선',1,'태광','023160','KR',NULL);

-- ── 방산 (defense) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('defense','방산',5,'ITA','ITA','US','iShares U.S. Aerospace & Defense'),
('defense','방산',5,'PPA','PPA','US','Invesco Aerospace & Defense'),
('defense','방산',5,'DFEN','DFEN','US','Direxion Daily Aero & Def 3x'),
('defense','방산',4,'Lockheed Martin','LMT','US',NULL),
('defense','방산',4,'RTX Corp','RTX','US',NULL),
('defense','방산',4,'Northrop Grumman','NOC','US',NULL),
('defense','방산',4,'General Dynamics','GD','US',NULL),
('defense','방산',4,'L3Harris','LHX','US',NULL),
('defense','방산',3,'BAE Systems','BAESY','UK',NULL),
('defense','방산',3,'Rheinmetall','RHM.DE','EU',NULL),
('defense','방산',3,'Leonardo','LDO.MI','EU',NULL),
('defense','방산',3,'Thales','HO.PA','EU',NULL),
('defense','방산',3,'Saab','SAAB-B.ST','EU',NULL),
('defense','방산',2,'한화에어로스페이스','012450','KR',NULL),
('defense','방산',2,'LIG넥스원','079550','KR',NULL),
('defense','방산',2,'한화시스템','272210','KR',NULL),
('defense','방산',2,'현대로템','064350','KR',NULL),
('defense','방산',1,'풍산','103140','KR',NULL),
('defense','방산',1,'한일단조','024720','KR',NULL),
('defense','방산',1,'만도식기기','311060','KR',NULL),
('defense','방산',1,'빅텍','065170','KR',NULL),
('defense','방산',1,'스페코','013810','KR',NULL),
('defense','방산',1,'한국항공우주','047810','KR',NULL);

-- ── 건설 (construction) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('construction','건설',5,'XHB','XHB','US','SPDR S&P Homebuilders ETF'),
('construction','건설',5,'ITB','ITB','US','iShares U.S. Home Construction'),
('construction','건설',4,'D.R. Horton','DHI','US',NULL),
('construction','건설',4,'Lennar','LEN','US',NULL),
('construction','건설',4,'Caterpillar','CAT','US',NULL),
('construction','건설',4,'Vinci','DG.PA','EU',NULL),
('construction','건설',3,'Vulcan Materials','VMC','US',NULL),
('construction','건설',3,'Martin Marietta','MLM','US',NULL),
('construction','건설',3,'Holcim','HOLN.SW','EU',NULL),
('construction','건설',2,'현대건설','000720','KR',NULL),
('construction','건설',2,'대우건설','047040','KR',NULL),
('construction','건설',2,'GS건설','006360','KR',NULL),
('construction','건설',2,'DL이앤씨','375500','KR',NULL),
('construction','건설',1,'HDC현대산업개발','294870','KR',NULL),
('construction','건설',1,'계룡건설','013580','KR',NULL),
('construction','건설',1,'한신공영','004960','KR',NULL),
('construction','건설',1,'아이에스동서','010780','KR',NULL);

-- ── 바이오 (bio) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('bio','바이오',5,'XBI','XBI','US','SPDR S&P Biotech ETF'),
('bio','바이오',5,'IBB','IBB','US','iShares Biotech ETF'),
('bio','바이오',5,'ARKG','ARKG','US','ARK Genomic Revolution'),
('bio','바이오',4,'Eli Lilly','LLY','US',NULL),
('bio','바이오',4,'Novo Nordisk ADR','NVO','US',NULL),
('bio','바이오',4,'AbbVie','ABBV','US',NULL),
('bio','바이오',4,'Amgen','AMGN','US',NULL),
('bio','바이오',4,'Regeneron','REGN','US',NULL),
('bio','바이오',3,'BioNTech ADR','BNTX','US',NULL),
('bio','바이오',3,'Moderna','MRNA','US',NULL),
('bio','바이오',3,'Vertex','VRTX','US',NULL),
('bio','바이오',3,'Gilead','GILD','US',NULL),
('bio','바이오',2,'삼성바이오로직스','207940','KR',NULL),
('bio','바이오',2,'셀트리온','068270','KR',NULL),
('bio','바이오',2,'SK바이오팜','326030','KR',NULL),
('bio','바이오',2,'유한양행','000100','KR',NULL),
('bio','바이오',1,'알테오젠','196170','KR',NULL),
('bio','바이오',1,'HLB','028300','KR',NULL),
('bio','바이오',1,'리가켐바이오','141080','KR',NULL),
('bio','바이오',1,'에이비엘바이오','298380','KR',NULL),
('bio','바이오',1,'메디톡스','086900','KR',NULL),
('bio','바이오',1,'파마리서치','214450','KR',NULL);

-- ── 금융 (finance) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('finance','금융(증권/보험)',5,'XLF','XLF','US','Financial Select Sector SPDR'),
('finance','금융(증권/보험)',5,'KBE','KBE','US','SPDR S&P Bank ETF'),
('finance','금융(증권/보험)',4,'JPMorgan','JPM','US',NULL),
('finance','금융(증권/보험)',4,'Goldman Sachs','GS','US',NULL),
('finance','금융(증권/보험)',4,'Morgan Stanley','MS','US',NULL),
('finance','금융(증권/보험)',4,'Berkshire B','BRK-B','US',NULL),
('finance','금융(증권/보험)',3,'Charles Schwab','SCHW','US',NULL),
('finance','금융(증권/보험)',3,'Interactive Brokers','IBKR','US',NULL),
('finance','금융(증권/보험)',3,'HSBC ADR','HSBC','US',NULL),
('finance','금융(증권/보험)',3,'Nomura ADR','NMR','JP',NULL),
('finance','금융(증권/보험)',2,'KB금융','105560','KR',NULL),
('finance','금융(증권/보험)',2,'신한지주','055550','KR',NULL),
('finance','금융(증권/보험)',2,'하나금융','086790','KR',NULL),
('finance','금융(증권/보험)',2,'삼성생명','032830','KR',NULL),
('finance','금융(증권/보험)',1,'키움증권','039490','KR',NULL),
('finance','금융(증권/보험)',1,'미래에셋증권','006800','KR',NULL),
('finance','금융(증권/보험)',1,'NH투자증권','005940','KR',NULL),
('finance','금융(증권/보험)',1,'한국금융지주','071050','KR',NULL),
('finance','금융(증권/보험)',1,'DB손보','005830','KR',NULL),
('finance','금융(증권/보험)',1,'메리츠금융','138040','KR',NULL);

-- ── 자동차 (auto) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('auto','자동차',5,'CARZ','CARZ','US','First Trust S-Network Future Vehicles'),
('auto','자동차',5,'DRIV','DRIV','US','Global X Autonomous & EV'),
('auto','자동차',4,'Tesla','TSLA','US',NULL),
('auto','자동차',4,'Toyota ADR','TM','US',NULL),
('auto','자동차',4,'BYD (OTC)','BYDDY','US',NULL),
('auto','자동차',4,'Stellantis','STLA','US',NULL),
('auto','자동차',3,'Aptiv','APTV','US',NULL),
('auto','자동차',3,'BorgWarner','BWA','US',NULL),
('auto','자동차',3,'Continental','CON.DE','EU',NULL),
('auto','자동차',3,'Denso','6902.T','JP',NULL),
('auto','자동차',2,'현대차','005380','KR',NULL),
('auto','자동차',2,'기아','000270','KR',NULL),
('auto','자동차',2,'현대모비스','012330','KR',NULL),
('auto','자동차',1,'만도','204320','KR',NULL),
('auto','자동차',1,'현대위아','011210','KR',NULL),
('auto','자동차',1,'HL만도','204320','KR',NULL),
('auto','자동차',1,'에스엘','005765','KR',NULL),
('auto','자동차',1,'현대트랜시스','298040','KR',NULL),
('auto','자동차',1,'세종공업','033530','KR',NULL);

-- ── 로봇 (robot) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('robot','로봇',5,'BOTZ','BOTZ','US','Global X Robotics & AI ETF'),
('robot','로봇',5,'ROBO','ROBO','US','ROBO Global Robotics & Auto'),
('robot','로봇',4,'Intuitive Surgical','ISRG','US',NULL),
('robot','로봇',4,'Fanuc ADR','FANUY','US',NULL),
('robot','로봇',4,'ABB Ltd','ABB','US',NULL),
('robot','로봇',4,'Rockwell Auto','ROK','US',NULL),
('robot','로봇',3,'Cognex','CGNX','US',NULL),
('robot','로봇',3,'Keyence','6861.T','JP',NULL),
('robot','로봇',3,'Siemens','SIE.DE','EU',NULL),
('robot','로봇',3,'Yaskawa','6506.T','JP',NULL),
('robot','로봇',2,'삼성전자(반도체장비)','005930','KR',NULL),
('robot','로봇',2,'두산로보틱스','454910','KR',NULL),
('robot','로봇',2,'레인보우로보틱스','277810','KR',NULL),
('robot','로봇',1,'로보티즈','108490','KR',NULL),
('robot','로봇',1,'유일로보틱스','388790','KR',NULL),
('robot','로봇',1,'뉴로메카','443060','KR',NULL),
('robot','로봇',1,'티로보틱스','117730','KR',NULL),
('robot','로봇',1,'로보스타','090360','KR',NULL);

-- ── 에너지 (energy) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('energy','에너지(원전/신재생)',5,'XLE','XLE','US','Energy Select Sector SPDR'),
('energy','에너지(원전/신재생)',5,'URA','URA','US','Global X Uranium ETF'),
('energy','에너지(원전/신재생)',5,'ICLN','ICLN','US','iShares Global Clean Energy'),
('energy','에너지(원전/신재생)',4,'Cameco','CCJ','US',NULL),
('energy','에너지(원전/신재생)',4,'NextEra Energy','NEE','US',NULL),
('energy','에너지(원전/신재생)',4,'Constellation Energy','CEG','US',NULL),
('energy','에너지(원전/신재생)',4,'Vistra Corp','VST','US',NULL),
('energy','에너지(원전/신재생)',3,'Vestas Wind','VWS.CO','EU',NULL),
('energy','에너지(원전/신재생)',3,'Enphase Energy','ENPH','US',NULL),
('energy','에너지(원전/신재생)',3,'First Solar','FSLR','US',NULL),
('energy','에너지(원전/신재생)',3,'BWX Technologies','BWXT','US',NULL),
('energy','에너지(원전/신재생)',2,'한국전력','015760','KR',NULL),
('energy','에너지(원전/신재생)',2,'한국가스공사','036460','KR',NULL),
('energy','에너지(원전/신재생)',2,'두산에너빌리티','034020','KR',NULL),
('energy','에너지(원전/신재생)',1,'비에이치아이','083650','KR',NULL),
('energy','에너지(원전/신재생)',1,'일진파워','094820','KR',NULL),
('energy','에너지(원전/신재생)',1,'씨에스윈드','112610','KR',NULL),
('energy','에너지(원전/신재생)',1,'HD현대에너지솔루션','322000','KR',NULL),
('energy','에너지(원전/신재생)',1,'LS ELECTRIC','010120','KR',NULL),
('energy','에너지(원전/신재생)',1,'효성중공업','298040','KR',NULL);

-- ── 게임 (game) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('game','게임',5,'HERO','HERO','US','Global X Video Games & Esports'),
('game','게임',5,'ESPO','ESPO','US','VanEck Video Gaming & Esports'),
('game','게임',4,'NVIDIA(GPU)','NVDA','US',NULL),
('game','게임',4,'Microsoft(Xbox)','MSFT','US',NULL),
('game','게임',4,'Sony ADR','SONY','US',NULL),
('game','게임',4,'Tencent(OTC)','TCEHY','US',NULL),
('game','게임',3,'EA','EA','US',NULL),
('game','게임',3,'Take-Two','TTWO','US',NULL),
('game','게임',3,'Roblox','RBLX','US',NULL),
('game','게임',3,'Nintendo ADR','NTDOY','US',NULL),
('game','게임',2,'크래프톤','259960','KR',NULL),
('game','게임',2,'엔씨소프트','036570','KR',NULL),
('game','게임',2,'넷마블','251270','KR',NULL),
('game','게임',1,'펄어비스','263750','KR',NULL),
('game','게임',1,'카카오게임즈','293490','KR',NULL),
('game','게임',1,'컴투스','078340','KR',NULL),
('game','게임',1,'위메이드','112040','KR',NULL),
('game','게임',1,'시프트업','462870','KR',NULL);

-- ── 엔터 (entertainment) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('entertainment','엔터',5,'PEJ','PEJ','US','Invesco Dynamic Leisure & Ent.'),
('entertainment','엔터',4,'Walt Disney','DIS','US',NULL),
('entertainment','엔터',4,'Netflix','NFLX','US',NULL),
('entertainment','엔터',4,'Live Nation','LYV','US',NULL),
('entertainment','엔터',4,'Warner Bros','WBD','US',NULL),
('entertainment','엔터',3,'Spotify','SPOT','US',NULL),
('entertainment','엔터',3,'Universal Music','UMG.AS','EU',NULL),
('entertainment','엔터',3,'CJ ENM US','035760','KR',NULL),
('entertainment','엔터',2,'HYBE','352820','KR',NULL),
('entertainment','엔터',2,'SM','041510','KR',NULL),
('entertainment','엔터',2,'JYP Ent.','035900','KR',NULL),
('entertainment','엔터',2,'YG Ent.','122870','KR',NULL),
('entertainment','엔터',1,'에스엠라이프디자인','063440','KR',NULL),
('entertainment','엔터',1,'디어유','327260','KR',NULL),
('entertainment','엔터',1,'CJ ENM','035760','KR',NULL),
('entertainment','엔터',1,'스튜디오드래곤','253450','KR',NULL),
('entertainment','엔터',1,'NEW','160550','KR',NULL);

-- ── 유통 (logistics) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('logistics','유통(해운/항공)',5,'IYT','IYT','US','iShares Transportation Average'),
('logistics','유통(해운/항공)',5,'SEA','SEA','US','U.S. Global Sea to Sky Cargo'),
('logistics','유통(해운/항공)',4,'FedEx','FDX','US',NULL),
('logistics','유통(해운/항공)',4,'UPS','UPS','US',NULL),
('logistics','유통(해운/항공)',4,'Maersk','MAERSK-B.CO','EU',NULL),
('logistics','유통(해운/항공)',4,'Delta Air','DAL','US',NULL),
('logistics','유통(해운/항공)',3,'ZIM Shipping','ZIM','US',NULL),
('logistics','유통(해운/항공)',3,'Hapag-Lloyd','HLAG.DE','EU',NULL),
('logistics','유통(해운/항공)',3,'Air France-KLM','AF.PA','EU',NULL),
('logistics','유통(해운/항공)',2,'HMM','011200','KR',NULL),
('logistics','유통(해운/항공)',2,'대한항공','003490','KR',NULL),
('logistics','유통(해운/항공)',2,'CJ대한통운','000120','KR',NULL),
('logistics','유통(해운/항공)',1,'팬오션','028670','KR',NULL),
('logistics','유통(해운/항공)',1,'한진칼','180640','KR',NULL),
('logistics','유통(해운/항공)',1,'티웨이항공','091810','KR',NULL),
('logistics','유통(해운/항공)',1,'흥아해운','003280','KR',NULL),
('logistics','유통(해운/항공)',1,'한솔로지스틱스','014790','KR',NULL);

-- ── 식품 (food) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, stock_name, ticker, market, "desc") VALUES
('food','식품',5,'XLP','XLP','US','Consumer Staples Select Sector'),
('food','식품',5,'PBJ','PBJ','US','Invesco Dynamic Food & Beverage'),
('food','식품',4,'Nestle ADR','NSRGY','US',NULL),
('food','식품',4,'PepsiCo','PEP','US',NULL),
('food','식품',4,'Coca-Cola','KO','US',NULL),
('food','식품',4,'Mondelez','MDLZ','US',NULL),
('food','식품',3,'Tyson Foods','TSN','US',NULL),
('food','식품',3,'Archer-Daniels','ADM','US',NULL),
('food','식품',3,'Danone','BN.PA','EU',NULL),
('food','식품',2,'CJ제일제당','097950','KR',NULL),
('food','식품',2,'오리온','271560','KR',NULL),
('food','식품',2,'농심','004370','KR',NULL),
('food','식품',1,'삼양식품','003230','KR',NULL),
('food','식품',1,'롯데웰푸드','280360','KR',NULL),
('food','식품',1,'대상','001680','KR',NULL),
('food','식품',1,'풀무원','017810','KR',NULL),
('food','식품',1,'하이트진로','000080','KR',NULL),
('food','식품',1,'매일유업','267980','KR',NULL);


-- ═══════════════════════════════════════
-- 2. SECTOR LINKS (supply chain connections)
-- 5 sectors, 88 connections
-- ═══════════════════════════════════════

-- ── 반도체 links (42 rows) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
-- SOXX ETF 구성
('semiconductor','SOXX','NVIDIA','ETF 구성',1),
('semiconductor','SOXX','TSMC','ETF 구성',1),
('semiconductor','SOXX','AMD','ETF 구성',1),
('semiconductor','SOXX','Intel','ETF 구성',1),
('semiconductor','SOXX','Broadcom','ETF 구성',1),
-- SMH ETF 구성
('semiconductor','SMH','NVIDIA','ETF 구성',1),
('semiconductor','SMH','TSMC','ETF 구성',1),
('semiconductor','SMH','ASML','ETF 구성',1),
('semiconductor','SMH','Broadcom','ETF 구성',1),
('semiconductor','SMH','AMD','ETF 구성',1),
-- NVIDIA → HBM/파운드리
('semiconductor','NVIDIA','TSMC','HBM/파운드리',5),
('semiconductor','NVIDIA','SK하이닉스','HBM/파운드리',5),
('semiconductor','NVIDIA','한미반도체','HBM/파운드리',5),
-- TSMC → 장비 공급
('semiconductor','TSMC','ASML','장비 공급',4),
('semiconductor','TSMC','Applied Materials','장비 공급',4),
('semiconductor','TSMC','Lam Research','장비 공급',4),
('semiconductor','TSMC','주성엔지니어링','장비 공급',4),
-- ASML → 광학/노광
('semiconductor','ASML','Tokyo Electron','광학/노광 장비',3),
('semiconductor','ASML','한화비전','광학/노광 장비',3),
-- AMD → 파운드리/HBM
('semiconductor','AMD','TSMC','파운드리/HBM',4),
('semiconductor','AMD','SK하이닉스','파운드리/HBM',4),
-- Micron → 메모리
('semiconductor','Micron','SK하이닉스','메모리 경쟁/소재',2),
('semiconductor','Micron','Entegris','메모리 경쟁/소재',2),
-- Applied Materials → 증착/식각
('semiconductor','Applied Materials','주성엔지니어링','증착/식각 장비',4),
('semiconductor','Applied Materials','원익IPS','증착/식각 장비',4),
('semiconductor','Applied Materials','유진테크','증착/식각 장비',4),
-- Lam Research → 식각/세정
('semiconductor','Lam Research','주성엔지니어링','식각/세정 장비',3),
('semiconductor','Lam Research','피에스케이','식각/세정 장비',3),
-- KLA Corp → 검사/테스트
('semiconductor','KLA Corp','리노공업','검사/테스트 장비',3),
('semiconductor','KLA Corp','ISC','검사/테스트 장비',3),
-- SK하이닉스 → 장비/패키징
('semiconductor','SK하이닉스','한미반도체','장비/패키징 납품',5),
('semiconductor','SK하이닉스','원익IPS','장비/패키징 납품',5),
('semiconductor','SK하이닉스','유진테크','장비/패키징 납품',5),
('semiconductor','SK하이닉스','테크윙','장비/패키징 납품',5),
-- 삼성전자 → 장비/패키징
('semiconductor','삼성전자','주성엔지니어링','장비/패키징 납품',5),
('semiconductor','삼성전자','한미반도체','장비/패키징 납품',5),
('semiconductor','삼성전자','피에스케이','장비/패키징 납품',5),
('semiconductor','삼성전자','ISC','장비/패키징 납품',5),
-- DB하이텍 → 파운드리
('semiconductor','DB하이텍','주성엔지니어링','파운드리 장비',3),
('semiconductor','DB하이텍','유진테크','파운드리 장비',3),
-- 리노공업 → 테스트 소켓
('semiconductor','리노공업','ISC','테스트 소켓',2),
('semiconductor','리노공업','테크윙','테스트 소켓',2);

-- ── 방산 links (18 rows) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
-- ITA ETF 구성
('defense','ITA','Lockheed Martin','ETF 구성',1),
('defense','ITA','RTX Corp','ETF 구성',1),
('defense','ITA','Northrop Grumman','ETF 구성',1),
('defense','ITA','General Dynamics','ETF 구성',1),
('defense','ITA','L3Harris','ETF 구성',1),
-- Lockheed Martin → F-35 공급망
('defense','Lockheed Martin','BAE Systems','F-35 공급망',5),
('defense','Lockheed Martin','한화에어로스페이스','F-35 공급망',5),
('defense','Lockheed Martin','풍산','F-35 공급망',5),
-- RTX Corp → 미사일/레이더
('defense','RTX Corp','Thales','미사일/레이더',4),
('defense','RTX Corp','LIG넥스원','미사일/레이더',4),
-- Northrop Grumman → 무인기/우주
('defense','Northrop Grumman','한화시스템','무인기/우주',3),
('defense','Northrop Grumman','빅텍','무인기/우주',3),
-- General Dynamics → 장갑차량
('defense','General Dynamics','현대로템','장갑차량',3),
-- 한화에어로스페이스 → 항공엔진/부품
('defense','한화에어로스페이스','풍산','항공엔진/부품',5),
('defense','한화에어로스페이스','한일단조','항공엔진/부품',5),
('defense','한화에어로스페이스','한국항공우주','항공엔진/부품',5),
-- LIG넥스원 → 유도무기/통신
('defense','LIG넥스원','빅텍','유도무기/통신',4),
-- 현대로템 → K2 전차 부품
('defense','현대로템','한일단조','K2 전차 부품',3);

-- ── 조선 links (8 rows) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('shipbuilding','HD한국조선','HD현대중공업','그룹사/엔진',5),
('shipbuilding','HD한국조선','한화엔진','그룹사/엔진',5),
('shipbuilding','HD한국조선','세진중공업','그룹사/엔진',5),
('shipbuilding','삼성중공업','동성화인텍','LNG 단열/배관',4),
('shipbuilding','삼성중공업','태광','LNG 단열/배관',4),
('shipbuilding','한화오션','한화엔진','그룹사 엔진',4),
('shipbuilding','Rolls-Royce','한화엔진','엔진 라이선스',3),
('shipbuilding','Wartsila','HD현대중공업','엔진 기술제휴',2);

-- ── 바이오 links (8 rows) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('bio','Eli Lilly','삼성바이오로직스','CMO 위탁생산',4),
('bio','Novo Nordisk','삼성바이오로직스','CMO 위탁생산',4),
('bio','AbbVie','셀트리온','바이오시밀러 경쟁',2),
('bio','Regeneron','알테오젠','피하주사 기술제휴',5),
('bio','삼성바이오로직스','에이비엘바이오','ADC 기술협력',3),
('bio','셀트리온','파마리서치','원료의약품',2),
('bio','유한양행','HLB','신약 라이선스',4),
('bio','유한양행','리가켐바이오','신약 라이선스',4);

-- ── 자동차 links (12 rows) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('auto','Tesla','현대차','EV 경쟁/부품',2),
('auto','Tesla','기아','EV 경쟁/부품',2),
('auto','현대차','현대모비스','그룹사 부품',5),
('auto','현대차','만도','그룹사 부품',5),
('auto','현대차','현대위아','그룹사 부품',5),
('auto','현대차','에스엘','그룹사 부품',5),
('auto','현대차','현대트랜시스','그룹사 부품',5),
('auto','기아','현대모비스','그룹사 부품',5),
('auto','기아','만도','그룹사 부품',5),
('auto','기아','세종공업','그룹사 부품',5),
('auto','Aptiv','만도','자율주행 협력',3),
('auto','Denso','현대모비스','전장부품 기술',2);

-- ═══════════════════════════════════════
-- 완료: 259 stocks + 88 links inserted
-- ═══════════════════════════════════════
