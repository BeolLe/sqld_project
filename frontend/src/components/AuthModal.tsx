import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logEvent } from '../utils/eventLogger';
import { apiFetch } from '../utils/api';
import type { AuthMode } from '../types';
import { TERMS_TEXT, PRIVACY_TEXT } from '../constants/legal';

type ModalStep = 'auth' | 'find-email' | 'find-email-result' | 'reset-password' | 'reset-password-verify' | 'reset-password-form' | 'reset-password-done';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
const SAVED_EMAIL_KEY = 'savedEmail';
const REMEMBER_EMAIL_KEY = 'rememberEmail';

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
  const [email, setEmail] = useState(() => {
    if (localStorage.getItem(REMEMBER_EMAIL_KEY) === 'true') {
      return localStorage.getItem(SAVED_EMAIL_KEY) ?? '';
    }
    return '';
  });
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(() => localStorage.getItem(REMEMBER_EMAIL_KEY) === 'true');
  const [autoLogin, setAutoLogin] = useState(false);
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
      const res = await apiFetch<{ maskedEmail: string }>('/auth/find-email', {
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
      await apiFetch<{ message: string }>('/auth/password-reset/request', {
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
      await apiFetch<{ message: string }>('/auth/password-reset/confirm', {
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
        if (rememberEmail) {
          localStorage.setItem(SAVED_EMAIL_KEY, email);
          localStorage.setItem(REMEMBER_EMAIL_KEY, 'true');
        } else {
          localStorage.removeItem(SAVED_EMAIL_KEY);
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }
        const result = await login(email, password, autoLogin);
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

          {mode === 'login' && (
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">이메일 저장</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={(e) => setAutoLogin(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-slate-600">자동 로그인</span>
              </label>
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
                    <span className="text-sm font-medium text-slate-700">개인정보처리방침 (필수)</span>
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
                        개인정보처리방침 및 개인정보 수집·이용에 동의합니다
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
