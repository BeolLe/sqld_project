# ADsP 개념학습 반영

테스트 호스트에서 `/adsp/learn`과 `/adsp/learn/adsp-1-1`~`adsp-1-8`을 제공합니다. 기존 `LearnIndexPage`, `LearnUnitPage`, `BlockRenderer`, `LearnBlank`를 사용하고 공통 로그인을 유지합니다. SQLD 30개 단원과 `/learn` 경로는 그대로입니다. 시험 전환 시 상세 항목 ID를 넘기지 않고 해당 시험 목차로 이동합니다.

현재 본문은 **로컬 TypeScript**입니다. `REMOTE_LESSON_ENABLED = false`를 유지하므로 DB 적재 전에도 8단원·41블록·51빈칸·24사례를 볼 수 있습니다. 빈칸 결과는 시험별 브라우저 저장소에만 기록합니다. 공통 계정·포인트와 기존 서버 테이블에는 변경이 없습니다. 검수본의 가짜 인증·무전송 어댑터를 서비스에 복사하지 않았습니다.

API 헬퍼와 원격 레슨 훅은 `exam_type=sqld|adsp`를 전달하도록 준비했습니다. 현행 API는 `education.curricula.exam_type`으로 소속을 판정하며 `lesson_versions.body_markdown`을 반환합니다. 본문과 빈칸을 API에서 읽고 있다는 의미는 아닙니다.

## DB 적재 파일

SQL은 사용자 직접 실행을 위한 별도 전달물이며 저장소 시작 과정이나 CI에서 실행하지 않습니다. `/Users/ronny/Documents/codex/2026-10-25/task-3/adsp-db-import/`의 SQL·실행 안내를 참고합니다. 기존 검수본 `/Users/ronny/Documents/codex/adsp-concept-review-v2`는 보존합니다.

현재 DB API에는 LearnBlock/Blank JSON 필드가 없습니다. 적재 SQL의 Markdown은 빈칸 정답을 본문에 넣어 노트를 표현합니다. 표와 설명은 보존되지만 원본의 콜아웃 종류·빈칸 ID·허용 답안·입력 채점을 Markdown만으로 복원할 수 없습니다. API 전환에는 실제 DDL 확인 후 버전별 구조화 콘텐츠(JSON 또는 블록/빈칸 테이블)를 추가하고, API가 그 구조를 반환해 기존 BlockRenderer를 호출하게 하는 확장 단계가 필요합니다. 이 작업에서 임의의 컬럼·DDL을 도입하지 않습니다.

## 검증

`npm run check:adsp-learn`은 8단원 렌더, 노트/퀴즈, 미로그인·잘못된 시험 ID, SQLD 30단원 회귀, 진도 분리, API exam_type 및 404 처리를 검사합니다. API 요청은 테스트 안에서 모킹하며 DB에 연결하지 않습니다. `npm run build`로 최종 타입·번들을 확인합니다. 직접 브라우저 클릭 검증과 배포된 자산 검증은 별도 결과로 구분합니다.

코드 롤백은 이 변경 커밋을 되돌리는 방식입니다. SQLD 데이터 삭제·변경이나 공통 포인트 재산정은 포함하지 않습니다. DB 적재는 별도의 트랜잭션이며, 실행 전 해당 전달물의 사전 점검을 통과해야 합니다. 코드 되돌리기만으로 DB에 적재한 데이터를 삭제하지 않습니다.
