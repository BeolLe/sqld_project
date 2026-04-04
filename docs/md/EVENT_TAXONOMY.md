# SolSQLD Event Taxonomy

> **최종 업데이트:** 2026-03-28
> **Amplitude Project:** SolSQLD
> **네이밍 규칙:** `{category}_{object}_{action}` (snake_case)

---

## 네이밍 컨벤션

| 구성 요소 | 설명 | 예시 |
|-----------|------|------|
| **category** | 도메인 카테고리 | `common`, `exam`, `sql`, `dashboard` |
| **object** | 대상 객체 | `page`, `modal`, `query`, `answer` |
| **action** | 사용자 행위 | `viewed`, `clicked`, `submitted`, `typed` |

### Action 용어 통일

| Action | 의미 | 사용 시점 |
|--------|------|----------|
| `viewed` | 페이지/섹션이 화면에 노출됨 | 페이지 마운트 시 |
| `clicked` | 버튼/링크를 클릭함 | onClick |
| `submitted` | 폼 또는 답안을 제출함 | 서버 전송 시점 |
| `selected` | 선택지를 골랐음 | 라디오/체크박스/필터 변경 시 |
| `typed` | 텍스트 입력이 발생함 | debounce 후 |
| `toggled` | on/off 전환 | 접기/펼치기, 비밀번호 표시 |
| `saved` | 명시적 저장 액션 | 저장 버튼 클릭 시 |
| `expired` | 시간 만료 | 타이머 종료 시 |
| `confirmed` | 확인 모달에서 확정함 | 모달 확인 버튼 |
| `dismissed` | 모달/팝업을 닫음 | 모달 닫기/취소 |

---

## 1. Common (공통)

> 헤더, 인증, 네비게이션 등 전역에서 발생하는 이벤트

### 1.1 페이지 조회

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `common_page_viewed` | 모든 페이지 마운트 시 | `page_name`, `page_path`, `referrer` | autocapture |

### 1.2 인증

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `common_auth_modal_viewed` | 로그인/회원가입 모달 열림 | `mode: 'login' \| 'signup'` | - |
| `common_auth_modal_dismissed` | 모달 닫기(X 또는 배경 클릭) | `mode` | - |
| `common_auth_mode_toggled` | 모달 내 로그인↔회원가입 전환 | `from_mode`, `to_mode` | - |
| `common_signup_submitted` | 회원가입 폼 제출 | `email_domain`, `has_nickname`, `terms_agreed` | `user_signup` |
| `common_signup_succeeded` | 회원가입 성공 | `user_id`, `nickname` | `user_signup` |
| `common_signup_failed` | 회원가입 실패 | `error_message` | - |
| `common_login_submitted` | 로그인 폼 제출 | `email_domain` | - |
| `common_login_succeeded` | 로그인 성공 | `user_id`, `nickname` | `user_login` |
| `common_login_failed` | 로그인 실패 | `error_message` | - |
| `common_logout_clicked` | 로그아웃 버튼 클릭 | `user_id` | - |
| `common_terms_expanded` | 약관 전문 보기 펼침 | - | - |
| `common_terms_scrolled` | 약관 끝까지 스크롤 | - | - |
| `common_password_visibility_toggled` | 비밀번호 표시/숨김 전환 | `visible: boolean` | - |

### 1.3 네비게이션

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `common_nav_clicked` | 헤더 네비게이션 클릭 | `target: 'home' \| 'exams' \| 'sql_practice' \| 'dashboard'` | - |
| `common_logo_clicked` | SolSQLD 로고 클릭 | `from_page` | - |

---

## 2. Exam (모의고사)

> 모의고사 목록 → 시험 풀이 → 결과 확인 퍼널

### 2.1 모의고사 목록 (`/exams`)

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `exam_list_viewed` | 목록 페이지 마운트 | `exam_count` | - |
| `exam_card_clicked` | 특정 모의고사 선택 | `exam_id`, `exam_round`, `difficulty` | - |

