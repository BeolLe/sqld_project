-- ADsP 모의고사·무한풀이 콘텐츠 시드
-- 생성: frontend/scripts/generate-adsp-seed.mjs (직접 수정하지 말고 스크립트를 다시 실행)
--
-- 모의고사: exam.exams.exam_code = adsp_mock_N, 프론트 id = adsp-N
--   5회 × 50문항 (1과목 1~10 · 2과목 11~20 · 3과목 21~50), 과목별 과락 기준 40%
-- 무한풀이: endless.problems.source_problem_id = adsp_endless_N, 78문항, 카테고리 8개
--
-- 같은 키가 이미 있으면 건너뛰므로 여러 번 실행해도 중복되지 않는다.
-- 실행 전 확인: 실제 DDL 에서 NOT NULL 컬럼(question_version, topic_category_id 등)과
--   correct_answer 타입(모의고사는 text, 무한풀이는 정수로 가정)을 확인한다.
--
-- 백엔드 반영 필요: content/router.py 는 exam_code 를 sqld_mock_ 으로 고정하고 있다.
--   exam_type=adsp 요청이면 adsp_mock_ 접두어를 쓰고, id 는 adsp-N 으로 내려주도록 바꿔야 한다.

BEGIN;

-- ===== ADsP 모의고사 1회 (adsp_mock_1) =====
INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)
SELECT 'adsp_mock_1', 'ADsP 모의고사 1회', 50, 10, 5400, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = 'adsp_mock_1');

INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 이해', 40, 1 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 1);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석 기획', 40, 2 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 2);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석', 40, 3 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 3);

INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 1, 1, s.id, 'multiple_choice', 'DIKW 피라미드에서 데이터를 가공·처리하여 데이터 간의 연관 관계 속에서 의미가 도출된 것은?', '{"source_id":"adsp_exam1_p1","category":"데이터의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["정보(Information)","지식(Knowledge)","지혜(Wisdom)","데이터(Data)"]'::jsonb, 'easy', 1, TRUE, '1. DIKW 피라미드', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 1);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '데이터를 가공·처리해 연관 관계와 의미를 도출한 것이 정보다. 지식은 정보를 구조화해 고유의 지식으로 내재화한 것, 지혜는 지식을 바탕으로 한 창의적 아이디어다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 1 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 2, 1, s.id, 'multiple_choice', '다음 중 정성 데이터(qualitative data)에 해당하는 것은?', '{"source_id":"adsp_exam1_p2","category":"데이터의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["기온","매출액","고객 설문의 서술형 응답","방문자 수"]'::jsonb, 'easy', 1, TRUE, '2. 정량 데이터와 정성 데이터', 80
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 2);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '정성 데이터는 언어·문자 등으로 기술되어 형태와 형식이 정해져 있지 않은 데이터다. 기온, 매출액, 방문자 수는 수치로 표현되는 정량 데이터다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 2 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 3, 1, s.id, 'multiple_choice', '다음 중 데이터베이스의 일반적인 특징으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p3","category":"데이터의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["공용 데이터(shared data)","고정된 데이터(fixed data)","통합된 데이터(integrated data)","저장된 데이터(stored data)"]'::jsonb, 'easy', 1, TRUE, '3. 데이터베이스의 특징', 76
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 3);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터베이스는 통합된 데이터, 저장된 데이터, 공용 데이터, 변화되는 데이터라는 특징을 가진다. 데이터는 새로운 데이터의 추가, 기존 데이터의 삭제·갱신으로 항상 변화한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 3 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 4, 1, s.id, 'multiple_choice', '데이터 웨어하우스(DW)의 특징으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p4","category":"데이터의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["주제 지향적(subject-oriented)","통합적(integrated)","시계열적(time-variant)","휘발성(volatile)"]'::jsonb, 'medium', 1, TRUE, '4. 데이터 웨어하우스의 특징', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 4);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'DW는 주제 지향성, 통합성, 시계열성, 비휘발성을 특징으로 한다. 적재된 데이터는 읽기 위주로 사용되며 갱신·삭제가 거의 일어나지 않는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 4 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 5, 1, s.id, 'multiple_choice', '빅데이터의 특징을 나타내는 3V에 해당하지 않는 것은?', '{"source_id":"adsp_exam1_p5","category":"데이터의 가치와 미래","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["Visualization","Volume","Variety","Velocity"]'::jsonb, 'easy', 1, TRUE, '5. 빅데이터의 3V', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 5);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '3V는 규모(Volume), 다양성(Variety), 속도(Velocity)다. 여기에 가치(Value)나 정확성(Veracity)을 더해 4V·5V로 확장하기도 한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 5 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 6, 2, s.id, 'multiple_choice', '빅데이터를 "산업혁명의 석탄·철"에 비유하는 이유로 가장 적절한 것은?', '{"source_id":"adsp_exam1_p6","category":"데이터의 가치와 미래","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["데이터를 분석하면 미래를 정확히 예측할 수 있기 때문이다","데이터가 특정 산업에만 쓰이기 때문이다","데이터가 고갈되는 자원이기 때문이다","서비스, 통신, 제조 등 사회 전반에 혁명적 변화를 가져올 것으로 기대되기 때문이다"]'::jsonb, 'easy', 1, TRUE, '6. 빅데이터에 대한 비유', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 6);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '석탄과 철이 산업혁명의 핵심 재료였듯 빅데이터도 사회·경제 전반에 혁명적 변화를 가져올 것이라는 의미다. 원유 비유는 산업 생산성 향상, 렌즈 비유는 산업 발전에 대한 영향, 플랫폼 비유는 공동 활용 기반을 뜻한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 6 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 7, 2, s.id, 'multiple_choice', '"맥주를 사는 사람은 땅콩도 함께 산다"처럼 변인 간의 관계를 찾아내는 빅데이터 활용 기본 테크닉은?', '{"source_id":"adsp_exam1_p7","category":"데이터의 가치와 미래","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["감정 분석","연관규칙 학습","유형 분석","유전 알고리즘"]'::jsonb, 'medium', 1, TRUE, '7. 빅데이터 활용 기본 테크닉', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 7);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '연관규칙 학습은 어떤 변인 간에 주목할 만한 상관관계가 있는지 찾는 방법이다. 유형 분석은 문서 분류·집단 구분, 유전 알고리즘은 최적화, 감정 분석은 문장의 긍정·부정을 판단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 7 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 8, 2, s.id, 'multiple_choice', '빅데이터 시대의 위기 요인 중 "사생활 침해"에 대한 통제 방안으로 가장 적절한 것은?', '{"source_id":"adsp_exam1_p8","category":"데이터의 가치와 미래","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["데이터 수집의 전면 금지","결과 기반 책임 원칙 고수","개인정보 제공자의 동의제에서 사용자의 책임제로 전환","알고리즈미스트 양성"]'::jsonb, 'medium', 1, TRUE, '8. 빅데이터 위기 요인과 통제', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 8);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '사생활 침해는 개인정보 사용 주체가 책임지는 책임제로 전환해 통제한다. 결과 기반 책임 원칙은 책임 원칙 훼손, 알고리즈미스트는 데이터 오용에 대한 대응이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 8 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 9, 2, s.id, 'multiple_choice', '데이터 사이언스의 구성 영역으로 보기 어려운 것은?', '{"source_id":"adsp_exam1_p9","category":"데이터 사이언스와 전략 인사이트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["하드웨어 제조","Analytics","IT(Data Management)","비즈니스 분석"]'::jsonb, 'easy', 1, TRUE, '9. 데이터 사이언스의 구성 요소', 74
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 9);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '데이터 사이언스는 분석적 영역(Analytics), IT 영역(Data Management), 비즈니스 분석 영역으로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 9 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 10, 2, s.id, 'multiple_choice', '데이터 사이언티스트에게 요구되는 소프트 스킬(soft skill)에 해당하는 것은?', '{"source_id":"adsp_exam1_p10","category":"데이터 사이언스와 전략 인사이트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["분석 기술의 숙련도","설득력 있는 전달(스토리텔링, 시각화)","최적의 분석 설계 노하우","빅데이터 관련 이론적 지식"]'::jsonb, 'medium', 1, TRUE, '10. 데이터 사이언티스트의 역량', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 10);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '소프트 스킬은 통찰력 있는 분석(창의적 사고, 호기심), 설득력 있는 전달(스토리텔링, 비주얼라이제이션), 다분야 간 협력(커뮤니케이션)이다. 나머지는 하드 스킬이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 10 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 11, 3, s.id, 'multiple_choice', '분석의 대상(What)은 알고 있으나 분석의 방법(How)을 모르는 경우의 분석 주제 유형은?', '{"source_id":"adsp_exam1_p11","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["발견(Discovery)","최적화(Optimization)","솔루션(Solution)","통찰(Insight)"]'::jsonb, 'easy', 1, TRUE, '11. 분석 주제 유형', 77
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 11);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '대상과 방법을 모두 알면 최적화, 대상만 알면 솔루션, 방법만 알면 통찰, 둘 다 모르면 발견이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 11 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 12, 3, s.id, 'multiple_choice', '분석 기획 시 고려해야 할 사항으로 거리가 먼 것은?', '{"source_id":"adsp_exam1_p12","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["가용한 데이터에 대한 고려","적절한 유스케이스 탐색","분석 수행 시 발생할 수 있는 장애 요소에 대한 사전 계획","분석 담당자의 개인 선호 도구 우선 적용"]'::jsonb, 'easy', 1, TRUE, '12. 분석 기획 시 고려사항', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 12);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '분석 기획 시에는 가용 데이터, 유사 유스케이스, 장애 요소(비용, 보안, 변화 관리 등)를 고려해야 한다. 개인 선호 도구는 고려 대상이 아니다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 12 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 13, 3, s.id, 'multiple_choice', 'KDD(Knowledge Discovery in Databases) 분석 절차를 순서대로 나열한 것은?', '{"source_id":"adsp_exam1_p13","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["데이터셋 선택 → 데이터 전처리 → 데이터 변환 → 데이터 마이닝 → 결과 평가","데이터 전처리 → 데이터셋 선택 → 데이터 마이닝 → 데이터 변환 → 결과 평가","데이터셋 선택 → 데이터 변환 → 데이터 전처리 → 데이터 마이닝 → 결과 평가","데이터 마이닝 → 데이터셋 선택 → 데이터 전처리 → 데이터 변환 → 결과 평가"]'::jsonb, 'easy', 1, TRUE, '13. KDD 분석 절차', 80
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 13);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'KDD는 데이터셋 선택 → 데이터 전처리 → 데이터 변환 → 데이터 마이닝 → 데이터 마이닝 결과 평가의 5단계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 13 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 14, 3, s.id, 'multiple_choice', 'CRISP-DM 프로세스의 6단계에 해당하지 않는 것은?', '{"source_id":"adsp_exam1_p14","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["데이터 준비(Data Preparation)","모델링(Modeling)","시스템 구현(System Implementation)","업무 이해(Business Understanding)"]'::jsonb, 'medium', 1, TRUE, '14. CRISP-DM 프로세스', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 14);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'CRISP-DM은 업무 이해 → 데이터 이해 → 데이터 준비 → 모델링 → 평가 → 전개의 6단계다. 시스템 구현은 빅데이터 분석 방법론의 단계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 14 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 15, 3, s.id, 'multiple_choice', '하향식 접근법(Top Down Approach)의 과제 발굴 절차로 옳은 것은?', '{"source_id":"adsp_exam1_p15","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["문제 탐색 → 해결방안 탐색 → 문제 정의 → 타당성 검토","문제 탐색 → 문제 정의 → 해결방안 탐색 → 타당성 검토","문제 정의 → 문제 탐색 → 타당성 검토 → 해결방안 탐색","해결방안 탐색 → 문제 탐색 → 문제 정의 → 타당성 검토"]'::jsonb, 'medium', 1, TRUE, '15. 하향식 접근법', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 15);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '하향식 접근법은 문제 탐색(Problem Discovery) → 문제 정의(Problem Definition) → 해결방안 탐색(Solution Search) → 타당성 검토(Feasibility Study) 순서로 진행한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 15 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 16, 4, s.id, 'multiple_choice', '상향식 접근법(Bottom Up Approach)에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p16","category":"데이터 분석 기획의 이해","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["문제의 정의 자체가 어려운 경우에 데이터를 기반으로 문제를 재정의한다","비지도 학습 방법이 주로 사용된다","디자인 사고의 발산(Diverge) 단계에 가깝다","분석 대상과 방법이 명확할 때 주로 사용한다"]'::jsonb, 'easy', 1, TRUE, '16. 상향식 접근법', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 16);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '상향식 접근법은 문제 정의가 어려울 때 데이터를 관찰하며 인사이트를 찾는 방식이다. 대상과 방법이 명확하면 하향식 접근법이 적합하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 16 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 17, 4, s.id, 'multiple_choice', '분석 과제의 우선순위를 시급성과 난이도로 평가할 때, 가장 먼저 추진해야 하는 과제는?', '{"source_id":"adsp_exam1_p17","category":"분석 마스터 플랜","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["시급성이 높고 난이도가 쉬운 과제","시급성이 높고 난이도가 어려운 과제","시급성이 낮고 난이도가 쉬운 과제","시급성이 낮고 난이도가 어려운 과제"]'::jsonb, 'easy', 1, TRUE, '17. 분석 과제 우선순위 평가 기준', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 17);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '현재 시급하고 난이도가 쉬운 과제(3사분면)가 우선순위가 가장 높다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 17 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 18, 4, s.id, 'multiple_choice', '분석 마스터 플랜 수립 시 우선순위 결정에 고려하는 요소가 아닌 것은?', '{"source_id":"adsp_exam1_p18","category":"분석 마스터 플랜","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["전략적 중요도","비즈니스 성과 및 ROI","실행 용이성","분석 담당자의 경력 연차"]'::jsonb, 'medium', 1, TRUE, '18. 마스터 플랜 수립 시 우선순위 고려요소', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 18);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '우선순위는 전략적 중요도, 비즈니스 성과·ROI, 실행 용이성을 기준으로 정한다. 적용 범위·방식은 업무 내재화 수준, 분석 데이터 적용 수준, 기술 적용 수준으로 정한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 18 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 19, 4, s.id, 'multiple_choice', '분석 거버넌스 체계의 구성요소가 아닌 것은?', '{"source_id":"adsp_exam1_p19","category":"분석 마스터 플랜","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["System(분석 관련 시스템)","Marketing(마케팅 전략)","Organization(조직)","Process(과제 기획·운영 프로세스)"]'::jsonb, 'easy', 1, TRUE, '19. 분석 거버넌스 체계 구성요소', 78
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 19);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '분석 거버넌스 체계는 조직, 과제 기획·운영 프로세스, 분석 관련 시스템, 데이터, 분석 교육·마인드 육성 체계로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 19 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 20, 4, s.id, 'multiple_choice', '분석 성숙도 모델의 단계를 낮은 단계부터 순서대로 나열한 것은?', '{"source_id":"adsp_exam1_p20","category":"분석 마스터 플랜","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["도입 → 확산 → 활용 → 최적화","준비 → 도입 → 활용 → 확산","도입 → 활용 → 확산 → 최적화","활용 → 도입 → 최적화 → 확산"]'::jsonb, 'medium', 1, TRUE, '20. 분석 성숙도 단계', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 20);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 성숙도는 도입 → 활용 → 확산 → 최적화 단계로 발전하며, 비즈니스·조직 및 역량·IT 부문별로 평가한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 20 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 21, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
x <- c(2, 4, 6, 8)
x[2:3]
```', '{"source_id":"adsp_exam1_p21","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["4 6","6 8","2 4 6","2 4"]'::jsonb, 'easy', 1, TRUE, '21. R 벡터 생성', 81
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 21);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'R의 인덱스는 1부터 시작한다. x[2:3]은 두 번째와 세 번째 원소인 4와 6을 반환한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 21 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 22, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
x <- c(1, 2, NA, 4)
mean(x, na.rm = TRUE)
```', '{"source_id":"adsp_exam1_p22","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["1.75","2.333333","7","NA"]'::jsonb, 'easy', 1, TRUE, '22. R 결측값 처리', 77
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 22);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'na.rm = TRUE 이면 결측값을 제외하고 계산한다. (1 + 2 + 4) / 3 = 2.333333 이다. 옵션이 없으면 NA가 반환된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 22 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 23, 5, s.id, 'multiple_choice', 'R의 데이터 구조 중 서로 다른 타입의 열을 가질 수 있는 2차원 구조는?', '{"source_id":"adsp_exam1_p23","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["vector","matrix","data.frame","array"]'::jsonb, 'easy', 1, TRUE, '23. R 데이터 구조', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 23);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'data.frame은 열마다 다른 데이터 타입을 가질 수 있는 2차원 구조다. vector와 matrix, array는 한 가지 타입만 담을 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 23 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 24, 5, s.id, 'multiple_choice', '결측값 처리 방법 중 결측값을 그 변수의 관측값 평균으로 바꾸는 방법의 단점으로 옳은 것은?', '{"source_id":"adsp_exam1_p24","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["계산이 매우 복잡하다","항상 편향된 평균을 만든다","자료의 수가 줄어든다","추정량의 표준오차가 과소 추정된다"]'::jsonb, 'medium', 1, TRUE, '24. 결측값 대치법', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 24);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '평균 대치법은 같은 값이 여러 번 들어가므로 분산이 작아져 표준오차가 과소 추정된다. 자료 수가 줄어드는 것은 완전 응답 개체 분석의 단점이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 24 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 25, 5, s.id, 'multiple_choice', '사분위수를 이용해 이상값을 판단할 때, 이상값으로 보는 기준은? (IQR = Q3 - Q1)', '{"source_id":"adsp_exam1_p25","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["Q1 - 1.5 × IQR 보다 작거나 Q3 + 1.5 × IQR 보다 큰 값","Q1 - 0.5 × IQR 보다 작거나 Q3 + 0.5 × IQR 보다 큰 값","평균 ± 1 표준편차를 벗어난 값","중앙값과 다른 모든 값"]'::jsonb, 'medium', 1, TRUE, '25. 이상값 판단 기준', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 25);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '상자 그림에서는 Q1 - 1.5×IQR보다 작거나 Q3 + 1.5×IQR보다 큰 값을 이상값으로 본다. 평균 ± 3 표준편차(ESD)를 기준으로 하는 방법도 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 25 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 26, 6, s.id, 'multiple_choice', '데이터 마트(Data Mart)에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam1_p26","category":"R기초와 데이터 마트","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["비정형 데이터만 저장하는 저장소다","전사의 모든 데이터를 통합한 저장소다","특정 부서나 주제 영역의 사용자를 위해 DW에서 일부 데이터를 추출해 구성한 저장소다","실시간 거래 처리를 위한 운영 DB다"]'::jsonb, 'easy', 1, TRUE, '26. 데이터 마트', 83
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 26);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '데이터 마트는 DW의 일부로 특정 사용자가 관심 있는 데이터를 담은 작은 규모의 DW다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 26 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 27, 6, s.id, 'multiple_choice', '모집단을 여러 개의 서로 겹치지 않는 계층으로 나누고, 각 계층에서 랜덤하게 표본을 추출하는 방법은?', '{"source_id":"adsp_exam1_p27","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["집락추출법","층화추출법","단순랜덤 추출법","계통추출법"]'::jsonb, 'easy', 1, TRUE, '27. 표본추출 방법', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 27);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '층화추출법은 이질적인 모집단을 동질적인 계층으로 나눈 뒤 각 계층에서 표본을 뽑는다. 집락추출법은 집락 자체를 랜덤하게 선택한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 27 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 28, 6, s.id, 'multiple_choice', '온도(섭씨)처럼 측정값 사이의 간격이 의미가 있지만 절대 영점이 없는 척도는?', '{"source_id":"adsp_exam1_p28","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["비율척도","명목척도","순서척도","구간척도"]'::jsonb, 'easy', 1, TRUE, '28. 척도의 종류', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 28);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '구간척도는 속성의 양을 측정하며 간격이 의미가 있지만 절대 영점이 없다. 무게·나이처럼 절대 영점이 있으면 비율척도다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 28 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 29, 6, s.id, 'multiple_choice', '자료 1, 2, 2, 3, 100 의 중앙값은?', '{"source_id":"adsp_exam1_p29","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["2","3","21.6","100"]'::jsonb, 'easy', 1, TRUE, '29. 대표값', 82
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 29);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '크기순으로 나열했을 때 가운데 값인 2가 중앙값이다. 평균은 21.6으로 이상값 100의 영향을 크게 받는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 29 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 30, 6, s.id, 'multiple_choice', '일정한 시간이나 공간에서 어떤 사건이 발생하는 횟수를 나타내는 확률분포는?', '{"source_id":"adsp_exam1_p30","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["정규분포","지수분포","이항분포","포아송분포"]'::jsonb, 'medium', 1, TRUE, '30. 이산형 확률분포', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 30);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '포아송분포는 단위 시간·공간에서 사건이 발생하는 횟수의 분포다. 지수분포는 사건 사이의 대기 시간을 나타내는 연속형 분포다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 30 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 31, 7, s.id, 'multiple_choice', '귀무가설이 참인데 귀무가설을 기각하는 오류는?', '{"source_id":"adsp_exam1_p31","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["측정오차","제1종 오류","제2종 오류","표본오차"]'::jsonb, 'easy', 1, TRUE, '31. 가설검정의 오류', 74
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 31);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '귀무가설이 참인데 기각하는 것은 제1종 오류(α), 귀무가설이 거짓인데 채택하는 것은 제2종 오류(β)다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 31 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 32, 7, s.id, 'multiple_choice', '유의수준 0.05에서 검정한 결과 p-value가 0.012로 나왔다. 해석으로 옳은 것은?', '{"source_id":"adsp_exam1_p32","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["대립가설을 기각한다","검정을 다시 해야 한다","귀무가설을 기각한다","귀무가설을 채택한다"]'::jsonb, 'medium', 1, TRUE, '32. p-value의 해석', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 32);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'p-value가 유의수준보다 작으므로 귀무가설을 기각한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 32 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 33, 7, s.id, 'multiple_choice', '신뢰수준 95%의 신뢰구간에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam1_p33","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["같은 방법으로 구간을 100번 만들면 그중 약 95번은 모수를 포함한다","표본의 95%가 신뢰구간 안에 있다","신뢰수준을 높이면 구간의 폭이 좁아진다","모수가 신뢰구간에 포함될 확률이 정확히 95%이다"]'::jsonb, 'medium', 1, TRUE, '33. 구간추정', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 33);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '95% 신뢰구간은 같은 방법으로 반복 추정할 때 약 95%의 구간이 모수를 포함한다는 뜻이다. 신뢰수준을 높이면 구간 폭은 넓어진다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 33 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 34, 7, s.id, 'multiple_choice', '피어슨 상관계수에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p34","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["두 변수의 선형 관계의 강도와 방향을 나타낸다","0이면 두 변수 사이에 어떤 관계도 없다고 단정할 수 있다","연속형 변수에 사용한다","-1에서 1 사이의 값을 가진다"]'::jsonb, 'easy', 1, TRUE, '34. 상관계수', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 34);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '상관계수 0은 선형 관계가 없다는 뜻일 뿐 곡선 관계 같은 비선형 관계는 있을 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 34 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 35, 7, s.id, 'multiple_choice', '선형회귀분석의 기본 가정이 아닌 것은?', '{"source_id":"adsp_exam1_p35","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["독립성","등분산성","다중공선성","선형성"]'::jsonb, 'medium', 1, TRUE, '35. 회귀분석의 가정', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 35);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '회귀분석은 선형성, 독립성, 등분산성, 비상관성, 정상성(정규성)을 가정한다. 다중공선성은 독립변수 간 상관이 높은 문제로 가정이 아니라 피해야 할 현상이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 35 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 36, 8, s.id, 'multiple_choice', '다음은 R에서 단순선형회귀를 수행한 결과의 일부다. 해석으로 옳은 것은?

```r
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)  12.4100     2.1300   5.826  1.2e-06
x             0.6500     0.0910   7.143  2.5e-08

Multiple R-squared:  0.581,  Adjusted R-squared:  0.570
```', '{"source_id":"adsp_exam1_p36","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["x의 회귀계수는 유의수준 0.05에서 유의하지 않다","절편의 표준오차는 0.091이다","x가 1 증가하면 y는 12.41 증가한다","결정계수는 0.581로 모형이 y 변동의 약 58.1%를 설명한다"]'::jsonb, 'medium', 1, TRUE, '36. 회귀분석 결과 해석', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 36);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'Multiple R-squared 0.581은 모형이 종속변수 변동의 58.1%를 설명한다는 뜻이다. x의 계수는 0.65이고 p-value가 매우 작아 유의하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 36 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 37, 8, s.id, 'multiple_choice', '주성분분석(PCA)의 주된 목적으로 옳은 것은?', '{"source_id":"adsp_exam1_p37","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["상관관계가 있는 변수들을 결합해 차원을 축소한다","개체를 비슷한 집단으로 묶는다","시간에 따른 추세를 예측한다","범주형 종속변수를 예측한다"]'::jsonb, 'easy', 1, TRUE, '37. 주성분분석의 목적', 83
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 37);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '주성분분석은 상관관계가 있는 여러 변수를 선형결합해 서로 상관이 없는 소수의 주성분으로 차원을 줄인다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 37 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 38, 8, s.id, 'multiple_choice', '정상성(stationarity)을 만족하는 시계열의 조건으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p38","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["분산이 시점에 의존하지 않는다","공분산은 시차에만 의존한다","시간이 지날수록 평균이 증가한다","평균이 일정하다"]'::jsonb, 'medium', 1, TRUE, '38. 시계열의 정상성', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 38);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '정상 시계열은 평균과 분산이 일정하고 공분산이 시차에만 의존한다. 평균이 증가하는 추세가 있으면 차분으로 정상화한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 38 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 39, 8, s.id, 'multiple_choice', '시계열 분해에서 고정된 주기(예: 요일, 월, 분기)에 따라 반복되는 변동 요인은?', '{"source_id":"adsp_exam1_p39","category":"통계분석","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["추세 요인","계절 요인","순환 요인","불규칙 요인"]'::jsonb, 'easy', 1, TRUE, '39. 시계열 분해 요인', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 39);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '계절 요인은 고정된 주기로 반복되는 변동이다. 순환 요인은 주기가 일정하지 않은 장기 변동이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 39 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 40, 8, s.id, 'multiple_choice', '다음 중 비지도학습(Unsupervised Learning)에 해당하는 기법은?', '{"source_id":"adsp_exam1_p40","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["서포트 벡터 머신","로지스틱 회귀분석","의사결정나무","K-평균 군집분석"]'::jsonb, 'easy', 1, TRUE, '40. 지도학습과 비지도학습', 82
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 40);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'K-평균 군집분석은 정답 레이블 없이 유사한 개체를 묶는 비지도학습이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 40 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 41, 9, s.id, 'multiple_choice', '모델이 학습 데이터에는 매우 잘 맞지만 새로운 데이터에서는 성능이 떨어지는 현상은?', '{"source_id":"adsp_exam1_p41","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["과대적합(overfitting)","다중공선성","정상성","과소적합(underfitting)"]'::jsonb, 'easy', 1, TRUE, '41. 과대적합', 78
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 41);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '과대적합은 모델이 학습 데이터의 잡음까지 학습해 일반화 성능이 떨어지는 현상이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 41 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 42, 9, s.id, 'multiple_choice', '로지스틱 회귀분석에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p42","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["종속변수가 범주형일 때 사용한다","오즈(odds)의 로그를 선형 함수로 모형화한다","예측값은 0과 1 사이의 확률로 해석할 수 있다","최소제곱법으로 회귀계수를 추정한다"]'::jsonb, 'medium', 1, TRUE, '42. 로지스틱 회귀분석', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 42);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '로지스틱 회귀의 계수는 최대우도추정법으로 추정한다. 최소제곱법은 선형회귀에서 사용한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 42 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 43, 9, s.id, 'multiple_choice', '목표변수가 이산형일 때 의사결정나무의 분리 기준으로 사용하지 않는 것은?', '{"source_id":"adsp_exam1_p43","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["카이제곱 통계량의 p-value","분산 감소량","지니 지수","엔트로피 지수"]'::jsonb, 'easy', 1, TRUE, '43. 의사결정나무의 분리 기준', 81
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 43);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '분산 감소량과 F 통계량의 p-value는 목표변수가 연속형일 때 사용하는 분리 기준이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 43 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 44, 9, s.id, 'multiple_choice', '부트스트랩 표본을 여러 개 만들어 각각 모델을 학습시키고 결과를 투표로 결합하는 앙상블 기법은?', '{"source_id":"adsp_exam1_p44","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["스태킹(Stacking)","가지치기(Pruning)","배깅(Bagging)","부스팅(Boosting)"]'::jsonb, 'medium', 1, TRUE, '44. 앙상블 기법', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 44);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '배깅은 부트스트랩 표본으로 여러 모델을 만들고 다수결(평균)로 결합한다. 부스팅은 잘못 분류된 개체에 가중치를 높여 순차적으로 학습한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 44 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 45, 9, s.id, 'multiple_choice', '다음 혼동행렬에서 정확도(Accuracy)는?

| 구분 | 예측 Positive | 예측 Negative |
| 실제 Positive | 30 | 10 |
| 실제 Negative | 20 | 40 |', '{"source_id":"adsp_exam1_p45","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["0.60","0.70","0.75","0.80"]'::jsonb, 'medium', 1, TRUE, '45. 혼동행렬 정확도', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 45);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '정확도 = (TP + TN) / 전체 = (30 + 40) / 100 = 0.70 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 45 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 46, 10, s.id, 'multiple_choice', 'ROC 곡선에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam1_p46","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["AUC가 1에 가까울수록 분류 성능이 좋다","AUC가 0.5면 완벽한 분류 모형이다","회귀모형의 성능 평가에만 쓰인다","가로축은 민감도, 세로축은 특이도다"]'::jsonb, 'easy', 1, TRUE, '46. ROC 곡선', 80
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 46);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'ROC 곡선은 가로축 FPR(1-특이도), 세로축 TPR(민감도)로 그린다. AUC가 1에 가까울수록 좋고 0.5면 랜덤 분류와 같다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 46 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 47, 10, s.id, 'multiple_choice', '계층적 군집분석의 결과를 나무 형태로 나타낸 그림은?', '{"source_id":"adsp_exam1_p47","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["상자 그림","산점도","덴드로그램","히스토그램"]'::jsonb, 'easy', 1, TRUE, '47. 계층적 군집분석', 76
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 47);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '덴드로그램은 군집이 병합되는 과정을 나무 구조로 보여준다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 47 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 48, 10, s.id, 'multiple_choice', 'K-평균 군집분석에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam1_p48","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["군집의 수 K를 미리 정해야 한다","초기 중심값 선택에 따라 결과가 달라질 수 있다","이상값에 민감하다","범주형 변수에 그대로 적용하기 좋다"]'::jsonb, 'medium', 1, TRUE, '48. K-평균 군집분석', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 48);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'K-평균은 평균과 거리를 계산하므로 연속형 변수에 적합하다. 범주형 변수에는 K-모드 같은 다른 방법을 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 48 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 49, 10, s.id, 'multiple_choice', '전체 거래 200건 중 A와 B를 함께 구매한 거래가 40건일 때, 규칙 A → B의 지지도는?', '{"source_id":"adsp_exam1_p49","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["0.1","0.2","0.4","0.5"]'::jsonb, 'easy', 1, TRUE, '49. 연관분석 지지도', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 49);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '지지도 = A와 B를 함께 포함한 거래 수 / 전체 거래 수 = 40 / 200 = 0.2 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 49 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 50, 10, s.id, 'multiple_choice', '연관규칙 A → B의 향상도(Lift)가 1이라는 것의 의미는?', '{"source_id":"adsp_exam1_p50","category":"정형 데이터 마이닝","points":2,"round":1,"avg_difficulty":"easy"}'::jsonb, '["A를 사면 반드시 B를 산다","A와 B는 양의 상관관계다","A와 B는 서로 독립이다","A와 B는 음의 상관관계다"]'::jsonb, 'medium', 1, TRUE, '50. 연관분석 향상도', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_1' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 50);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '향상도가 1이면 두 품목은 독립, 1보다 크면 양의 관계, 1보다 작으면 음의 관계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_1' AND x.question_no = 50 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);

