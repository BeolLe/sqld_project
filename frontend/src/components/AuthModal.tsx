import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logEvent } from '../utils/eventLogger';
import { apiFetch } from '../utils/api';
import type { AuthMode } from '../types';

type ModalStep = 'auth' | 'find-email' | 'find-email-result' | 'reset-password' | 'reset-password-verify' | 'reset-password-form' | 'reset-password-done';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TERMS_TEXT = `SolSQLD 서비스 이용약관

제1조 (목적)
본 약관은 SolSQLD(이하 "서비스")가 제공하는 SQLD 자격증 대비 모의고사 및 SQL 실습 서비스의 이용 조건과 절차에 관한 사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "서비스"란 SolSQLD가 제공하는 SQLD 모의고사, SQL 실습, 학습 대시보드 등 일체의 온라인 학습 서비스를 말합니다.
2. "회원"이란 본 약관에 동의하고 회원가입을 완료한 이용자를 말합니다.
3. "콘텐츠"란 서비스 내에서 제공되는 문제, 해설, 학습 자료 등을 말합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스 화면에 게시하거나 기타 방법으로 회원에게 공지함으로써 효력이 발생합니다.
2. 서비스는 관련 법령에 위배되지 않는 범위에서 약관을 변경할 수 있으며, 변경 시 적용일자 7일 전부터 공지합니다.

제4조 (회원가입 및 계정 관리)
1. 회원가입은 이용자가 본 약관 및 개인정보 처리방침에 동의한 후 가입 양식을 작성하여 신청합니다.
2. 회원은 가입 시 제공한 정보에 변경이 있는 경우 즉시 수정하여야 합니다.
3. 계정의 관리 책임은 회원 본인에게 있으며, 타인에게 이용을 허락할 수 없습니다.

제5조 (서비스 이용)
1. 서비스는 회원가입 완료 후 이용할 수 있습니다.
2. 서비스 이용 시간은 원칙적으로 연중무휴 24시간이나, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.

제6조 (지식재산권)
1. 서비스 내 모든 콘텐츠(문제, 해설, 디자인, 소스코드 등)의 지식재산권은 SolSQLD에 귀속됩니다.
2. 회원은 서비스를 통해 제공받은 콘텐츠를 개인 학습 목적으로만 이용할 수 있으며, 무단 복제·배포·상업적 이용을 할 수 없습니다.

제7조 (회원의 의무)
1. 회원은 서비스를 부정한 목적으로 이용하여서는 안 됩니다.
2. 회원은 타인의 정보를 도용하거나 허위 정보를 등록하여서는 안 됩니다.
3. 회원은 서비스의 정상적 운영을 방해하는 행위를 하여서는 안 됩니다.

제8조 (서비스 제공의 중지)
서비스는 다음 각 호에 해당하는 경우 서비스 제공을 일시적으로 중지할 수 있습니다.
1. 시스템 정기 점검 또는 긴급 보수
2. 천재지변, 국가비상사태 등 불가항력적 사유
3. 기타 서비스 운영상 상당한 이유가 있는 경우

제9조 (면책조항)
1. 서비스는 무료로 제공되는 서비스로 인한 손해에 대해 책임을 지지 않습니다.
2. 서비스는 회원의 귀책사유로 발생한 손해에 대해 책임을 지지 않습니다.
3. 서비스가 제공하는 모의고사 및 학습 콘텐츠는 참고용이며, 실제 시험 결과를 보장하지 않습니다.

제10조 (분쟁 해결)
본 약관과 관련한 분쟁은 대한민국 법령에 따라 해결하며, 관할 법원은 민사소송법에 따릅니다.

부칙
본 약관은 2026년 3월 28일부터 시행합니다.`;