### 2.2 시험 풀이 (`/exams/:id/taking`)

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `exam_session_started` | 시험 페이지 마운트 | `exam_id`, `session_id`, `total_problems` | `exam_start` |
| `exam_answer_selected` | 객관식 선택지 클릭 | `exam_id`, `problem_id`, `problem_index`, `selected_option` | `choice_select` |
| `exam_page_navigated` | 페이지 넘기기 (좌우 버튼/하단 번호) | `exam_id`, `from_page`, `to_page`, `direction` | - |
| `exam_submit_clicked` | 최종 제출 버튼 클릭 | `exam_id`, `answered_count`, `unanswered_count` | - |
| `exam_submit_confirmed` | 제출 확인 모달에서 "제출" 클릭 | `exam_id`, `session_id`, `score`, `answers` | `exam_submit` |
| `exam_submit_cancelled` | 제출 확인 모달에서 "계속 풀기" | `exam_id` | - |
| `exam_timer_expired` | 타이머 0분 도달 (자동 제출) | `exam_id`, `session_id`, `answered_count` | - |
| `exam_exit_attempted` | 이탈 확인 모달 노출 | `exam_id`, `target_path`, `answered_count` | - |
| `exam_exit_confirmed` | 이탈 모달에서 "나가기" 클릭 | `exam_id`, `target_path` | - |
| `exam_exit_cancelled` | 이탈 모달에서 "계속 풀기" | `exam_id` | - |
| `exam_notepad_saved` | 메모장 저장 버튼 클릭 | `exam_id`, `session_id`, `content_length` | `notepad_update` |
| `exam_notepad_typed` | 메모장 입력 (debounce) | `exam_id`, `session_id`, `content_length` | `notepad_update` |

### 2.3 결과 확인 (`/exams/:id/result`)

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `exam_result_viewed` | 결과 페이지 마운트 | `exam_id`, `score`, `is_passed`, `correct_count`, `wrong_count` | `stats_update` |
| `exam_retry_clicked` | "다시 풀기" 버튼 클릭 | `exam_id`, `previous_score` | - |
| `exam_list_return_clicked` | "모의고사 목록" 버튼 클릭 | `exam_id` | - |

---

## 3. SQL (SQL 실습)

> SQL 실습 목록 → 문제 풀이 퍼널

### 3.1 실습 목록 (`/sql-practice`)

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `sql_list_viewed` | 목록 페이지 마운트 | `total_problems` | - |
| `sql_search_typed` | 검색어 입력 (debounce) | `search_term`, `result_count` | - |
| `sql_filter_selected` | 난이도 필터 변경 | `difficulty: 'all' \| 'easy' \| 'medium' \| 'hard'`, `result_count` | - |
| `sql_sort_selected` | 정렬 기준 변경 | `sort_key`, `result_count` | - |
| `sql_problem_clicked` | 문제 카드 클릭 | `problem_id`, `difficulty`, `category`, `correct_rate` | - |

### 3.2 문제 풀이 (`/sql-practice/:id`)

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `sql_practice_viewed` | 문제 페이지 마운트 | `problem_id`, `difficulty`, `category` | - |
| `sql_query_executed` | 실행 버튼 또는 Cmd/Ctrl+Enter | `problem_id`, `query`, `has_result`, `execution_time_ms` | `sql_execute` |
| `sql_query_execute_failed` | 실행 중 에러 발생 | `problem_id`, `query`, `error_message` | - |
| `sql_answer_submitted` | 제출 버튼 클릭 | `problem_id`, `query`, `is_correct`, `execution_time_ms` | `sql_submit` |
| `sql_result_modal_viewed` | 정답/오답 모달 노출 | `problem_id`, `is_correct` | - |
| `sql_result_modal_dismissed` | 모달 닫기 ("확인" 또는 "다시 풀기") | `problem_id`, `is_correct` | - |
| `sql_hint_toggled` | 힌트 섹션 접기/펼치기 | `problem_id`, `is_open` | - |
| `sql_sample_data_toggled` | 예시 데이터 섹션 접기/펼치기 | `problem_id`, `is_open` | - |
| `sql_exit_attempted` | 이탈 확인 모달 노출 | `problem_id`, `target_path`, `has_query` | - |
| `sql_exit_confirmed` | 이탈 모달에서 "나가기" 클릭 | `problem_id`, `target_path` | - |
| `sql_exit_cancelled` | 이탈 모달에서 "계속 풀기" | `problem_id` | - |
| `sql_editor_resized` | 패널 리사이즈 드래그 완료 | `direction: 'horizontal' \| 'vertical'`, `ratio` | - |

---

## 4. Dashboard (대시보드)

> 학습 현황 조회 페이지

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `dashboard_viewed` | 대시보드 페이지 마운트 | `user_id`, `points`, `is_logged_in` | - |
| `dashboard_login_redirect_clicked` | 비로그인 시 "홈으로 돌아가기" 클릭 | - | - |

---

## 5. System (시스템 이벤트)

> Amplitude에 의해 자동 수집되거나, 포인트/통계 등 시스템에서 발생하는 이벤트

| Event Name | Trigger | Properties | 현재 구현 |
|------------|---------|------------|:---------:|
| `system_points_awarded` | 정답 시 포인트 지급 | `user_id`, `delta`, `problem_id`, `source: 'sql' \| 'exam'` | `points_update` |
| `system_first_visit` | 최초 접속 감지 | `user_id` | `user_first_visit` |
| `[Amplitude] Page Viewed` | (autocapture) 페이지 전환 | `page_path`, `page_title` | autocapture |
| `[Amplitude] Element Clicked` | (autocapture) 요소 클릭 | `element_text`, `element_tag` | autocapture |
| `[Amplitude] Session Start` | (autocapture) 세션 시작 | - | autocapture |