-- ===== ADsP 모의고사 2회 (adsp_mock_2) =====
INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)
SELECT 'adsp_mock_2', 'ADsP 모의고사 2회', 50, 10, 5400, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = 'adsp_mock_2');

INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 이해', 40, 1 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 1);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석 기획', 40, 2 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 2);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석', 40, 3 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 3);

INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 1, 1, s.id, 'multiple_choice', '개인에게 체화되어 있어 겉으로 드러나지 않는 지식으로, 공유와 전달이 어려운 지식은?', '{"source_id":"adsp_exam2_p1","category":"데이터의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["암묵지","메타데이터","정량 데이터","형식지"]'::jsonb, 'easy', 1, TRUE, '1. 암묵지와 형식지', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 1);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '암묵지는 학습과 경험을 통해 개인에게 체화된 지식으로 외부에 표출되지 않는다. 형식지는 문서·매체로 표현되어 전달과 공유가 쉽다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 1 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 2, 1, s.id, 'multiple_choice', '노나카의 지식 전환 모델(SECI)에서 형식지를 개인의 지식으로 다시 체화하는 과정은?', '{"source_id":"adsp_exam2_p2","category":"데이터의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["표출화(Externalization)","연결화(Combination)","내면화(Internalization)","공통화(Socialization)"]'::jsonb, 'medium', 1, TRUE, '2. 지식 전환 과정', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 2);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '지식 전환은 공통화 → 표출화 → 연결화 → 내면화 순서로 순환한다. 내면화는 형식지를 다시 암묵지로 체화하는 단계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 2 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 3, 1, s.id, 'multiple_choice', '다차원 데이터를 대화식으로 분석해 의사결정에 활용하는 정보 처리 방식은?', '{"source_id":"adsp_exam2_p3","category":"데이터의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["OLTP","OLAP","ETL","CDC"]'::jsonb, 'easy', 1, TRUE, '3. OLTP와 OLAP', 76
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 3);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'OLAP(On-Line Analytical Processing)는 다차원 분석으로 의사결정을 지원한다. OLTP는 일상 거래 처리를 위한 방식이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 3 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 4, 1, s.id, 'multiple_choice', '고객 데이터를 통합·분석해 고객 관계를 관리하고 마케팅에 활용하는 시스템은?', '{"source_id":"adsp_exam2_p4","category":"데이터의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["KMS","ERP","SCM","CRM"]'::jsonb, 'easy', 1, TRUE, '4. 기업 내부 데이터베이스 솔루션', 83
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 4);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'CRM(Customer Relationship Management)은 고객 관계 관리 시스템이다. ERP는 전사 자원 관리, SCM은 공급망 관리, KMS는 지식 관리 시스템이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 4 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 5, 1, s.id, 'multiple_choice', '빅데이터 출현 배경으로 거리가 먼 것은?', '{"source_id":"adsp_exam2_p5","category":"데이터의 가치와 미래","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["데이터 저장 비용의 급격한 상승","디지털화의 급진전과 저장 기술의 발전","인터넷과 모바일 확산","클라우드 컴퓨팅 등 처리 기술의 발전"]'::jsonb, 'easy', 1, TRUE, '5. 빅데이터 출현 배경', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 5);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '저장 장치의 가격이 크게 낮아진 것이 빅데이터 출현 배경이다. 저장 비용 상승은 오히려 반대 요인이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 5 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 6, 2, s.id, 'multiple_choice', '빅데이터의 가치를 산정하기 어려운 이유로 옳지 않은 것은?', '{"source_id":"adsp_exam2_p6","category":"데이터의 가치와 미래","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["데이터 활용 방식이 재사용·재조합 등으로 다양해졌다","기존에 없던 새로운 가치를 창출한다","분석 기술이 빠르게 발전한다","데이터의 양이 줄어 측정이 불가능해졌다"]'::jsonb, 'medium', 1, TRUE, '6. 빅데이터 가치 산정의 어려움', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 6);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '가치 산정이 어려운 이유는 데이터 활용 방식의 다양화, 새로운 가치 창출, 분석 기술의 발전이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 6 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 7, 2, s.id, 'multiple_choice', '빅데이터 시대에 나타난 변화로 옳지 않은 것은?', '{"source_id":"adsp_exam2_p7","category":"데이터의 가치와 미래","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["양보다 질에서 질보다 양으로","상관관계보다 인과관계 중시로","사전 처리에서 사후 처리로","표본조사에서 전수조사로"]'::jsonb, 'easy', 1, TRUE, '7. 빅데이터가 만든 변화', 82
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 7);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '빅데이터 시대에는 인과관계보다 상관관계를 통한 패턴 발견이 중요해졌다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 7 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 8, 2, s.id, 'multiple_choice', '빅데이터 활용의 3요소로 옳은 것은?', '{"source_id":"adsp_exam2_p8","category":"데이터의 가치와 미래","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["하드웨어, 소프트웨어, 네트워크","조직, 프로세스, 시스템","데이터, 기술, 인력","자본, 노동, 토지"]'::jsonb, 'medium', 1, TRUE, '8. 미래 빅데이터의 구성요소', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 8);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '빅데이터 활용의 3요소는 자원(데이터), 기술(진화하는 알고리즘, 인공지능), 인력(데이터 사이언티스트, 알고리즈미스트)이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 8 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 9, 2, s.id, 'multiple_choice', '빅데이터 분석에서 "일차원적 분석"의 한계를 넘어서기 위해 필요한 것은?', '{"source_id":"adsp_exam2_p9","category":"데이터 사이언스와 전략 인사이트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["사업 성과를 견인하는 전략적 인사이트 도출","분석 도구의 최신 버전 도입","데이터 양의 단순한 확대","부서 단위의 업무 효율화에 집중"]'::jsonb, 'easy', 1, TRUE, '9. 전략적 인사이트', 74
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 9);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '일차원적 분석은 부서 단위의 업무 효율화에 머문다. 전략적 인사이트를 바탕으로 사업 성과와 연결해야 경쟁 우위를 얻는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 9 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 10, 2, s.id, 'multiple_choice', '데이터 사이언스에서 인문학적 사고가 중요해진 이유로 거리가 먼 것은?', '{"source_id":"adsp_exam2_p10","category":"데이터 사이언스와 전략 인사이트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["생산에서 시장 창조로의 경제·산업 논리 변화","정형 데이터만 분석 대상이 되었기 때문","단순 세계화에서 복잡한 세계화로의 변화","제품 생산에서 서비스로 비즈니스 중심 이동"]'::jsonb, 'medium', 1, TRUE, '10. 데이터 사이언스와 인문학', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 10);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '인문학 열풍은 복잡한 세계화, 서비스 중심 이동, 시장 창조로의 변화 때문이다. 분석 대상은 오히려 비정형 데이터로 넓어졌다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 10 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 11, 3, s.id, 'multiple_choice', '분석 방법론의 구성요소로 옳지 않은 것은?', '{"source_id":"adsp_exam2_p11","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["방법(Methods)","도구와 기법(Tools & Techniques)","분석 결과의 수익 배분","상세한 절차(Procedures)"]'::jsonb, 'easy', 1, TRUE, '11. 분석 방법론의 구성요소', 77
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 11);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 방법론은 상세한 절차, 방법, 도구와 기법, 템플릿과 산출물로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 11 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 12, 3, s.id, 'multiple_choice', '단계를 순차적으로 진행하며 이전 단계가 완료되어야 다음 단계로 넘어가는 방법론 모델은?', '{"source_id":"adsp_exam2_p12","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["나선형 모델","프로토타입 모델","애자일 모델","폭포수 모델"]'::jsonb, 'easy', 1, TRUE, '12. 방법론 모델', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 12);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '폭포수 모델은 단계를 순차적으로 진행하며 문제가 생기면 이전 단계로 돌아가는 피드백만 허용한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 12 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 13, 3, s.id, 'multiple_choice', '빅데이터 분석 방법론의 5단계를 순서대로 나열한 것은?', '{"source_id":"adsp_exam2_p13","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["분석 기획 → 데이터 준비 → 데이터 분석 → 시스템 구현 → 평가 및 전개","데이터 준비 → 분석 기획 → 데이터 분석 → 평가 및 전개 → 시스템 구현","분석 기획 → 데이터 분석 → 데이터 준비 → 시스템 구현 → 평가 및 전개","분석 기획 → 데이터 준비 → 시스템 구현 → 데이터 분석 → 평가 및 전개"]'::jsonb, 'medium', 1, TRUE, '13. 빅데이터 분석 방법론 단계', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 13);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '빅데이터 분석 방법론은 분석 기획 → 데이터 준비 → 데이터 분석 → 시스템 구현 → 평가 및 전개 단계로 진행한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 13 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 14, 3, s.id, 'multiple_choice', '분석 프로젝트의 위험 대응 계획에서 위험을 다른 주체에게 넘기는 대응 방법은?', '{"source_id":"adsp_exam2_p14","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["수용(Accept)","회피(Avoid)","전이(Transfer)","완화(Mitigate)"]'::jsonb, 'medium', 1, TRUE, '14. 위험 대응 방법', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 14);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '위험 대응은 회피, 전이, 완화, 수용 네 가지다. 전이는 보험이나 외주처럼 위험의 영향을 제3자에게 넘기는 방법이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 14 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 15, 3, s.id, 'multiple_choice', '하향식 접근법의 문제 탐색에서 비즈니스 모델 캔버스의 5가지 영역에 해당하지 않는 것은?', '{"source_id":"adsp_exam2_p15","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["고객(Customer)","경쟁사(Competitor)","업무(Operation)","제품(Product)"]'::jsonb, 'easy', 1, TRUE, '15. 비즈니스 모델 캔버스', 83
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 15);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '비즈니스 모델 캔버스 기반 문제 탐색은 업무, 제품, 고객, 규제와 감사, 지원 인프라 5개 영역으로 본다. 경쟁사는 분석 기회 확장 영역이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 15 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 16, 4, s.id, 'multiple_choice', '분석 과제를 관리할 때 고려해야 하는 5가지 주요 속성이 아닌 것은?', '{"source_id":"adsp_exam2_p16","category":"데이터 분석 기획의 이해","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["Data Size","Data Complexity","Speed","Data Ownership"]'::jsonb, 'medium', 1, TRUE, '16. 분석 과제 관리 속성', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 16);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '분석 과제의 5가지 주요 속성은 Data Size, Data Complexity, Speed, Analytic Complexity, Accuracy & Precision이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 16 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 17, 4, s.id, 'multiple_choice', '빅데이터의 4V를 ROI 관점에서 볼 때 비즈니스 효과(Return) 요소에 해당하는 것은?', '{"source_id":"adsp_exam2_p17","category":"분석 마스터 플랜","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["Value","Volume","Variety","Velocity"]'::jsonb, 'easy', 1, TRUE, '17. 3V와 ROI', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 17);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'Volume, Variety, Velocity는 투자비용(Investment) 요소, Value는 비즈니스 효과(Return) 요소다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 17 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 18, 4, s.id, 'multiple_choice', '별도의 독립적인 분석 전담 조직이 회사의 모든 분석 업무를 맡아 우선순위를 정해 수행하는 조직 구조는?', '{"source_id":"adsp_exam2_p18","category":"분석 마스터 플랜","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["기능 중심 조직 구조","분산형 조직 구조","매트릭스형 조직 구조","집중형 조직 구조"]'::jsonb, 'medium', 1, TRUE, '18. 분석 조직 구조', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 18);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '집중형 조직은 분석 전담 조직이 전사 분석을 담당한다. 기능 중심은 각 부서가 직접 분석, 분산형은 분석 인력을 현업 부서에 배치한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 18 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 19, 4, s.id, 'multiple_choice', '데이터 거버넌스의 구성요소로 옳은 것은?', '{"source_id":"adsp_exam2_p19","category":"분석 마스터 플랜","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["전략, 예산, 일정","원칙, 조직, 프로세스","자본, 인력, 기술","하드웨어, 소프트웨어, 데이터"]'::jsonb, 'easy', 1, TRUE, '19. 데이터 거버넌스 구성요소', 78
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 19);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터 거버넌스는 원칙(Principle), 조직(Organization), 프로세스(Process)로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 19 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 20, 4, s.id, 'multiple_choice', '분석 준비도는 낮지만 분석 성숙도는 높은 기업 유형은?', '{"source_id":"adsp_exam2_p20","category":"분석 마스터 플랜","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["확산형","준비형","정착형","도입형"]'::jsonb, 'medium', 1, TRUE, '20. 분석 준비도 사분면', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 20);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '정착형은 준비도가 낮지만 성숙도가 높아 내부에서 제한적으로 활용 중인 기업이다. 준비도와 성숙도가 모두 높으면 확산형, 모두 낮으면 준비형이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 20 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 21, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
seq(1, 10, by = 3)
```', '{"source_id":"adsp_exam2_p21","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["1 4 7 10","3 6 9","1 10 3","1 3 5 7 9"]'::jsonb, 'easy', 1, TRUE, '21. R seq 함수', 81
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 21);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'seq(from, to, by)는 from부터 by씩 증가하며 to를 넘지 않는 수열을 만든다. 1, 4, 7, 10이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 21 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 22, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
rep(c(1, 2), times = 2)
```', '{"source_id":"adsp_exam2_p22","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["1 1 2 2","1 2 1 2","2 2 1 1","1 2"]'::jsonb, 'easy', 1, TRUE, '22. R rep 함수', 77
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 22);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'times = 2는 벡터 전체를 2번 반복한다. each = 2를 쓰면 1 1 2 2가 된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 22 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 23, 5, s.id, 'multiple_choice', 'R에서 명목형(범주형) 변수를 표현하기 위해 수준(levels)을 가지는 데이터 타입은?', '{"source_id":"adsp_exam2_p23","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["character","numeric","factor","logical"]'::jsonb, 'medium', 1, TRUE, '23. R factor', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 23);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'factor는 범주형 변수를 표현하며 levels 속성으로 범주 목록을 가진다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 23 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 24, 5, s.id, 'multiple_choice', 'R에서 벡터 x의 각 원소가 결측값인지 TRUE/FALSE로 확인하는 함수는?', '{"source_id":"adsp_exam2_p24","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["na.omit(x)","complete(x)","null(x)","is.na(x)"]'::jsonb, 'easy', 1, TRUE, '24. R 결측값 확인', 80
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 24);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'is.na()는 각 원소가 NA인지 논리값으로 반환한다. na.omit()은 결측값이 있는 행을 제거한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 24 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 25, 5, s.id, 'multiple_choice', '다중대치법(Multiple Imputation)의 수행 단계로 옳은 것은?', '{"source_id":"adsp_exam2_p25","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["대치 → 분석 → 결합","분석 → 대치 → 결합","결합 → 대치 → 분석","삭제 → 대치 → 분석"]'::jsonb, 'medium', 1, TRUE, '25. 다중대치법', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 25);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '다중대치법은 여러 번 대치해 복수의 완전 데이터셋을 만들고(대치), 각각 분석한 뒤(분석), 결과를 통합한다(결합).' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 25 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 26, 6, s.id, 'multiple_choice', 'R reshape2 패키지에서 넓은(wide) 형태의 데이터를 식별자와 변수-값 쌍의 긴(long) 형태로 바꾸는 함수는?', '{"source_id":"adsp_exam2_p26","category":"R기초와 데이터 마트","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["merge","split","melt","cast"]'::jsonb, 'medium', 1, TRUE, '26. 데이터 구조 변환', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 26);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'melt()는 데이터를 긴 형태로 녹이고, dcast()/acast()는 다시 원하는 형태로 재구성한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 26 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 27, 6, s.id, 'multiple_choice', '모집단의 개체에 번호를 붙이고 일정한 간격마다 표본을 추출하는 방법은?', '{"source_id":"adsp_exam2_p27","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["단순랜덤 추출법","계통추출법","층화추출법","집락추출법"]'::jsonb, 'easy', 1, TRUE, '27. 계통추출법', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 27);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '계통추출법은 번호를 붙인 뒤 첫 표본을 랜덤으로 뽑고 이후 일정 간격(K)마다 추출한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 27 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 28, 6, s.id, 'multiple_choice', '절대 영점이 존재하여 사칙연산이 모두 가능한 척도는?', '{"source_id":"adsp_exam2_p28","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["명목척도","순서척도","구간척도","비율척도"]'::jsonb, 'easy', 1, TRUE, '28. 비율척도', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 28);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '비율척도는 절대 영점이 있어 비율 계산이 가능하다. 무게, 나이, 소득 등이 해당한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 28 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 29, 6, s.id, 'multiple_choice', '성공 확률이 0.3인 베르누이 시행을 10번 반복할 때 성공 횟수 X의 기댓값은?', '{"source_id":"adsp_exam2_p29","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["0.3","2.1","3","7"]'::jsonb, 'medium', 1, TRUE, '29. 이항분포', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 29);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '이항분포 B(n, p)의 기댓값은 np = 10 × 0.3 = 3 이다. 분산은 np(1-p) = 2.1 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 29 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 30, 6, s.id, 'multiple_choice', '표준정규분포의 평균과 표준편차는?', '{"source_id":"adsp_exam2_p30","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["평균 1, 표준편차 0","평균 0, 표준편차 0","평균 1, 표준편차 1","평균 0, 표준편차 1"]'::jsonb, 'easy', 1, TRUE, '30. 정규분포', 78
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 30);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '표준정규분포는 평균 0, 표준편차 1인 정규분포다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 30 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 31, 7, s.id, 'multiple_choice', '귀무가설이 거짓일 때 이를 올바르게 기각할 확률을 무엇이라 하는가?', '{"source_id":"adsp_exam2_p31","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["검정력","p-value","유의수준","신뢰수준"]'::jsonb, 'medium', 1, TRUE, '31. 검정력', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 31);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '검정력은 1 - β로, 대립가설이 참일 때 귀무가설을 기각할 확률이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 31 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 32, 7, s.id, 'multiple_choice', '단위가 다른 두 자료의 흩어진 정도를 비교할 때 사용하는 통계량은?', '{"source_id":"adsp_exam2_p32","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["표준편차","변동계수","범위","분산"]'::jsonb, 'easy', 1, TRUE, '32. 변동계수', 81
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 32);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '변동계수(CV)는 표준편차를 평균으로 나눈 값으로 단위와 관계없이 산포를 비교할 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 32 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 33, 7, s.id, 'multiple_choice', '세 개 이상 집단의 평균 차이를 검정하는 방법은?', '{"source_id":"adsp_exam2_p33","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["분산분석(ANOVA)","카이제곱 적합도 검정","독립표본 t-검정","대응표본 t-검정"]'::jsonb, 'medium', 1, TRUE, '33. 분산분석', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 33);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '분산분석은 세 개 이상 집단의 평균이 같은지 F 통계량으로 검정한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 33 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 34, 7, s.id, 'multiple_choice', '성별(남/여)과 선호 상품(A/B/C)이 서로 관련이 있는지 검정하는 방법은?', '{"source_id":"adsp_exam2_p34","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["단순회귀분석","카이제곱 독립성 검정","대응표본 t-검정","피어슨 상관분석"]'::jsonb, 'medium', 1, TRUE, '34. 카이제곱 독립성 검정', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 34);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '두 범주형 변수의 연관성은 분할표를 이용한 카이제곱 독립성 검정으로 확인한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 34 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 35, 7, s.id, 'multiple_choice', '순서척도 자료의 상관관계를 측정할 때 사용하는 상관계수는?', '{"source_id":"adsp_exam2_p35","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["분산팽창계수","피어슨 상관계수","스피어만 상관계수","결정계수"]'::jsonb, 'easy', 1, TRUE, '35. 스피어만 상관계수', 80
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 35);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '스피어만 상관계수는 순위를 이용해 상관관계를 측정하므로 서열 자료나 비선형 단조 관계에 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 35 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 36, 8, s.id, 'multiple_choice', '회귀분석에서 다중공선성을 진단하는 지표와 일반적인 판단 기준으로 옳은 것은?', '{"source_id":"adsp_exam2_p36","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["p-value가 0.05보다 작으면 다중공선성이다","결정계수가 0.5보다 작으면 다중공선성이다","잔차가 정규분포를 따르면 다중공선성이다","VIF가 10보다 크면 다중공선성을 의심한다"]'::jsonb, 'medium', 1, TRUE, '36. 다중공선성 진단', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 36);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '분산팽창요인(VIF)이 10을 넘으면 다중공선성이 심하다고 판단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 36 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 37, 8, s.id, 'multiple_choice', '절편만 있는 모형에서 시작해 기준에 따라 가장 유의한 변수를 하나씩 추가하는 변수 선택법은?', '{"source_id":"adsp_exam2_p37","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["전진선택법","단계적 선택법","전역 탐색법","후진제거법"]'::jsonb, 'medium', 1, TRUE, '37. 변수 선택법', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 37);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '전진선택법은 변수를 하나씩 추가한다. 후진제거법은 모든 변수에서 시작해 하나씩 제거하고, 단계적 선택법은 추가와 제거를 함께 한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 37 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 38, 8, s.id, 'multiple_choice', '주성분분석에서 주성분 개수를 정할 때 사용하는 방법으로 옳지 않은 것은?', '{"source_id":"adsp_exam2_p38","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["스크리 그래프에서 기울기가 완만해지는 지점","고유값이 1 이상인 주성분","변수 개수와 같은 수의 주성분을 항상 사용","누적 기여율이 80% 이상이 되는 지점"]'::jsonb, 'medium', 1, TRUE, '38. 주성분 개수 선택', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 38);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '차원 축소가 목적이므로 누적 기여율, 스크리 그래프, 고유값 기준으로 소수의 주성분을 선택한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 38 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 39, 8, s.id, 'multiple_choice', '시계열의 평균이 일정하지 않을 때 정상 시계열로 바꾸기 위해 사용하는 방법은?', '{"source_id":"adsp_exam2_p39","category":"통계분석","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["정규화","차분","로그 변환","표준화"]'::jsonb, 'easy', 1, TRUE, '39. 차분', 75
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 39);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '평균이 일정하지 않으면 차분(differencing)으로, 분산이 일정하지 않으면 로그 변환 등으로 정상화한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 39 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 40, 8, s.id, 'multiple_choice', '다음 중 분류(Classification)에 해당하는 분석 기법이 아닌 것은?', '{"source_id":"adsp_exam2_p40","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["로지스틱 회귀분석","의사결정나무","서포트 벡터 머신","K-평균 군집분석"]'::jsonb, 'easy', 1, TRUE, '40. 데이터 마이닝 분석 방법', 82
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 40);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'K-평균 군집분석은 레이블 없이 집단을 묶는 군집 기법이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 40 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 41, 9, s.id, 'multiple_choice', 'k-fold 교차검증에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam2_p41","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["데이터를 k개로 나누고 k-1개로 학습, 나머지 1개로 평가하는 과정을 k번 반복한다","데이터를 학습용과 평가용으로 한 번만 나눈다","복원추출로 표본을 만들어 학습한다","평가용 데이터를 학습에도 반복 사용한다"]'::jsonb, 'medium', 1, TRUE, '41. k-fold 교차검증', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 41);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'k-fold 교차검증은 k개 부분 중 하나씩을 평가용으로 돌려가며 k번 학습·평가한 뒤 결과를 평균한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 41 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 42, 9, s.id, 'multiple_choice', '의사결정나무에서 과대적합을 줄이기 위해 불필요한 가지를 제거하는 과정은?', '{"source_id":"adsp_exam2_p42","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["분리(Splitting)","배깅(Bagging)","성장(Growing)","가지치기(Pruning)"]'::jsonb, 'easy', 1, TRUE, '42. 의사결정나무 가지치기', 74
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 42);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '가지치기는 과대적합을 막기 위해 분류 오류를 크게 할 위험이 있거나 부적절한 가지를 제거하는 과정이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 42 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 43, 9, s.id, 'multiple_choice', '랜덤 포레스트에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam2_p43","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["하나의 깊은 의사결정나무를 사용한다","배깅에 더해 각 분리마다 일부 변수만 무작위로 후보로 사용한다","잘못 분류된 관측치에 가중치를 순차적으로 높인다","비지도학습 기법이다"]'::jsonb, 'medium', 1, TRUE, '43. 랜덤 포레스트', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 43);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '랜덤 포레스트는 부트스트랩 표본과 노드마다 무작위로 고른 변수 일부를 사용해 많은 나무를 만들고 결합한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 43 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 44, 9, s.id, 'multiple_choice', '다음 혼동행렬에서 재현율(Recall)은?

