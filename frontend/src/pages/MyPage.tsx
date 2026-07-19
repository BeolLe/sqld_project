import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, FileText, Trash2, X, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import type { UserProfile } from '../types';
import { TERMS_TEXT, PRIVACY_TEXT } from '../constants/legal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PENDING_ACCOUNT_DELETE_KEY = 'pendingAccountDelete';

/* ─── 약관 텍스트: constants/legal.ts에서 공용 관리 ─────────────────────── */

/* ─── 날짜 포맷 헬퍼 ──────────────────────────────────────────────────────── */

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ─── 섹션 카드 래퍼 ──────────────────────────────────────────────────────── */

function SectionCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50">
        {icon}
        <h2 className="text-lg font-semibold text-sqld-navy">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

/* ─── 약관 보기 모달 ──────────────────────────────────────────────────────── */

function TermsModal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-sqld-navy">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 text-sm text-slate-600 leading-relaxed whitespace-pre-line">
          {content}
        </div>
        <div className="px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 탈퇴 확인 모달 ─────────────────────────────────────────────────────── */

function DeleteAccountModal({
  onClose,
  onConfirm,
  onConfirmSocial,
  loading,
  authProvider,
  socialDeleteReady,
}: {
  onClose: () => void;
  onConfirm: (password: string) => void;
  onConfirmSocial: () => void;
  loading: boolean;
  authProvider: 'local' | 'google';
  socialDeleteReady: boolean;
}) {
  const [password, setPassword] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h3 className="text-xl font-bold text-red-600 mb-4">정말 탈퇴하시겠습니까?</h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          탈퇴 시 아래 데이터가 모두 삭제되며 복구할 수 없습니다:
        </p>
        <ul className="text-sm text-slate-600 mb-6 space-y-1 pl-4">
          <li>· 학습 기록 (모의고사, SQL 실습)</li>
          <li>· 보유 포인트</li>
          <li>· 계정 정보</li>
        </ul>
        {authProvider === 'local' ? (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              확인을 위해 비밀번호를 입력해주세요.
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
          </>
        ) : (
          <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {socialDeleteReady
              ? '구글 본인 확인이 완료되었습니다. 아래 버튼을 누르면 계정이 삭제됩니다.'
              : '현재 구글 로그인 상태입니다. 탈퇴 전에 Google 계정으로 한 번 더 본인 확인을 진행합니다.'}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => (
              authProvider === 'local'
                ? onConfirm(password)
                : socialDeleteReady
                  ? onConfirm('')
                  : onConfirmSocial()
            )}
            disabled={(authProvider === 'local' && !password) || loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading
              ? '처리 중...'
              : authProvider === 'local'
                ? '탈퇴하기'
                : socialDeleteReady
                  ? '탈퇴하기'
                  : 'Google로 본인 확인'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── 메인 페이지 ─────────────────────────────────────────────────────────── */

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInitializing, logout, updateNickname } = useAuth();

  // 프로필 데이터
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');

  // 닉네임 편집
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameMessage, setNicknameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [verificationMessage, setVerificationMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 비밀번호 변경
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 약관 모달
  const [termsModal, setTermsModal] = useState<'terms' | 'privacy' | null>(null);

  // 탈퇴 모달
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [accountDeleteToken, setAccountDeleteToken] = useState('');

  // 비로그인 리다이렉트
  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      navigate('/', { replace: true });
    }
  }, [isInitializing, isLoggedIn, navigate]);

  // 프로필 로드
  useEffect(() => {
    if (!isLoggedIn) return;

    let cancelled = false;

    async function loadProfile() {
      try {
        const data = await apiFetch<UserProfile>('/auth/profile');
        if (!cancelled) {
          setProfile(data);
          setProfileError('');
        }
      } catch (err) {
        if (!cancelled) {
          setProfileError('프로필 API가 아직 준비되지 않았습니다.');
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    loadProfile();
    return () => { cancelled = true; };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('verifyToken');
    const deleteTokenFromUrl = params.get('account_delete_token');
    if (tokenFromUrl) {
      setVerificationToken(tokenFromUrl);
      window.history.replaceState({}, '', '/mypage');
    }
    if (deleteTokenFromUrl) {
      setAccountDeleteToken(deleteTokenFromUrl);
      setDeleteModal(true);
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('account_delete_ready');
      nextParams.delete('account_delete_provider');
      nextParams.delete('account_delete_token');
      const nextSearch = nextParams.toString();
      window.history.replaceState({}, '', `/mypage${nextSearch ? `?${nextSearch}` : ''}`);
      return;
    }

    const storedDeleteToken = window.sessionStorage.getItem(PENDING_ACCOUNT_DELETE_KEY);
    if (storedDeleteToken) {
      try {
        const parsed = JSON.parse(storedDeleteToken) as { token?: string };
        if (parsed.token) {
          setAccountDeleteToken(parsed.token);
          setDeleteModal(true);
        }
      } finally {
        window.sessionStorage.removeItem(PENDING_ACCOUNT_DELETE_KEY);
      }
    }
  }, [isLoggedIn]);

  // 닉네임 변경
  async function handleNicknameSave() {
    const trimmed = newNickname.trim();
    if (!trimmed) {
      setNicknameMessage({ type: 'error', text: '닉네임을 입력해주세요.' });
      return;
    }
    if (trimmed.length > 20) {
      setNicknameMessage({ type: 'error', text: '닉네임은 20자 이내로 입력해주세요.' });
      return;
    }

    try {
      setNicknameLoading(true);
      const res = await apiFetch<{ message: string; nickname: string }>('/auth/nickname', {
        method: 'PUT',
        body: JSON.stringify({ nickname: trimmed }),
      });
      updateNickname(res.nickname);
      setProfile((prev) => prev ? { ...prev, nickname: res.nickname } : prev);
      setEditingNickname(false);
      setNicknameMessage({ type: 'success', text: '닉네임이 변경되었습니다.' });
    } catch (err) {
      setNicknameMessage({ type: 'error', text: err instanceof Error ? err.message : '닉네임 변경에 실패했습니다.' });
    } finally {
      setNicknameLoading(false);
    }
  }

  // 비밀번호 변경
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: '새 비밀번호는 8자 이상이어야 합니다.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    try {
      setPasswordLoading(true);
      await apiFetch<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다.' });
    } finally {
      setPasswordLoading(false);
    }
  }

  // 회원 탈퇴
  async function handleDeleteAccount(password: string) {
    try {
      setDeleteLoading(true);
      await apiFetch<{ message: string }>('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
      });
      setDeleteModal(false);
      logout();
      navigate('/', { replace: true });
      // 브라우저 alert로 완료 알림 (페이지 이동 후)
      window.setTimeout(() => {
        alert('탈퇴가 완료되었습니다.');
      }, 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : '탈퇴 처리에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  }

  function handleDeleteAccountWithGoogle() {
    const next = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `${API_BASE_URL}/auth/google/delete/start?next=${encodeURIComponent(next)}`
    );
  }

  async function handleDeleteAccountWithSocialToken() {
    try {
      setDeleteLoading(true);
      await apiFetch<{ message: string }>('/auth/account', {
        method: 'DELETE',
        body: JSON.stringify({ social_delete_token: accountDeleteToken }),
      });
      setDeleteModal(false);
      setAccountDeleteToken('');
      window.sessionStorage.removeItem(PENDING_ACCOUNT_DELETE_KEY);
      logout();
      navigate('/', { replace: true });
      window.setTimeout(() => {
        alert('탈퇴가 완료되었습니다.');
      }, 100);
    } catch (err) {
      alert(err instanceof Error ? err.message : '탈퇴 처리에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleSendVerification() {
    try {
      setVerificationLoading(true);
      setVerificationMessage(null);
      const res = await apiFetch<{
        message: string;
        deliveryMode?: 'email' | 'inline_token';
        verificationToken?: string;
      }>('/auth/email-verification/send', {
        method: 'POST',
      });

      if (res.deliveryMode === 'inline_token') {
        setVerificationMessage({
          type: 'error',
          text: '인증 메일 발송에 실패했습니다. 잠시 후 다시 시도하시거나 문의해주세요.',
        });
        return;
      }
      setVerificationMessage({ type: 'success', text: res.message });
    } catch (err) {
      setVerificationMessage({ type: 'error', text: err instanceof Error ? err.message : '인증 메일 재발송에 실패했습니다.' });
    } finally {
      setVerificationLoading(false);
    }
  }

  async function handleConfirmVerification(tokenOverride?: string) {
    const token = (tokenOverride ?? verificationToken).trim();
    if (!token) {
      setVerificationMessage({ type: 'error', text: '6자리 인증 코드를 입력해주세요.' });
      return;
    }

    try {
      setVerificationLoading(true);
      setVerificationMessage(null);
      await apiFetch<{ message: string }>('/auth/email-verification/confirm', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              emailVerified: true,
              emailVerifiedAt: new Date().toISOString(),
            }
          : prev
      );
      setVerificationToken('');
      setVerificationMessage({ type: 'success', text: '이메일 인증이 완료되었습니다.' });
    } catch (err) {
      setVerificationMessage({ type: 'error', text: err instanceof Error ? err.message : '이메일 인증에 실패했습니다.' });
    } finally {
      setVerificationLoading(false);
    }
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn || !user) return null;

  // 프로필 데이터 — API 실패 시 AuthContext user 정보로 fallback
  const displayEmail = profile?.email ?? user.email;
  const displayNickname = profile?.nickname ?? user.nickname;
  const displayCreatedAt = profile?.createdAt ?? user.createdAt;
  const displayPoints = profile?.points ?? user.points;
  const displayTermsAgreedAt = profile?.termsAgreedAt ?? null;
  const displayPrivacyAgreedAt = profile?.privacyAgreedAt ?? null;
  const displayEmailVerified = profile?.emailVerified ?? false;
  const displayEmailVerifiedAt = profile?.emailVerifiedAt ?? null;
  const authProvider = profile?.authProvider ?? user.authProvider ?? 'local';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-sqld-navy">마이페이지</h1>
          <p className="text-sm text-slate-500 mt-1">내 계정 정보를 확인하고 관리할 수 있습니다.</p>
        </div>

        {/* 프로필 로딩 에러 배너 */}
        {profileError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg">
            {profileError} 기본 정보로 표시 중입니다.
          </div>
        )}

        {/* ── 내 정보 ──────────────────────────────────────────────── */}
        <SectionCard icon={<User className="w-5 h-5 text-primary-600" />} title="내 정보">
          {profileLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 bg-slate-200 rounded w-2/3" />
              ))}
            </div>
          ) : (
            <dl className="space-y-4 text-sm">
              <div className="flex items-center">
                <dt className="w-28 text-slate-500 font-medium">이메일</dt>
                <dd className="text-slate-800">{displayEmail}</dd>
              </div>
              <div className="flex items-center gap-3">
                <dt className="w-28 text-slate-500 font-medium">이메일 인증</dt>
                <dd className={displayEmailVerified ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                  {displayEmailVerified ? '인증 완료' : '미인증'}
                </dd>
                {!displayEmailVerified && (
                  <button
                    onClick={handleSendVerification}
                    disabled={verificationLoading}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50"
                  >
                    {verificationLoading ? '처리 중...' : '인증 메일 재발송'}
                  </button>
                )}
              </div>
              {displayEmailVerifiedAt && (
                <div className="flex items-center">
                  <dt className="w-28 text-slate-500 font-medium">인증 완료일</dt>
                  <dd className="text-slate-800">{formatDate(displayEmailVerifiedAt)}</dd>
                </div>
              )}
              {!displayEmailVerified && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm text-amber-800">
                    아직 이메일 인증이 완료되지 않았습니다. 인증 메일이 오지 않으면 잠시 후 다시 시도하시거나 문의해주세요.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6자리 인증 코드 입력"
                      maxLength={6}
                      className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <button
                      onClick={() => handleConfirmVerification()}
                      disabled={verificationLoading}
                      className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                    >
                      인증 완료
                    </button>
                  </div>
                </div>
              )}
              {verificationMessage && (
                <p className={`text-sm px-3 py-2 rounded-lg ${verificationMessage.type === 'success' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  {verificationMessage.text}
                </p>
              )}
              <div className="flex items-center gap-2">
                <dt className="w-28 text-slate-500 font-medium">닉네임</dt>
                {editingNickname ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      maxLength={20}
                      className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1"
                      autoFocus
                    />
                    <button
                      onClick={handleNicknameSave}
                      disabled={nicknameLoading}
                      className="text-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {nicknameLoading ? '...' : '저장'}
                    </button>
                    <button
                      onClick={() => { setEditingNickname(false); setNicknameMessage(null); }}
                      className="text-sm text-slate-500 hover:text-slate-700 px-2 py-1.5"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <>
                    <dd className="text-slate-800">{displayNickname}</dd>
                    <button
                      onClick={() => { setNewNickname(displayNickname); setEditingNickname(true); setNicknameMessage(null); }}
                      className="text-slate-400 hover:text-primary-600 transition-colors"
                      title="닉네임 변경"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
              {nicknameMessage && (
                <p className={`text-sm px-3 py-2 rounded-lg ${nicknameMessage.type === 'success' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                  {nicknameMessage.text}
                </p>
              )}
              <div className="flex items-center">
                <dt className="w-28 text-slate-500 font-medium">가입일</dt>
                <dd className="text-slate-800">{formatDate(displayCreatedAt)}</dd>
              </div>
              <div className="flex items-center">
                <dt className="w-28 text-slate-500 font-medium">보유 포인트</dt>
                <dd className="text-sqld-accent font-semibold">{displayPoints}pt</dd>
              </div>
            </dl>
          )}
        </SectionCard>

        {/* ── 비밀번호 변경 ────────────────────────────────────────── */}
        <SectionCard icon={<Lock className="w-5 h-5 text-primary-600" />} title="비밀번호 변경">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">현재 비밀번호</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">새 비밀번호 확인</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {passwordMessage && (
              <p className={`text-sm px-4 py-2 rounded-lg ${passwordMessage.type === 'success' ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
                {passwordMessage.text}
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
            >
              {passwordLoading ? '처리 중...' : '비밀번호 변경'}
            </button>
          </form>
        </SectionCard>

        {/* ── 약관 및 동의 ─────────────────────────────────────────── */}
        <SectionCard icon={<FileText className="w-5 h-5 text-primary-600" />} title="약관 및 동의">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">서비스 이용약관</span>
              <button
                onClick={() => setTermsModal('terms')}
                className="text-primary-600 hover:underline text-sm"
              >
                보기
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-700">개인정보처리방침</span>
              <button
                onClick={() => setTermsModal('privacy')}
                className="text-primary-600 hover:underline text-sm"
              >
                보기
              </button>
            </div>
            {(displayTermsAgreedAt || displayPrivacyAgreedAt) && (
              <p className="text-xs text-slate-400 pt-1">
                동의일: {formatDate(displayTermsAgreedAt ?? displayPrivacyAgreedAt)}
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── 계정 삭제 ────────────────────────────────────────────── */}
        <SectionCard icon={<Trash2 className="w-5 h-5 text-red-500" />} title="계정 삭제">
          <p className="text-sm text-slate-500 mb-4">
            탈퇴 시 모든 학습 기록이 삭제되며 복구할 수 없습니다.
          </p>
          <button
            onClick={() => setDeleteModal(true)}
            className="border border-red-300 text-red-600 hover:bg-red-50 font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors"
          >
            회원 탈퇴
          </button>
        </SectionCard>
      </div>

      {/* 약관 모달 */}
      {termsModal === 'terms' && (
        <TermsModal title="서비스 이용약관" content={TERMS_TEXT} onClose={() => setTermsModal(null)} />
      )}
      {termsModal === 'privacy' && (
        <TermsModal title="개인정보처리방침" content={PRIVACY_TEXT} onClose={() => setTermsModal(null)} />
      )}

      {/* 탈퇴 확인 모달 */}
      {deleteModal && (
        <DeleteAccountModal
          onClose={() => setDeleteModal(false)}
          onConfirm={authProvider === 'google' && accountDeleteToken ? handleDeleteAccountWithSocialToken : handleDeleteAccount}
          onConfirmSocial={handleDeleteAccountWithGoogle}
          loading={deleteLoading}
          authProvider={authProvider}
          socialDeleteReady={!!accountDeleteToken}
        />
      )}
    </div>
  );
}