const PRIVACY_TEXT = `개인정보 수집 및 이용 동의서

SolSQLD(이하 "서비스")는 「개인정보 보호법」 제15조 제1항 제1호, 제17조 제1항 제1호, 제22조 제4항에 의거하여 아래와 같이 개인정보를 수집·이용합니다. 내용을 자세히 읽으신 후 동의 여부를 결정하여 주십시오.

1. 개인정보의 수집 및 이용 목적
- 회원 식별 및 가입 의사 확인
- 서비스 제공 및 학습 진도 관리
- 모의고사 응시 결과 저장 및 통계 제공
- SQL 실습 이력 관리
- 서비스 개선을 위한 이용 행태 분석

2. 수집하는 개인정보의 항목
[필수 항목]
- 이메일 주소: 로그인 및 회원 식별에 사용
- 비밀번호: 계정 보안을 위해 암호화하여 저장

[선택 항목]
- 닉네임: 서비스 내 표시 이름 (미입력 시 이메일 앞부분으로 자동 설정)

[자동 수집 항목]
- 서비스 이용 기록: 모의고사 응시 기록, SQL 실습 이력, 학습 진도
- 접속 로그: IP 주소, 브라우저 종류, 접속 일시
- 기기 정보: 운영체제, 화면 해상도

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.
- 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관합니다.
  · 전자상거래 등에서의 소비자 보호에 관한 법률
    - 계약 또는 청약철회에 관한 기록: 5년
    - 접속에 관한 기록: 3개월

4. 동의를 거부할 권리 및 거부에 따른 불이익
- 위 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다.
- 다만 필수 항목에 대한 동의를 거부하실 경우 회원가입 및 서비스 이용이 제한됩니다.

5. 개인정보의 제3자 제공
- 서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
- 다만, 법령에 의해 요구되는 경우에 한하여 관련 기관에 제공할 수 있습니다.

6. 개인정보의 처리 위탁
- 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.
  · 서비스 이용 분석: Amplitude (미국) — 서비스 이용 행태 분석 목적
  · 클라우드 호스팅: 서비스 인프라 운영 목적

7. 개인정보 보호책임자
- 서비스 운영팀 (solsqld@solsqld.com)

8. 정보주체의 권리
- 이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제, 처리정지를 요구할 수 있습니다.
- 개인정보 관련 문의는 개인정보 보호책임자에게 연락해 주십시오.

본 동의서는 2026년 3월 28일부터 적용됩니다.`;

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

interface PendingSocialSignup {
  provider: string;
  token: string;
  email?: string;
  nickname?: string;
}

const PENDING_SOCIAL_SIGNUP_KEY = 'pendingSocialSignup';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const SIGNUP_REASON_OPTIONS = [
  { value: 'sqld_exam', label: 'SQLD 자격증 시험 준비', code: 1 },
  { value: 'sql_skill', label: 'SQL 실력 향상', code: 2 },
  { value: 'school_work', label: '학교 · 직장 학습용', code: 3 },
] as const;

function getSignupPurposePayload(signupReason: string, signupReasonOther: string) {
  if (signupReason === 'other') {
    return {
      signupPurposeCode: 4,
      signupPurposeOther: signupReasonOther.trim(),
    };
  }

  const matchedOption = SIGNUP_REASON_OPTIONS.find((option) => option.value === signupReason);
  return {
    signupPurposeCode: matchedOption?.code ?? null,
    signupPurposeOther: '',
  };
}