| 구분 | 예측 Positive | 예측 Negative |
| 실제 Positive | 40 | 10 |
| 실제 Negative | 20 | 30 |', '{"source_id":"adsp_exam2_p44","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["0.67","0.75","0.80","0.40"]'::jsonb, 'medium', 1, TRUE, '44. 정밀도와 재현율', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 44);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '재현율 = TP / (TP + FN) = 40 / (40 + 10) = 0.8 이다. 정밀도는 TP / (TP + FP) = 40 / 60 ≈ 0.67 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 44 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 45, 9, s.id, 'multiple_choice', '두 점 (1, 2)와 (4, 6) 사이의 맨해튼 거리는?', '{"source_id":"adsp_exam2_p45","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["5","7","25","3.5"]'::jsonb, 'easy', 1, TRUE, '45. 거리 측정', 73
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 45);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '맨해튼 거리는 좌표 차이의 절댓값 합이다. |4-1| + |6-2| = 3 + 4 = 7 이다. 유클리드 거리는 5다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 45 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 46, 10, s.id, 'multiple_choice', '계층적 군집분석에서 군집 내 편차 제곱합의 증가량이 최소가 되도록 군집을 병합하는 방법은?', '{"source_id":"adsp_exam2_p46","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["와드연결법","단일연결법","완전연결법","중심연결법"]'::jsonb, 'medium', 1, TRUE, '46. 와드 연결법', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 46);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '와드연결법은 군집 내 오차제곱합(SSE) 증가량이 가장 작은 쪽으로 병합한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 46 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 47, 10, s.id, 'multiple_choice', 'A를 구매한 거래 50건 중 B도 함께 구매한 거래가 20건일 때, 규칙 A → B의 신뢰도는?', '{"source_id":"adsp_exam2_p47","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["0.2","0.4","0.5","2.5"]'::jsonb, 'easy', 1, TRUE, '47. 연관분석 신뢰도', 76
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 47);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '신뢰도 = P(A∩B) / P(A) = 20 / 50 = 0.4 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 47 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 48, 10, s.id, 'multiple_choice', 'Apriori 알고리즘의 핵심 원리로 옳은 것은?', '{"source_id":"adsp_exam2_p48","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["모든 항목 조합을 빠짐없이 계산한다","신뢰도가 높은 규칙부터 생성한다","트리 구조로 데이터를 압축해 한 번만 스캔한다","빈발하지 않은 항목집합의 상위 집합도 빈발하지 않다"]'::jsonb, 'medium', 1, TRUE, '48. Apriori 알고리즘', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 48);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'Apriori는 최소 지지도를 넘지 못한 항목집합의 상위 집합을 후보에서 제외해 계산량을 줄인다. 트리 압축은 FP-Growth의 특징이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 48 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 49, 10, s.id, 'multiple_choice', '인공신경망에서 출력값을 0과 1 사이로 변환해 이진 분류의 확률로 쓰는 활성화 함수는?', '{"source_id":"adsp_exam2_p49","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["항등 함수","ReLU","시그모이드","계단 함수"]'::jsonb, 'easy', 1, TRUE, '49. 활성화 함수', 79
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 49);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '시그모이드 함수는 입력을 0~1 사이의 값으로 변환한다. 다중 분류에는 소프트맥스 함수를 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 49 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 50, 10, s.id, 'multiple_choice', '분류 모형의 성능을 평가할 때, 예측 확률 순으로 데이터를 나눈 등급별로 실제 반응률을 보여주는 표는?', '{"source_id":"adsp_exam2_p50","category":"정형 데이터 마이닝","points":2,"round":2,"avg_difficulty":"easy"}'::jsonb, '["덴드로그램","산점도 행렬","이익도표(Gain Chart)","분할표"]'::jsonb, 'medium', 1, TRUE, '50. 이익도표', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_2' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 50);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '이익도표는 등급별 반응률과 향상도를 보여주며, 상위 등급의 향상도가 클수록 좋은 모형이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_2' AND x.question_no = 50 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);

-- ===== ADsP 모의고사 3회 (adsp_mock_3) =====
INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)
SELECT 'adsp_mock_3', 'ADsP 모의고사 3회', 50, 10, 5400, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = 'adsp_mock_3');

INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 이해', 40, 1 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 1);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석 기획', 40, 2 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 2);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석', 40, 3 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 3);

INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 1, 1, s.id, 'multiple_choice', '다음 사례 중 "지식(Knowledge)"에 해당하는 것은?', '{"source_id":"adsp_exam3_p1","category":"데이터의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["상대적으로 저렴한 A마트에서 볼펜을 사야겠다","A마트의 다른 상품도 B마트보다 쌀 것이라고 판단한다","A마트의 볼펜 가격은 100원, B마트는 200원이다","A마트의 볼펜이 B마트보다 더 싸다"]'::jsonb, 'medium', 1, TRUE, '1. 데이터와 정보의 관계', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 1);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '가격 자체는 데이터, 가격 비교는 정보, 정보를 바탕으로 한 행동 판단은 지식, 이를 다른 상품까지 확장한 추론은 지혜에 해당한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 1 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 2, 1, s.id, 'multiple_choice', '데이터베이스의 특징을 활용 측면에서 설명한 것으로 옳은 것은?', '{"source_id":"adsp_exam3_p2","category":"데이터의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["대량의 정보를 일정한 형식에 따라 저장한다","다양한 정보를 체계적으로 축적해 경제성과 효율성을 높인다","데이터 검색·갱신이 쉽고, 실시간 처리와 접근이 가능하다","정보를 일정한 형식으로 수집해 체계적으로 저장한다"]'::jsonb, 'medium', 1, TRUE, '2. 데이터베이스의 활용 측면', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 2);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '활용 측면에서는 정보 검색과 갱신이 쉽고, 여러 사용자가 동시에 접근해 실시간으로 이용할 수 있다는 점이 특징이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 2 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 3, 1, s.id, 'multiple_choice', '데이터베이스 설계 절차를 순서대로 나열한 것은?', '{"source_id":"adsp_exam3_p3","category":"데이터의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["물리적 설계 → 논리적 설계 → 개념적 설계 → 요구사항 분석","요구사항 분석 → 개념적 설계 → 논리적 설계 → 물리적 설계","개념적 설계 → 요구사항 분석 → 물리적 설계 → 논리적 설계","요구사항 분석 → 논리적 설계 → 개념적 설계 → 물리적 설계"]'::jsonb, 'hard', 1, TRUE, '3. 데이터베이스 설계 절차', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 3);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '요구사항을 분석해 개념적 모델(ERD)을 만들고, 이를 DBMS에 맞는 논리적 스키마로 바꾼 뒤 저장 구조를 정하는 물리적 설계로 진행한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 3 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 4, 1, s.id, 'multiple_choice', '다음 중 데이터 정의어(DDL)에 해당하는 SQL 명령어는?', '{"source_id":"adsp_exam3_p4","category":"데이터의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["GRANT","SELECT","UPDATE","CREATE"]'::jsonb, 'medium', 1, TRUE, '4. SQL 명령어 분류', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 4);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'DDL은 CREATE, ALTER, DROP 등이다. SELECT·UPDATE는 DML, GRANT는 DCL이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 4 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 5, 1, s.id, 'multiple_choice', '빅데이터가 기업, 정부, 개인에게 주는 영향으로 옳지 않은 것은?', '{"source_id":"adsp_exam3_p5","category":"데이터의 가치와 미래","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["정부: 데이터 수집 비용의 증가로 의사결정 지연","기업: 혁신, 경쟁력 제고, 생산성 향상","정부: 환경 탐색, 상황 분석, 미래 대응","개인: 목적에 따른 활용, 기회 비용 절약"]'::jsonb, 'medium', 1, TRUE, '5. 빅데이터의 영향', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 5);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '빅데이터는 정부가 환경 탐색, 상황 분석, 미래 대응 능력을 높이는 데 활용된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 5 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 6, 2, s.id, 'multiple_choice', '"고객의 구매 이력과 SNS 반응을 보고 문장이 긍정인지 부정인지를 판단해 상품 평판을 파악한다"에 해당하는 기법은?', '{"source_id":"adsp_exam3_p6","category":"데이터의 가치와 미래","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["유전 알고리즘","회귀분석","소셜 네트워크 분석","감정 분석(Sentiment Analysis)"]'::jsonb, 'hard', 1, TRUE, '6. 빅데이터 활용 기본 테크닉 사례', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 6);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '감정 분석은 문장이나 단어의 긍정·부정을 판단한다. 소셜 네트워크 분석은 사용자 간 관계와 영향력을 분석한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 6 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 7, 2, s.id, 'multiple_choice', '빅데이터 위기 요인 중 "책임 원칙 훼손"의 사례로 가장 적절한 것은?', '{"source_id":"adsp_exam3_p7","category":"데이터의 가치와 미래","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["개인 위치 정보가 무단으로 수집되는 경우","범죄 예측 프로그램에 따라 아직 일어나지 않은 행동으로 사람을 처벌하는 경우","잘못된 지표를 사용해 잘못된 결론을 내리는 경우","데이터 저장 장치가 고장 나는 경우"]'::jsonb, 'medium', 1, TRUE, '7. 책임 원칙 훼손', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 7);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '책임 원칙 훼손은 예측 결과만으로 개인을 판단·처벌하는 것이다. 통제 방안은 결과 기반 책임 원칙의 고수다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 7 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 8, 2, s.id, 'multiple_choice', '데이터의 가치 패러다임 변화를 순서대로 나열한 것은?', '{"source_id":"adsp_exam3_p8","category":"데이터 사이언스와 전략 인사이트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["Agency → Connection → Digitalization","Digitalization → Agency → Connection","Digitalization → Connection → Agency","Connection → Digitalization → Agency"]'::jsonb, 'medium', 1, TRUE, '8. 가치 패러다임의 변화', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 8);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '아날로그를 디지털화하던 시대(Digitalization)에서 디지털 정보를 연결하는 시대(Connection)를 거쳐, 복잡한 연결을 관리하는 시대(Agency)로 변하고 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 8 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 9, 2, s.id, 'multiple_choice', '데이터 사이언스의 한계에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam3_p9","category":"데이터 사이언스와 전략 인사이트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["모든 분석은 가정에 근거하며, 같은 데이터도 해석하는 사람에 따라 결론이 달라질 수 있다","정량 분석이면 인간의 해석이 필요 없다","데이터가 많을수록 해석의 오류는 사라진다","분석 모형은 항상 현실을 정확히 반영한다"]'::jsonb, 'hard', 1, TRUE, '9. 데이터 사이언스의 한계', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 9);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '모델은 현실을 단순화한 것이고 분석은 가정에 근거한다. 따라서 해석에는 인간의 통찰이 반드시 필요하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 9 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 10, 2, s.id, 'multiple_choice', '데이터 사이언티스트의 하드 스킬(hard skill)에 해당하는 것은?', '{"source_id":"adsp_exam3_p10","category":"데이터 사이언스와 전략 인사이트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["스토리텔링","빅데이터에 대한 이론적 지식과 분석 기술의 숙련","다분야 간 협력과 커뮤니케이션","창의적 사고와 호기심"]'::jsonb, 'medium', 1, TRUE, '10. 데이터 사이언티스트의 하드 스킬', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 10);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '하드 스킬은 빅데이터 관련 기법과 이론적 지식, 분석 기술의 숙련이다. 나머지는 소프트 스킬이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 10 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 11, 3, s.id, 'multiple_choice', '단기적으로 빠르게 성과를 내기 위한 과제 단위 분석 기획(Quick-Win)의 특징으로 옳은 것은?', '{"source_id":"adsp_exam3_p11","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["1차 목표는 정확도(Accuracy)와 배포","과제 유형은 Long Term View","문제 해결(Problem Solving)이 1차 목표이며 속도와 테스트를 중시한다","분석 접근 방식은 문제 정의(Problem Definition)"]'::jsonb, 'medium', 1, TRUE, '11. 목표 시점별 분석 기획', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 11);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '과제 단위 접근은 Speed & Test, Quick-Win, Problem Solving 중심이다. 마스터 플랜 단위는 Accuracy & Deploy, Long Term View, Problem Definition 중심이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 11 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 12, 3, s.id, 'multiple_choice', 'CRISP-DM에서 "모델링 기법 선택, 모델 테스트 계획 설계, 모델 작성, 모델 평가"를 수행하는 단계는?', '{"source_id":"adsp_exam3_p12","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["평가","전개","데이터 준비","모델링"]'::jsonb, 'medium', 1, TRUE, '12. CRISP-DM 단계별 업무', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 12);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '모델링 단계의 태스크다. 평가 단계는 분석 결과 평가, 모델링 과정 평가, 모델 적용성 평가를 수행한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 12 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 13, 3, s.id, 'multiple_choice', 'CRISP-DM의 4레벨 계층 구조로 옳은 것은?', '{"source_id":"adsp_exam3_p13","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["단계(Phase) → 일반화 태스크 → 세분화 태스크 → 프로세스 실행","단계 → 세분화 태스크 → 일반화 태스크 → 프로세스 실행","프로세스 실행 → 단계 → 일반화 태스크 → 세분화 태스크","일반화 태스크 → 단계 → 프로세스 실행 → 세분화 태스크"]'::jsonb, 'hard', 1, TRUE, '13. CRISP-DM의 계층', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 13);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'CRISP-DM은 최상위 단계(Phase), 일반화 태스크, 세분화 태스크, 프로세스 실행의 4레벨로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 13 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 14, 3, s.id, 'multiple_choice', '빅데이터 분석 방법론의 "분석 기획" 단계에서 수행하는 태스크가 아닌 것은?', '{"source_id":"adsp_exam3_p14","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["프로젝트 정의 및 계획 수립","프로젝트 위험 계획 수립","모델 발전 계획 수립","비즈니스 이해 및 범위 설정"]'::jsonb, 'medium', 1, TRUE, '14. 빅데이터 분석 방법론의 분석 기획 단계', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 14);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '모델 발전 계획 수립은 평가 및 전개 단계의 태스크다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 14 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 15, 3, s.id, 'multiple_choice', '거시적 관점에서 분석 기회를 발굴할 때 사용하는 STEEP 요소에 해당하지 않는 것은?', '{"source_id":"adsp_exam3_p15","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["Economic(경제)","Product(제품)","Social(사회)","Technological(기술)"]'::jsonb, 'medium', 1, TRUE, '15. 분석 기회 발굴의 범위 확장', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 15);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'STEEP은 사회(Social), 기술(Technological), 경제(Economic), 환경(Environmental), 정치(Political)다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 15 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 16, 4, s.id, 'multiple_choice', '상향식 접근법에서 활용하는 디자인 사고(Design Thinking)의 단계에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam3_p16","category":"데이터 분석 기획의 이해","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["디자인 사고는 하향식 접근법에서만 사용한다","수렴(Converge) 단계에서 가능한 옵션을 최대한 도출한다","발산(Diverge) 단계에서 도출된 옵션을 분석해 하나로 좁힌다","발산 단계와 수렴 단계를 반복하며 과제를 발굴한다"]'::jsonb, 'hard', 1, TRUE, '16. 디자인 사고', 44
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 16);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '디자인 사고는 가능한 옵션을 도출하는 발산과, 이를 분석·검토해 좁히는 수렴을 반복한다. 상향식 접근은 발산 단계에, 하향식 접근은 수렴 단계에 가깝다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 16 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 17, 4, s.id, 'multiple_choice', '시급성(현재/미래)과 난이도(쉬움/어려움)로 구성한 포트폴리오 사분면에서 "시급성"을 우선 기준으로 할 때의 추진 순서는?', '{"source_id":"adsp_exam3_p17","category":"분석 마스터 플랜","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["3사분면 → 4사분면 → 2사분면","3사분면 → 1사분면 → 2사분면","1사분면 → 2사분면 → 3사분면","2사분면 → 4사분면 → 3사분면"]'::jsonb, 'medium', 1, TRUE, '17. 포트폴리오 사분면 우선순위', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 17);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '시급성을 우선하면 3사분면(현재·쉬움) → 4사분면(미래·쉬움) → 2사분면(미래·어려움) 순이다. 난이도를 우선하면 3 → 1 → 2 순이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 17 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 18, 4, s.id, 'multiple_choice', '분석 과제 관리 프로세스 중 "과제 발굴" 단계에 해당하지 않는 것은?', '{"source_id":"adsp_exam3_p18","category":"분석 마스터 플랜","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["분석 아이디어 발굴","분석 과제 후보 제안","분석 과제 확정","분석 결과 공유 및 개선"]'::jsonb, 'medium', 1, TRUE, '18. 분석 과제 관리 프로세스', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 18);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '과제 발굴은 아이디어 발굴 → 과제 후보 제안 → 과제 확정, 과제 수행은 팀 구성 → 과제 실행 → 진행 관리 → 결과 공유·개선으로 나뉜다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 18 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 19, 4, s.id, 'multiple_choice', '데이터 거버넌스 체계 중 데이터 표준 용어 설정, 명명 규칙 수립, 메타데이터 구축 등을 수행하는 영역은?', '{"source_id":"adsp_exam3_p19","category":"분석 마스터 플랜","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["표준화 활동","데이터 표준화","데이터 관리 체계","데이터 저장소 관리"]'::jsonb, 'hard', 1, TRUE, '19. 데이터 거버넌스 체계', 43
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 19);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터 표준화는 표준 용어, 명명 규칙, 메타데이터·데이터 사전을 구축한다. 데이터 관리 체계는 메타데이터와 사전의 관리 원칙과 역할을 정한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 19 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 20, 4, s.id, 'multiple_choice', '분석 성숙도 모델에서 성숙도를 진단하는 3개 부문으로 옳은 것은?', '{"source_id":"adsp_exam3_p20","category":"분석 마스터 플랜","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["데이터 부문, 모델 부문, 시각화 부문","전략 부문, 운영 부문, 보안 부문","비즈니스 부문, 조직·역량 부문, IT 부문","재무 부문, 인사 부문, 영업 부문"]'::jsonb, 'medium', 1, TRUE, '20. 분석 성숙도 진단 부문', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 20);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 성숙도는 비즈니스, 조직·역량, IT 부문을 대상으로 도입·활용·확산·최적화 단계를 진단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 20 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 21, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
x <- c(5, 12, 7, 20, 3)
x[x > 6]
```', '{"source_id":"adsp_exam3_p21","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["12 7 20","5 12 7 20","12 20","TRUE FALSE TRUE"]'::jsonb, 'medium', 1, TRUE, '21. R 논리 인덱싱', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 21);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '논리 조건 x > 6을 인덱스로 쓰면 조건을 만족하는 원소 12, 7, 20만 추출된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 21 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 22, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
paste("A", 1:3, sep = "-")
```', '{"source_id":"adsp_exam3_p22","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["\"A\" \"1\" \"2\" \"3\"","\"A-1\" \"A-2\" \"A-3\"","\"A1\" \"A2\" \"A3\"","\"A-1-2-3\""]'::jsonb, 'medium', 1, TRUE, '22. R paste 함수', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 22);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'paste()는 벡터를 원소별로 이어 붙인다. sep = "-"이므로 "A-1", "A-2", "A-3"이 된다. 하나로 합치려면 collapse 인자를 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 22 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 23, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
df <- data.frame(id = 1:4, score = c(70, 85, 90, 60))
nrow(df[df$score >= 80, ])
```', '{"source_id":"adsp_exam3_p23","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["1","2","3","4"]'::jsonb, 'hard', 1, TRUE, '23. R 데이터 프레임 인덱싱', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 23);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'score가 80 이상인 행은 85와 90 두 개다. nrow()는 행 수를 반환하므로 2다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 23 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 24, 5, s.id, 'multiple_choice', 'R에서 데이터 프레임에 SQL 문법을 그대로 사용해 조회할 수 있게 해주는 패키지는?', '{"source_id":"adsp_exam3_p24","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["plyr","reshape2","ggplot2","sqldf"]'::jsonb, 'medium', 1, TRUE, '24. sqldf', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 24);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'sqldf 패키지를 쓰면 sqldf("SELECT * FROM df WHERE score > 80")처럼 SQL로 데이터 프레임을 다룰 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 24 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 25, 5, s.id, 'multiple_choice', '결측값을 비슷한 성향을 가진 다른 응답자의 값으로 대체하는 단순 확률 대치법은?', '{"source_id":"adsp_exam3_p25","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["회귀 대치법","평균 대치법","Hot-deck 대치법","완전 응답 개체 분석"]'::jsonb, 'medium', 1, TRUE, '25. 단순 확률 대치법', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 25);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'Hot-deck 대치법은 같은 데이터 내에서 비슷한 응답자의 값을 무작위로 골라 대체한다. 외부 자료에서 가져오면 Cold-deck이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 25 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 26, 6, s.id, 'multiple_choice', '평균이 50, 표준편차가 5인 자료에서 ESD(Extreme Studentized Deviation) 기준으로 이상값으로 판단하는 범위는?', '{"source_id":"adsp_exam3_p26","category":"R기초와 데이터 마트","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["45 미만 또는 55 초과","25 미만 또는 75 초과","35 미만 또는 65 초과","40 미만 또는 60 초과"]'::jsonb, 'hard', 1, TRUE, '26. ESD 이상값 판단', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 26);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'ESD는 평균 ± 3 표준편차 밖의 값을 이상값으로 본다. 50 ± 15이므로 35 미만 또는 65 초과다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 26 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 27, 6, s.id, 'multiple_choice', '서울시 전체 초등학교 중 몇 개 학교를 랜덤하게 고른 뒤, 선택된 학교의 학생 전원을 조사하는 방법은?', '{"source_id":"adsp_exam3_p27","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["집락추출법","단순랜덤 추출법","층화추출법","계통추출법"]'::jsonb, 'medium', 1, TRUE, '27. 집락추출법', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 27);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '집락추출법은 모집단을 집락(학교)으로 나누고 일부 집락을 선택해 그 안의 개체를 조사한다. 집락 내부는 이질적, 집락 간은 동질적인 것이 좋다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 27 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 28, 6, s.id, 'multiple_choice', '성공 확률이 p인 독립 시행을 반복할 때, 처음 성공할 때까지의 시행 횟수가 따르는 분포는?', '{"source_id":"adsp_exam3_p28","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["포아송분포","균일분포","이항분포","기하분포"]'::jsonb, 'medium', 1, TRUE, '28. 기하분포', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 28);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '기하분포는 첫 성공까지의 시행 횟수(또는 실패 횟수)의 분포다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 28 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 29, 6, s.id, 'multiple_choice', '다른 조건이 같을 때 표본 크기를 4배로 늘리면 모평균 신뢰구간의 폭은 어떻게 되는가?', '{"source_id":"adsp_exam3_p29","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["1/2로 좁아진다","1/4로 좁아진다","4배로 넓어진다","2배로 넓어진다"]'::jsonb, 'hard', 1, TRUE, '29. 표본 크기와 신뢰구간', 47
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 29);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '신뢰구간 폭은 σ/√n에 비례한다. n을 4배로 늘리면 √4 = 2이므로 폭은 1/2이 된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 29 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 30, 6, s.id, 'multiple_choice', 't-분포에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam3_p30","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["평균이 0을 중심으로 좌우 대칭이다","자유도가 커질수록 표준정규분포에 가까워진다","표준정규분포보다 꼬리가 두껍다","모분산을 알 때 모평균 검정에 주로 사용한다"]'::jsonb, 'medium', 1, TRUE, '30. t-분포', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 30);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 't-분포는 모분산을 모를 때 표본표준편차를 이용해 모평균을 추정·검정할 때 사용한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 30 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 31, 7, s.id, 'multiple_choice', '두 모집단의 분산이 같은지 검정할 때 사용하는 분포는?', '{"source_id":"adsp_exam3_p31","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["카이제곱 분포","F-분포","포아송 분포","t-분포"]'::jsonb, 'medium', 1, TRUE, '31. F-분포', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 31);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '두 표본분산의 비는 F-분포를 따르므로 등분산 검정에 F-분포를 사용한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 31 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 32, 7, s.id, 'multiple_choice', '정규분포의 첨도를 0으로 보정했을 때, 첨도가 양수인 분포의 특징은?', '{"source_id":"adsp_exam3_p32","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["오른쪽으로 치우쳐 있다","왼쪽으로 치우쳐 있다","정규분포보다 뾰족하고 꼬리가 두껍다","정규분포보다 완만하고 꼬리가 얇다"]'::jsonb, 'hard', 1, TRUE, '32. 첨도', 46
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 32);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '초과 첨도가 양수이면 정규분포보다 중심이 뾰족하고 꼬리가 두껍다. 치우침은 왜도로 판단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 32 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 33, 7, s.id, 'multiple_choice', '다중회귀분석에서 모형 전체가 통계적으로 유의한지 판단할 때 확인하는 것은?', '{"source_id":"adsp_exam3_p33","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["F 통계량과 그 p-value","결정계수의 크기만","잔차의 평균","각 회귀계수의 t 통계량"]'::jsonb, 'medium', 1, TRUE, '33. 회귀모형의 유의성', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 33);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '모형 전체의 유의성은 F 통계량의 p-value로, 개별 회귀계수의 유의성은 t 통계량의 p-value로 판단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 33 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 34, 7, s.id, 'multiple_choice', '수정된 결정계수(Adjusted R²)에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam3_p34","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["독립변수를 추가하면 항상 증가한다","유의하지 않은 변수를 추가하면 감소할 수 있다","결정계수보다 항상 크다","음수가 될 수 없다"]'::jsonb, 'hard', 1, TRUE, '34. 수정된 결정계수', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 34);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '결정계수는 변수를 추가하면 항상 커지지만, 수정된 결정계수는 변수 수에 대한 벌점을 반영해 쓸모없는 변수를 추가하면 감소한다. 결정계수보다 작거나 같고 음수가 될 수도 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 34 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 35, 7, s.id, 'multiple_choice', '다음은 R에서 다중회귀분석을 수행한 결과다. 유의수준 0.05에서 해석으로 옳은 것은?

```r
Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept)   5.2310     1.4120   3.705 0.000512
x1            2.1040     0.3150   6.679 1.9e-08
x2           -0.0870     0.1520  -0.572 0.569700

