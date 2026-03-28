# 백엔드 전달사항: 개인정보 이용 동의 필드 추가

**작성일**: 2026-03-28
**작성자**: 프론트엔드
**대상**: 백엔드 개발자 (BeolLe)
**우선순위**: HIGH — 프론트엔드 배포 후 즉시 적용 필요

---

## 변경 배경

회원가입 시 기존 서비스 이용약관 동의(`terms_agreed`)에 더해, **개인정보 수집 및 이용 동의**(`privacy_agreed`)를 별도로 받도록 프론트엔드가 변경되었습니다.

개인정보 보호법 제15조 제1항 제1호에 따라 개인정보 수집 시 별도의 동의를 받아야 하며, 서비스 이용약관 동의와 분리하여 관리해야 합니다.

---

## 프론트엔드 변경 내역

### API 요청 변경 (`POST /api/auth/register`)

기존 요청 body:
```json
{
  "email": "user@example.com",
  "nickname": "사용자",
  "password": "********",
  "terms_agreed": true
}
```

변경 후 요청 body:
```json
{
  "email": "user@example.com",
  "nickname": "사용자",
  "password": "********",
  "terms_agreed": true,
  "privacy_agreed": true
}
```

### 신규 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `privacy_agreed` | `boolean` | Yes | 개인정보 수집 및 이용 동의 여부 |

---

## 백엔드 작업 요청

### 1. API 수신 처리
- `POST /api/auth/register` 엔드포인트에서 `privacy_agreed` 필드를 수신
- `privacy_agreed`가 `true`가 아닌 경우 회원가입 거부 (400 Bad Request)

### 2. DB 스키마 변경
- `users` 테이블에 `privacy_agreed` 컬럼 추가

```sql
ALTER TABLE users ADD COLUMN privacy_agreed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN privacy_agreed_at TIMESTAMP NULL;
```

### 3. 저장 로직
- 회원가입 시 `privacy_agreed = true`, `privacy_agreed_at = NOW()` 저장
- 기존 `terms_agreed`, `terms_agreed_at`과 동일한 패턴 적용

### 4. 기존 사용자 마이그레이션
- 기존 회원은 `privacy_agreed = true`, `privacy_agreed_at = terms_agreed_at`으로 일괄 설정 (기존 약관에 개인정보 보호 조항이 포함되어 있었으므로)

---

## 완료 조건

- [ ] `POST /api/auth/register`에서 `privacy_agreed` 필드 수신 및 검증
- [ ] `privacy_agreed = false`일 때 400 에러 반환
- [ ] DB에 `privacy_agreed`, `privacy_agreed_at` 저장
- [ ] 기존 사용자 마이그레이션 스크립트 작성 및 실행
- [ ] `/api/auth/me` 응답에 `privacy_agreed` 포함 (선택)

---

## 참고

- 프론트엔드에서는 두 체크박스(약관 + 개인정보) 모두 체크해야 회원가입 버튼이 활성화됩니다
- 개인정보 동의서 전문은 `frontend/src/components/AuthModal.tsx`의 `PRIVACY_TEXT` 상수에 있습니다
- 수집 항목: 이메일, 비밀번호(암호화), 닉네임(선택), 서비스 이용기록, 접속로그, 기기정보
- 처리 위탁: Amplitude (이용 행태 분석)
