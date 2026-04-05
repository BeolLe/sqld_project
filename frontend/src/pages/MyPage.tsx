import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, FileText, Trash2, X, Pencil } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';
import type { UserProfile } from '../types';

/* ─── 약관 텍스트 (AuthModal.tsx와 동일) ─────────────────────────────────── */

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
  loading,
}: {
  onClose: () => void;
  onConfirm: (password: string) => void;
  loading: boolean;
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
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-600 font-semibold py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={!password || loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {loading ? '처리 중...' : '탈퇴하기'}
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
    if (tokenFromUrl) {
      setVerificationToken(tokenFromUrl);
      window.history.replaceState({}, '', '/mypage');
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

      if (res.verificationToken) {
        setVerificationToken(res.verificationToken);
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
      setVerificationMessage({ type: 'error', text: '인증 토큰을 입력해주세요.' });
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
                    아직 이메일 인증이 완료되지 않았습니다. 메일이 오지 않는 환경에서는 아래 토큰으로 직접 인증할 수 있습니다.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      placeholder="인증 토큰 입력"
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
              <span className="text-slate-700">개인정보 수집 및 이용</span>
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
        <TermsModal title="개인정보 수집 및 이용 동의서" content={PRIVACY_TEXT} onClose={() => setTermsModal(null)} />
      )}

      {/* 탈퇴 확인 모달 */}
      {deleteModal && (
        <DeleteAccountModal
          onClose={() => setDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