Residual standard error: 2.31 on 47 degrees of freedom
Multiple R-squared:  0.497,  Adjusted R-squared:  0.476
F-statistic: 23.2 on 2 and 47 DF,  p-value: 9.1e-08
```', '{"source_id":"adsp_exam3_p35","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["표본 크기는 47이다","x1과 x2 모두 유의하다","x2는 유의하지 않으므로 제거를 고려할 수 있다","모형 전체는 유의하지 않다"]'::jsonb, 'hard', 1, TRUE, '35. R 회귀분석 출력', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 35);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'x2의 p-value가 0.5697로 0.05보다 커서 유의하지 않다. F 검정 p-value가 작아 모형 전체는 유의하며, 잔차 자유도 47 = n - 3이므로 n = 50이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 35 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 36, 8, s.id, 'multiple_choice', '다차원 척도법(MDS)에서 적합 정도를 나타내는 지표로, 0에 가까울수록 적합이 좋은 것은?', '{"source_id":"adsp_exam3_p36","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["고유값","VIF","결정계수","스트레스(Stress) 값"]'::jsonb, 'medium', 1, TRUE, '36. 다차원 척도법', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 36);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'MDS는 개체 간 거리를 저차원 공간에 나타내며, 스트레스 값이 0에 가까울수록 원래 거리를 잘 보존한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 36 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 37, 8, s.id, 'multiple_choice', '다음은 R에서 주성분분석을 수행한 결과다. 누적 기여율 80% 이상을 기준으로 할 때 선택할 주성분 수는?

```r
Importance of components:
                          PC1    PC2    PC3    PC4