export default function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  const { login, signup, completeSocialSignup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [privacyScrolled, setPrivacyScrolled] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [signupReason, setSignupReason] = useState('');
  const [signupReasonOther, setSignupReasonOther] = useState('');
  const [reasonOpen, setReasonOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingSocialSignup, setPendingSocialSignup] = useState<PendingSocialSignup | null>(null);

  // 계정 찾기 step 상태
  const [step, setStep] = useState<ModalStep>('auth');
  const [findNickname, setFindNickname] = useState('');
  const [findEmail, setFindEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const termsRef = useRef<HTMLDivElement>(null);
  const privacyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedSocialSignup = window.sessionStorage.getItem(PENDING_SOCIAL_SIGNUP_KEY);
    if (mode === 'signup' && storedSocialSignup) {
      try {
        const parsed = JSON.parse(storedSocialSignup) as PendingSocialSignup;
        const payload = decodeJwtPayload(parsed.token);
        const resolvedEmail = typeof payload?.email === 'string' ? payload.email : '';
        const resolvedNickname = typeof payload?.nickname === 'string' ? payload.nickname : '';
        setPendingSocialSignup({
          ...parsed,
          email: resolvedEmail,
          nickname: resolvedNickname,
        });
        if (resolvedEmail) {
          setEmail(resolvedEmail);
        }
        if (resolvedNickname) {
          setNickname(resolvedNickname);
        }
      } catch {
        window.sessionStorage.removeItem(PENDING_SOCIAL_SIGNUP_KEY);
        setPendingSocialSignup(null);
      }
    } else {
      setPendingSocialSignup(null);
    }

    logEvent('common_auth_modal_viewed', { mode });
    setError('');
    setSuccess('');
    setTermsScrolled(false);
    setTermsAgreed(false);
    setTermsOpen(false);
    setPrivacyScrolled(false);
    setPrivacyAgreed(false);
    setPrivacyOpen(false);
    setSignupReason('');
    setSignupReasonOther('');
    setReasonOpen(false);
    setStep('auth');
    setFindNickname('');
    setFindEmail('');
    setMaskedEmail('');
    setResetNewPassword('');
    setResetConfirmPassword('');
    setResetToken('');
  }, [mode]);

  function handleTermsScroll() {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      setTermsScrolled(true);
    }
  }

  function handlePrivacyScroll() {
    const el = privacyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      setPrivacyScrolled(true);
    }
  }

  function goBackToAuth() {
    setStep('auth');
    setError('');
    setSuccess('');
  }

  function handleGoogleLogin() {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `${API_BASE_URL}/auth/google/start?next=${encodeURIComponent(next)}`
    );
  }

  async function handleFindEmail(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!findNickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      const res = await apiFetch<{ maskedEmail: string }>('/api/auth/find-email', {
        method: 'POST',
        body: JSON.stringify({ nickname: findNickname.trim() }),
      });
      setMaskedEmail(res.maskedEmail);
      setStep('find-email-result');
      logEvent('common_auth_modal_viewed', { step: 'find-email', found: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '계정을 찾을 수 없습니다.');
      logEvent('common_auth_modal_viewed', { step: 'find-email', found: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPasswordRequest(e?: React.FormEvent) {
    e?.preventDefault();
    setError('');
    if (!findEmail.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      await apiFetch<{ message: string }>('/api/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email: findEmail.trim() }),
      });
      setStep('reset-password-verify');
      setError('');
      logEvent('common_auth_modal_viewed', { step: 'reset-password-request', sent: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증번호 발송에 실패했습니다.');
      logEvent('common_auth_modal_viewed', { step: 'reset-password-request', sent: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleResetTokenVerify(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!resetToken.trim()) {
      setError('인증번호를 입력해주세요.');
      return;
    }
    setStep('reset-password-form');
    setError('');
  }

  async function handleResetPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (resetNewPassword.length < 8) {
      setError('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setLoading(true);
      await apiFetch<{ message: string }>('/api/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({
          token: resetToken.trim(),
          new_password: resetNewPassword,
        }),
      });
      setStep('reset-password-done');
      logEvent('common_auth_modal_viewed', { step: 'reset-password', success: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다.');
      logEvent('common_auth_modal_viewed', { step: 'reset-password', success: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || (!pendingSocialSignup && !password)) {
      setError(
        pendingSocialSignup
          ? '이메일 정보를 불러오지 못했습니다. 다시 시도해주세요.'
          : '이메일과 비밀번호를 입력해주세요.'
      );
      return;
    }
    if (mode === 'signup' && (!termsAgreed || !privacyAgreed)) {
      setError('서비스 이용약관과 개인정보 수집·이용에 모두 동의해주세요.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'login') {
        const result = await login(email, password);
        setSuccess(result.message);
        window.setTimeout(() => {
          onClose();
        }, 600);
      } else {
        const reason = signupReason === 'other' ? signupReasonOther.trim() : signupReason;
        const { signupPurposeCode, signupPurposeOther } = getSignupPurposePayload(
          signupReason,
          signupReasonOther
        );
        const result = pendingSocialSignup
          ? await completeSocialSignup(
              pendingSocialSignup.token,
              nickname,
              termsAgreed,
              privacyAgreed,
              signupPurposeCode,
              signupPurposeOther
            )
          : await signup(
              email,
              password,
              nickname,
              termsAgreed,
              privacyAgreed,
              signupPurposeCode,
              signupPurposeOther
            );
        if (reason) {
          logEvent('common_signup_reason', { email, reason });
        }
        setSuccess(result.message);
        setPassword('');
        window.setTimeout(() => {
          if (pendingSocialSignup) {
            onClose();
          } else {
            onModeChange('login');
          }
        }, 900);
      }
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 모달 본체 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── 아이디 찾기 step ── */}
        {step === 'find-email' && (
          <>
            <button onClick={goBackToAuth} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
            </button>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">아이디 찾기</h2>
            <p className="text-sm text-slate-500 mb-6">가입 시 등록한 닉네임을 입력해주세요.</p>
            <form onSubmit={handleFindEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">닉네임</label>
                <input
                  type="text"
                  value={findNickname}
                  onChange={(e) => setFindNickname(e.target.value)}
                  placeholder="닉네임 입력"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? '검색 중...' : '아이디 찾기'}
              </button>
            </form>
          </>
        )}

        {/* ── 아이디 찾기 결과 ── */}
        {step === 'find-email-result' && (
          <>
            <button onClick={goBackToAuth} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
            </button>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">아이디 찾기 결과</h2>
            <p className="text-sm text-slate-500 mb-6">가입된 이메일을 확인해주세요.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-4 text-center mb-6">
              <p className="text-lg font-semibold text-sqld-navy">{maskedEmail}</p>
            </div>
            <button
              onClick={goBackToAuth}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              로그인하러 가기
            </button>
          </>
        )}

        {/* ── 비밀번호 재설정 - 이메일 입력 ── */}
        {step === 'reset-password' && (
          <>
            <button onClick={goBackToAuth} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> 로그인으로 돌아가기
            </button>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">비밀번호 재설정</h2>
            <p className="text-sm text-slate-500 mb-6">가입한 이메일을 입력하시면 인증번호를 보내드립니다.</p>
            <form onSubmit={handleResetPasswordRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
                <input
                  type="email"
                  value={findEmail}
                  onChange={(e) => setFindEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? '발송 중...' : '인증번호 받기'}
              </button>
            </form>
          </>
        )}

        {/* ── 비밀번호 재설정 - 인증번호 입력 ── */}
        {step === 'reset-password-verify' && (
          <>
            <button onClick={() => { setStep('reset-password'); setError(''); setResetToken(''); }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> 이전 단계
            </button>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">인증번호 확인</h2>
            <p className="text-sm text-slate-500 mb-2">
              <span className="font-medium text-sqld-navy">{findEmail}</span>로 인증번호를 보냈습니다.
            </p>
            <p className="text-xs text-slate-400 mb-6">이메일을 확인하고 인증번호를 입력해주세요.</p>
            <form onSubmit={handleResetTokenVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">인증번호</label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="이메일로 받은 인증번호 입력"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 tracking-widest"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                확인
              </button>
              <button
                type="button"
                onClick={handleResetPasswordRequest}
                disabled={loading}
                className="w-full text-sm text-slate-500 hover:text-primary-600 transition-colors"
              >
                인증번호 재발송
              </button>
            </form>
          </>
        )}

        {/* ── 비밀번호 재설정 - 새 비밀번호 입력 ── */}
        {step === 'reset-password-form' && (
          <>
            <button onClick={() => { setStep('reset-password-verify'); setError(''); }} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
              <ArrowLeft className="w-4 h-4" /> 이전 단계
            </button>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">새 비밀번호 설정</h2>
            <p className="text-sm text-slate-500 mb-6">새로운 비밀번호를 입력해주세요.</p>
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호</label>
                <input
                  type="password"
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="8자 이상"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={resetConfirmPassword}
                  onChange={(e) => setResetConfirmPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? '처리 중...' : '비밀번호 재설정'}
              </button>
            </form>
          </>
        )}

        {/* ── 비밀번호 재설정 완료 ── */}
        {step === 'reset-password-done' && (
          <>
            <h2 className="text-2xl font-bold text-sqld-navy mb-1">비밀번호 재설정 완료</h2>
            <p className="text-sm text-slate-500 mb-6">비밀번호가 성공적으로 변경되었습니다.</p>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg mb-6">
              새 비밀번호로 로그인해주세요.
            </div>
            <button
              onClick={goBackToAuth}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              로그인하러 가기
            </button>
          </>
        )}

        {/* ── 기본 로그인/회원가입 폼 ── */}
        {step === 'auth' && (
        <>
        <h2 className="text-2xl font-bold text-sqld-navy mb-1">
          {mode === 'login' ? '로그인' : pendingSocialSignup ? '구글 가입 완료' : '회원가입'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'login'
            ? 'SolSQLD에 오신 것을 환영합니다.'
            : pendingSocialSignup
              ? '추가 정보와 약관 동의를 완료하면 바로 시작할 수 있습니다.'
              : '지금 바로 SQL 실력을 키워보세요.'}
        </p>

        {!pendingSocialSignup && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium py-3 rounded-lg transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M21.6 12.23c0-.68-.06-1.33-.18-1.95H12v3.69h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.97-4.34 2.97-7.26Z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.7 0 4.96-.9 6.61-2.44l-3.24-2.5c-.9.61-2.05.97-3.37.97-2.59 0-4.78-1.75-5.56-4.1H3.1v2.58A10 10 0 0 0 12 22Z"
              />
              <path
                fill="#FBBC05"
                d="M6.44 13.93A6 6 0 0 1 6.13 12c0-.67.11-1.32.31-1.93V7.49H3.1A10 10 0 0 0 2 12c0 1.61.38 3.13 1.1 4.51l3.34-2.58Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.97c1.47 0 2.8.5 3.84 1.5l2.88-2.88C16.95 2.96 14.7 2 12 2A10 10 0 0 0 3.1 7.49l3.34 2.58c.78-2.35 2.97-4.1 5.56-4.1Z"
              />
            </svg>
            <span>{mode === 'login' ? 'Google로 로그인' : 'Google로 계속하기'}</span>
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={!!pendingSocialSignup}
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {!pendingSocialSignup && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  닉네임{' '}
                  <span className="text-slate-400 font-normal">
                    (선택 · 미입력 시 이메일 앞부분 자동 설정)
                  </span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={email ? email.split('@')[0] : '닉네임'}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* 약관 동의 */}
              <div className="space-y-3">
                {/* 서비스 이용약관 */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">서비스 이용약관 (필수)</span>
                    <button
                      type="button"
                      onClick={() => setTermsOpen((v) => !v)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {termsOpen ? '닫기' : '전문 보기'}
                    </button>
                  </div>
                  {termsOpen && (
                    <div
                      ref={termsRef}
                      onScroll={handleTermsScroll}
                      className="h-36 overflow-y-auto px-4 py-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-200"
                    >
                      {TERMS_TEXT}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        disabled={termsOpen && !termsScrolled}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-40"
                      />
                      <span
                        className={`text-sm ${termsOpen && !termsScrolled ? 'text-slate-400' : 'text-slate-700'}`}
                      >
                        서비스 이용약관에 동의합니다
                        {termsOpen && !termsScrolled && (
                          <span className="ml-1 text-xs text-slate-400">
                            (약관을 끝까지 읽어주세요)
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 개인정보 수집 및 이용 동의 */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">개인정보 수집 및 이용 동의 (필수)</span>
                    <button
                      type="button"
                      onClick={() => setPrivacyOpen((v) => !v)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {privacyOpen ? '닫기' : '전문 보기'}
                    </button>
                  </div>
                  {privacyOpen && (
                    <div
                      ref={privacyRef}
                      onScroll={handlePrivacyScroll}
                      className="h-36 overflow-y-auto px-4 py-3 text-xs text-slate-600 leading-relaxed whitespace-pre-line border-t border-slate-200"
                    >
                      {PRIVACY_TEXT}
                    </div>
                  )}
                  <div className="px-4 py-3 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => setPrivacyAgreed(e.target.checked)}
                        disabled={privacyOpen && !privacyScrolled}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 disabled:opacity-40"
                      />
                      <span
                        className={`text-sm ${privacyOpen && !privacyScrolled ? 'text-slate-400' : 'text-slate-700'}`}
                      >
                        개인정보 수집 및 이용에 동의합니다
                        {privacyOpen && !privacyScrolled && (
                          <span className="ml-1 text-xs text-slate-400">
                            (내용을 끝까지 읽어주세요)
                          </span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>

                {/* 가입 목적 설문 (선택) */}
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setReasonOpen((v) => !v)}
                    className="flex items-center justify-between w-full px-4 py-3 bg-slate-50 text-left"
                  >
                    <span>
                      <span className="text-sm font-medium text-slate-700">가입 목적 </span>
                      <span className="text-xs text-slate-400">(선택)</span>
                    </span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform ${reasonOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {reasonOpen && <div className="px-4 py-3 border-t border-slate-200 space-y-2">
                    {SIGNUP_REASON_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="signupReason"
                          value={option.value}
                          checked={signupReason === option.value}
                          onChange={(e) => setSignupReason(e.target.value)}
                          className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                        />
                        <span className="text-sm text-slate-700">{option.label}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="radio"
                        name="signupReason"
                        value="other"
                        checked={signupReason === 'other'}
                        onChange={(e) => setSignupReason(e.target.value)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300"
                      />
                      <span className="text-sm text-slate-700">기타</span>
                    </label>
                    {signupReason === 'other' && (
                      <input
                        type="text"
                        value={signupReasonOther}
                        onChange={(e) => setSignupReasonOther(e.target.value)}
                        placeholder="가입 목적을 알려주세요"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ml-6"
                        style={{ maxWidth: 'calc(100% - 1.5rem)' }}
                        maxLength={100}
                      />
                    )}
                  </div>}
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && (!termsAgreed || !privacyAgreed))}
            className={`w-full font-semibold py-3 rounded-lg transition-colors ${
              mode === 'signup' && (!termsAgreed || !privacyAgreed)
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white'
            }`}
          >
            {loading
              ? '처리 중...'
              : mode === 'login'
                ? '로그인'
                : !termsAgreed || !privacyAgreed
                  ? '약관에 모두 동의해주세요'
                  : pendingSocialSignup
                    ? '구글 계정으로 가입 완료'
                    : '회원가입'}
          </button>
        </form>

        {mode === 'login' && (
          <div className="flex justify-center gap-3 mt-3 text-xs text-slate-400">
            <button
              onClick={() => { setStep('find-email'); setError(''); setFindNickname(''); }}
              className="hover:text-primary-600 hover:underline transition-colors"
            >
              아이디를 잊으셨나요?
            </button>
            <span>|</span>
            <button
              onClick={() => { setStep('reset-password'); setError(''); setFindEmail(''); setResetToken(''); }}
              className="hover:text-primary-600 hover:underline transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-4">
          {mode === 'login' ? (
            <>
              계정이 없으신가요?{' '}
              <button
                onClick={() => onModeChange('signup')}
                className="text-primary-600 hover:underline font-medium"
              >
                회원가입
              </button>
            </>
          ) : (
            <>
              {pendingSocialSignup ? (
                <>구글 인증이 완료되었습니다. 추가 정보 입력 후 바로 로그인됩니다.</>
              ) : (
                <>
                  이미 계정이 있으신가요?{' '}
                  <button
                    onClick={() => onModeChange('login')}
                    className="text-primary-600 hover:underline font-medium"
                  >
                    로그인
                  </button>
                </>
              )}
            </>
          )}
        </p>
        </>
        )}
      </div>
    </div>
  );
}