---

## 주요 퍼널 정의

### Funnel 1: 가입 전환 퍼널
```
common_page_viewed (page_name='main')
  → common_auth_modal_viewed (mode='signup')
  → common_signup_submitted
  → common_signup_succeeded
  → common_login_succeeded
```

### Funnel 2: 모의고사 완주 퍼널
```
exam_list_viewed
  → exam_card_clicked
  → exam_session_started
  → exam_answer_selected (반복)
  → exam_submit_clicked
  → exam_submit_confirmed
  → exam_result_viewed
```

### Funnel 3: SQL 실습 완주 퍼널
```
sql_list_viewed
  → sql_problem_clicked
  → sql_practice_viewed
  → sql_query_executed (반복)
  → sql_answer_submitted
  → sql_result_modal_viewed (is_correct=true)
```

### Funnel 4: 재방문 학습 루프
```
common_login_succeeded
  → dashboard_viewed
  → common_nav_clicked (target='exams' | 'sql_practice')
  → exam_session_started | sql_practice_viewed
```

---

## 기존 이벤트 → 신규 이벤트 매핑

| 기존 (현재 코드) | 신규 택소노미 | 비고 |
|------------------|--------------|------|
| `user_signup` | `common_signup_succeeded` | submitted/succeeded 분리 |
| `user_login` | `common_login_succeeded` | submitted/succeeded 분리 |
| `user_first_visit` | `system_first_visit` | 시스템 이벤트로 이동 |
| `exam_start` | `exam_session_started` | 네이밍 통일 |
| `choice_select` | `exam_answer_selected` | 네이밍 통일 |
| `exam_submit` | `exam_submit_confirmed` | 모달 확인 단계 명시 |
| `stats_update` | `exam_result_viewed` | 결과 조회로 의미 명확화 |
| `sql_execute` | `sql_query_executed` | 과거형 통일 |
| `sql_submit` | `sql_answer_submitted` | 네이밍 통일 |
| `points_update` | `system_points_awarded` | 시스템 이벤트로 이동 |
| `notepad_update` | `exam_notepad_typed` / `exam_notepad_saved` | 자동저장과 명시적 저장 분리 |

---

## 구현 우선순위

### Phase 1: 퍼널 핵심 (즉시)
기존 11개 이벤트를 신규 네이밍으로 리네이밍 + 누락된 퍼널 핵심 이벤트 추가

- [ ] `common_auth_modal_viewed` — 가입 퍼널 시작점
- [ ] `exam_list_viewed` — 모의고사 퍼널 시작점
- [ ] `exam_card_clicked` — 모의고사 선택
- [ ] `sql_list_viewed` — SQL 퍼널 시작점
- [ ] `sql_problem_clicked` — SQL 문제 선택
- [ ] `sql_practice_viewed` — SQL 문제 진입

### Phase 2: 행동 분석 보강
이탈/필터/검색 등 상세 행동 이벤트

- [ ] `exam_exit_attempted` / `confirmed` / `cancelled`
- [ ] `sql_search_typed`, `sql_filter_selected`, `sql_sort_selected`
- [ ] `sql_hint_toggled`, `sql_sample_data_toggled`
- [ ] `common_login_failed`, `common_signup_failed`

### Phase 3: 세부 UX 트래킹
- [ ] `exam_page_navigated`
- [ ] `sql_editor_resized`
- [ ] `common_terms_scrolled`, `common_password_visibility_toggled`
- [ ] `dashboard_viewed`

---

## Amplitude Visual Labeling 매핑 가이드

Amplitude의 Visual Labeling 기능으로 기존 이벤트를 리네이밍할 때:

1. **Amplitude > Data > Events** 에서 현재 수집된 이벤트 목록 확인
2. 각 이벤트 옆 **Edit** → **Display Name** 변경
3. 기존 코드의 이벤트명은 유지하되, Amplitude 대시보드에서 신규 택소노미 이름으로 표시

| Amplitude Raw Name | Display Name (Visual Label) |
|--------------------|-----------------------------|
| `user_signup` | `common_signup_succeeded` |
| `user_login` | `common_login_succeeded` |
| `exam_start` | `exam_session_started` |
| `choice_select` | `exam_answer_selected` |
| ... | (위 매핑표 참조) |

> **주의**: Visual Labeling은 표시명만 변경합니다. 코드에서 실제 이벤트명을 변경하려면 `eventLogger.ts`와 각 발화 지점을 수정해야 합니다. 단계적으로 Visual Label 먼저 적용 → 코드 리팩토링 순서를 권장합니다.
