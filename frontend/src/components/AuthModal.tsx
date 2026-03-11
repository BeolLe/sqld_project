import { useState, useRef, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { AuthMode } from '../types';

const TERMS_TEXT = `SolSQLD 서비스 이용약관\n\n제1조 (목적)\n본 약관은 SolSQLD(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정합니다.\n\n제2조 (서비스 이용)\n이용자는 본 약관에 동의함으로써 서비스를 이용할 수 있습니다.\n\n제3조 (개인정보 보호)\n서비스는 이용자의 개인정보를 관련 법령에 따라 보호합니다.\n\n제4조 (지식재산권)\n서비스 내 모든 콘텐츠의 지식재산권은 SolSQLD에 귀속됩니다.\n\n제5조 (면책조항)\n서비스는 이용자의 귀책사유로 발생한 손해에 대해 책임지지 않습니다.\n\n[이하 약관 내용 생략]\n\n본 약관에 동의하시면 SolSQLD 서비스를 이용하실 수 있습니다.`;

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
}

export default function AuthModal({ mode, onClose, onModeChange }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsScrolled, setTermsScrolled] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setError('');
    setTermsScrolled(false);
    setTermsAgreed(false);
    setTermsOpen(false);
  }, [mode]);

  function handleTermsScroll() {
    const el = termsRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      setTermsScrolled(true);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (mode === 'signup' && !termsAgreed) {
      setError('약관에 동의해주세요.');
      return;
    }
    try {
      setLoading(true);
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, nickname);
      }
      onClose();
    } catch {
      setError('처리 중 오류가 발생했습니다.');
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

        <h2 className="text-2xl font-bold text-sqld-navy mb-1">
          {mode === 'login' ? '로그인' : '회원가입'}
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          {mode === 'login'
            ? 'SolSQLD에 오신 것을 환영합니다.'
            : '지금 바로 SQL 실력을 키워보세요.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

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
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50">
                  <span className="text-sm font-medium text-slate-700">서비스 이용약관</span>
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
                      약관에 동의합니다
                      {termsOpen && !termsScrolled && (
                        <span className="ml-1 text-xs text-slate-400">
                          (약관을 끝까지 읽어주세요)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

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
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => onModeChange('login')}
                className="text-primary-600 hover:underline font-medium"
              >
                로그인
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