Standard deviation     1.5749 0.9949 0.5971 0.4164
Proportion of Variance 0.6201 0.2474 0.0891 0.0434
Cumulative Proportion  0.6201 0.8675 0.9566 1.0000
```', '{"source_id":"adsp_exam3_p37","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["1개","2개","3개","4개"]'::jsonb, 'hard', 1, TRUE, '37. 주성분분석 결과 해석', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 37);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'PC2까지의 누적 기여율이 0.8675로 처음 80%를 넘으므로 주성분 2개를 선택한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 37 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 38, 8, s.id, 'multiple_choice', 'ARIMA(p, d, q) 모형에서 d가 의미하는 것은?', '{"source_id":"adsp_exam3_p38","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["계절 주기","자기회귀 차수","차분 횟수","이동평균 차수"]'::jsonb, 'medium', 1, TRUE, '38. ARIMA 모형', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 38);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'p는 AR 차수, d는 정상화를 위한 차분 횟수, q는 MA 차수다. d = 0이면 ARMA 모형이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 38 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 39, 8, s.id, 'multiple_choice', 'AR(p) 모형의 자기상관함수(ACF)와 부분자기상관함수(PACF)의 특징으로 옳은 것은?', '{"source_id":"adsp_exam3_p39","category":"통계분석","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["ACF는 지수적으로 감소하고 PACF는 p+1 시차부터 절단된다","ACF와 PACF 모두 절단된다","ACF와 PACF 모두 변하지 않는다","ACF는 p+1 시차부터 절단되고 PACF는 지수적으로 감소한다"]'::jsonb, 'hard', 1, TRUE, '39. ACF와 PACF', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 39);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'AR(p) 모형은 ACF가 빠르게 감소하고 PACF가 p+1 시차부터 0이 된다. MA(q) 모형은 반대로 ACF가 q+1 시차부터 절단된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 39 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 40, 8, s.id, 'multiple_choice', '부트스트랩에서 관측치 하나가 n번의 복원추출 동안 한 번도 뽑히지 않을 확률은 n이 클 때 약 얼마인가?', '{"source_id":"adsp_exam3_p40","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["약 26.8%","약 36.8%","약 50%","약 63.2%"]'::jsonb, 'medium', 1, TRUE, '40. 부트스트랩', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 40);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '(1 - 1/n)^n은 n이 크면 e⁻¹ ≈ 0.368에 가까워진다. 따라서 약 63.2%의 관측치만 학습에 쓰이고, 뽑히지 않은 36.8%는 검증에 사용할 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 40 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 41, 9, s.id, 'multiple_choice', '로지스틱 회귀분석에서 변수 x의 회귀계수가 0.693일 때, x가 1 증가하면 성공의 오즈는 몇 배가 되는가? (e^0.693 ≈ 2)', '{"source_id":"adsp_exam3_p41","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["0.5배","약 0.693배","약 2배","약 7배"]'::jsonb, 'medium', 1, TRUE, '41. 오즈비 해석', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 41);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '로지스틱 회귀에서 x가 1 증가하면 오즈는 e^β배가 된다. e^0.693 ≈ 2이므로 약 2배다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 41 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 42, 9, s.id, 'multiple_choice', '어떤 노드에 클래스 A가 6개, 클래스 B가 4개 있다. 이 노드의 지니 지수는?', '{"source_id":"adsp_exam3_p42","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["0.24","0.48","0.52","0.60"]'::jsonb, 'hard', 1, TRUE, '42. 지니 지수 계산', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 42);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '지니 지수 = 1 - Σp² = 1 - (0.6² + 0.4²) = 1 - (0.36 + 0.16) = 0.48 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 42 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 43, 9, s.id, 'multiple_choice', '의사결정나무 알고리즘과 분리 기준의 연결로 옳지 않은 것은?', '{"source_id":"adsp_exam3_p43","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["CART - 지니 지수","C4.5 - 엔트로피(정보이득비)","CHAID - 카이제곱 통계량","CART - 이익도표"]'::jsonb, 'medium', 1, TRUE, '43. 의사결정나무 알고리즘', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 43);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'CART는 이산형 목표변수에 지니 지수, 연속형에 분산 감소량을 쓴다. C4.5는 엔트로피, CHAID는 카이제곱 통계량을 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 43 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 44, 9, s.id, 'multiple_choice', '부스팅(Boosting)에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam3_p44","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["부트스트랩 표본만 사용하고 가중치는 쓰지 않는다","한 번에 하나의 모델만 사용한다","여러 모델을 독립적으로 병렬 학습한다","이전 모델이 잘못 분류한 관측치에 가중치를 높여 다음 모델을 순차적으로 학습한다"]'::jsonb, 'medium', 1, TRUE, '44. 부스팅', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 44);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '부스팅은 약한 학습기를 순차적으로 학습하며 오분류된 관측치에 더 큰 가중치를 준다. AdaBoost, GBM, XGBoost 등이 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 44 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 45, 9, s.id, 'multiple_choice', '다음 혼동행렬에서 특이도(Specificity)는?

| 구분 | 예측 Positive | 예측 Negative |
| 실제 Positive | 45 | 15 |
| 실제 Negative | 8 | 32 |', '{"source_id":"adsp_exam3_p45","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["0.75","0.80","0.85","0.68"]'::jsonb, 'hard', 1, TRUE, '45. 특이도 계산', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 45);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '특이도 = TN / (TN + FP) = 32 / (32 + 8) = 0.8 이다. 민감도는 45 / 60 = 0.75 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 45 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 46, 10, s.id, 'multiple_choice', '정밀도가 0.6, 재현율이 0.9일 때 F1 점수는?', '{"source_id":"adsp_exam3_p46","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["0.72","0.75","0.54","0.80"]'::jsonb, 'medium', 1, TRUE, '46. F1 점수', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 46);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'F1 = 2 × (정밀도 × 재현율) / (정밀도 + 재현율) = 2 × 0.54 / 1.5 = 0.72 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 46 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 47, 10, s.id, 'multiple_choice', '변수 간 상관관계와 척도를 고려한 거리 측정 방법은?', '{"source_id":"adsp_exam3_p47","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["유클리드 거리","맨해튼 거리","마할라노비스 거리","자카드 거리"]'::jsonb, 'medium', 1, TRUE, '47. 마할라노비스 거리', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 47);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '마할라노비스 거리는 공분산 행렬을 이용해 변수의 상관과 분산을 반영한다. 자카드 거리는 범주형(집합) 자료에 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 47 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 48, 10, s.id, 'multiple_choice', 'K-평균 군집분석에서 군집 수 K를 늘려가며 군집 내 제곱합(WSS)을 그렸을 때, 감소 폭이 급격히 줄어드는 지점을 K로 정하는 방법은?', '{"source_id":"adsp_exam3_p48","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["덴드로그램 절단","스크리 그래프","부트스트랩","엘보우(Elbow) 기법"]'::jsonb, 'hard', 1, TRUE, '48. K-평균의 군집 수 결정', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 48);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '엘보우 기법은 WSS 그래프가 팔꿈치처럼 꺾이는 지점을 적정 군집 수로 본다. 실루엣 계수도 함께 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 48 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 49, 10, s.id, 'multiple_choice', '임의 모양의 군집을 찾을 수 있고 잡음(noise)에 강하며, 군집 수를 미리 정할 필요가 없는 군집 기법은?', '{"source_id":"adsp_exam3_p49","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["DBSCAN","와드연결법","K-medoids","K-평균"]'::jsonb, 'medium', 1, TRUE, '49. 밀도 기반 군집', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 49);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'DBSCAN은 반경(eps)과 최소 점 개수(minPts)로 밀도가 높은 영역을 군집으로 묶는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 49 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 50, 10, s.id, 'multiple_choice', '전체 거래 100건 중 A 포함 40건, B 포함 50건, A와 B 동시 포함 30건이다. 규칙 A → B의 향상도는?', '{"source_id":"adsp_exam3_p50","category":"정형 데이터 마이닝","points":2,"round":3,"avg_difficulty":"medium"}'::jsonb, '["0.75","1.0","1.5","2.0"]'::jsonb, 'hard', 1, TRUE, '50. 연관분석 향상도 계산', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_3' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 50);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '신뢰도 = 30/40 = 0.75, P(B) = 0.5이므로 향상도 = 0.75 / 0.5 = 1.5 다. 1보다 크므로 양의 관계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_3' AND x.question_no = 50 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);

-- ===== ADsP 모의고사 4회 (adsp_mock_4) =====
INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)
SELECT 'adsp_mock_4', 'ADsP 모의고사 4회', 50, 10, 5400, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = 'adsp_mock_4');

INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 이해', 40, 1 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 1);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석 기획', 40, 2 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 2);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석', 40, 3 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 3);

INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 1, 1, s.id, 'multiple_choice', '데이터의 특성에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p1","category":"데이터의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["데이터는 단독으로 존재해도 항상 의미 있는 정보가 된다","데이터는 정량 데이터와 정성 데이터로 구분할 수 있다","존재적 특성은 객관적 사실(fact, raw material)이라는 것이다","당위적 특성은 추론·예측·전망·추정을 위한 근거(basis)로 기능한다는 것이다"]'::jsonb, 'medium', 1, TRUE, '1. 데이터의 정의', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 1);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '데이터는 다른 데이터와의 상호 관계 속에서 가공되어야 의미 있는 정보가 된다. 단독 데이터가 항상 정보인 것은 아니다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 1 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 2, 1, s.id, 'multiple_choice', '데이터에 관한 구조화된 데이터로, 다른 데이터를 설명해 주는 데이터는?', '{"source_id":"adsp_exam4_p2","category":"데이터의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["마스터 데이터","인덱스","메타데이터","트랜잭션 데이터"]'::jsonb, 'medium', 1, TRUE, '2. 메타데이터', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 2);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '메타데이터는 데이터의 구조, 의미, 출처 등 데이터를 설명하는 데이터다. 인덱스는 검색 속도를 높이기 위한 자료 구조다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 2 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 3, 1, s.id, 'multiple_choice', '원재료 조달부터 생산, 유통, 판매까지 이어지는 흐름을 통합 관리해 재고와 납기를 최적화하는 시스템은?', '{"source_id":"adsp_exam4_p3","category":"데이터의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["CRM","SCM","BI","KMS"]'::jsonb, 'hard', 1, TRUE, '3. 기업 내부 시스템', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 3);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'SCM(Supply Chain Management)은 공급망 전체를 관리한다. BI는 데이터를 분석해 의사결정을 지원하는 도구다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 3 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 4, 1, s.id, 'multiple_choice', '관계형 데이터베이스와 달리 고정된 스키마 없이 키-값, 문서, 컬럼 패밀리 등으로 데이터를 저장하는 데이터베이스를 통칭하는 말은?', '{"source_id":"adsp_exam4_p4","category":"데이터의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["OLAP","ETL","RDBMS","NoSQL"]'::jsonb, 'medium', 1, TRUE, '4. 빅데이터 저장 기술', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 4);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'NoSQL은 고정 스키마가 없고 수평 확장이 쉬워 대용량·비정형 데이터 저장에 쓰인다. MongoDB, Cassandra, HBase 등이 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 4 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 5, 1, s.id, 'multiple_choice', '"이 고객은 어느 집단에 속하는가?"처럼 문서를 분류하거나 조직을 그룹으로 나눌 때 사용하는 빅데이터 활용 기본 테크닉은?', '{"source_id":"adsp_exam4_p5","category":"데이터의 가치와 미래","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["유형 분석","유전 알고리즘","회귀분석","연관규칙 학습"]'::jsonb, 'medium', 1, TRUE, '5. 빅데이터 활용 기본 테크닉 - 유형 분석', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 5);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '유형 분석은 새로운 사건이 속할 범주를 찾아내거나 사용자를 특성별로 나누는 방법이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 5 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 6, 2, s.id, 'multiple_choice', '"택배 차량을 어떻게 배치해야 비용이 최소가 될까?"처럼 최적화가 필요한 문제를 생물의 진화 과정을 모방해 해결하는 테크닉은?', '{"source_id":"adsp_exam4_p6","category":"데이터의 가치와 미래","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["기계학습","감정 분석","소셜 네트워크 분석","유전 알고리즘"]'::jsonb, 'hard', 1, TRUE, '6. 빅데이터 활용 기본 테크닉 - 유전 알고리즘', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 6);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '유전 알고리즘은 선택, 교차, 변이를 반복하며 점진적으로 더 나은 해를 찾아가는 최적화 기법이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 6 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 7, 2, s.id, 'multiple_choice', '빅데이터 위기 요인 중 "데이터 오용"에 대한 통제 방안은?', '{"source_id":"adsp_exam4_p7","category":"데이터의 가치와 미래","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["결과 기반 책임 원칙 고수","알고리즘 접근 허용과 알고리즈미스트의 역할","개인정보의 익명화 금지","동의제에서 책임제로 전환"]'::jsonb, 'medium', 1, TRUE, '7. 데이터 오용 통제', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 7);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터 오용(잘못된 지표 사용 등)은 알고리즘에 대한 접근을 허용하고, 알고리즘을 해석·검증하는 알고리즈미스트가 피해를 구제하도록 해 통제한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 7 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 8, 2, s.id, 'multiple_choice', '산업과 대표적인 분석 애플리케이션의 연결로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p8","category":"데이터 사이언스와 전략 인사이트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["소매 - 재고 보충, 수요 예측","제조 - 맞춤형 상품 개발, 신상품 개발","에너지 - 신용점수 산정, 보험 사기 탐지","금융 - 신용점수 산정, 사기 탐지"]'::jsonb, 'medium', 1, TRUE, '8. 산업별 분석 애플리케이션', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 8);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '에너지 산업은 트레이딩, 공급·수요 예측에 분석을 활용한다. 신용점수 산정과 사기 탐지는 금융 산업의 대표 애플리케이션이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 8 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 9, 2, s.id, 'multiple_choice', '데이터 사이언티스트에 대한 설명으로 가장 적절한 것은?', '{"source_id":"adsp_exam4_p9","category":"데이터 사이언스와 전략 인사이트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["데이터를 분석해 비즈니스 문제를 정의하고 가치 있는 인사이트를 전달하는 전문가다","분석 도구 사용법만 알면 되는 단순 분석가다","수학적 이론만 연구하는 통계학자다","데이터 저장 장치를 관리하는 시스템 엔지니어다"]'::jsonb, 'medium', 1, TRUE, '9. 데이터 사이언티스트의 역할', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 9);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '데이터 사이언티스트는 이론적 지식과 분석 기술(하드 스킬)에 더해 통찰력, 전달력, 협력 능력(소프트 스킬)을 갖춰 비즈니스 가치를 만든다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 9 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 10, 2, s.id, 'multiple_choice', '빅데이터 분석에서 "가치 창출"에 필요한 관점으로 거리가 먼 것은?', '{"source_id":"adsp_exam4_p10","category":"데이터 사이언스와 전략 인사이트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["분석 결과를 실제 의사결정에 반영해야 한다","데이터가 많을수록 자동으로 가치가 커진다","전략적 통찰을 바탕으로 경쟁 우위를 확보해야 한다","데이터의 양보다 비즈니스 핵심에 대한 객관적 질문이 중요하다"]'::jsonb, 'hard', 1, TRUE, '10. 분석 대상의 확장', 46
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 10);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터의 양 자체가 가치를 보장하지 않는다. 비즈니스 핵심 가치에 집중하고 분석 결과를 실행에 옮겨야 가치가 생긴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 10 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 11, 3, s.id, 'multiple_choice', '데이터 분석 방법론이 생겨나는 일반적인 흐름으로 옳은 것은?', '{"source_id":"adsp_exam4_p11","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["암묵지 → 방법론 → 형식지","형식지 → 암묵지 → 방법론","암묵지 → 형식지 → 방법론","방법론 → 형식지 → 암묵지"]'::jsonb, 'medium', 1, TRUE, '11. 분석 방법론의 발전', 60
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 11);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '개인의 암묵지가 형식화(형식지)되고, 이것이 체계화·문서화되어 방법론이 된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 11 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 12, 3, s.id, 'multiple_choice', '반복을 통해 점진적으로 개발하며, 처음 시도하는 프로젝트에 적용하기 쉽지만 관리 체계를 갖추지 못하면 복잡도가 높아지는 방법론 모델은?', '{"source_id":"adsp_exam4_p12","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["프로토타입 모델","V 모델","폭포수 모델","나선형 모델"]'::jsonb, 'hard', 1, TRUE, '12. 나선형 모델', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 12);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '나선형 모델은 계획 → 위험 분석 → 개발 → 평가를 반복한다. 위험 관리에 강하지만 관리가 어렵다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 12 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 13, 3, s.id, 'multiple_choice', '빅데이터 분석 방법론의 "데이터 준비" 단계에서 수행하는 태스크가 아닌 것은?', '{"source_id":"adsp_exam4_p13","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["모델링 및 모델 평가","필요 데이터 정의","데이터 스토어 설계","데이터 수집 및 정합성 점검"]'::jsonb, 'medium', 1, TRUE, '13. 빅데이터 분석 방법론 - 데이터 준비', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 13);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '데이터 준비 단계는 필요 데이터 정의, 데이터 스토어 설계, 데이터 수집 및 정합성 점검으로 구성된다. 모델링은 데이터 분석 단계다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 13 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 14, 3, s.id, 'multiple_choice', '빅데이터 분석 방법론의 "데이터 분석" 단계 태스크를 순서대로 나열한 것은?', '{"source_id":"adsp_exam4_p14","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["모델링 → 분석용 데이터 준비 → 모델 평가 및 검증 → 탐색적 분석","텍스트 분석 → 모델링 → 탐색적 분석 → 모델 평가 및 검증","분석용 데이터 준비 → 텍스트 분석 → 탐색적 분석 → 모델링 → 모델 평가 및 검증 → 모델 적용 및 운영 방안 수립","탐색적 분석 → 분석용 데이터 준비 → 모델링 → 텍스트 분석 → 모델 평가 및 검증"]'::jsonb, 'medium', 1, TRUE, '14. 빅데이터 분석 방법론 - 데이터 분석', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 14);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '데이터 분석 단계는 분석용 데이터 준비, 텍스트 분석, 탐색적 분석, 모델링, 모델 평가 및 검증, 모델 적용 및 운영 방안 수립으로 진행된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 14 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 15, 3, s.id, 'multiple_choice', '하향식 접근법의 타당성 검토 단계에서 검토하는 항목의 연결로 옳은 것은?', '{"source_id":"adsp_exam4_p15","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["데이터 및 기술적 타당성 - 비용 대비 편익 분석","경제적 타당성 - 비용 대비 편익 분석","데이터 및 기술적 타당성 - 조직 문화 분석","경제적 타당성 - 데이터 존재 여부"]'::jsonb, 'hard', 1, TRUE, '15. 타당성 검토', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 15);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '경제적 타당성은 비용 대비 편익 분석, 데이터 및 기술적 타당성은 데이터 존재 여부, 분석 시스템 환경, 분석 역량을 검토한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 15 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 16, 4, s.id, 'multiple_choice', '분석 프로젝트 관리 지식 영역 중 "프로젝트 수행에 필요한 외부 자원(인력, 장비, 데이터 구매 등)을 확보하는 활동"에 해당하는 영역은?', '{"source_id":"adsp_exam4_p16","category":"데이터 분석 기획의 이해","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["품질(Quality)","의사소통(Communication)","범위(Scope)","조달(Procurement)"]'::jsonb, 'medium', 1, TRUE, '16. 프로젝트 관리 지식 영역', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 16);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '조달 관리는 외부 소싱(데이터 구매, 외주 등)을 계획하고 관리한다. 범위는 분석 기획 산출물과 범위 관리, 품질은 품질 보증·통제를 다룬다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 16 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 17, 4, s.id, 'multiple_choice', '분석 마스터 플랜에서 과제의 적용 범위와 방식을 결정할 때 고려하는 요소가 아닌 것은?', '{"source_id":"adsp_exam4_p17","category":"분석 마스터 플랜","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["비즈니스 성과 및 ROI","업무 내재화 적용 수준","분석 데이터 적용 수준","기술 적용 수준"]'::jsonb, 'medium', 1, TRUE, '17. 이행 계획 수립', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 17);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '적용 범위·방식은 업무 내재화, 분석 데이터, 기술 적용 수준으로 결정한다. 비즈니스 성과·ROI는 우선순위 고려 요소다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 17 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 18, 4, s.id, 'multiple_choice', '분석 조직 구조 중 각 현업 부서에 분석 전문 인력을 배치해 빠른 업무 적용이 가능하지만, 전사 차원의 우선순위 관리와 노하우 공유가 어려울 수 있는 구조는?', '{"source_id":"adsp_exam4_p18","category":"분석 마스터 플랜","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["중앙 통제형","집중형","기능 중심","분산형"]'::jsonb, 'hard', 1, TRUE, '18. 분석 조직 구조의 특징', 47
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 18);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '분산형 조직은 분석 인력이 현업 부서에 직접 배치되어 실무 적용이 빠르다. 다만 협업과 베스트 프랙티스 공유를 위한 체계가 필요하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 18 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 19, 4, s.id, 'multiple_choice', '빅데이터 거버넌스의 특징에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p19","category":"분석 마스터 플랜","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["데이터 최적화, 정보 보호, 데이터 생명주기 관리를 포함한다","빅데이터는 양이 많으므로 품질 관리를 하지 않는다","산업 분야별, 데이터 유형별 데이터 관리 기준을 정한다","ERD는 운영 중인 DB와 일치하도록 지속적으로 변경 관리해야 한다"]'::jsonb, 'medium', 1, TRUE, '19. 빅데이터 거버넌스', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 19);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '빅데이터도 데이터 품질 관리가 필요하며, 데이터 생명주기 관리와 정보 보호, 최적화가 거버넌스에 포함된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 19 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 20, 4, s.id, 'multiple_choice', '분석 교육 및 변화 관리에 대한 설명으로 가장 적절한 것은?', '{"source_id":"adsp_exam4_p20","category":"분석 마스터 플랜","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["변화 관리는 시스템 구축 후에는 필요 없다","분석 도구 사용법 교육만으로 충분하다","분석 기획자와 현업 사용자의 데이터 분석 역량과 분석 문화를 함께 키워야 한다","분석 조직만 교육하면 전사 확산이 저절로 일어난다"]'::jsonb, 'medium', 1, TRUE, '20. 분석 교육', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 20);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 교육은 도구 교육을 넘어 분석적 사고와 문화를 정착시키는 것이 목적이며, 경영층과 현업 사용자를 모두 대상으로 한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 20 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 21, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
m <- matrix(1:4, nrow = 2)
t(m)[1, 2]
```', '{"source_id":"adsp_exam4_p21","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["1","2","3","4"]'::jsonb, 'medium', 1, TRUE, '21. R 행렬 연산', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 21);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'm은 열 우선으로 [1 3; 2 4]다. t(m)은 전치 행렬 [1 2; 3 4]이므로 1행 2열 원소는 2다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 21 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 22, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
c(1, 2, 3, 4) + c(10, 20)
```', '{"source_id":"adsp_exam4_p22","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["11 22 13 24","11 22 33 44","11 22","오류가 발생한다"]'::jsonb, 'hard', 1, TRUE, '22. R 벡터 재활용 규칙', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 22);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '길이가 짧은 벡터가 반복(재활용)되어 c(10, 20, 10, 20)으로 계산된다. 결과는 11, 22, 13, 24다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 22 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 23, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
sapply(list(a = 1:3, b = 4:6), sum)
```', '{"source_id":"adsp_exam4_p23","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["21","a 1 2 3  b 4 5 6","a 6  b 15","a 3  b 3"]'::jsonb, 'medium', 1, TRUE, '23. R sapply 함수', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 23);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'sapply()는 리스트의 각 원소에 함수를 적용하고 결과를 벡터로 단순화한다. a는 6, b는 15다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 23 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 24, 5, s.id, 'multiple_choice', 'R plyr 패키지의 ddply() 함수에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam4_p24","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["리스트를 입력받아 배열로 반환한다","데이터를 긴 형태로 변환한다","SQL 문법으로 데이터를 조회한다","데이터 프레임을 입력받아 그룹별로 함수를 적용하고 데이터 프레임으로 반환한다"]'::jsonb, 'medium', 1, TRUE, '24. plyr 패키지', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 24);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'ddply의 첫 글자 d는 입력(data frame), 두 번째 d는 출력(data frame)을 뜻한다. 그룹별 요약에 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 24 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 25, 5, s.id, 'multiple_choice', '결측값 처리에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p25","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["다중 대치법은 한 번만 대치하므로 계산이 가장 간단하다","완전 응답 개체 분석은 결측값이 있는 개체를 삭제해 분석한다","평균 대치법은 표본 분산을 과소 추정한다","단순 확률 대치법은 평균 대치법보다 추정량 표준오차의 과소 추정 문제를 보완한다"]'::jsonb, 'hard', 1, TRUE, '25. 결측값 처리 방법 비교', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 25);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '다중 대치법은 여러 번 대치해 복수의 데이터셋을 만들고 분석 결과를 결합하므로 가장 정교하지만 계산이 복잡하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 25 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 26, 6, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
df <- data.frame(x = c(1, NA, 3), y = c("a", "b", NA))
nrow(na.omit(df))
```', '{"source_id":"adsp_exam4_p26","category":"R기초와 데이터 마트","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["0","1","2","3"]'::jsonb, 'medium', 1, TRUE, '26. R 결측 행 제거', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 26);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'na.omit()은 결측값이 하나라도 있는 행을 제거한다. 2행과 3행에 결측이 있으므로 1행만 남는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 26 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 27, 6, s.id, 'multiple_choice', '표본조사에서 발생하는 오차에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam4_p27","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["표본 편향은 랜덤 추출로 해결할 수 없다","표본오차는 표본 크기를 늘려도 줄지 않는다","비표본오차는 응답자의 거짓 응답, 측정 오류 등 표본추출 이외의 원인으로 생긴다","전수조사에서는 비표본오차가 발생하지 않는다"]'::jsonb, 'medium', 1, TRUE, '27. 표본오차와 비표본오차', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 27);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '비표본오차는 조사 설계, 측정, 응답 과정의 오류로 생기며 전수조사에서도 발생한다. 표본오차는 표본 크기를 늘리면 줄어든다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 27 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 28, 6, s.id, 'multiple_choice', '어떤 질병의 유병률은 1%이고, 검사의 민감도는 90%, 위양성률(건강한 사람이 양성 판정 받을 확률)은 10%다. 양성 판정을 받은 사람이 실제 환자일 확률에 가장 가까운 값은?', '{"source_id":"adsp_exam4_p28","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["약 8.3%","약 50%","약 90%","약 10%"]'::jsonb, 'hard', 1, TRUE, '28. 조건부 확률', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 28);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '베이즈 정리로 P(환자|양성) = 0.01×0.9 / (0.01×0.9 + 0.99×0.1) = 0.009 / 0.108 ≈ 0.083 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 28 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 29, 6, s.id, 'multiple_choice', '확률변수 X의 기댓값이 5, 분산이 4일 때 Y = 2X + 3의 기댓값과 분산은?', '{"source_id":"adsp_exam4_p29","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["E(Y) = 13, Var(Y) = 8","E(Y) = 10, Var(Y) = 11","E(Y) = 13, Var(Y) = 11","E(Y) = 13, Var(Y) = 16"]'::jsonb, 'medium', 1, TRUE, '29. 기댓값과 분산', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 29);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'E(aX + b) = aE(X) + b = 13, Var(aX + b) = a²Var(X) = 4 × 4 = 16 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 29 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 30, 6, s.id, 'multiple_choice', '카이제곱 분포를 이용하는 검정이 아닌 것은?', '{"source_id":"adsp_exam4_p30","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["적합도 검정","독립성 검정","동질성 검정","두 모평균 차이 검정"]'::jsonb, 'medium', 1, TRUE, '30. 카이제곱 분포', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 30);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '카이제곱 분포는 범주형 자료의 적합도·독립성·동질성 검정과 모분산 검정에 쓴다. 두 모평균 차이는 t-검정을 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 30 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 31, 7, s.id, 'multiple_choice', '"신제품의 평균 수명은 기존 제품의 1,000시간보다 길다"를 주장하려 할 때 귀무가설과 대립가설로 옳은 것은?', '{"source_id":"adsp_exam4_p31","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["H0: μ = 1000, H1: μ ≠ 1000","H0: μ = 1000, H1: μ > 1000","H0: μ > 1000, H1: μ = 1000","H0: μ < 1000, H1: μ = 1000"]'::jsonb, 'hard', 1, TRUE, '31. 단측 검정', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 31);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '입증하고 싶은 주장을 대립가설로 둔다. 길다는 주장이므로 우측 단측 검정 H1: μ > 1000 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 31 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 32, 7, s.id, 'multiple_choice', '다음 R 출력에 대한 해석으로 옳은 것은?

```r
	Pearson''s product-moment correlation

data:  x and y
t = 8.24, df = 48, p-value = 9.6e-11
alternative hypothesis: true correlation is not equal to 0
95 percent confidence interval:
 0.6248 0.8638
sample estimates:
      cor
0.7652
```', '{"source_id":"adsp_exam4_p32","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["표본 크기는 48이다","상관계수의 95% 신뢰구간이 0을 포함한다","상관계수는 0.7652로 강한 양의 선형 관계가 있다","유의수준 0.05에서 상관관계가 유의하지 않다"]'::jsonb, 'medium', 1, TRUE, '32. 상관분석 결과 해석', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 32);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '상관계수 0.7652, p-value가 매우 작아 유의하며 신뢰구간도 0을 포함하지 않는다. 자유도 48 = n - 2이므로 n = 50이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 32 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 33, 7, s.id, 'multiple_choice', '회귀계수 β의 추정값이 3.0, 표준오차가 0.5, 해당 자유도의 t 임계값이 2.0일 때 β의 95% 신뢰구간은?', '{"source_id":"adsp_exam4_p33","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["(2.0, 4.0)","(1.0, 5.0)","(2.75, 3.25)","(2.5, 3.5)"]'::jsonb, 'hard', 1, TRUE, '33. 회귀계수의 신뢰구간', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 33);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '신뢰구간 = 추정값 ± t 임계값 × 표준오차 = 3.0 ± 2.0 × 0.5 = (2.0, 4.0) 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 33 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 34, 7, s.id, 'multiple_choice', '잔차의 정규성을 확인하는 방법으로 거리가 먼 것은?', '{"source_id":"adsp_exam4_p34","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["히스토그램","Durbin-Watson 검정","Q-Q plot","Shapiro-Wilk 검정"]'::jsonb, 'medium', 1, TRUE, '34. 정규성 검정', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 34);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'Durbin-Watson 검정은 잔차의 자기상관(독립성)을 확인한다. 정규성은 Q-Q plot, Shapiro-Wilk 검정, 히스토그램 등으로 확인한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 34 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 35, 7, s.id, 'multiple_choice', '회귀모형 선택에 쓰는 AIC와 BIC에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam4_p35","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["두 지표는 항상 같은 모형을 선택한다","값이 클수록 좋은 모형이다","BIC는 AIC보다 변수 수에 대한 벌점이 커서 더 단순한 모형을 선호한다","AIC는 변수 수와 관계없이 적합도만 반영한다"]'::jsonb, 'hard', 1, TRUE, '35. 정보 기준', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 35);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'AIC와 BIC는 작을수록 좋다. BIC는 벌점 항에 log(n)을 써서 표본이 클수록 AIC보다 단순한 모형을 고른다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 35 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 36, 8, s.id, 'multiple_choice', '회귀계수의 절댓값 합에 벌점을 주어 일부 계수를 정확히 0으로 만들어 변수 선택 효과가 있는 회귀는?', '{"source_id":"adsp_exam4_p36","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["단순선형회귀","로지스틱 회귀","릿지(Ridge) 회귀","라쏘(Lasso) 회귀"]'::jsonb, 'medium', 1, TRUE, '36. 라쏘와 릿지', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 36);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '라쏘는 L1 벌점으로 계수를 0으로 만들 수 있다. 릿지는 L2 벌점으로 계수를 0에 가깝게 줄이지만 0으로 만들지는 않는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 36 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 37, 8, s.id, 'multiple_choice', '다음 주성분분석 적재값(loadings)에서 PC1에 대한 해석으로 가장 적절한 것은?

```r
            PC1    PC2
Murder    -0.536  0.418
Assault   -0.583  0.188
UrbanPop  -0.278 -0.873
Rape      -0.543 -0.167
```', '{"source_id":"adsp_exam4_p37","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["세 범죄 변수(Murder, Assault, Rape)가 비슷하게 큰 적재값을 가져 전반적인 범죄 수준을 나타낸다","살인만을 나타내는 성분이다","범죄와 도시 인구가 반대 방향임을 나타낸다","도시 인구 비율을 주로 나타낸다"]'::jsonb, 'hard', 1, TRUE, '37. 주성분 적재값 해석', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 37);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'PC1에서 세 범죄 변수의 적재값이 비슷하게 크므로 전반적인 범죄율을 대표하는 성분이다. PC2는 UrbanPop의 적재값이 커서 도시화 정도를 나타낸다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 37 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 38, 8, s.id, 'multiple_choice', 'MA(1) 모형의 자기상관함수(ACF)의 특징으로 옳은 것은?', '{"source_id":"adsp_exam4_p38","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["모든 시차에서 1이다","사인 곡선 형태로 감소한다","시차 1에서만 유의하고 시차 2부터 0에 가깝다","지수적으로 서서히 감소한다"]'::jsonb, 'medium', 1, TRUE, '38. 이동평균 모형', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 38);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'MA(q) 모형의 ACF는 시차 q+1부터 절단된다. MA(1)은 시차 1에서만 유의하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 38 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 39, 8, s.id, 'multiple_choice', '최근 관측치에 더 큰 가중치를 주고 과거로 갈수록 가중치를 지수적으로 줄여 예측하는 시계열 방법은?', '{"source_id":"adsp_exam4_p39","category":"통계분석","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["단순 이동평균법","지수평활법","시계열 분해법","회귀분석"]'::jsonb, 'medium', 1, TRUE, '39. 지수평활법', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 39);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '지수평활법은 평활 상수 α로 최근 값에 높은 가중치를 준다. 단순 이동평균은 일정 기간의 값을 같은 가중치로 평균한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 39 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 40, 8, s.id, 'multiple_choice', '데이터 마이닝 추진 단계로 옳은 것은?', '{"source_id":"adsp_exam4_p40","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["데이터 준비 → 목적 설정 → 기법 적용 → 가공 → 검증","기법 적용 → 목적 설정 → 데이터 준비 → 검증 → 가공","목적 설정 → 기법 적용 → 데이터 준비 → 가공 → 검증","목적 설정 → 데이터 준비 → 가공 → 기법 적용 → 검증"]'::jsonb, 'medium', 1, TRUE, '40. 데이터 마이닝 추진 단계', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 40);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '데이터 마이닝은 목적 설정 → 데이터 준비 → 데이터 가공 → 기법 적용 → 검증 순서로 진행한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 40 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 41, 9, s.id, 'multiple_choice', '목표변수의 클래스 비율이 99:1처럼 크게 불균형할 때의 대응 방법으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p41","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["정확도(Accuracy)만으로 모델을 평가한다","소수 클래스를 과대표집(oversampling)한다","다수 클래스를 과소표집(undersampling)한다","SMOTE로 소수 클래스의 합성 데이터를 만든다"]'::jsonb, 'hard', 1, TRUE, '41. 불균형 데이터', 43
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 41);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '불균형 데이터에서는 모두 다수 클래스로 예측해도 정확도가 99%가 되므로 정확도만으로 평가하면 안 된다. 재현율, F1, AUC 등을 함께 본다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 41 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 42, 9, s.id, 'multiple_choice', '어떤 노드에 두 클래스가 각각 50%씩 있을 때 엔트로피(로그 밑 2)는?', '{"source_id":"adsp_exam4_p42","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["0","0.5","1","2"]'::jsonb, 'medium', 1, TRUE, '42. 엔트로피 계산', 57
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 42);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '엔트로피 = -Σp log₂p = -(0.5×log₂0.5 + 0.5×log₂0.5) = 1 로, 불순도가 최대다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 42 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 43, 9, s.id, 'multiple_choice', '의사결정나무의 특징으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p43","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["수치형과 범주형 변수를 모두 다룰 수 있다","분류 경계가 매끄러워 선형 관계를 정확히 표현한다","결과를 해석하고 설명하기 쉽다","변수 간 상호작용을 자연스럽게 반영한다"]'::jsonb, 'medium', 1, TRUE, '43. 의사결정나무의 장단점', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 43);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '의사결정나무는 축에 평행한 계단식 경계를 만들어 선형 관계나 연속적인 변화를 표현하는 데 약하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 43 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 44, 9, s.id, 'multiple_choice', '은닉층이 많은 신경망에서 역전파 과정 중 기울기가 점점 작아져 앞쪽 층의 가중치가 거의 갱신되지 않는 현상은?', '{"source_id":"adsp_exam4_p44","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["다중공선성","지역 최적해","과대적합","기울기 소실(Vanishing Gradient)"]'::jsonb, 'hard', 1, TRUE, '44. 인공신경망의 학습 문제', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 44);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '시그모이드처럼 기울기가 작은 활성화 함수를 여러 층 거치면 기울기가 소실된다. ReLU 등으로 완화한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 44 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 45, 9, s.id, 'multiple_choice', 'K-최근접 이웃(KNN) 분류에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam4_p45","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["학습 단계에서 복잡한 모형 파라미터를 추정한다","새 관측치와 가까운 K개 이웃의 다수결로 클래스를 정한다","변수의 척도에 영향을 받으므로 표준화가 필요하다","K가 너무 작으면 과대적합되기 쉽다"]'::jsonb, 'medium', 1, TRUE, '45. KNN', 56
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 45);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'KNN은 별도의 모형을 학습하지 않는 게으른 학습(lazy learning)으로, 예측 시점에 거리를 계산한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 45 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 46, 10, s.id, 'multiple_choice', '두 분류 모형 A, B의 AUC가 각각 0.92, 0.71일 때의 해석으로 옳은 것은?', '{"source_id":"adsp_exam4_p46","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["B가 A보다 판별력이 좋다","A가 B보다 판별력이 좋다","두 모형 모두 랜덤 분류보다 못하다","AUC로는 모형을 비교할 수 없다"]'::jsonb, 'hard', 1, TRUE, '46. ROC 곡선 해석', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 46);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'AUC는 1에 가까울수록 판별력이 좋다. 0.9 이상은 매우 우수, 0.5는 랜덤 수준이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 46 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 47, 10, s.id, 'multiple_choice', '집합 A = {사과, 배, 포도}, B = {배, 포도, 귤, 감}의 자카드 유사도는?', '{"source_id":"adsp_exam4_p47","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["0.2","0.4","0.5","0.67"]'::jsonb, 'medium', 1, TRUE, '47. 자카드 유사도', 59
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 47);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '자카드 유사도 = |A∩B| / |A∪B| = 2 / 5 = 0.4 다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 47 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 48, 10, s.id, 'multiple_choice', '데이터가 여러 개의 확률분포(예: 정규분포)의 혼합에서 생성되었다고 보고, EM 알고리즘으로 모수를 추정하는 군집 방법은?', '{"source_id":"adsp_exam4_p48","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["DBSCAN","계층적 군집","K-평균 군집","혼합 분포 군집"]'::jsonb, 'hard', 1, TRUE, '48. 혼합 분포 군집', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 48);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '혼합 분포 군집은 E 단계에서 각 관측치의 소속 확률을, M 단계에서 분포의 모수를 반복 추정한다. 군집 크기가 너무 작으면 추정이 어렵다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 48 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 49, 10, s.id, 'multiple_choice', '고차원 데이터를 2차원 격자의 뉴런에 대응시켜 시각적으로 군집을 이해하기 쉽게 하는 비지도 신경망 모델은?', '{"source_id":"adsp_exam4_p49","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["순환 신경망","서포트 벡터 머신","자기조직화지도(SOM)","다층 퍼셉트론"]'::jsonb, 'medium', 1, TRUE, '49. SOM', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 49);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'SOM은 입력층과 경쟁층으로 구성되며 승자 독식 방식으로 학습해 입력 공간의 위상을 보존한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 49 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 50, 10, s.id, 'multiple_choice', '규칙 A → B의 신뢰도가 0.8로 높지만 향상도가 0.9일 때의 해석으로 옳은 것은?', '{"source_id":"adsp_exam4_p50","category":"정형 데이터 마이닝","points":2,"round":4,"avg_difficulty":"medium"}'::jsonb, '["지지도가 반드시 0.8이다","A를 구매하면 B를 구매할 가능성이 크게 높아진다","B는 원래 많이 팔리는 상품이며, A를 사는 것이 B 구매를 높여주지는 않는다","A와 B는 강한 양의 관계다"]'::jsonb, 'hard', 1, TRUE, '50. 연관규칙 평가', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_4' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 50);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '향상도가 1보다 작으면 A 구매가 B 구매 확률을 높이지 않는다. 신뢰도가 높은 것은 B 자체의 구매 비율이 높기 때문일 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_4' AND x.question_no = 50 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);

-- ===== ADsP 모의고사 5회 (adsp_mock_5) =====
INSERT INTO exam.exams (exam_code, title, total_question_count, total_page_count, duration_seconds, is_active)
SELECT 'adsp_mock_5', 'ADsP 모의고사 5회', 50, 10, 5400, TRUE
WHERE NOT EXISTS (SELECT 1 FROM exam.exams WHERE exam_code = 'adsp_mock_5');

INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 이해', 40, 1 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 1);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석 기획', 40, 2 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 2);
INSERT INTO exam.subjects (exam_id, name, pass_threshold_percent, display_order)
SELECT e.id, '데이터 분석', 40, 3 FROM exam.exams e
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.subjects s WHERE s.exam_id = e.id AND s.display_order = 3);

INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 1, 1, s.id, 'multiple_choice', '숙련 기술자의 노하우를 매뉴얼로 문서화하는 활동은 SECI 모델의 어느 단계에 해당하는가?', '{"source_id":"adsp_exam5_p1","category":"데이터의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["표출화","연결화","내면화","공통화"]'::jsonb, 'hard', 1, TRUE, '1. 지식 전환 사례', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 1);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '개인의 암묵지(노하우)를 문서 같은 형식지로 바꾸는 것은 표출화다. 문서들을 결합해 새 지식을 만드는 것은 연결화다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 1 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 2, 1, s.id, 'multiple_choice', '데이터베이스를 "소재를 체계적으로 배열 또는 구성한 편집물로서 개별적으로 그 소재에 접근하거나 검색할 수 있도록 한 것"으로 정의하고, 데이터베이스 제작자의 권리를 보호하는 법률은?', '{"source_id":"adsp_exam5_p2","category":"데이터의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["전자정부법","정보통신망법","저작권법","개인정보 보호법"]'::jsonb, 'hard', 1, TRUE, '2. 데이터베이스 정의의 관점', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 2);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '저작권법은 데이터베이스를 위와 같이 정의하고, 상당한 투자를 한 데이터베이스 제작자의 권리를 보호한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 2 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 3, 1, s.id, 'multiple_choice', '데이터 웨어하우스(DW)에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p3","category":"데이터의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["과거부터 현재까지의 이력 데이터를 보관한다","일상적인 주문·결제 같은 트랜잭션을 실시간으로 처리하는 것이 주목적이다","여러 원천 시스템의 데이터를 ETL로 추출·변환·적재한다","주제별로 정리되어 의사결정을 지원한다"]'::jsonb, 'hard', 1, TRUE, '3. DW와 데이터 마트', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 3);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '실시간 트랜잭션 처리는 OLTP 시스템의 역할이다. DW는 분석과 의사결정 지원이 목적이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 3 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 4, 1, s.id, 'multiple_choice', '사물인터넷(IoT) 시대 데이터의 특징으로 가장 적절한 것은?', '{"source_id":"adsp_exam5_p4","category":"데이터의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["데이터 생성 속도가 매우 느리다","데이터 형식이 하나로 통일되어 있다","사람이 직접 입력한 정형 데이터가 대부분이다","센서 등 기기에서 실시간으로 대량의 데이터가 생성된다"]'::jsonb, 'medium', 1, TRUE, '4. 사물인터넷과 데이터', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 4);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'IoT 환경에서는 수많은 센서가 실시간으로 데이터를 생성하므로 규모와 속도, 다양성이 모두 커진다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 4 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 5, 1, s.id, 'multiple_choice', '빅데이터를 "렌즈"에 비유하는 의미로 가장 적절한 것은?', '{"source_id":"adsp_exam5_p5","category":"데이터의 가치와 미래","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["현미경이 생물학 발전에 미친 영향처럼 데이터가 산업 발전에 큰 영향을 미칠 것이라는 의미","여러 서비스가 공동으로 활용하는 기반이라는 의미","데이터를 가공하지 않아도 가치가 생긴다는 의미","데이터가 고갈되지 않는 자원이라는 의미"]'::jsonb, 'hard', 1, TRUE, '5. 빅데이터 비유와 의미', 44
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 5);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '렌즈 비유는 현미경이 생물학을 발전시켰듯 데이터가 산업 발전에 영향을 준다는 뜻이다. 구글 Ngram Viewer가 대표 사례다. 공동 활용 기반은 플랫폼 비유다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 5 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 6, 2, s.id, 'multiple_choice', '데이터 산업의 진화 단계를 순서대로 나열한 것은?', '{"source_id":"adsp_exam5_p6","category":"데이터의 가치와 미래","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["데이터 통합 → 데이터 처리 → 데이터 연결 → 데이터 분석 → 데이터 권리","데이터 처리 → 데이터 분석 → 데이터 통합 → 데이터 권리 → 데이터 연결","데이터 권리 → 데이터 처리 → 데이터 통합 → 데이터 분석 → 데이터 연결","데이터 처리 → 데이터 통합 → 데이터 분석 → 데이터 연결 → 데이터 권리"]'::jsonb, 'hard', 1, TRUE, '6. 데이터 산업의 진화', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 6);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '데이터 산업은 처리 → 통합 → 분석 → 연결 → 권리 시대로 진화해 왔다. 권리 시대에는 개인이 자신의 데이터를 관리·활용하는 마이데이터가 등장한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 6 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 7, 2, s.id, 'multiple_choice', '"사용자의 만족도가 충성도에 어떤 영향을 미치는가?"처럼 독립변수의 변화가 종속변수에 미치는 영향을 파악하는 테크닉은?', '{"source_id":"adsp_exam5_p7","category":"데이터의 가치와 미래","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["감정 분석","회귀분석","연관규칙 학습","유형 분석"]'::jsonb, 'medium', 1, TRUE, '7. 빅데이터 활용 기본 테크닉 - 회귀분석', 65
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 7);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '회귀분석은 독립변수를 조작할 때 종속변수가 어떻게 변하는지 보며 두 변인의 관계를 파악한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 7 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 8, 2, s.id, 'multiple_choice', '빅데이터 위기 요인과 통제 방안의 연결로 옳은 것은?', '{"source_id":"adsp_exam5_p8","category":"데이터의 가치와 미래","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["책임 원칙 훼손 - 동의제에서 책임제로 전환","데이터 오용 - 결과 기반 책임 원칙 고수","사생활 침해 - 동의제에서 책임제로 전환","사생활 침해 - 알고리즈미스트"]'::jsonb, 'hard', 1, TRUE, '8. 빅데이터 위기 요인 종합', 43
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 8);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '사생활 침해는 책임제 전환, 책임 원칙 훼손은 결과 기반 책임 원칙 고수, 데이터 오용은 알고리즘 접근 허용과 알고리즈미스트로 통제한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 8 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 9, 2, s.id, 'multiple_choice', '빅데이터 분석 과제의 실패 원인으로 가장 거리가 먼 것은?', '{"source_id":"adsp_exam5_p9","category":"데이터 사이언스와 전략 인사이트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["분석 결과를 시각화와 스토리텔링으로 전달함","분석 목표가 비즈니스 핵심 가치와 연결되지 않음","데이터의 양에만 집착함","분석 결과를 의사결정에 반영할 체계가 없음"]'::jsonb, 'hard', 1, TRUE, '9. 빅데이터 분석의 함정', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 9);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '시각화와 스토리텔링을 통한 전달은 성공 요인이다. 실패는 목표 부재, 양에 대한 집착, 실행 체계 부재에서 온다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 9 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 10, 2, s.id, 'multiple_choice', '데이터 사이언스와 기존 통계학·데이터 마이닝의 차이로 가장 적절한 것은?', '{"source_id":"adsp_exam5_p10","category":"데이터 사이언스와 전략 인사이트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["데이터 사이언스는 정형 데이터만 다룬다","데이터 사이언스는 정형·비정형을 아우르며 분석뿐 아니라 이를 효과적으로 전달하는 과정까지 포함한다","데이터 사이언스는 통계적 방법을 사용하지 않는다","데이터 사이언스는 IT 기술과 무관하다"]'::jsonb, 'medium', 1, TRUE, '10. 데이터 사이언스와 통계학', 64
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 1
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 10);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터 사이언스는 정형·비정형 데이터를 모두 다루고, 분석 결과를 비즈니스 가치로 전달하는 과정까지 포함하는 더 넓은 개념이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 10 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 11, 3, s.id, 'multiple_choice', '"고객 이탈이 문제라는 것은 알지만 원인과 분석 방법을 모두 모르는 상황"에서 데이터를 탐색하며 새로운 문제를 찾는 분석 유형은?', '{"source_id":"adsp_exam5_p11","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["솔루션","통찰","발견","최적화"]'::jsonb, 'hard', 1, TRUE, '11. 분석 주제 유형 사례', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 11);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 대상과 방법을 모두 모르는 경우는 발견(Discovery)이다. 이때는 상향식 접근으로 데이터를 탐색한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 11 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 12, 3, s.id, 'multiple_choice', '프로토타이핑 접근법이 필요한 상황으로 거리가 먼 것은?', '{"source_id":"adsp_exam5_p12","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["문제에 대한 인식 수준이 낮다","필요한 데이터가 존재하는지 불확실하다","데이터 사용 목적이 가변적이다","분석 대상과 해결 방법이 명확히 정의되어 있다"]'::jsonb, 'hard', 1, TRUE, '12. 프로토타이핑 접근법', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 12);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '프로토타이핑은 문제 인식이 낮고, 데이터 존재가 불확실하며, 목적이 변할 수 있을 때 빠르게 시도하며 개선하는 방식이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 12 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 13, 3, s.id, 'multiple_choice', 'KDD와 CRISP-DM 단계의 대응으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p13","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["KDD 결과 평가 - CRISP-DM 데이터 이해","KDD 데이터셋 선택 - CRISP-DM 업무 이해·데이터 이해","KDD 데이터 전처리·변환 - CRISP-DM 데이터 준비","KDD 데이터 마이닝 - CRISP-DM 모델링"]'::jsonb, 'hard', 1, TRUE, '13. KDD와 CRISP-DM 비교', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 13);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'KDD의 결과 평가는 CRISP-DM의 평가 단계에 대응한다. CRISP-DM의 전개 단계는 KDD에 대응하는 단계가 없다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 13 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 14, 3, s.id, 'multiple_choice', '빅데이터 분석 방법론의 "평가 및 전개" 단계에서 수행하는 태스크는?', '{"source_id":"adsp_exam5_p14","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["탐색적 분석","프로젝트 위험 계획 수립","모델 발전 계획 수립과 프로젝트 평가 보고","데이터 스토어 설계"]'::jsonb, 'hard', 1, TRUE, '14. 빅데이터 분석 방법론 - 평가 및 전개', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 14);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '평가 및 전개 단계는 모델 발전 계획 수립, 프로젝트 평가 및 보고로 구성된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 14 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 15, 3, s.id, 'multiple_choice', '분석 과제 정의서에 포함할 내용으로 거리가 먼 것은?', '{"source_id":"adsp_exam5_p15","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["상세 분석 과정과 검증 오너십","분석 담당자의 개인 평가 점수","필요 데이터와 데이터 입수 난이도","분석 방법과 분석 수행 주기"]'::jsonb, 'medium', 1, TRUE, '15. 분석 과제 정의서', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 15);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '분석 과제 정의서에는 데이터 소스, 분석 방법, 수행 주기, 상세 분석 과정, 검증 오너십 등이 들어간다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 15 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 16, 4, s.id, 'multiple_choice', '분석 과제의 Accuracy와 Precision에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam5_p16","category":"데이터 분석 기획의 이해","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["두 지표는 항상 같이 증가한다","Accuracy는 모형을 반복 사용했을 때 결과가 일관되게 나오는 정도다","Precision은 모형과 실제 값의 차이가 적은 정도다","활용 측면에서는 Accuracy가, 안정성 측면에서는 Precision이 중요하다"]'::jsonb, 'hard', 1, TRUE, '16. 분석 과제 관리 속성 - 정확도와 정밀도', 44
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 16);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'Accuracy는 실제 값과의 차이가 적은 정도(활용 측면), Precision은 반복 시 결과의 일관성(안정성 측면)이다. 둘은 트레이드오프 관계인 경우가 많다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 16 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 17, 4, s.id, 'multiple_choice', '포트폴리오 사분면 분석에서 "난이도"를 우선 기준으로 할 때 추진 순서는? (1사분면: 현재·어려움, 2사분면: 미래·어려움, 3사분면: 현재·쉬움, 4사분면: 미래·쉬움)', '{"source_id":"adsp_exam5_p17","category":"분석 마스터 플랜","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["3 → 1 → 2","1 → 3 → 4","4 → 3 → 1","3 → 4 → 2"]'::jsonb, 'hard', 1, TRUE, '17. 포트폴리오 사분면 - 난이도 우선', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 17);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '난이도를 우선하면 쉬운 과제를 먼저 하되 현재 시급한 순으로 3 → 1 → 2 순이다. 시급성 우선이면 3 → 4 → 2 순이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 17 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 18, 4, s.id, 'multiple_choice', '분석 성숙도 단계 중 "전사 차원에서 분석을 관리하고 공유하며, 분석 전문 조직과 빅데이터 관리 환경을 갖춘" 단계는?', '{"source_id":"adsp_exam5_p18","category":"분석 마스터 플랜","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["최적화 단계","도입 단계","활용 단계","확산 단계"]'::jsonb, 'hard', 1, TRUE, '18. 분석 성숙도 - 확산 단계', 47
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 18);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '확산 단계는 전사 분석을 관리·공유하고 분석 COE 조직, 빅데이터 관리 환경을 갖춘다. 최적화 단계는 분석을 혁신과 성과 향상에 기여하는 수준이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 18 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 19, 4, s.id, 'multiple_choice', '데이터 거버넌스 체계 중 메타데이터와 표준 데이터를 관리하기 위한 전사 차원의 저장소를 구성하고, 데이터 관리 워크플로와 관리용 응용 소프트웨어를 지원하는 영역은?', '{"source_id":"adsp_exam5_p19","category":"분석 마스터 플랜","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["데이터 관리 체계","데이터 저장소 관리","표준화 활동","데이터 표준화"]'::jsonb, 'medium', 1, TRUE, '19. 데이터 저장소 관리', 61
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 19);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '데이터 저장소 관리는 메타데이터·표준 데이터 저장소를 구성하고 워크플로와 응용 소프트웨어를 지원한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 19 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 20, 4, s.id, 'multiple_choice', '분석 준비도(Readiness) 진단 영역으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p20","category":"분석 마스터 플랜","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["인력 및 조직","분석 데이터와 분석 인프라","경쟁사의 분석 예산","분석 업무 파악"]'::jsonb, 'hard', 1, TRUE, '20. 분석 준비도 진단 영역', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 2
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 20);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '분석 준비도는 분석 업무 파악, 인력 및 조직, 분석 기법, 분석 데이터, 분석 문화, IT 인프라의 6개 영역으로 진단한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 20 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 21, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
f <- function(x, y = 2) {
  x ^ y
}
f(3) + f(2, 3)
```', '{"source_id":"adsp_exam5_p21","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["13","17","9","72"]'::jsonb, 'hard', 1, TRUE, '21. R 함수 정의', 46
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 21);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'f(3)은 기본값 y = 2로 3² = 9, f(2, 3)은 2³ = 8 이다. 합은 17 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 21 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 22, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과로 만들어지는 데이터 프레임의 행 수는?

```r
a <- data.frame(id = c(1, 2, 3), x = c("p", "q", "r"))
b <- data.frame(id = c(2, 3, 4), y = c(10, 20, 30))
nrow(merge(a, b, by = "id"))
```', '{"source_id":"adsp_exam5_p22","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["1","2","3","4"]'::jsonb, 'hard', 1, TRUE, '22. R 데이터 프레임 병합', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 22);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'merge()의 기본값은 공통 키만 남기는 내부 조인이다. id 2와 3만 양쪽에 있으므로 2행이다. all = TRUE를 쓰면 외부 조인이 된다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 22 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 23, 5, s.id, 'multiple_choice', 'R data.table 패키지에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p23","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["DT[i, j, by] 형식으로 행 선택, 열 연산, 그룹화를 한 번에 표현한다","키(key)를 설정하면 이진 탐색으로 빠르게 조회할 수 있다","data.frame과 전혀 호환되지 않아 변환이 불가능하다","data.frame보다 대용량 데이터 처리 속도가 빠르다"]'::jsonb, 'hard', 1, TRUE, '23. data.table', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 23);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'data.table은 data.frame을 상속하므로 대부분의 data.frame 함수와 호환되며 서로 변환할 수 있다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 23 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 24, 5, s.id, 'multiple_choice', '이상값 처리에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p24","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["이상값이 항상 오류는 아니므로 원인을 먼저 파악한다","극단값을 일정 값으로 바꾸는 절단(trimming)·조정(winsorizing) 방법이 있다","부정 사용 탐지처럼 이상값 자체가 분석 목적인 경우도 있다","이상값은 발견 즉시 모두 삭제해야 한다"]'::jsonb, 'medium', 1, TRUE, '24. 이상값 처리', 63
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 24);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '이상값은 입력 오류일 수도, 의미 있는 극단값일 수도 있다. 분석 목적과 원인에 따라 삭제·대체·유지를 결정한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 24 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 25, 5, s.id, 'multiple_choice', '다음 R 코드의 실행 결과는?

```r
x <- c("a", "b", "a", "c", "a", "b")
table(x)["a"]
```', '{"source_id":"adsp_exam5_p25","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["a 3","a 6","a 1","a 2"]'::jsonb, 'hard', 1, TRUE, '25. R 빈도표', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 25);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'table()은 각 값의 빈도를 센다. "a"는 3번 나온다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 25 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 26, 6, s.id, 'multiple_choice', '변수의 척도를 맞추기 위해 (x - 평균) / 표준편차로 변환하는 방법은?', '{"source_id":"adsp_exam5_p26","category":"R기초와 데이터 마트","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["이산화","정규화(min-max)","표준화(z-score)","로그 변환"]'::jsonb, 'medium', 1, TRUE, '26. 데이터 변환', 66
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 26);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '표준화는 평균 0, 표준편차 1로 변환한다. min-max 정규화는 (x - 최솟값) / (최댓값 - 최솟값)으로 0~1 범위로 변환한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 26 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 27, 6, s.id, 'multiple_choice', '좋은 추정량이 갖추어야 할 조건으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p27","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["편향성: 추정량의 기댓값이 모수와 일정하게 차이 난다","불편성: 추정량의 기댓값이 모수와 같다","효율성: 분산이 작다","일치성: 표본 크기가 커질수록 모수에 가까워진다"]'::jsonb, 'hard', 1, TRUE, '27. 추정량의 성질', 44
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 27);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '좋은 추정량은 불편성, 효율성, 일치성, 충족성을 갖춘다. 편향은 작을수록 좋다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 27 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 28, 6, s.id, 'multiple_choice', '하루 평균 2건의 민원이 접수되는 포아송분포에서, 하루에 민원이 한 건도 없을 확률은? (e⁻² ≈ 0.135)', '{"source_id":"adsp_exam5_p28","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["약 0.135","약 0.271","약 0.5","약 0.865"]'::jsonb, 'hard', 1, TRUE, '28. 포아송분포 계산', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 28);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', 'P(X = 0) = e^(-λ) λ⁰ / 0! = e⁻² ≈ 0.135 다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 28 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 29, 6, s.id, 'multiple_choice', '모표준편차가 10인 모집단에서 크기 100인 표본의 평균이 52였다. H0: μ = 50을 검정할 때 Z 통계량은?', '{"source_id":"adsp_exam5_p29","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["0.2","1.0","2.0","20"]'::jsonb, 'hard', 1, TRUE, '29. 검정 통계량 계산', 47
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 29);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'Z = (표본평균 - μ0) / (σ / √n) = (52 - 50) / (10 / 10) = 2.0 이다. 유의수준 0.05의 양측 임계값 1.96보다 크므로 귀무가설을 기각한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 29 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 30, 6, s.id, 'multiple_choice', '표본 크기가 고정되어 있을 때 유의수준 α를 0.05에서 0.01로 낮추면 나타나는 변화로 옳은 것은?', '{"source_id":"adsp_exam5_p30","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["제1종 오류는 커지고 제2종 오류는 줄어든다","검정력이 커진다","제1종 오류와 제2종 오류가 모두 줄어든다","제1종 오류는 줄고 제2종 오류는 커진다"]'::jsonb, 'hard', 1, TRUE, '30. 유의수준과 오류의 관계', 43
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 30);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '표본 크기가 고정되면 α를 낮출수록 귀무가설을 덜 기각하므로 β(제2종 오류)는 커지고 검정력(1-β)은 작아진다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 30 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 31, 7, s.id, 'multiple_choice', '다음 R 분산분석 결과의 해석으로 옳은 것은?

```r
            Df Sum Sq Mean Sq F value  Pr(>F)
group        2  120.0   60.00    7.50 0.00141
Residuals   45  360.0    8.00
```', '{"source_id":"adsp_exam5_p31","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["집단은 2개다","유의수준 0.05에서 적어도 한 집단의 평균은 다르다","모든 집단 쌍의 평균이 다르다는 것이 증명되었다","전체 관측치 수는 47개다"]'::jsonb, 'hard', 1, TRUE, '31. 분산분석 결과 해석', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 31);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', 'group 자유도 2 = 집단 수 - 1이므로 집단은 3개, 전체 자유도 47 = n - 1이므로 관측치는 48개다. p-value가 작아 평균이 모두 같지는 않다. 어느 쌍이 다른지는 사후검정(Tukey 등)으로 확인한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 31 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 32, 7, s.id, 'multiple_choice', '회귀분석에서 총제곱합(SST)이 200, 잔차제곱합(SSE)이 50일 때 결정계수는?', '{"source_id":"adsp_exam5_p32","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["0.25","0.5","0.75","4"]'::jsonb, 'hard', 1, TRUE, '32. 결정계수 계산', 46
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 32);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', 'R² = SSR / SST = 1 - SSE / SST = 1 - 50 / 200 = 0.75 다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 32 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 33, 7, s.id, 'multiple_choice', '계절(봄, 여름, 가을, 겨울) 범주형 변수를 회귀모형에 넣을 때 필요한 더미 변수의 수는? (절편 포함 모형)', '{"source_id":"adsp_exam5_p33","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["1개","2개","3개","4개"]'::jsonb, 'hard', 1, TRUE, '33. 더미 변수', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 33);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '범주가 k개면 기준 범주를 제외한 k - 1개의 더미 변수를 쓴다. 4개를 모두 넣으면 완전한 다중공선성이 생긴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 33 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 34, 7, s.id, 'multiple_choice', '회귀분석에서 특정 관측치가 회귀계수 추정에 미치는 영향력을 측정하는 지표는?', '{"source_id":"adsp_exam5_p34","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["VIF","결정계수","AIC","쿡의 거리(Cook''s Distance)"]'::jsonb, 'hard', 1, TRUE, '34. 회귀 진단', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 34);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '쿡의 거리는 해당 관측치를 제외했을 때 적합값이 얼마나 변하는지를 측정해 영향력 있는 관측치를 찾는다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 34 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 35, 7, s.id, 'multiple_choice', '요인분석과 주성분분석의 차이로 옳은 것은?', '{"source_id":"adsp_exam5_p35","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["주성분분석은 잠재 요인을 가정해 변수 간 공통 구조를 찾는 데 초점을 둔다","요인분석은 관측 변수들 뒤에 있는 잠재 요인을 찾는 데 초점을 두고, 주성분분석은 분산을 최대한 설명하는 선형결합을 찾는다","두 방법은 완전히 같은 방법이다","요인분석은 종속변수를 예측하는 지도학습이다"]'::jsonb, 'hard', 1, TRUE, '35. 요인분석과 주성분분석', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 35);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '주성분분석은 분산을 보존하는 차원 축소, 요인분석은 공통 요인을 찾는 잠재 구조 분석이다. 둘 다 비지도 기법이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 35 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 36, 8, s.id, 'multiple_choice', '어떤 정상 시계열의 ACF는 지수적으로 감소하고, PACF는 시차 2 이후 0에 가까웠다. 가장 적절한 모형은?', '{"source_id":"adsp_exam5_p36","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["MA(2)","ARMA(1, 1)","백색잡음","AR(2)"]'::jsonb, 'hard', 1, TRUE, '36. 시계열 모형 식별', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 36);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'PACF가 시차 p 이후 절단되고 ACF가 서서히 감소하면 AR(p) 모형이다. 시차 2 이후 절단이므로 AR(2)다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 36 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 37, 8, s.id, 'multiple_choice', '계절 변동의 폭이 추세 수준에 비례해 커지는 시계열을 분해할 때 적합한 모형은?', '{"source_id":"adsp_exam5_p37","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["승법 모형","이동평균 모형","랜덤워크 모형","가법 모형"]'::jsonb, 'hard', 1, TRUE, '37. 시계열 분해 모형', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 37);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '계절 변동 폭이 일정하면 가법 모형(Y = T + S + I), 수준에 비례해 커지면 승법 모형(Y = T × S × I)을 쓴다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 37 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 38, 8, s.id, 'multiple_choice', '백색잡음(white noise)에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam5_p38","category":"통계분석","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["평균이 시간에 따라 증가한다","서로 독립이고 평균 0, 분산이 일정한 확률 과정이다","강한 자기상관을 가진다","계절성을 가진다"]'::jsonb, 'medium', 1, TRUE, '38. 백색잡음', 62
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 38);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '백색잡음은 평균 0, 분산 일정, 자기상관이 없는 확률 과정으로 시계열 모형의 오차항 가정이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 38 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 39, 8, s.id, 'multiple_choice', '모델 복잡도를 높일 때 나타나는 일반적인 변화로 옳은 것은?', '{"source_id":"adsp_exam5_p39","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["편향은 감소하고 분산은 증가한다","편향은 증가하고 분산은 감소한다","편향과 분산이 모두 증가한다","편향과 분산이 모두 감소한다"]'::jsonb, 'hard', 1, TRUE, '39. 편향-분산 트레이드오프', 40
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 39);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '복잡한 모델은 학습 데이터를 잘 맞혀 편향이 줄지만 데이터에 따라 결과가 크게 달라져 분산이 커진다(과대적합 위험).' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 39 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 40, 8, s.id, 'multiple_choice', '다음 R 로지스틱 회귀 결과에 대한 해석으로 옳은 것은? (exp(0.405) ≈ 1.5)

