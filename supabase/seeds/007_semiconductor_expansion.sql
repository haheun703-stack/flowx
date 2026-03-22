-- 007_semiconductor_expansion.sql
-- 반도체 섹터 33→100종목 확장 + 120연결
-- Supabase SQL Editor에서 실행

-- ============================================================
-- 1. 기존 반도체 종목/연결 삭제 (깨끗하게 재삽입)
-- ============================================================
DELETE FROM sector_links WHERE sector_key = 'semiconductor';
DELETE FROM sector_universe WHERE sector_key = 'semiconductor';

-- ============================================================
-- 2. 반도체 100종목 INSERT (글로벌 18 + 한국 82)
-- ============================================================

-- ── 글로벌 ETF (5★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',5,'ETF','SOXX','SOXX','US','필라델피아 반도체 지수','{"ETF"}'),
('semiconductor','반도체',5,'ETF','SMH','SMH','US','반도체 대형주 ETF','{"ETF"}'),
('semiconductor','반도체',5,'ETF','XSD','XSD','US','S&P 반도체 ETF','{"ETF"}');

-- ── 글로벌 대형 (4★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',4,'글로벌대형','엔비디아','NVDA','US','AI GPU 1위, HBM 최대 수요처','{"AI서버","HBM"}'),
('semiconductor','반도체',4,'글로벌대형','TSMC','TSM','US','파운드리 세계 1위','{"파운드리"}'),
('semiconductor','반도체',4,'글로벌대형','브로드컴','AVGO','US','네트워킹 반도체 1위','{"AI서버"}'),
('semiconductor','반도체',4,'글로벌대형','AMD','AMD','US','CPU/GPU, MI 시리즈 AI 가속기','{"AI서버"}'),
('semiconductor','반도체',4,'글로벌대형','ASML 홀딩','ASML','US','EUV 노광장비 독점','{"EUV"}'),
('semiconductor','반도체',4,'글로벌대형','마이크론','MU','US','DRAM/NAND, HBM 3위','{"HBM","메모리"}'),
('semiconductor','반도체',4,'글로벌대형','인텔','INTC','US','CPU + 파운드리 전환 중','{"파운드리"}'),
('semiconductor','반도체',4,'글로벌대형','램리서치','LRCX','US','식각/증착 장비','{"식각","증착"}'),
('semiconductor','반도체',4,'글로벌대형','어플라이드 머티어리얼즈','AMAT','US','반도체 장비 1위','{"증착","식각"}'),
('semiconductor','반도체',4,'글로벌대형','KLA','KLAC','US','검사/계측 장비','{"검사"}');

-- ── 글로벌 서플라이어 (4★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',4,'글로벌서플라이어','온세미컨덕터','ON','US','전력반도체, 차량용','{"전력반도체"}'),
('semiconductor','반도체',4,'글로벌서플라이어','마벨테크','MRVL','US','데이터 인프라 반도체','{"AI서버"}'),
('semiconductor','반도체',4,'글로벌서플라이어','엔테그리스','ENTG','US','반도체 소재/필터','{"소재"}'),
('semiconductor','반도체',4,'글로벌서플라이어','모놀리식파워','MPWR','US','전력관리IC','{"전력반도체"}'),
('semiconductor','반도체',4,'글로벌서플라이어','래티스반도체','LSCC','US','FPGA 저전력','{"팹리스"}'),
('semiconductor','반도체',4,'글로벌서플라이어','도쿄일렉트론','8035.T','JP','반도체 장비, 코터/디벨로퍼','{"장비"}');

-- ── 지주사 (4★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',4,'지주사','SK스퀘어','402340','KR','SK하이닉스 지주 (20% 보유)','{"지주","HBM"}'),
('semiconductor','반도체',4,'지주사','원익홀딩스','030530','KR','원익그룹 지주 (원익IPS, 원익머트리얼즈)','{"지주"}'),
('semiconductor','반도체',4,'지주사','피에스케이홀딩스','031980','KR','PSK그룹 지주 (피에스케이)','{"지주"}');

-- ── IDM 종합반도체 (5★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',5,'IDM','삼성전자','005930','KR','메모리(DRAM/NAND) + 파운드리 + LSI','{"HBM","AI서버","파운드리"}'),
('semiconductor','반도체',5,'IDM','SK하이닉스','000660','KR','DRAM, NAND, HBM 세계 1위 (점유율 50%+)','{"HBM","AI서버","메모리"}');

-- ── 파운드리 (3★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',3,'파운드리','DB하이텍','000990','KR','8인치 파운드리 (아날로그/전력반도체)','{"파운드리","전력반도체"}');

-- ── 팹리스/설계 (3★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',3,'팹리스','LX세미콘','108320','KR','디스플레이 구동IC(DDIC), LG디스플레이 독점','{"팹리스"}'),
('semiconductor','반도체',3,'팹리스','가온칩스','399720','KR','WiFi/BT/NFC 무선통신IC, 삼성전자','{"팹리스"}'),
('semiconductor','반도체',3,'팹리스','텔레칩스','054450','KR','자동차 SoC (인포테인먼트), 현대차/테슬라','{"팹리스","자동차"}'),
('semiconductor','반도체',3,'팹리스','어보브반도체','102120','KR','MCU (가전/산업용)','{"팹리스"}'),
('semiconductor','반도체',3,'팹리스','칩스앤미디어','094360','KR','영상처리 IP (코덱) 라이선스','{"팹리스","IP"}'),
('semiconductor','반도체',3,'팹리스','아나패스','123860','KR','디스플레이 타이밍컨트롤러','{"팹리스"}'),
('semiconductor','반도체',3,'팹리스','넥스트칩','244620','KR','차량용 ISP/영상처리, 현대모비스','{"팹리스","자동차"}'),
('semiconductor','반도체',3,'팹리스','파두','440110','KR','SSD 컨트롤러, 삼성전자','{"팹리스","AI서버"}'),
('semiconductor','반도체',3,'팹리스','에이디테크놀로지','200710','KR','ASIC 설계 서비스, 삼성 파운드리','{"팹리스","파운드리"}'),
('semiconductor','반도체',3,'팹리스','퀄리타스반도체','432720','KR','DDR5/HBM PHY IP, SK하이닉스/삼성전자','{"팹리스","HBM","IP"}'),
('semiconductor','반도체',3,'팹리스','제주반도체','080220','KR','메모리 모듈 설계 B2B','{"팹리스","메모리모듈"}');

-- ── 전공정 장비 (2★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',2,'전공정장비','원익IPS','240810','KR','CVD/ALD 증착장비, 삼성/SK','{"증착","ALD"}'),
('semiconductor','반도체',2,'전공정장비','주성엔지니어링','036930','KR','PECVD/ALD 증착장비, 삼성/SK','{"증착","ALD"}'),
('semiconductor','반도체',2,'전공정장비','유진테크','084370','KR','퍼니스/LP-CVD, 삼성/SK','{"증착","열처리"}'),
('semiconductor','반도체',2,'전공정장비','HPSP','403870','KR','고압수소어닐링, 삼성/SK','{"열처리","HBM"}'),
('semiconductor','반도체',2,'전공정장비','테스','095610','KR','CVD/에칭 장비, 삼성전자','{"증착"}'),
('semiconductor','반도체',2,'전공정장비','피에스케이','319660','KR','에싱/세정 장비, 삼성/SK','{"식각","HBM"}'),
('semiconductor','반도체',2,'전공정장비','AP시스템','265520','KR','레이저어닐링/ELA, 삼성디스플레이','{"열처리"}'),
('semiconductor','반도체',2,'전공정장비','케이씨텍','281820','KR','CMP 장비/슬러리, 삼성전자','{"CMP","HBM"}'),
('semiconductor','반도체',2,'전공정장비','디아이','003160','KR','CVD 증착장비','{"증착"}'),
('semiconductor','반도체',2,'전공정장비','에프에스티','036810','KR','포토마스크 검사/수리, 삼성전자','{"EUV"}'),
('semiconductor','반도체',2,'전공정장비','넥스틴','348210','KR','웨이퍼 외관검사, 삼성/SK','{"검사"}'),
('semiconductor','반도체',2,'전공정장비','파크시스템스','140860','KR','원자현미경(AFM), 글로벌','{"계측"}'),
('semiconductor','반도체',2,'전공정장비','오로스테크놀로지','322310','KR','박막두께 측정, 삼성전자','{"계측"}'),
('semiconductor','반도체',2,'전공정장비','인텍플러스','064290','KR','외관/패턴 검사, 삼성/SK','{"검사"}'),
('semiconductor','반도체',2,'전공정장비','엘오티베큠','083310','KR','진공펌프/밸브, 장비사 공급','{"진공"}'),
('semiconductor','반도체',2,'전공정장비','싸이맥스','160980','KR','가스공급장치(GDS), 삼성전자','{"가스"}');

-- ── 전공정 소재 (1★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',1,'전공정소재','솔브레인','357780','KR','식각액, 세정액, CMP슬러리, 전구체','{"식각","CMP","HBM"}'),
('semiconductor','반도체',1,'전공정소재','동진쎄미켐','005290','KR','포토레지스트(PR), BARC, SOC','{"EUV","포토"}'),
('semiconductor','반도체',1,'전공정소재','후성','093370','KR','C4F6, WF6, NF3 특수가스','{"특수가스","HBM","식각"}'),
('semiconductor','반도체',1,'전공정소재','디엔에프','092070','KR','High-K/Low-K 전구체, 삼성전자(지분7%)','{"전구체","ALD","HBM"}'),
('semiconductor','반도체',1,'전공정소재','한솔케미칼','014680','KR','전구체, 초고순도 과산화수소','{"전구체","HBM"}'),
('semiconductor','반도체',1,'전공정소재','이엔에프테크놀로지','102710','KR','식각액, 세정액, 슬러리','{"식각"}'),
('semiconductor','반도체',1,'전공정소재','원익머트리얼즈','104830','KR','N2O, NH3, F2, Si2H6 특수가스','{"특수가스","HBM"}'),
('semiconductor','반도체',1,'전공정소재','하나머티리얼즈','166330','KR','실리콘/SiC 링·전극 부품소재','{"부품소재"}'),
('semiconductor','반도체',1,'전공정소재','티씨케이','064760','KR','SiC 코팅 흑연부품','{"SiC","코팅"}'),
('semiconductor','반도체',1,'전공정소재','에스앤에스텍','101490','KR','EUV 블랭크마스크, 삼성전자','{"EUV"}'),
('semiconductor','반도체',1,'전공정소재','덕산테코피아','317330','KR','ALD/CVD 전구체','{"전구체","ALD"}'),
('semiconductor','반도체',1,'전공정소재','코미코','183300','KR','부품 코팅·세정·재생','{"코팅"}'),
('semiconductor','반도체',1,'전공정소재','PI첨단소재','178920','KR','폴리이미드(PI) 필름','{"필름"}');

-- ── 후공정 장비 (2★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',2,'후공정장비','한미반도체','042700','KR','TC 본더(HBM 점유율 71.2%), 다이싱','{"HBM","TC본더","AI서버"}'),
('semiconductor','반도체',2,'후공정장비','이오테크닉스','039030','KR','레이저 마킹/드릴링/커팅','{"HBM","레이저"}'),
('semiconductor','반도체',2,'후공정장비','프로텍','053610','KR','디스펜서, 다이본더','{"본딩"}'),
('semiconductor','반도체',2,'후공정장비','제너셈','217190','KR','Pick&Place, 검사장비','{"이송"}'),
('semiconductor','반도체',2,'후공정장비','테크윙','089030','KR','테스트핸들러, 체인저','{"테스트","HBM"}'),
('semiconductor','반도체',2,'후공정장비','고영','098460','KR','3D SPI/AOI 검사, 글로벌 EMS','{"검사","AI서버"}'),
('semiconductor','반도체',2,'후공정장비','기가비스','420770','KR','AVI 외관검사','{"검사"}'),
('semiconductor','반도체',2,'후공정장비','에이팩트','200470','KR','DRAM/NAND 테스트, SK하이닉스','{"테스트","HBM"}'),
('semiconductor','반도체',2,'후공정장비','펨트론','168360','KR','비전검사장비','{"검사"}'),
('semiconductor','반도체',2,'후공정장비','코세스','089890','KR','와이어본더','{"본딩"}');

-- ── OSAT/패키징 (2★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',2,'OSAT','SFA반도체','036540','KR','패키징+테스트(OSAT), 삼성/SK/마이크론','{"OSAT"}'),
('semiconductor','반도체',2,'OSAT','하나마이크론','067310','KR','메모리 패키징+실리콘부품, SK하이닉스','{"OSAT","HBM"}'),
('semiconductor','반도체',2,'OSAT','네패스','033640','KR','팬아웃WLP, 범핑','{"OSAT","AI서버"}'),
('semiconductor','반도체',2,'OSAT','네패스아크','330860','KR','선단 패키징','{"OSAT","AI서버"}'),
('semiconductor','반도체',2,'OSAT','시그네틱스','033170','KR','SiP 모듈, 플립칩','{"OSAT"}'),
('semiconductor','반도체',2,'OSAT','두산테스나','131970','KR','웨이퍼 테스트, 삼성/퀄컴','{"OSAT","테스트"}');

-- ── 검사/테스트 부품 (1★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',1,'검사테스트','리노공업','058470','KR','IC 테스트 소켓 세계 1위','{"테스트","HBM","AI서버"}'),
('semiconductor','반도체',1,'검사테스트','티에스이','131290','KR','프로브카드, 삼성/SK','{"테스트","HBM"}'),
('semiconductor','반도체',1,'검사테스트','아이에스시','095340','KR','러버소켓/테스트소켓','{"테스트"}'),
('semiconductor','반도체',1,'검사테스트','유니테스트','086390','KR','메모리 테스트 장비, SK/마이크론','{"테스트","HBM"}'),
('semiconductor','반도체',1,'검사테스트','엑시콘','092870','KR','비메모리 테스트 장비','{"테스트"}');

-- ── 기판/PCB/부품 (2★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',2,'기판PCB','삼성전기','009150','KR','MLCC, FC-BGA 기판','{"기판","AI서버"}'),
('semiconductor','반도체',2,'기판PCB','LG이노텍','011070','KR','FC-BGA, 카메라모듈, 애플','{"기판"}'),
('semiconductor','반도체',2,'기판PCB','심텍','222800','KR','메모리기판(BOC), HBM기판 세계 1위','{"기판","HBM","AI서버"}'),
('semiconductor','반도체',2,'기판PCB','대덕전자','353200','KR','MLB, FC-BGA, 삼성/인텔','{"기판","AI서버"}'),
('semiconductor','반도체',2,'기판PCB','이수페타시스','007660','KR','고다층 MLB/HDI, NVIDIA/구글/MS 직납','{"기판","AI서버"}'),
('semiconductor','반도체',2,'기판PCB','코리아써키트','007810','KR','HDI, FC-BGA, 삼성전자','{"기판"}'),
('semiconductor','반도체',2,'기판PCB','해성디에스','195870','KR','리드프레임, DAP, 삼성/SK','{"기판","HBM"}'),
('semiconductor','반도체',2,'기판PCB','인터플렉스','051370','KR','FPCB, 삼성전자','{"FPCB"}'),
('semiconductor','반도체',2,'기판PCB','비에이치','090460','KR','FPCB, RF안테나, 애플','{"FPCB"}'),
('semiconductor','반도체',2,'기판PCB','티엘비','356860','KR','MLB 기판, 서버/통신','{"기판","AI서버"}'),
('semiconductor','반도체',2,'기판PCB','한양디지텍','078350','KR','메모리 모듈, SK하이닉스','{"메모리모듈"}'),
('semiconductor','반도체',2,'기판PCB','덕산하이메탈','077360','KR','솔더볼(BGA접합), 삼성/SK','{"접합","HBM"}');

-- ── 클린룸/설비/유틸리티 (1★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',1,'클린룸설비','신성이엔지','011930','KR','클린룸 설비, 삼성/SK','{"클린룸"}'),
('semiconductor','반도체',1,'클린룸설비','한양이엔지','045100','KR','반도체 유틸리티 설비','{"설비"}'),
('semiconductor','반도체',1,'클린룸설비','에스티아이','039440','KR','반도체 설비/EFEM','{"설비"}'),
('semiconductor','반도체',1,'클린룸설비','유니셈','036200','KR','스크러버(가스정화), 삼성/SK','{"설비"}'),
('semiconductor','반도체',1,'클린룸설비','제우스','079370','KR','석영튜브/세정장비','{"설비"}'),
('semiconductor','반도체',1,'클린룸설비','예스티','122640','KR','열처리장비','{"열처리"}'),
('semiconductor','반도체',1,'클린룸설비','네오셈','253590','KR','가스 분석/공급','{"가스"}');

-- ── 전력반도체/SiC/GaN (2★) ──
INSERT INTO sector_universe (sector_key, sector_name, tier, sub_category, stock_name, ticker, market, "desc", theme_tags) VALUES
('semiconductor','반도체',2,'전력반도체','레이크머티리얼즈','281740','KR','SiC 잉곳/웨이퍼, SiC 국산화','{"SiC","전력반도체"}'),
('semiconductor','반도체',2,'전력반도체','디아이티','110990','KR','SiC 레이저어닐링, 수율 개선','{"SiC","전력반도체"}');


-- ============================================================
-- 3. 공급망 연결 120개+ INSERT
-- ============================================================

-- ── HBM 밸류체인 (13연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','SK하이닉스','한미반도체','TC본더 납품 (점유율71%)',5),
('semiconductor','SK하이닉스','심텍','HBM 기판 납품',5),
('semiconductor','SK하이닉스','이오테크닉스','TSV 레이저드릴링',5),
('semiconductor','SK하이닉스','피에스케이','TSV 에싱공정',4),
('semiconductor','SK하이닉스','케이씨텍','TSV CMP',4),
('semiconductor','SK하이닉스','덕산하이메탈','HBM 솔더볼',4),
('semiconductor','SK하이닉스','유니테스트','HBM 테스트',4),
('semiconductor','SK하이닉스','리노공업','테스트 소켓',4),
('semiconductor','SK하이닉스','티에스이','프로브카드',4),
('semiconductor','SK하이닉스','하나마이크론','메모리 패키징',4),
('semiconductor','SK하이닉스','에이팩트','DRAM 테스트',3),
('semiconductor','SK하이닉스','해성디에스','리드프레임',3),
('semiconductor','SK하이닉스','한양디지텍','메모리 모듈',3);

-- ── 삼성전자 서플라이체인 (30연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','삼성전자','원익IPS','ALD 증착장비',5),
('semiconductor','삼성전자','주성엔지니어링','PECVD 장비',5),
('semiconductor','삼성전자','유진테크','퍼니스/LP-CVD',4),
('semiconductor','삼성전자','HPSP','고압수소어닐링',5),
('semiconductor','삼성전자','테스','CVD 장비',4),
('semiconductor','삼성전자','피에스케이','에싱장비',4),
('semiconductor','삼성전자','솔브레인','식각액/세정액',5),
('semiconductor','삼성전자','동진쎄미켐','포토레지스트',4),
('semiconductor','삼성전자','디엔에프','전구체 (지분7%)',5),
('semiconductor','삼성전자','후성','특수가스',4),
('semiconductor','삼성전자','한솔케미칼','전구체',4),
('semiconductor','삼성전자','에스앤에스텍','EUV 블랭크마스크',4),
('semiconductor','삼성전자','하나머티리얼즈','실리콘링/전극',3),
('semiconductor','삼성전자','티씨케이','SiC 코팅부품',3),
('semiconductor','삼성전자','코미코','부품 코팅/재생',3),
('semiconductor','삼성전자','신성이엔지','클린룸 설비',3),
('semiconductor','삼성전자','한양이엔지','유틸리티 설비',3),
('semiconductor','삼성전자','삼성전기','FC-BGA 기판',4),
('semiconductor','삼성전자','대덕전자','MLB 기판',3),
('semiconductor','삼성전자','SFA반도체','OSAT',3),
('semiconductor','삼성전자','시그네틱스','SiP 모듈',3),
('semiconductor','삼성전자','두산테스나','웨이퍼 테스트',3),
('semiconductor','삼성전자','가온칩스','팹리스 고객',3),
('semiconductor','삼성전자','LX세미콘','팹리스 고객',3),
('semiconductor','삼성전자','어보브반도체','팹리스 고객',3),
('semiconductor','삼성전자','파두','SSD컨트롤러',4),
('semiconductor','삼성전자','에프에스티','포토마스크 검사',3),
('semiconductor','삼성전자','넥스틴','웨이퍼 검사',3),
('semiconductor','삼성전자','오로스테크놀로지','박막두께 측정',3),
('semiconductor','삼성전자','인텍플러스','패턴 검사',3);

-- ── AI 서버 밸류체인 (7연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','엔비디아','이수페타시스','서버 MLB 직납',5),
('semiconductor','엔비디아','SK하이닉스','HBM 공급',5),
('semiconductor','엔비디아','삼성전기','FC-BGA 기판',4),
('semiconductor','엔비디아','대덕전자','FC-BGA 기판',4),
('semiconductor','엔비디아','리노공업','테스트 소켓',4),
('semiconductor','엔비디아','고영','3D SPI 검사',3),
('semiconductor','엔비디아','퀄리타스반도체','HBM PHY IP',4);

-- ── 글로벌 → 한국 (7연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','ASML 홀딩','에스앤에스텍','EUV 블랭크마스크',4),
('semiconductor','ASML 홀딩','동진쎄미켐','EUV PR',4),
('semiconductor','ASML 홀딩','에프에스티','마스크 검사',3),
('semiconductor','램리서치','솔브레인','식각 소재',4),
('semiconductor','어플라이드 머티어리얼즈','원익IPS','증착장비 경쟁/협력',3),
('semiconductor','마이크론','SFA반도체','OSAT',3),
('semiconductor','마이크론','유니테스트','메모리 테스트',3);

-- ── 지주 → 자회사 (4연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','SK스퀘어','SK하이닉스','지분 20% 보유',5),
('semiconductor','원익홀딩스','원익IPS','자회사',4),
('semiconductor','원익홀딩스','원익머트리얼즈','자회사',4),
('semiconductor','피에스케이홀딩스','피에스케이','자회사',4);

-- ── 전력반도체 체인 (4연결) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','DB하이텍','LX세미콘','파운드리 위탁',3),
('semiconductor','DB하이텍','레이크머티리얼즈','SiC 웨이퍼',3),
('semiconductor','레이크머티리얼즈','티씨케이','SiC 코팅',3),
('semiconductor','레이크머티리얼즈','디아이티','SiC 레이저어닐링',3);

-- ── 추가 연결 (장비사 간, 소재-장비 관계 등) ──
INSERT INTO sector_links (sector_key, from_stock, to_stock, relation, strength) VALUES
('semiconductor','TSMC','ASML 홀딩','EUV 장비 공급',5),
('semiconductor','TSMC','어플라이드 머티어리얼즈','증착/식각 장비',4),
('semiconductor','TSMC','램리서치','식각 장비',4),
('semiconductor','삼성전자','한미반도체','TC 본더',5),
('semiconductor','삼성전자','심텍','HBM 기판',4),
('semiconductor','삼성전자','이오테크닉스','레이저 장비',4),
('semiconductor','SK하이닉스','원익IPS','ALD 증착장비',4),
('semiconductor','SK하이닉스','주성엔지니어링','PECVD 장비',4),
('semiconductor','SK하이닉스','HPSP','고압수소어닐링',5),
('semiconductor','SK하이닉스','솔브레인','식각액/세정액',4),
('semiconductor','SK하이닉스','후성','특수가스',3),
('semiconductor','SK하이닉스','디엔에프','전구체',4),
('semiconductor','SK하이닉스','한솔케미칼','전구체',3),
('semiconductor','SK하이닉스','원익머트리얼즈','특수가스',3),
('semiconductor','SK하이닉스','SFA반도체','OSAT',3),
('semiconductor','SK하이닉스','테크윙','테스트핸들러',3),
('semiconductor','에이디테크놀로지','삼성전자','ASIC 설계 → 파운드리',3),
('semiconductor','퀄리타스반도체','삼성전자','HBM PHY IP',4),
('semiconductor','퀄리타스반도체','SK하이닉스','HBM PHY IP',4),
('semiconductor','네패스','삼성전자','팬아웃WLP',3),
('semiconductor','네패스아크','삼성전자','선단 패키징',3);
