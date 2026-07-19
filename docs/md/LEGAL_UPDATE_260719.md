# 개인정보처리방침·약관·AI 고지 최신화 (2026-07-19)

기획 Notion "개인정보처리방침 및 결제 정보처리방침 업데이트" + `docs/PRD_PAYMENT_SERVICE.html`
기준으로 진행한 작업 및 후속(보류) 항목 기록.

## 이번에 반영한 것 (1차 우선순위)

- **약관/개인정보처리방침 공용 상수화**
  - `frontend/src/constants/legal.ts` 신설. `TERMS_TEXT`, `PRIVACY_TEXT`(개인정보처리방침 전문),
    시행일 상수(`TERMS_EFFECTIVE_DATE`, `PRIVACY_EFFECTIVE_DATE`)를 단일 소스로 관리.
  - `AuthModal.tsx`(회원가입 동의), `MyPage.tsx`(내 정보 > 약관 및 동의)의 중복 하드코딩 제거 →
    공용 상수 import로 교체.
- **개인정보처리방침 최신화** (시행일 2026-07-19)
  - 수집 항목 상세화: 회원가입/로그인, 서비스 이용 기록, AI 기능(요청/응답 원문·토큰·시각),
    결제 도입 시 항목.
  - 이용 목적 / 보관 기간(회원·학습기록·AI 원문 로그·접속로그·결제기록) 정비.
  - 제3자 제공·처리위탁·**국외 이전** 목록 정리:
    Google OAuth, **Gemini API, Claude API**, Amplitude, Toss Payments, Cloudflare, Slack.
  - AI 기능 안내(외부 전송·민감정보 입력 금지), 이용자 권리, 회원 탈퇴 시 처리,
    안전성 확보 조치, 결제 정보 처리(도입 예정) 섹션 추가.
  - 이용약관에 AI 기능(제6조)·유료 서비스(제10조) 조항 추가.
- **AI 화면 고지 문구 추가**
  - `AIStreamPanel.tsx` 하단에 "입력 내용·문제 정보가 외부 AI 제공업체(Gemini/Claude)로
    전송될 수 있으며 민감정보 입력 금지" 고지 상시 노출. (해설/SQL 리뷰/무한풀이 공용 패널)
- **AI 해설 렌더링 모델 무관(model-agnostic) 개선**
  - `AIStreamPanel.tsx`: 강조 정규화가 `**bold**`뿐 아니라 `__bold__`도 처리.
  - 모든 헤더 레벨(h1~h6) 스타일 매핑(기존 h3만) → 모델이 `##`/`####` 등 어떤 레벨을 써도 일관 렌더.
  - `em`, 링크(`a`), 순서 목록(`ol`), 구분선(`hr`), 표(table/th/td) 스타일 추가.
  - 코드블록 판정: 언어 태그(`language-`) 없이 줄바꿈만 있는 펜스도 블록으로 인식.
  - 목적: Gemini 응답 포맷 가정에 묶여 있던 렌더 로직을 Claude 등 다른 모델 응답에도
    동일하게 적용. **모델별 UI 분기는 두지 않음(모델 무관 단일 UI).**

## 결제 관련 (2차) — 기록만, 백엔드 구성 중

- `docs/md/PAID_SERVICE_TERMS.md` — 유료서비스 이용약관 초안
- `docs/md/REFUND_POLICY.md` — 환불 정책 초안
- `docs/md/PAYMENT_NOTICE.md` — 결제 화면 고지 문구 초안
- 개인정보처리방침에 "결제 도입 시" 수집 항목/보관/위탁(Toss Payments) 사전 반영 완료.
- **확인 필요(가격/결제방식 불일치):** PRD = 월 2,900원 정기구독(빌링키·자동갱신),
  Notion 예시 = 1,000원/30일 단건결제. 최종 상품 구조 확정 후 세 문서의 가격·결제방식 일치 필요.

## 보류 / 후속 TODO

- **[3차] 마케팅 정보 수신 동의 [선택]**
  - 회원가입 동의 구조상 `[선택] 마케팅 정보 수신 동의`가 필요하나 이번 범위에서 제외.
  - 선행 조건: 백엔드 회원 스키마에 `marketing_agreed`(+ `marketing_agreed_at`) 컬럼,
    `/auth/register`·`/auth/social/register`에 필드 추가, `auth.consent_versions`에 마케팅
    동의 버전 추가. 이후 `AuthModal.tsx`에 선택 체크박스(스크롤 없이 선택 가능) 추가.
- 결제 백엔드 연동 시: 개인정보처리방침의 "결제 도입 시/예정" 표현을 정식 문구로 전환,
  통신판매업 신고번호·사업자 정보 기입.
- `auth.consent_versions`에 2026-07-19 개인정보처리방침 개정 버전 등록(백엔드/DB 작업).
- (선택) 개인정보처리방침/이용약관 전용 페이지·라우트(`/privacy`, `/terms`) 신설 검토.