```r
Coefficients:
            Estimate Std. Error z value Pr(>|z|)
(Intercept)  -2.1000     0.6000  -3.500 0.000465
age           0.4050     0.1200   3.375 0.000738
```', '{"source_id":"adsp_exam5_p40","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["age는 유의하지 않다","age가 1 증가하면 성공 확률이 1.5배가 된다","age가 1 증가하면 성공 확률이 0.405 증가한다","age가 1 증가하면 성공의 오즈가 약 1.5배가 된다"]'::jsonb, 'hard', 1, TRUE, '40. 로지스틱 회귀 출력 해석', 47
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 40);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '로지스틱 회귀계수는 로그 오즈의 변화량이다. exp(0.405) ≈ 1.5이므로 오즈가 약 1.5배가 된다. 확률 자체가 1.5배가 되는 것은 아니다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 40 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 41, 9, s.id, 'multiple_choice', '부모 노드의 엔트로피가 1.0이고, 분리 후 두 자식 노드(관측치 비율 각 50%)의 엔트로피가 각각 0.8, 0.4일 때 정보이득은?', '{"source_id":"adsp_exam5_p41","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["0.2","0.4","0.6","0.8"]'::jsonb, 'hard', 1, TRUE, '41. 정보이득 계산', 43
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 41);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '자식 노드의 가중 평균 엔트로피 = 0.5×0.8 + 0.5×0.4 = 0.6, 정보이득 = 1.0 - 0.6 = 0.4 다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 41 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 42, 9, s.id, 'multiple_choice', '앙상블 기법에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p42","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["배깅은 분산을 줄이는 데 효과적이다","부스팅은 편향을 줄이는 데 효과적이다","랜덤 포레스트는 나무 간 상관을 낮추기 위해 변수 일부를 무작위로 선택한다","부스팅은 각 모델을 독립적으로 병렬 학습하므로 순서와 무관하다"]'::jsonb, 'hard', 1, TRUE, '42. 앙상블 기법 비교', 39
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 42);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', '부스팅은 이전 모델의 오차를 반영해 순차적으로 학습하므로 병렬화가 어렵고 순서가 중요하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 42 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 43, 9, s.id, 'multiple_choice', '암 진단 모형처럼 실제 환자를 놓치는 것의 비용이 매우 큰 경우 특히 중요하게 봐야 하는 지표는?', '{"source_id":"adsp_exam5_p43","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["재현율(민감도, Recall)","특이도(Specificity)","정확도(Accuracy)","정밀도(Precision)"]'::jsonb, 'hard', 1, TRUE, '43. 민감도와 정밀도의 활용', 46
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 43);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '실제 양성을 놓치지 않는 비율인 재현율이 중요하다. 스팸 필터처럼 정상 메일을 스팸으로 잘못 거르는 비용이 크면 정밀도가 중요하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 43 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 44, 9, s.id, 'multiple_choice', '다음 혼동행렬에 대한 설명으로 옳은 것은?

| 구분 | 예측 Positive | 예측 Negative |
| 실제 Positive | 60 | 40 |
| 실제 Negative | 20 | 80 |', '{"source_id":"adsp_exam5_p44","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["특이도는 0.6이다","정확도는 0.6이다","정밀도는 0.75이다","재현율은 0.75이다"]'::jsonb, 'hard', 1, TRUE, '44. 혼동행렬 종합', 42
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 44);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '정밀도 = 60 / 80 = 0.75, 정확도 = 140 / 200 = 0.7, 재현율 = 60 / 100 = 0.6, 특이도 = 80 / 100 = 0.8 이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 44 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 45, 9, s.id, 'multiple_choice', '향상도 곡선(Lift Curve)에서 좋은 모형의 특징으로 옳은 것은?', '{"source_id":"adsp_exam5_p45","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["상위 등급에서 향상도가 크고 하위 등급으로 갈수록 빠르게 감소한다","하위 등급의 향상도가 가장 크다","향상도가 등급과 관계없이 무작위로 변한다","모든 등급의 향상도가 1로 일정하다"]'::jsonb, 'hard', 1, TRUE, '45. 향상도 곡선', 38
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 45);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '좋은 모형은 반응 확률이 높은 상위 등급에서 기본 반응률보다 훨씬 높은 반응률(큰 향상도)을 보이고, 하위로 갈수록 빠르게 줄어든다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 45 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 46, 10, s.id, 'multiple_choice', '계층적 군집분석의 덴드로그램에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p46","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["한 번 병합된 개체는 이후 다른 군집으로 이동할 수 없다","덴드로그램을 그리려면 군집 수 K를 반드시 먼저 정해야 한다","높이(거리)가 클수록 서로 이질적인 군집이 병합된 것이다","수평선을 그어 절단하는 높이에 따라 군집 수가 정해진다"]'::jsonb, 'hard', 1, TRUE, '46. 계층적 군집 덴드로그램', 45
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 46);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '2', '계층적 군집은 K를 미리 정하지 않고, 덴드로그램을 보고 절단 높이를 정해 군집 수를 결정한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 46 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 47, 10, s.id, 'multiple_choice', '군집분석 결과를 평가하는 실루엣 계수에 대한 설명으로 옳은 것은?', '{"source_id":"adsp_exam5_p47","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["값이 작을수록 좋은 군집이다","지도학습 모델의 정확도를 측정한다","-1에서 1 사이의 값을 가지며 1에 가까울수록 군집이 잘 분리되어 있다","0에서 100 사이의 값이다"]'::jsonb, 'hard', 1, TRUE, '47. 실루엣 계수', 41
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 47);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '실루엣 계수는 같은 군집 내 응집도와 다른 군집과의 분리도를 함께 본다. 1에 가까우면 잘 분리, 0 근처면 경계, 음수면 잘못 배정된 것이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 47 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 48, 10, s.id, 'multiple_choice', 'K-평균의 단점인 이상값에 대한 민감성을 줄이기 위해, 군집 중심으로 평균 대신 실제 관측치를 사용하는 방법은?', '{"source_id":"adsp_exam5_p48","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["DBSCAN","와드연결법","SOM","K-medoids(PAM)"]'::jsonb, 'hard', 1, TRUE, '48. K-medoids', 48
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 48);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '4', 'K-medoids는 군집 내 다른 점들과의 거리 합이 최소인 실제 관측치를 중심으로 사용해 이상값에 덜 민감하다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 48 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 49, 10, s.id, 'multiple_choice', '연관분석에 대한 설명으로 옳지 않은 것은?', '{"source_id":"adsp_exam5_p49","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["목적변수가 필요한 지도학습이다","조건 반응(if-then) 형태로 결과를 이해하기 쉽다","품목 수가 늘어나면 계산량이 기하급수적으로 증가한다","거래량이 적은 품목은 규칙 발견에서 제외되기 쉽다"]'::jsonb, 'hard', 1, TRUE, '49. 연관분석의 한계', 44
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 49);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '1', '연관분석은 목적변수 없이 품목 간 관계를 찾는 비지도학습이다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 49 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);
INSERT INTO exam.exam_questions (exam_id, question_no, page_no, subject_id, question_type, question_text, question_payload, choice_payload, difficulty, question_version, is_active, title, seed_correct_rate)
SELECT e.id, 50, 10, s.id, 'multiple_choice', 'Apriori 알고리즘에서 최소 지지도를 너무 낮게 설정했을 때 나타날 수 있는 문제는?', '{"source_id":"adsp_exam5_p50","category":"정형 데이터 마이닝","points":2,"round":5,"avg_difficulty":"hard"}'::jsonb, '["신뢰도 계산이 불가능해진다","규칙이 거의 생성되지 않는다","생성되는 규칙 수와 계산량이 크게 늘어난다","향상도가 항상 1이 된다"]'::jsonb, 'medium', 1, TRUE, '50. 최소 지지도 설정', 58
FROM exam.exams e JOIN exam.subjects s ON s.exam_id = e.id AND s.display_order = 3
WHERE e.exam_code = 'adsp_mock_5' AND NOT EXISTS (SELECT 1 FROM exam.exam_questions x WHERE x.exam_id = e.id AND x.question_no = 50);
INSERT INTO exam.answer_keys (question_id, correct_answer, explanation)
SELECT x.id, '3', '최소 지지도가 낮으면 빈발 항목집합이 많아져 계산량과 의미 없는 규칙 수가 급증한다.' FROM exam.exam_questions x JOIN exam.exams e ON e.id = x.exam_id
WHERE e.exam_code = 'adsp_mock_5' AND x.question_no = 50 AND NOT EXISTS (SELECT 1 FROM exam.answer_keys k WHERE k.question_id = x.id);

-- ===== 무한풀이 카테고리 =====
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_data_understanding', '데이터의 이해', 101, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_data_understanding');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_data_value_future', '데이터의 가치와 미래', 102, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_data_value_future');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_data_science_insight', '데이터 사이언스와 전략 인사이트', 103, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_data_science_insight');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_analysis_planning', '데이터 분석 기획의 이해', 104, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_analysis_planning');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_master_plan', '분석 마스터 플랜', 105, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_master_plan');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_r_data_mart', 'R기초와 데이터 마트', 106, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_r_data_mart');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_statistics', '통계분석', 107, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_statistics');
INSERT INTO endless.problem_categories (category_code, category_name, display_order, is_active)
SELECT 'adsp_data_mining', '정형 데이터 마이닝', 108, TRUE WHERE NOT EXISTS (SELECT 1 FROM endless.problem_categories WHERE category_code = 'adsp_data_mining');

