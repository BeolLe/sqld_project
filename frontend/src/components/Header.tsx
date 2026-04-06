import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Database, User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, isLoggedIn, isInitializing, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-sqld-navy border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link
          to="/"
          onClick={closeMobile}
          className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity"
        >
          <Database className="w-6 h-6 text-primary-500" />
          <span>
            Sol<span className="text-primary-500">SQLD</span>
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link to="/exams" className="hover:text-white transition-colors">
            모의고사
          </Link>
          <Link to="/sql-practice" className="hover:text-white transition-colors">
            SQL 실습
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="hover:text-white transition-colors">
              학습현황
            </Link>
          )}
          {isLoggedIn && (
            <Link to="/feedback" className="hover:text-white transition-colors">
              피드백
            </Link>
          )}
          {isLoggedIn && user?.isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors">
              <Shield className="w-3.5 h-3.5" />
              관리자
            </Link>
          )}
        </nav>

        {/* 사용자 영역 (데스크탑) + 모바일 햄버거 */}
        <div className="flex items-center gap-3">
          {isInitializing ? (
            <span className="text-sm text-slate-400">인증 확인 중...</span>
          ) : isLoggedIn && user ? (
            <>
              <span className="text-sm text-slate-300 hidden sm:block">
                <span className="text-sqld-accent font-semibold">{user.nickname}</span>
                <span className="ml-1"> 님 환영합니다!</span>
              </span>
              <Link
                to="/mypage"
                className="hidden md:block text-slate-400 hover:text-white transition-colors"
                title="마이페이지"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuthClick('login')}
                className="hidden md:block text-sm text-slate-300 hover:text-white transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => onAuthClick('signup')}
                className="hidden md:flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                회원가입
              </button>
            </>
          )}

          {/* 모바일 햄버거 버튼 */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden text-slate-300 hover:text-white transition-colors"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-sqld-navy border-t border-slate-700">
          <nav className="flex flex-col px-4 py-3 space-y-1">
            <Link
              to="/exams"
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              모의고사
            </Link>
            <Link
              to="/sql-practice"
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              SQL 실습
            </Link>
            {isLoggedIn && (
              <Link
                to="/dashboard"
                onClick={closeMobile}
                className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                학습현황
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to="/feedback"
                onClick={closeMobile}
                className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                피드백
              </Link>
            )}
            {isLoggedIn && user?.isAdmin && (
              <Link
                to="/admin"
                onClick={closeMobile}
                className="flex items-center gap-1 py-2.5 text-sm text-primary-400 hover:text-primary-300 transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                관리자
              </Link>
            )}

            {/* 구분선 + 사용자 액션 */}
            <div className="border-t border-slate-700 pt-2 mt-1">
              {!isInitializing && isLoggedIn && user ? (
                <>
                  <Link
                    to="/mypage"
                    onClick={closeMobile}
                    className="flex items-center gap-2 py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    마이페이지
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 py-2.5 text-sm text-slate-300 hover:text-white transition-colors w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </>
              ) : !isInitializing ? (
                <>
                  <button
                    onClick={() => { onAuthClick('login'); closeMobile(); }}
                    className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors w-full text-left"
                  >
                    로그인
                  </button>
                  <button
                    onClick={() => { onAuthClick('signup'); closeMobile(); }}
                    className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors w-full text-left"
                  >
                    회원가입
                  </button>
                </>
              ) : null}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
