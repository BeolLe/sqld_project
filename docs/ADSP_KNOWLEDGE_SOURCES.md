# ADsP 지식 보강 출처 — 2026-11-01

이 문서는 8개 기존 세부항목 안의 보강 근거를 기록한다. 출처는 담당 작성자가 2026-11-01 열람했으며, 통합 QA는 SQL 공동 개발자·Google 원 논문 연도·GNMT 전환 시점을 별도로 교차 확인했다. 원 논문의 다른 기관 보관본은 아래에 표시했다. 공식 문서라도 특정 제품의 특징을 모든 제품의 보편 법칙으로 확대하지 않는다. 예시 문장은 새로 작성했으며 시험 문제·보기·비공식 정답키를 근거로 인용하지 않는다.

## 1–4단원

- **1단원 메타데이터·데이터 사전:** [Oracle Database Concepts](https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-dictionary-and-dynamic-performance-views.html). 항목 정의·형식·제약 등의 정보를 구별한다. 풍향은 기록 방식에 따라 각도/범주가 될 수 있다. [기상청 풍향 자료 설명](https://data.kma.go.kr/data/weatherResourceMap/selectWeatherResourceMapWdpw.do?pgmNo=107), [기상청 API 안내](https://apihub.kma.go.kr/apiList.do).
- **2단원 SQL 개발자와 역할:** [IBM 관계형 데이터베이스 역사](https://www.ibm.com/history/relational-database), [IBM Redbook 역사 설명](https://www.redbooks.ibm.com/redbooks/pdfs/sg246393.pdf). Donald Chamberlin·Raymond Boyce의 SQL/SEQUEL 계보를 설명하며 Codd의 관계형 모형과 구별한다.
- **2단원 객체지향 DB:** [ObjectDB 특징](https://www.objectdb.com/database/features), [ObjectDB 엔터티 타입](https://www.objectdb.com/java/jpa/entity/types). 정체성·속성·메서드·상속·사용자 정의 타입의 의미를 설명한다. 상속은 계층형 DB의 부모–자식 저장 구조와 동일하지 않으며 질의 성능 우위를 보장하지 않는다.
- **2단원 제품의 대표 모델:** [MySQL](https://dev.mysql.com/doc/refman/8.4/en/what-is-mysql.html), [MongoDB](https://www.mongodb.com/docs/manual/), [HBase](https://hbase.apache.org/docs/datamodel/), [Redis](https://redis.io/nosql/key-value-databases/), [Cassandra](https://cassandra.apache.org/_/index.html). 대표 저장 모델의 대비이지 제품 기능의 배타적 분류가 아니다.
- **3단원 데이터 레이크:** [AWS 설명](https://aws.amazon.com/what-is/data-lake/). 원자료와 여러 형식의 저장, 읽을 때의 구조 적용 경향, 거버넌스 필요성을 설명한다. DW에는 정형 자료만 들어간다는 절대 규칙을 만들지 않는다.
- **3단원 BI·BA:** [IBM BI](https://www.ibm.com/think/topics/business-intelligence), [IBM BA](https://www.ibm.com/think/topics/business-analytics). 보고·현황 이해와 통계적 분석의 강조점은 다르지만 실제 업무와 제품은 중첩된다.
- **3단원 공공·조직 시스템:** [교육정보원 NEIS](https://www.goeia.go.kr/goeia/cm/cntnts/cntntsView.do?cntntsId=4008&mi=20056), [ITS 국가 안내](https://intl.its.go.kr/korea-its/system/its), [사회보장정보원 보건 시스템](https://www.ssis.or.kr/lay1/S1T751C769/contents.do), [IBM 지식관리](https://www.ibm.com/think/topics/knowledge-management). NEIS·ITS·KMS는 목적과 함께 설명한다. 불명확한 ‘KMD’의 확장명은 만들지 않는다.
- **3단원 RTE:** [IBM 2007 실시간 미들웨어 워크숍](https://research.ibm.com/haifa/Workshops/rt2007/papers/RT_Middleware07_Abstracts.pdf). 업무 정보 전달과 실행의 지연 감소를 설명하며 물리적인 지연 0을 보장하지 않는다.
- **4단원 3V의 역사:** Doug Laney, META Group, _3D Data Management: Controlling Data Volume, Velocity, and Variety_, 2001-02-06 [원 보고서 보관본](https://diegonogare.net/wp-content/uploads/2020/08/3D-Data-Management-Controlling-Data-Volume-Velocity-and-Variety.pdf). 원 저자/기관 사이트가 아닌 재게시 PDF다. 3V 계보를 설명할 뿐 ‘빅데이터’라는 단어를 최초 발명했다고 주장하지 않는다.
- **4단원 분산 처리 계보:** [Google File System 원 논문, 2003](https://research.google/pubs/the-google-file-system/), [Google MapReduce 원 논문, 2004](https://research.google/pubs/mapreduce-simplified-data-processing-on-large-clusters/), [Apache Hadoop 공식 소개](https://hadoop.apache.org/), [Google의 Hadoop 역사 설명](https://cloud.google.com/learn/what-is-hadoop). Hadoop은 Google 소유 제품도 빅데이터의 필수조건도 아니다.

- **4단원 Human Genome Project:** [NHGRI 공식 개요](https://www.genome.gov/human-genome-project). 1990년 시작·2003년 완료된 인간 게놈 프로젝트를 대규모 생명과학 자료의 역사적 사례로 설명한다. 빅데이터의 단일 원인 또는 정형 데이터 배제 근거로 사용하지 않는다.

## 5–8단원

5단원은 기존 가치·재사용·편익 구분을 유지했다. 추가된 기업 사례와 기술은 6–8단원의 기존 범위에 둔다.

- **6단원 Netflix:** Bennett·Lanning(Netflix), _The Netflix Prize_, KDD Cup Workshop 2007, p.1 [원 논문 보관본](https://scispace.com/pdf/the-netflix-prize-2xr5gnsvfw.pdf). 2006년 경진대회와 당시 Cinematch 영화 추천을 설명한다. 현재 서비스 구성으로 단정하지 않는다.
- **6단원 Google 번역:** [Google Research, 2006-04-28](https://research.google/blog/statistical-machine-translation-live/), [Google Research, 2016-09-27](https://research.google/blog/a-neural-network-for-machine-translation-at-production-scale/). 말뭉치 기반 통계학습의 과거 사례와 중국어→영어 GNMT 적용 시점을 분리한다. 모든 시대에 같은 방식이라는 암기는 금한다.
- **6단원 WalmartLabs:** [Walmart 발행 보도자료, 2012-08-30](https://www.prnewswire.com/news-releases/walmart-announces-new-search-engine-to-power-walmartcom-167991966.html). 발행 주체가 Walmart인 1차 발표이며 Polaris의 검색 의도·관련 상품 연결을 설명한다. 성과 수치를 일반화하지 않는다.
- **6단원 Zara·Inditex:** [Inditex Annual Report 2015](https://static.inditex.com/annual_report_2015/en/our-priorities/innovation-in-customer-services.php). 고객 요구 분석, RFID 재고 확인·보충을 설명한다. 현재 운영 현황이나 미확인 일일 처리 주기는 주장하지 않는다.
- **6단원 딥러닝:** LeCun·Bengio·Hinton, _Deep Learning_, Nature 2015 [저자 보관 원문](https://www.cs.utoronto.ca/~hinton/absps/NatureDeepReview.pdf). 여러 처리 층을 통한 표현 학습의 개념을 사용한다.
- **6단원 핀테크:** [FSB 보고서 소개, 2019-02](https://www.fsb.org/2019/02/fsb-report-assesses-fintech-developments-and-potential-financial-stability-implications/), [ECB 핀테크 설명](https://www.bankingsupervision.europa.eu/about/banking-supervision-explained/html/fintech.ga.html). 결제·신용평가·투자 등 여러 활용을 구별한다. 자체 작성한 신용 위험 예시는 특정 회사 사례가 아니며 ‘가장 중요한 분야’ 순위를 주장하지 않는다.
- **7단원 비식별 기술:** 개인정보보호위원회 _가명정보 처리 가이드라인_, 2024.2, 부록 1 인쇄면 pp.85–87. [공식 게시물](https://pipc.go.kr/np/cop/bbs/selectBoardArticle.do?bbsId=BS074&mCode=C020010000&nttId=9899), [정부기관 보관 PDF](<https://data.gangwon.kr/images/pdf/가명정보_처리_가이드라인(2024_2_개정).pdf>). 총계처리·삭제·마스킹·일반화·토큰화의 기술적 대비에 사용했다. 최신 법적 처리 허가의 판정 자료로 사용하지 않는다. 가명정보는 개인정보이며 한 기법 적용만으로 익명성이 보장되지 않는다.
- **8단원 IoT·M2M:** [IETF IoT 설명](https://www.ietf.org/technologies/iot/), [ITU Y.2060, 2012](https://www.itu.int/rec/T-REC-Y.2060-201206-I/en), [ITU M2M 기술 보고서, 2017](https://www.itu.int/dms_pub/itu-t/opb/tut/T-TUT-IOT-2017-M2M6-PDF-E.pdf). 사물의 연결·정보 교환과 기계 간 통신의 강조점을 구분한다. Y.2060은 현재 Y.4000 번호로 안내된다.
- **8단원 데이터화:** Cukier·Mayer-Schoenberger, _The Rise of Big Data_, Foreign Affairs, May/June 2013 [Brown 보관 원문](https://cs.brown.edu/courses/cs100/lectures/readings/riseOfBigData.pdf). 현상을 기록·분석 가능한 데이터로 만드는 개념을 설명한다. IoT만이 데이터화의 수단이라는 배타 규칙이나 용어 최초 창시 주장은 없다.

## 커버리지와 미확정 경계

기존 학습 범위에서 빠진 이름·정의·대비를 보강했다. 출처나 해석이 모호한 부분은 정답키를 강제로 사실화하지 않고, 표현·범주·인과·비용·식별 위험 등 해석 경계를 명확히 하는 방식으로 다룬다. 이것은 문항별 정답 확정이나 시험 정확도 보장이 아니다.

특히 DB의 중복 0, 핀테크의 보편적 최상위 분야, 풍향/수요예측의 고정 형식, DIKW 사례의 절대 경계, 서로 배타적인 분석 기법, 언제나 더 싼 클라우드, 비식별 처리 즉시 익명정보라는 주장을 넣지 않는다. 본문상의 개념 표지 검사는 학습 범위의 회귀 검사이지 교육 내용 전체의 진실성 또는 미공개 시험 정확도의 자동 증명은 아니다.