-- ===== 무한풀이 문항 =====
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_1', '정형 데이터', '다음 중 정형 데이터(structured data)에 해당하는 것은?', 'easy', c.category_id, '정형 데이터는 고정된 스키마(행과 열)를 가진 데이터다. 텍스트, 음성, 영상은 비정형 데이터다.', 73, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_1');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '관계형 데이터베이스의 고객 테이블'), (2, 'SNS 게시글 본문'), (3, '콜센터 상담 녹음 파일'), (4, 'CCTV 영상')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_1' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '정형 데이터는 고정된 스키마(행과 열)를 가진 데이터다. 텍스트, 음성, 영상은 비정형 데이터다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_1' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_2', '반정형 데이터', '스키마 정보를 데이터와 함께 포함하는 반정형 데이터의 예로 가장 적절한 것은?', 'easy', c.category_id, 'JSON, XML, HTML처럼 태그나 키로 구조를 표현하는 데이터는 반정형 데이터다.', 80, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_2');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '이미지 파일'), (2, '음성 파일'), (3, 'JSON, XML 파일'), (4, '엑셀 표')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_2' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, 'JSON, XML, HTML처럼 태그나 키로 구조를 표현하는 데이터는 반정형 데이터다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_2' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_3', '지식 전환 - 연결화', 'SECI 모델에서 여러 형식지를 결합해 새로운 형식지를 만드는 단계는?', 'medium', c.category_id, '연결화(Combination)는 형식지들을 모으고 결합해 새로운 형식지를 만드는 단계다.', 59, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_3');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '표출화'), (2, '연결화'), (3, '내면화'), (4, '공통화')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_3' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '연결화(Combination)는 형식지들을 모으고 결합해 새로운 형식지를 만드는 단계다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_3' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_4', '데이터베이스 관리 시스템', 'DBMS(Database Management System)를 사용하는 장점으로 옳지 않은 것은?', 'medium', c.category_id, 'DBMS는 중복 감소, 독립성, 공유, 무결성·보안 유지에 유리하지만 구축과 운영 비용이 크다는 단점이 있다.', 66, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_4');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '데이터 중복을 줄일 수 있다'), (2, '데이터 독립성이 높아진다'), (3, '여러 사용자가 동시에 데이터를 공유할 수 있다'), (4, '파일 시스템보다 항상 구축 비용이 적게 든다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_4' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'DBMS는 중복 감소, 독립성, 공유, 무결성·보안 유지에 유리하지만 구축과 운영 비용이 크다는 단점이 있다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_4' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_5', '데이터베이스 - 공용 데이터', '데이터베이스는 여러 사용자가 서로 다른 목적으로 함께 이용한다. 이 특징은?', 'easy', c.category_id, '공용 데이터는 여러 사용자가 공동으로 이용하는 데이터라는 특징이다.', 79, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_5');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '공용 데이터'), (2, '변화되는 데이터'), (3, '통합된 데이터'), (4, '저장된 데이터')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_5' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '공용 데이터는 여러 사용자가 공동으로 이용하는 데이터라는 특징이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_5' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_6', 'ETL', '원천 시스템의 데이터를 추출하고, 분석 목적에 맞게 변환한 뒤, 데이터 웨어하우스에 적재하는 과정은?', 'medium', c.category_id, 'ETL은 Extract(추출), Transform(변환), Load(적재)의 약자다.', 58, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_6');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'OLTP'), (2, 'CRUD'), (3, 'DDL'), (4, 'ETL')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_6' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'ETL은 Extract(추출), Transform(변환), Load(적재)의 약자다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_6' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_7', 'BI와 BA', 'BI(Business Intelligence)와 비교한 BA(Business Analytics)의 특징으로 옳은 것은?', 'medium', c.category_id, 'BI는 과거와 현재 상황을 보여주는 리포트 중심, BA는 예측·최적화 같은 분석으로 미래 의사결정을 지원한다.', 65, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_7');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '과거 성과를 보고서로 정리하는 데 집중한다'), (2, '통계·예측 분석으로 미래를 예측하고 최적의 의사결정을 지원하는 데 초점을 둔다'), (3, '데이터 저장소 구축만을 의미한다'), (4, '정형 리포트 작성 도구다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_7' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'BI는 과거와 현재 상황을 보여주는 리포트 중심, BA는 예측·최적화 같은 분석으로 미래 의사결정을 지원한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_7' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_8', '데이터베이스 설계 - 논리적 설계', '데이터베이스 설계 단계 중 개념적 모델을 특정 DBMS가 처리할 수 있는 스키마(테이블, 키, 관계)로 변환하는 단계는?', 'hard', c.category_id, '논리적 설계는 ERD를 관계형 스키마로 변환하고 정규화를 수행한다. 물리적 설계는 저장 구조, 인덱스, 접근 경로를 정한다.', 43, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_understanding' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_8');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '요구사항 분석'), (2, '개념적 설계'), (3, '논리적 설계'), (4, '물리적 설계')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_8' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '논리적 설계는 ERD를 관계형 스키마로 변환하고 정규화를 수행한다. 물리적 설계는 저장 구조, 인덱스, 접근 경로를 정한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_8' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_9', '빅데이터 비유 - 원유', '빅데이터를 "21세기의 원유"에 비유하는 이유로 가장 적절한 것은?', 'easy', c.category_id, '원유가 정제되어 산업 전반의 생산성을 높였듯, 빅데이터는 정보 제공 경제의 생산성을 높이는 핵심 자원이라는 의미다.', 74, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_9');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '각종 비즈니스와 공공 기관 서비스의 품질을 높이고 생산성을 끌어올리는 핵심 자원이기 때문'), (2, '가공 없이 바로 쓸 수 있기 때문'), (3, '특정 국가만 보유하기 때문'), (4, '고갈되는 자원이기 때문')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_9' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '원유가 정제되어 산업 전반의 생산성을 높였듯, 빅데이터는 정보 제공 경제의 생산성을 높이는 핵심 자원이라는 의미다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_9' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_10', '빅데이터 비유 - 플랫폼', '빅데이터를 "플랫폼"에 비유하는 의미로 옳은 것은?', 'easy', c.category_id, '플랫폼 비유는 빅데이터가 여러 주체가 공동으로 활용하는 기반 역할을 한다는 뜻이다. 페이스북이 대표 사례다.', 81, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_10');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '정제가 필요한 원유'), (2, '공동 활용의 목적으로 구축된 유무형의 구조물로서 다양한 서비스를 제공하는 기반'), (3, '현미경처럼 사물을 확대해 보는 도구'), (4, '산업혁명의 석탄과 철')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_10' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '플랫폼 비유는 빅데이터가 여러 주체가 공동으로 활용하는 기반 역할을 한다는 뜻이다. 페이스북이 대표 사례다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_10' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_11', '빅데이터 활용 기본 테크닉 - 기계학습', '"영화 시청 이력을 학습해 사용자가 좋아할 영화를 추천한다"에 해당하는 빅데이터 활용 기본 테크닉은?', 'medium', c.category_id, '기계학습은 데이터에서 학습한 알려진 특성을 활용해 예측하는 기법이다. 추천 시스템이 대표적이다.', 60, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_11');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '감정 분석'), (2, '연관규칙 학습'), (3, '기계학습'), (4, '유전 알고리즘')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_11' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '기계학습은 데이터에서 학습한 알려진 특성을 활용해 예측하는 기법이다. 추천 시스템이 대표적이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_11' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_12', '빅데이터 활용 기본 테크닉 - 소셜 네트워크 분석', '"고객들 사이에서 영향력 있는 사람은 누구인가?"를 파악할 때 사용하는 빅데이터 활용 기본 테크닉은?', 'medium', c.category_id, '소셜 네트워크 분석은 사람 간 관계를 분석해 영향력 있는 사용자(인플루언서)를 찾는다.', 56, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_12');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '유형 분석'), (2, '유전 알고리즘'), (3, '회귀분석'), (4, '소셜 네트워크 분석')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_12' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '소셜 네트워크 분석은 사람 간 관계를 분석해 영향력 있는 사용자(인플루언서)를 찾는다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_12' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_13', '빅데이터가 만든 본질적 변화', '빅데이터가 만들어 낸 본질적인 변화로 옳은 것은?', 'medium', c.category_id, '빅데이터 시대에는 사전 처리 → 사후 처리, 표본조사 → 전수조사, 양보다 질 → 질보다 양, 인과관계 → 상관관계로 변했다.', 63, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_13');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '질보다 양으로'), (2, '상관관계에서 인과관계로'), (3, '전수조사에서 표본조사로'), (4, '사후 처리에서 사전 처리로')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_13' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '빅데이터 시대에는 사전 처리 → 사후 처리, 표본조사 → 전수조사, 양보다 질 → 질보다 양, 인과관계 → 상관관계로 변했다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_13' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_14', '빅데이터와 사생활 보호', '개인정보를 활용하면서 사생활을 보호하기 위한 기술로, 데이터의 특정 값을 변경하거나 일부를 삭제해 개인을 식별하지 못하게 하는 것은?', 'hard', c.category_id, '비식별화는 가명 처리, 총계 처리, 데이터 삭제, 범주화, 데이터 마스킹 등으로 개인을 식별할 수 없게 한다.', 41, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_14');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '인덱싱'), (2, '샤딩'), (3, '비식별화(가명·익명 처리)'), (4, '정규화')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_14' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '비식별화는 가명 처리, 총계 처리, 데이터 삭제, 범주화, 데이터 마스킹 등으로 개인을 식별할 수 없게 한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_14' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_15', '미래의 빅데이터 - 인력', '빅데이터 활용 3요소 중 "인력"과 관련해, 알고리즘으로 인한 피해를 해석하고 구제하는 전문가는?', 'hard', c.category_id, '알고리즈미스트는 컴퓨터와 수학, 통계, 비즈니스에 대한 지식으로 알고리즘의 부당한 피해를 구제하는 전문가다.', 48, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_15');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '데이터 엔지니어'), (2, '알고리즈미스트'), (3, 'DBA'), (4, '시스템 관리자')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_15' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '알고리즈미스트는 컴퓨터와 수학, 통계, 비즈니스에 대한 지식으로 알고리즘의 부당한 피해를 구제하는 전문가다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_15' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_16', '데이터화(Datafication)', '세상의 모든 활동과 현상이 데이터로 기록되고 측정되는 현상을 무엇이라 하는가?', 'medium', c.category_id, '데이터화는 사물인터넷, 웨어러블 기기 등으로 세상의 모든 것이 데이터로 측정되는 현상이다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_value_future' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_16');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '정규화(Normalization)'), (2, '시각화(Visualization)'), (3, '표준화(Standardization)'), (4, '데이터화(Datafication)')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_16' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '데이터화는 사물인터넷, 웨어러블 기기 등으로 세상의 모든 것이 데이터로 측정되는 현상이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_16' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_17', '빅데이터 분석의 출발점', '빅데이터 분석에서 가장 먼저 고려해야 할 것은?', 'easy', c.category_id, '분석은 비즈니스의 핵심 가치에 대한 질문에서 출발해야 한다. 도구와 데이터 양은 그다음 문제다.', 75, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_17');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '비즈니스 핵심 가치와 분석 목적의 정의'), (2, '데이터 양의 최대 확보'), (3, '하드웨어 성능 확보'), (4, '최신 분석 도구 구입')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_17' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '분석은 비즈니스의 핵심 가치에 대한 질문에서 출발해야 한다. 도구와 데이터 양은 그다음 문제다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_17' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_18', '데이터 사이언티스트의 역량 구분', '다음 중 데이터 사이언티스트의 하드 스킬과 소프트 스킬의 분류로 옳지 않은 것은?', 'medium', c.category_id, '알고리즘 구현 능력은 분석 기술 숙련에 속하는 하드 스킬이다. 소프트 스킬은 통찰력, 설득력 있는 전달, 협력이다.', 65, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_18');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '하드 스킬 - 빅데이터 관련 이론적 지식'), (2, '하드 스킬 - 분석 기술의 숙련'), (3, '소프트 스킬 - 다분야 간 협력'), (4, '소프트 스킬 - 머신러닝 알고리즘 구현 능력')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_18' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '알고리즘 구현 능력은 분석 기술 숙련에 속하는 하드 스킬이다. 소프트 스킬은 통찰력, 설득력 있는 전달, 협력이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_18' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_19', '가트너의 데이터 사이언티스트 역량', '가트너가 제시한 데이터 사이언티스트의 요구 역량에 해당하지 않는 것은?', 'medium', c.category_id, '가트너는 데이터 관리, 분석 모델링, 비즈니스 분석, 소프트 스킬을 데이터 사이언티스트의 역량으로 제시했다.', 61, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_19');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '비즈니스 분석'), (2, '하드웨어 설계'), (3, '데이터 관리'), (4, '분석 모델링')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_19' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '가트너는 데이터 관리, 분석 모델링, 비즈니스 분석, 소프트 스킬을 데이터 사이언티스트의 역량으로 제시했다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_19' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_20', '인문학적 사고의 역할', '데이터 사이언스에서 인문학적 사고가 기여하는 바로 가장 적절한 것은?', 'hard', c.category_id, '인문학적 사고는 사람과 사회에 대한 이해를 바탕으로 분석 결과를 해석하고 가치 있는 질문을 만드는 데 기여한다.', 39, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_20');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분석 모델의 정확도를 자동으로 높인다'), (2, '계산 속도를 높인다'), (3, '분석 결과의 의미를 해석하고, 고객과 사회의 맥락에서 새로운 질문을 던진다'), (4, '데이터 저장 비용을 줄인다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_20' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '인문학적 사고는 사람과 사회에 대한 이해를 바탕으로 분석 결과를 해석하고 가치 있는 질문을 만드는 데 기여한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_20' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_21', '일차원적 분석 사례', '산업별 일차원적 분석 사례의 연결로 옳은 것은?', 'medium', c.category_id, '금융은 신용점수 산정과 사기 탐지, 병원은 가격 책정과 고객 충성도, 에너지는 트레이딩과 공급·수요 예측, 소매업은 재고 보충과 수요 예측이 대표적이다.', 64, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_21');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '금융 서비스 - 신용점수 산정, 사기 탐지'), (2, '병원 - 트레이딩, 공급 예측'), (3, '에너지 - 고객 충성도, 수익 관리'), (4, '소매업 - 시뮬레이션, 품질 관리')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_21' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '금융은 신용점수 산정과 사기 탐지, 병원은 가격 책정과 고객 충성도, 에너지는 트레이딩과 공급·수요 예측, 소매업은 재고 보충과 수요 예측이 대표적이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_21' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_22', '전략 도출을 위한 질문', '전략적 인사이트를 도출하기 위한 분석 접근으로 가장 적절한 것은?', 'hard', c.category_id, '전략적 인사이트는 일차원적 분석을 넘어 사업 전체, 경쟁자, 시장 변화 관점에서 과제를 정의할 때 얻을 수 있다.', 42, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_science_insight' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_22');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '부서별로 독립된 분석을 각자 수행한다'), (2, '경쟁 환경과 시장 변화를 고려해 사업 전체의 관점에서 분석 과제를 정의한다'), (3, '현재 업무의 효율화에만 집중한다'), (4, '데이터가 있는 분야만 분석한다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_22' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '전략적 인사이트는 일차원적 분석을 넘어 사업 전체, 경쟁자, 시장 변화 관점에서 과제를 정의할 때 얻을 수 있다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_22' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_23', '분석 기획의 정의', '분석 기획에 대한 설명으로 가장 적절한 것은?', 'easy', c.category_id, '분석 기획은 분석 수행 전 과제를 정의하고 결과를 도출하기 위한 방안을 사전에 계획하는 작업이다.', 73, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_23');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '데이터를 수집하는 작업이다'), (2, '분석 도구를 선정하는 작업이다'), (3, '실제 분석을 수행하기 전에 분석 과제를 정의하고, 의도한 결과를 얻을 수 있도록 관리 방안을 사전에 계획하는 작업이다'), (4, '분석 결과를 보고서로 작성하는 작업이다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_23' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '분석 기획은 분석 수행 전 과제를 정의하고 결과를 도출하기 위한 방안을 사전에 계획하는 작업이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_23' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_24', '분석가의 역량', '분석 기획자에게 요구되는 역량으로 거리가 먼 것은?', 'easy', c.category_id, '분석가는 수학·통계, IT 기술, 비즈니스 도메인 지식을 갖추고 프로젝트 관리 역량과 리더십을 겸비해야 한다.', 80, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_24');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '수학·통계학적 지식'), (2, '정보 기술(IT) 역량'), (3, '해당 비즈니스에 대한 이해'), (4, '하드웨어 조립 기술')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_24' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '분석가는 수학·통계, IT 기술, 비즈니스 도메인 지식을 갖추고 프로젝트 관리 역량과 리더십을 겸비해야 한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_24' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_25', '프로토타입 모델', '사용자 요구사항을 정확히 파악하기 어려울 때 일부분을 먼저 개발해 사용자에게 보여주고 피드백을 받아 개선하는 방법론 모델은?', 'medium', c.category_id, '프로토타입 모델은 빠르게 시제품을 만들어 사용자 피드백으로 요구사항을 구체화한다.', 59, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_25');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '프로토타입 모델'), (2, 'V 모델'), (3, '나선형 모델'), (4, '폭포수 모델')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_25' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '프로토타입 모델은 빠르게 시제품을 만들어 사용자 피드백으로 요구사항을 구체화한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_25' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_26', '분석 방법론의 계층', '빅데이터 분석 방법론의 계층 구조로 옳은 것은?', 'medium', c.category_id, '빅데이터 분석 방법론은 단계, 태스크, 스텝의 3계층이다. 단계는 베이스라인, 태스크는 물리적·논리적 단위, 스텝은 WBS의 워크 패키지에 해당한다.', 66, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_26');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '태스크 → 단계 → 스텝'), (2, '단계 → 스텝 → 태스크'), (3, '단계(Phase) → 태스크(Task) → 스텝(Step)'), (4, '스텝 → 태스크 → 단계')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_26' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '빅데이터 분석 방법론은 단계, 태스크, 스텝의 3계층이다. 단계는 베이스라인, 태스크는 물리적·논리적 단위, 스텝은 WBS의 워크 패키지에 해당한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_26' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_27', '분석 기획 - 프로젝트 정의', '빅데이터 분석 방법론의 분석 기획 단계에서 "프로젝트 정의 및 계획 수립" 태스크의 산출물로 적절한 것은?', 'medium', c.category_id, '프로젝트 정의 및 계획 수립에서는 데이터 분석 프로젝트 정의서, 프로젝트 수행 계획서, WBS를 만든다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_27');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '탐색적 분석 결과 보고서'), (2, 'WBS(작업 분할 구조도)와 프로젝트 정의서'), (3, '분석용 데이터셋'), (4, '모델 운영 매뉴얼')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_27' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '프로젝트 정의 및 계획 수립에서는 데이터 분석 프로젝트 정의서, 프로젝트 수행 계획서, WBS를 만든다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_27' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_28', '분석 유스케이스', '하향식 접근법의 문제 정의 단계에서 "비즈니스 문제를 데이터 분석 문제로 변환"하는 것의 예로 가장 적절한 것은?', 'medium', c.category_id, '문제 정의 단계에서는 비즈니스 문제를 데이터로 풀 수 있는 분석 문제(예측, 분류 등)로 변환한다.', 58, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_28');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '"분석 도구를 바꾸고 싶다" → "새 도구를 구매한다"'), (2, '"매출이 줄었다" → "광고비를 늘린다"'), (3, '"보고서가 늦다" → "인력을 늘린다"'), (4, '"고객 이탈을 줄이고 싶다" → "고객의 이탈 가능성을 예측하는 모델을 만든다"')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_28' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '문제 정의 단계에서는 비즈니스 문제를 데이터로 풀 수 있는 분석 문제(예측, 분류 등)로 변환한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_28' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_29', '분석 기회 발굴 - 경쟁자 확대', '분석 기회 발굴의 범위를 확장할 때 경쟁자 확대 관점에서 살펴보는 영역이 아닌 것은?', 'hard', c.category_id, '경쟁자 확대 관점은 대체재, 경쟁자, 신규 진입자를 살핀다. 규제와 감사는 비즈니스 모델 캔버스의 영역이다.', 47, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_29');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '규제와 감사(Regulation & Audit)'), (2, '대체재(Substitute)'), (3, '경쟁자(Competitor)'), (4, '신규 진입자(New Entrant)')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_29' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '경쟁자 확대 관점은 대체재, 경쟁자, 신규 진입자를 살핀다. 규제와 감사는 비즈니스 모델 캔버스의 영역이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_29' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_30', '분석 기회 발굴 - 시장 니즈', '시장 니즈 탐색 관점에서 분석 기회를 찾을 때 살펴보는 대상으로 옳지 않은 것은?', 'hard', c.category_id, '시장 니즈 탐색은 고객, 채널, 영향자들을 대상으로 한다. 역량의 재해석 관점에서는 내부 역량과 파트너 네트워크를 본다.', 43, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_30');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '고객(Customer)'), (2, '채널(Channel)'), (3, '영향자들(Influencer)'), (4, '내부 인사 제도(HR Policy)')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_30' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '시장 니즈 탐색은 고객, 채널, 영향자들을 대상으로 한다. 역량의 재해석 관점에서는 내부 역량과 파트너 네트워크를 본다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_30' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_31', '프로젝트 관리 - 범위 관리', '분석 프로젝트에서 분석 기획 단계의 범위가 데이터 분석 단계에서 자주 변경되는 이유로 가장 적절한 것은?', 'medium', c.category_id, '분석 프로젝트는 데이터를 다뤄 보면서 요구사항과 범위가 바뀌는 경우가 많으므로 범위 관리가 중요하다.', 57, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_31');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '프로젝트 일정이 고정되어 있기 때문'), (2, '분석 결과에 따라 새로운 요구사항이 생기고 데이터 형태와 양이 예상과 다르기 때문'), (3, '분석 도구의 가격이 변하기 때문'), (4, '분석 인력이 항상 부족하기 때문')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_31' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '분석 프로젝트는 데이터를 다뤄 보면서 요구사항과 범위가 바뀌는 경우가 많으므로 범위 관리가 중요하다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_31' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_32', '프로젝트 관리 - 시간 관리', '분석 프로젝트의 시간(Time) 관리에 대한 설명으로 가장 적절한 것은?', 'hard', c.category_id, '분석은 초기 의도보다 시간이 길어지기 쉬우므로 타임박싱으로 정해진 기간 안에 결과를 내도록 관리한다.', 46, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_analysis_planning' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_32');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분석은 반복적이므로 일정 관리를 할 필요가 없다'), (2, '모델 정확도를 높이려 일정을 무한정 늘린다'), (3, '타임박싱(Time Boxing) 기법으로 일정 계획을 관리한다'), (4, '모든 일정은 프로젝트 종료 후 확정한다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_32' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '분석은 초기 의도보다 시간이 길어지기 쉬우므로 타임박싱으로 정해진 기간 안에 결과를 내도록 관리한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_32' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_33', '마스터 플랜의 정의', '분석 마스터 플랜에 대한 설명으로 옳은 것은?', 'easy', c.category_id, '분석 마스터 플랜은 중장기적 관점에서 분석 과제를 도출하고 우선순위와 이행 로드맵을 정한 종합 계획이다.', 77, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_33');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '전사 관점에서 분석 과제들의 우선순위와 단계별 로드맵을 수립한 중장기 계획이다'), (2, '분석 결과를 보고하는 문서다'), (3, '데이터베이스 설계서다'), (4, '개별 분석 과제를 빠르게 수행하기 위한 계획이다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_33' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '분석 마스터 플랜은 중장기적 관점에서 분석 과제를 도출하고 우선순위와 이행 로드맵을 정한 종합 계획이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_33' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_34', 'ISP', '정보기술 또는 정보시스템을 전략적으로 활용하기 위해 조직 내외부 환경을 분석하고 중장기 마스터 플랜을 수립하는 절차는?', 'medium', c.category_id, 'ISP는 정보 전략 계획으로, 분석 마스터 플랜도 이와 유사하게 수립한다.', 56, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_34');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'OLAP'), (2, 'ISP(Information Strategy Planning)'), (3, 'ERP'), (4, 'BPR')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_34' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'ISP는 정보 전략 계획으로, 분석 마스터 플랜도 이와 유사하게 수립한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_34' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_35', '시급성과 난이도', '포트폴리오 사분면 분석에서 시급성의 판단 기준으로 가장 적절한 것은?', 'medium', c.category_id, '시급성은 전략적 중요도와 목표 가치를 기준으로, 난이도는 데이터 획득·저장·가공 비용과 분석 수준을 기준으로 판단한다.', 63, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_35');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분석 기술의 수준'), (2, '분석 담당자의 수'), (3, '전략적 중요도와 목표 가치(KPI)'), (4, '데이터 획득·저장·가공 비용')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_35' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '시급성은 전략적 중요도와 목표 가치를 기준으로, 난이도는 데이터 획득·저장·가공 비용과 분석 수준을 기준으로 판단한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_35' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_36', '이행 계획 로드맵', '분석 마스터 플랜의 단계적 구현 로드맵에서 "데이터 분석 체계 도입 → 데이터 분석 유효성 검증 → 데이터 분석 확산 및 고도화"를 순서대로 진행하는 이유로 가장 적절한 것은?', 'hard', c.category_id, '로드맵은 단계적으로 성과를 검증하며 확산해 위험을 관리하고 조직의 변화를 끌어낸다.', 41, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_36');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '확산 단계는 필요 없기 때문'), (2, '도입 단계에서 모든 시스템을 완성해야 하기 때문'), (3, '모든 과제를 동시에 추진해야 효율적이기 때문'), (4, '작게 시작해 성과를 검증한 뒤 전사로 확산해야 위험을 줄이고 조직의 수용성을 높일 수 있기 때문')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_36' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '로드맵은 단계적으로 성과를 검증하며 확산해 위험을 관리하고 조직의 변화를 끌어낸다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_36' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_37', '분석 성숙도 - 도입 단계', '분석 성숙도의 "도입 단계"에 대한 설명으로 옳은 것은?', 'easy', c.category_id, '도입 단계는 분석 환경을 갖추기 시작하는 단계다. 업무 적용은 활용, 전사 관리·공유는 확산, 혁신 기여는 최적화 단계다.', 83, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_37');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분석을 시작해 환경과 시스템을 구축하는 단계'), (2, '전사 차원에서 분석을 관리하고 공유하는 단계'), (3, '분석을 진화시켜 혁신과 성과 향상에 기여하는 단계'), (4, '분석 결과를 실제 업무에 적용하는 단계')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_37' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '도입 단계는 분석 환경을 갖추기 시작하는 단계다. 업무 적용은 활용, 전사 관리·공유는 확산, 혁신 기여는 최적화 단계다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_37' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_38', '분석 준비도 - 확산형', '분석 준비도와 분석 성숙도가 모두 높은 기업 유형은?', 'medium', c.category_id, '확산형은 6가지 분석 구성요소를 모두 갖추고 현재 부분적으로 도입해 지속적으로 확산 중인 기업이다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_38');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '정착형'), (2, '도입형'), (3, '확산형'), (4, '준비형')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_38' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '확산형은 6가지 분석 구성요소를 모두 갖추고 현재 부분적으로 도입해 지속적으로 확산 중인 기업이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_38' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_39', '분석 준비도 - 도입형', '분석 업무와 기법 등은 부족하지만 조직, 인력, 분석 인프라 등 준비도가 높아 바로 도입할 수 있는 기업 유형은?', 'medium', c.category_id, '도입형은 성숙도는 낮지만 준비도가 높아 분석 업무를 바로 도입할 수 있다. 준비도와 성숙도가 모두 낮으면 준비형이다.', 58, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_39');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '정착형'), (2, '도입형'), (3, '확산형'), (4, '준비형')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_39' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '도입형은 성숙도는 낮지만 준비도가 높아 분석 업무를 바로 도입할 수 있다. 준비도와 성숙도가 모두 낮으면 준비형이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_39' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_40', '분석 조직 - 기능 중심', '별도 분석 조직 없이 해당 업무 부서에서 직접 분석을 수행하는 기능 중심 조직 구조의 특징으로 옳은 것은?', 'hard', c.category_id, '기능 중심 조직은 각 부서가 자체 분석을 하므로 전사적 핵심 분석이 어렵고 과거 실적 분석에 머물 수 있다. 업무 이원화는 집중형 조직의 단점이다.', 47, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_40');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '전략적 중요도에 따라 전사 우선순위를 정해 분석한다'), (2, '분석 전문 인력을 현업 부서에 파견한다'), (3, '분석 업무가 이원화될 가능성이 크다'), (4, '전사적 관점의 핵심 분석이 어렵고 특정 업무 부서에 국한된 분석이 이루어지기 쉽다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_40' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '기능 중심 조직은 각 부서가 자체 분석을 하므로 전사적 핵심 분석이 어렵고 과거 실적 분석에 머물 수 있다. 업무 이원화는 집중형 조직의 단점이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_40' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_41', '데이터 거버넌스 - 표준화 활동', '데이터 거버넌스 체계 중 "표준화 활동"에 해당하는 것은?', 'medium', c.category_id, '표준화 활동은 거버넌스 체계 구축 후 표준 준수 여부를 점검·모니터링하고 지속적으로 개선하는 활동이다.', 61, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_41');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '표준 준수 여부를 주기적으로 점검하고 모니터링하며 개선 활동을 수행'), (2, '데이터 저장소 구성'), (3, '데이터 표준 용어 설정'), (4, '메타데이터 구축')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_41' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '표준화 활동은 거버넌스 체계 구축 후 표준 준수 여부를 점검·모니터링하고 지속적으로 개선하는 활동이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_41' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_42', '과제 수행 프로세스', '분석 과제 관리 프로세스 중 "과제 수행" 단계의 순서로 옳은 것은?', 'hard', c.category_id, '과제 수행은 팀 구성 → 분석 과제 실행 → 진행 관리 → 결과 공유·개선 순이다. 수행 결과는 과제 풀(Pool)에 축적해 다음 과제 발굴에 활용한다.', 39, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_master_plan' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_42');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분석 과제 실행 → 팀 구성 → 결과 공유·개선 → 진행 관리'), (2, '결과 공유·개선 → 팀 구성 → 과제 실행 → 진행 관리'), (3, '팀 구성 → 진행 관리 → 결과 공유·개선 → 과제 실행'), (4, '팀 구성 → 분석 과제 실행 → 분석 과제 진행 관리 → 결과 공유·개선')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_42' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '과제 수행은 팀 구성 → 분석 과제 실행 → 진행 관리 → 결과 공유·개선 순이다. 수행 결과는 과제 풀(Pool)에 축적해 다음 과제 발굴에 활용한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_42' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_43', '최빈값', '자료 3, 5, 5, 7, 9, 5, 2 의 최빈값은?', 'easy', c.category_id, '최빈값은 가장 자주 나타나는 값이다. 5가 세 번 나온다.', 81, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_43');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '3'), (2, '5'), (3, '7'), (4, '9')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_43' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '최빈값은 가장 자주 나타나는 값이다. 5가 세 번 나온다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_43' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_44', '사분위수 범위', '1사분위수가 20, 3사분위수가 50일 때 사분위수 범위(IQR)는?', 'medium', c.category_id, 'IQR = Q3 - Q1 = 50 - 20 = 30 이다.', 60, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_44');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '20'), (2, '30'), (3, '35'), (4, '70')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_44' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'IQR = Q3 - Q1 = 50 - 20 = 30 이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_44' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_45', '독립 사건', '두 사건 A, B가 서로 독립이고 P(A) = 0.4, P(B) = 0.5일 때 P(A∩B)는?', 'medium', c.category_id, '독립이면 P(A∩B) = P(A) × P(B) = 0.4 × 0.5 = 0.2 다.', 56, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_45');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '0.1'), (2, '0.2'), (3, '0.45'), (4, '0.9')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_45' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '독립이면 P(A∩B) = P(A) × P(B) = 0.4 × 0.5 = 0.2 다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_45' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_46', '공분산과 상관계수', 'X와 Y의 공분산이 12, X의 표준편차가 3, Y의 표준편차가 5일 때 상관계수는?', 'hard', c.category_id, '상관계수 = Cov(X, Y) / (σX σY) = 12 / 15 = 0.8 이다.', 45, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_46');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '0.2'), (2, '0.6'), (3, '0.8'), (4, '4')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_46' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '상관계수 = Cov(X, Y) / (σX σY) = 12 / 15 = 0.8 이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_46' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_47', '표본분산의 자유도', '표본분산을 구할 때 편차제곱합을 n이 아닌 n - 1로 나누는 이유는?', 'medium', c.category_id, 'n - 1로 나누면 표본분산의 기댓값이 모분산과 같아지는 불편추정량이 된다.', 59, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_47');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분산을 항상 크게 만들기 위해'), (2, '계산을 쉽게 하기 위해'), (3, '모분산의 불편추정량을 얻기 위해'), (4, '표본 크기를 줄이기 위해')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_47' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, 'n - 1로 나누면 표본분산의 기댓값이 모분산과 같아지는 불편추정량이 된다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_47' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_48', '부호 검정', '대응되는 두 측정값의 차이의 부호(+, -)만 이용해 중앙값의 차이를 검정하는 비모수 방법은?', 'hard', c.category_id, '부호 검정은 차이의 크기는 무시하고 부호만 이용한다. 윌콕슨 부호순위 검정은 차이의 크기 순위까지 이용한다.', 48, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_48');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '윌콕슨 순위합 검정'), (2, 'F-검정'), (3, '런 검정'), (4, '부호 검정')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_48' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '부호 검정은 차이의 크기는 무시하고 부호만 이용한다. 윌콕슨 부호순위 검정은 차이의 크기 순위까지 이용한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_48' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_49', '홀드아웃 방법', '데이터를 무작위로 학습용과 평가용으로 한 번 나누어(예: 70:30) 모델을 평가하는 방법은?', 'medium', c.category_id, '홀드아웃은 간단하지만 한 번 나눈 결과에 성능이 좌우된다. 이를 보완하려 k-fold 교차검증을 쓴다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_49');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '홀드아웃(Hold-out)'), (2, 'k-fold 교차검증'), (3, '부트스트랩'), (4, 'LOOCV')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_49' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '홀드아웃은 간단하지만 한 번 나눈 결과에 성능이 좌우된다. 이를 보완하려 k-fold 교차검증을 쓴다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_49' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_50', '소프트맥스', '인공신경망에서 다중 클래스 분류의 출력층에 사용해, 출력값의 합이 1이 되도록 확률로 변환하는 함수는?', 'hard', c.category_id, '소프트맥스는 각 클래스의 점수를 지수화해 합이 1인 확률 분포로 바꾼다.', 40, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_50');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'tanh'), (2, '시그모이드'), (3, '소프트맥스'), (4, 'ReLU')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_50' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '소프트맥스는 각 클래스의 점수를 지수화해 합이 1인 확률 분포로 바꾼다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_50' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_51', '군집분석의 표준화', '키(cm)와 몸무게(kg)로 거리 기반 군집분석을 할 때 변수를 표준화하는 이유로 가장 적절한 것은?', 'medium', c.category_id, '거리 계산은 값의 범위가 큰 변수의 영향을 크게 받으므로 표준화로 척도를 맞춘다.', 65, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_51');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '단위와 범위가 다른 변수가 거리 계산을 지배하지 않도록 하기 위해'), (2, '군집 수를 자동으로 정하기 위해'), (3, '이상값을 제거하기 위해'), (4, '계산 속도를 높이기 위해')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_51' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '거리 계산은 값의 범위가 큰 변수의 영향을 크게 받으므로 표준화로 척도를 맞춘다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_51' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_52', '의사결정나무 정지 규칙', '의사결정나무의 정지 규칙(stopping rule)으로 사용되지 않는 것은?', 'hard', c.category_id, '정지 규칙은 더 이상 분리해도 의미가 없을 때 성장을 멈추는 기준이다. 최소 관측치 수, 최대 깊이, 불순도 감소량 기준 등이 있다.', 43, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_52');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '노드의 관측치 수가 최소 기준보다 작아지면 멈춘다'), (2, '나무의 깊이가 최대 깊이에 도달하면 멈춘다'), (3, '불순도 감소량이 기준보다 작으면 멈춘다'), (4, '부모 노드의 불순도가 증가하면 계속 분리한다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_52' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '정지 규칙은 더 이상 분리해도 의미가 없을 때 성장을 멈추는 기준이다. 최소 관측치 수, 최대 깊이, 불순도 감소량 기준 등이 있다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_52' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_53', '연관규칙의 활용', '연관규칙 분석의 활용 사례로 가장 적절한 것은?', 'medium', c.category_id, '연관규칙은 장바구니 분석, 교차 판매, 상품 진열, 묶음 상품 기획 등에 활용한다.', 57, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_53');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '함께 구매되는 상품을 가까이 진열하거나 묶음 상품을 기획한다'), (2, '고객의 연간 소득을 예측한다'), (3, '주가의 다음 날 값을 예측한다'), (4, '고객을 세 집단으로 나눈다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_53' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '연관규칙은 장바구니 분석, 교차 판매, 상품 진열, 묶음 상품 기획 등에 활용한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_53' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_54', 'R 정렬', '다음 R 코드의 실행 결과는?

```r
x <- c(30, 10, 20)
order(x)
```', 'medium', c.category_id, 'order()는 정렬된 값이 아니라 정렬 순서의 인덱스를 반환한다. 가장 작은 10이 2번째, 20이 3번째, 30이 1번째다. 값 정렬은 sort()를 쓴다.', 64, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_54');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '3 1 2'), (2, '1 2 3'), (3, '10 20 30'), (4, '2 3 1')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_54' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'order()는 정렬된 값이 아니라 정렬 순서의 인덱스를 반환한다. 가장 작은 10이 2번째, 20이 3번째, 30이 1번째다. 값 정렬은 sort()를 쓴다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_54' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_55', 'R 데이터 확인', 'R에서 데이터 프레임의 앞부분 6개 행을 확인하는 함수는?', 'easy', c.category_id, 'head()는 앞부분, tail()은 뒷부분을 보여준다. 기본값은 6행이다.', 77, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_55');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'nrow()'), (2, 'head()'), (3, 'tail()'), (4, 'str()')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_55' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'head()는 앞부분, tail()은 뒷부분을 보여준다. 기본값은 6행이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_55' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_56', '데이터 분할', '모델 학습에 사용하지 않고 최종 성능을 평가하기 위해 남겨두는 데이터는?', 'easy', c.category_id, '테스트 데이터는 학습과 모형 선택에 쓰지 않고 최종 일반화 성능을 평가하는 데만 사용한다.', 73, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_56');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '훈련용 데이터(training)'), (2, '검증용 데이터(validation)'), (3, '테스트용 데이터(test)'), (4, '부트스트랩 데이터')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_56' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '테스트 데이터는 학습과 모형 선택에 쓰지 않고 최종 일반화 성능을 평가하는 데만 사용한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_56' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_57', '인공신경망', '인공신경망에서 출력층의 오차를 이용해 가중치를 출력층에서 입력층 방향으로 조정하는 알고리즘은?', 'medium', c.category_id, '역전파(Backpropagation)는 출력 오차를 뒤로 전파하며 가중치를 갱신한다.', 63, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_57');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '역전파 알고리즘'), (2, '분할정복 알고리즘'), (3, 'Apriori 알고리즘'), (4, 'EM 알고리즘')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_57' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '역전파(Backpropagation)는 출력 오차를 뒤로 전파하며 가중치를 갱신한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_57' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_58', '비모수 검정', '다음 중 비모수 검정 방법에 해당하는 것은?', 'medium', c.category_id, '윌콕슨 부호순위 검정은 모집단 분포를 가정하지 않는 비모수 검정이다. t-검정, ANOVA, F-검정은 정규분포를 가정하는 모수 검정이다.', 59, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_58');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '분산분석(ANOVA)'), (2, '윌콕슨 부호순위 검정'), (3, 'F-검정'), (4, 't-검정')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_58' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '윌콕슨 부호순위 검정은 모집단 분포를 가정하지 않는 비모수 검정이다. t-검정, ANOVA, F-검정은 정규분포를 가정하는 모수 검정이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_58' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_59', '왜도', '분포의 오른쪽 꼬리가 길게 늘어진 경우(오른쪽으로 치우친 분포)의 왜도와 대표값의 관계로 옳은 것은?', 'easy', c.category_id, '오른쪽 꼬리가 길면 왜도는 양수이고, 큰 값의 영향으로 평균 > 중앙값 > 최빈값 순서가 된다.', 83, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_59');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '왜도 > 0, 평균 < 중앙값'), (2, '왜도 < 0, 평균 < 중앙값'), (3, '왜도 > 0, 평균 > 중앙값'), (4, '왜도 = 0, 평균 = 중앙값')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_59' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '오른쪽 꼬리가 길면 왜도는 양수이고, 큰 값의 영향으로 평균 > 중앙값 > 최빈값 순서가 된다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_59' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_60', 'R apply 함수', '다음 R 코드의 실행 결과는?

```r
m <- matrix(1:6, nrow = 2)
apply(m, 1, sum)
```', 'medium', c.category_id, 'matrix(1:6, nrow = 2)는 열 우선으로 채워져 1행은 1, 3, 5, 2행은 2, 4, 6이 된다. apply(m, 1, sum)은 행 합이므로 9, 12다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_60');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '3 7 11'), (2, '21'), (3, '6 15'), (4, '9 12')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_60' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'matrix(1:6, nrow = 2)는 열 우선으로 채워져 1행은 1, 3, 5, 2행은 2, 4, 6이 된다. apply(m, 1, sum)은 행 합이므로 9, 12다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_60' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_61', '군집 간 거리 측정', '계층적 군집분석에서 두 군집 사이의 거리를 각 군집에 속한 관측치 사이의 최단 거리로 정의하는 연결법은?', 'medium', c.category_id, '단일연결법은 두 군집 관측치 간 가장 가까운 거리를 군집 간 거리로 쓴다. 완전연결법은 가장 먼 거리를 쓴다.', 58, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_61');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '단일연결법(최단연결법)'), (2, '완전연결법(최장연결법)'), (3, '평균연결법'), (4, '와드연결법')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_61' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '단일연결법은 두 군집 관측치 간 가장 가까운 거리를 군집 간 거리로 쓴다. 완전연결법은 가장 먼 거리를 쓴다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_61' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_62', '중심극한정리', '중심극한정리에 대한 설명으로 옳은 것은?', 'easy', c.category_id, '모집단 분포와 관계없이 표본 크기가 충분히 크면 표본평균의 분포는 정규분포에 가까워진다. 표본평균의 분산은 σ²/n으로 n이 커질수록 작아진다.', 82, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_62');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '표본평균의 분산은 표본 크기에 관계없이 일정하다'), (2, '모집단이 정규분포일 때만 성립한다'), (3, '표본 크기가 충분히 크면 표본평균의 분포는 정규분포에 가까워진다'), (4, '표본 크기가 커지면 모집단 분포가 정규분포가 된다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_62' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '모집단 분포와 관계없이 표본 크기가 충분히 크면 표본평균의 분포는 정규분포에 가까워진다. 표본평균의 분산은 σ²/n으로 n이 커질수록 작아진다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_62' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_63', '대응표본 t-검정', '같은 사람들에게 다이어트 프로그램 전후의 체중을 측정해 효과를 검정할 때 적합한 방법은?', 'medium', c.category_id, '같은 대상의 전후 측정값은 서로 대응되므로 대응표본 t-검정을 쓴다.', 61, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_63');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '독립표본 t-검정'), (2, '대응표본 t-검정'), (3, '일원분산분석'), (4, '카이제곱 검정')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_63' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, '같은 대상의 전후 측정값은 서로 대응되므로 대응표본 t-검정을 쓴다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_63' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_64', 'R 데이터 요약', 'R에서 데이터 프레임의 각 변수에 대해 최솟값, 사분위수, 평균, 최댓값을 한 번에 보여주는 함수는?', 'easy', c.category_id, 'summary()는 수치형 변수의 요약 통계량과 factor의 빈도를 보여준다. str()은 구조, dim()은 행·열 수를 보여준다.', 74, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_64');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'head()'), (2, 'dim()'), (3, 'str()'), (4, 'summary()')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_64' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'summary()는 수치형 변수의 요약 통계량과 factor의 빈도를 보여준다. str()은 구조, dim()은 행·열 수를 보여준다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_64' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_65', '나이브 베이즈', '나이브 베이즈 분류기의 기본 가정으로 옳은 것은?', 'medium', c.category_id, '나이브 베이즈는 클래스가 주어졌을 때 설명변수들이 서로 독립이라고 가정하고 베이즈 정리로 확률을 계산한다.', 64, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_65');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '모든 설명변수가 서로 조건부 독립이다'), (2, '모든 설명변수가 정규분포를 따른다'), (3, '목표변수가 연속형이다'), (4, '설명변수 간 다중공선성이 높다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_65' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '나이브 베이즈는 클래스가 주어졌을 때 설명변수들이 서로 독립이라고 가정하고 베이즈 정리로 확률을 계산한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_65' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_66', '순차 패턴 분석', '연관분석에 시간 순서를 반영해 "노트북 구매 후 일주일 안에 마우스 구매"와 같은 패턴을 찾는 분석은?', 'medium', c.category_id, '순차 패턴 분석은 구매 시점의 순서 정보를 포함해 연관 규칙을 찾는다.', 60, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_66');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '군집분석'), (2, '주성분분석'), (3, '다차원 척도법'), (4, '순차 패턴(Sequence) 분석')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_66' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '순차 패턴 분석은 구매 시점의 순서 정보를 포함해 연관 규칙을 찾는다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_66' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_67', '서포트 벡터 머신', '서포트 벡터 머신(SVM)에 대한 설명으로 옳지 않은 것은?', 'medium', c.category_id, 'SVM은 정확도가 높지만 데이터가 많을수록 학습 시간이 오래 걸리고, 커널과 파라미터 선택이 중요하다.', 56, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_67');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '마진 경계에 위치한 관측치를 서포트 벡터라 한다'), (2, '학습 속도가 매우 빨라 대용량 데이터에 항상 유리하다'), (3, '클래스 사이의 마진(margin)을 최대화하는 초평면을 찾는다'), (4, '커널 함수를 이용해 비선형 분류도 할 수 있다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_67' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'SVM은 정확도가 높지만 데이터가 많을수록 학습 시간이 오래 걸리고, 커널과 파라미터 선택이 중요하다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_67' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_68', '크루스칼-왈리스 검정', '정규성을 만족하지 않는 세 개 이상 독립 집단의 중앙값 차이를 검정하는 비모수 방법은?', 'medium', c.category_id, '크루스칼-왈리스 검정은 일원분산분석의 비모수 버전이다. 맨-휘트니 U 검정은 두 독립 집단을 비교한다.', 63, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_68');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '대응표본 t-검정'), (2, '맨-휘트니 U 검정'), (3, '크루스칼-왈리스 검정'), (4, '부호 검정')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_68' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, '크루스칼-왈리스 검정은 일원분산분석의 비모수 버전이다. 맨-휘트니 U 검정은 두 독립 집단을 비교한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_68' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_69', '잔차 분석', '회귀모형의 잔차를 적합값에 대해 그렸을 때 깔때기 모양으로 퍼지는 패턴이 보인다면 위배된 가정은?', 'medium', c.category_id, '잔차의 퍼짐이 적합값에 따라 커지면 오차의 분산이 일정하지 않은 것으로 등분산성 가정이 위배된 것이다.', 59, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_69');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '등분산성'), (2, '정규성'), (3, '선형성'), (4, '독립성')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_69' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '잔차의 퍼짐이 적합값에 따라 커지면 오차의 분산이 일정하지 않은 것으로 등분산성 가정이 위배된 것이다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_69' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_70', 'R 리스트', '다음 R 코드의 실행 결과는?

```r
l <- list(a = 1:3, b = "x")
length(l)
```', 'medium', c.category_id, 'length()는 리스트의 원소(요소) 개수를 반환한다. 리스트 l의 원소는 a와 b 두 개다.', 66, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_70');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '1'), (2, '2'), (3, '3'), (4, '4')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_70' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'length()는 리스트의 원소(요소) 개수를 반환한다. 리스트 l의 원소는 a와 b 두 개다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_70' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_71', 'R tapply 함수', '다음 R 코드의 실행 결과는?

```r
score <- c(80, 90, 70, 60)
group <- c("A", "A", "B", "B")
tapply(score, group, mean)
```', 'medium', c.category_id, 'tapply()는 그룹별로 함수를 적용한다. A는 (80 + 90)/2 = 85, B는 (70 + 60)/2 = 65 다.', 62, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_71');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, 'A 170  B 130'), (2, 'A 80  B 70'), (3, 'A 85  B 65'), (4, 'A 75  B 75')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_71' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, 'tapply()는 그룹별로 함수를 적용한다. A는 (80 + 90)/2 = 85, B는 (70 + 60)/2 = 65 다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_71' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_72', 'FP-Growth', 'FP-Growth 알고리즘에 대한 설명으로 옳은 것은?', 'medium', c.category_id, 'FP-Growth는 데이터베이스를 두 번만 스캔해 FP-Tree를 만들고 후보 생성 없이 빈발 패턴을 찾으므로 Apriori보다 빠르다.', 58, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_72');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '데이터베이스를 여러 번 반복해서 스캔해야 한다'), (2, '연속형 변수의 군집에 쓰인다'), (3, '후보 항목집합을 단계별로 모두 생성한다'), (4, 'FP-Tree로 거래 데이터를 압축해 후보 생성 없이 빈발 항목집합을 찾는다')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_72' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, 'FP-Growth는 데이터베이스를 두 번만 스캔해 FP-Tree를 만들고 후보 생성 없이 빈발 패턴을 찾으므로 Apriori보다 빠르다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_72' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_73', '이원분산분석', '두 요인(예: 비료 종류, 물 주는 양)의 효과와 두 요인의 상호작용 효과를 함께 검정하는 방법은?', 'medium', c.category_id, '이원분산분석은 두 요인의 주효과와 교호작용(상호작용) 효과를 검정한다.', 65, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_73');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '이원분산분석'), (2, '대응표본 t-검정'), (3, '카이제곱 독립성 검정'), (4, '일원분산분석')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_73' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '이원분산분석은 두 요인의 주효과와 교호작용(상호작용) 효과를 검정한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_73' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_74', 'R 문자열 처리', '다음 R 코드의 실행 결과는?

```r
x <- "ADsP-2026"
substr(x, 1, 4)
```', 'medium', c.category_id, 'substr(x, start, stop)은 start부터 stop번째 문자까지 잘라낸다. 1~4번째 문자는 "ADsP"다.', 61, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_74');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '"ADsP-"'), (2, '"A"'), (3, '"ADsP"'), (4, '"2026"')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_74' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 3, 'substr(x, start, stop)은 start부터 stop번째 문자까지 잘라낸다. 1~4번째 문자는 "ADsP"다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_74' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_75', 'R 조건 함수', '다음 R 코드의 실행 결과는?

```r
x <- c(3, 8, 5)
ifelse(x > 4, "H", "L")
```', 'hard', c.category_id, 'ifelse()는 벡터의 원소마다 조건을 검사한다. 3은 L, 8과 5는 H다.', 39, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_75');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '"H"'), (2, '"L" "H" "H"'), (3, '"H" "L" "H"'), (4, '"L" "L" "H"')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_75' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'ifelse()는 벡터의 원소마다 조건을 검사한다. 3은 L, 8과 5는 H다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_75' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_76', '신경망 구조 설계', '인공신경망의 은닉층 노드 수에 대한 설명으로 옳은 것은?', 'hard', c.category_id, '노드가 너무 적으면 과소적합, 너무 많으면 과대적합이 생긴다. 은닉층이 없는 단층 퍼셉트론은 XOR 같은 비선형 문제를 풀지 못한다.', 46, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_data_mining' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_76');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '노드 수는 많을수록 항상 일반화 성능이 좋아진다'), (2, '노드 수는 입력 변수 수와 반드시 같아야 한다'), (3, '은닉층이 없어도 XOR 문제를 풀 수 있다'), (4, '노드 수가 너무 적으면 복잡한 의사결정 경계를 만들기 어렵다(과소적합)')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_76' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 4, '노드가 너무 적으면 과소적합, 너무 많으면 과대적합이 생긴다. 은닉층이 없는 단층 퍼셉트론은 XOR 같은 비선형 문제를 풀지 못한다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_76' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_77', '모수 검정과 비모수 검정 선택', '두 독립 집단의 표본 크기가 각각 8로 작고 정규성 가정이 의심될 때, 두 집단의 위치(중앙값) 차이를 검정하기에 가장 적절한 방법은?', 'hard', c.category_id, '표본이 작고 정규성이 의심되는 두 독립 집단 비교에는 비모수 방법인 윌콕슨 순위합 검정(맨-휘트니 U 검정)이 적절하다.', 42, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_statistics' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_77');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '윌콕슨 순위합 검정(맨-휘트니 U 검정)'), (2, '대응표본 t-검정'), (3, '카이제곱 적합도 검정'), (4, '독립표본 t-검정')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_77' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 1, '표본이 작고 정규성이 의심되는 두 독립 집단 비교에는 비모수 방법인 윌콕슨 순위합 검정(맨-휘트니 U 검정)이 적절하다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_77' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);
INSERT INTO endless.problems (source_problem_id, title, description, difficulty, category_id, explanation, correct_rate, points, is_active)
SELECT 'adsp_endless_78', 'R 반복문', '다음 R 코드의 실행 결과는?

```r
s <- 0
for (i in 1:5) {
  if (i %% 2 == 0) next
  s <- s + i
}
s
```', 'hard', c.category_id, 'next는 짝수일 때 이번 반복을 건너뛴다. 홀수 1 + 3 + 5 = 9 다.', 38, 10, TRUE
FROM endless.problem_categories c WHERE c.category_code = 'adsp_r_data_mart' AND NOT EXISTS (SELECT 1 FROM endless.problems p WHERE p.source_problem_id = 'adsp_endless_78');
INSERT INTO endless.problem_choices (problem_id, choice_no, choice_text)
SELECT p.problem_id, v.no, v.txt FROM endless.problems p CROSS JOIN (VALUES (1, '6'), (2, '9'), (3, '15'), (4, '5')) AS v(no, txt)
WHERE p.source_problem_id = 'adsp_endless_78' AND NOT EXISTS (SELECT 1 FROM endless.problem_choices x WHERE x.problem_id = p.problem_id);
INSERT INTO endless.problem_answer_keys (problem_id, correct_answer, answer_commentary)
SELECT p.problem_id, 2, 'next는 짝수일 때 이번 반복을 건너뛴다. 홀수 1 + 3 + 5 = 9 다.' FROM endless.problems p
WHERE p.source_problem_id = 'adsp_endless_78' AND NOT EXISTS (SELECT 1 FROM endless.problem_answer_keys k WHERE k.problem_id = p.problem_id);

COMMIT;
