import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClickLog } from '../logging';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, isLoggedIn, isInitializing, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pageId = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'main';
    if (path.startsWith('/exams')) return path.includes('/result') ? 'exam_result' : path.includes('/taking') ? 'exam_taking' : 'exam_list';
    if (path.startsWith('/sql-practice/')) return 'sql_solving';
    if (path === '/sql-practice') return 'sql_list';
    if (path === '/learn') return 'learn_index';
    if (path.startsWith('/learn/')) return 'learn_unit';
    if (path === '/endless') return 'endless';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/feedback') return 'feedback';
    if (path === '/mypage') return 'mypage';
    return 'unknown';
  }, [location.pathname]);

  const click = useMemo(() => new ClickLog({ page_id: pageId, url: location.pathname }), [pageId, location.pathname]);

  function handleLogout() {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  }

  function closeMobile() {
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-sqld-navy border-b border-slate-700 shadow-lg print:hidden">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link
          to="/"
          onClick={() => { click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 0, object_id: 'home', object_url: '/', data: { header_variant: 'common' } }); closeMobile(); }}
          className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity"
        >
          <Database className="w-6 h-6 text-primary-500" />
          <span>
            Sol<span className="text-primary-500">SQLD</span>
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link to="/exams" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 1, object_id: 'exam_list', object_url: '/exams', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            모의고사
          </Link>
          <Link to="/sql-practice" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 2, object_id: 'sql_list', object_url: '/sql-practice', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            SQL 실습
          </Link>
          <Link to="/learn" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 3, object_id: 'learn_index', object_url: '/learn', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            개념 학습
          </Link>
          {isLoggedIn && (
            <Link to="/endless" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 4, object_id: 'endless', object_url: '/endless', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
              무한풀이
            </Link>
          )}
          {isLoggedIn && (
            <Link to="/dashboard" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 5, object_id: 'dashboard', object_url: '/dashboard', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
              학습현황
            </Link>
          )}
          {isLoggedIn && (
            <Link to="/feedback" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 6, object_id: 'feedback', object_url: '/feedback', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
              피드백
            </Link>
          )}
          {isLoggedIn && user?.isAdmin && (
            <Link to="/admin" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 7, object_id: 'admin', object_url: '/admin', data: { header_variant: 'common' } })} className="flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors">
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
                onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'icon', object_idx: 8, object_id: 'mypage', object_url: '/mypage', data: { header_variant: 'common' } })}
                className="hidden md:block text-slate-400 hover:text-white transition-colors"
                title="마이페이지"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <button
                onClick={() => { click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'button', object_idx: 9, object_id: 'logout', data: { header_variant: 'common' } }); handleLogout(); }}
                className="hidden md:flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'button', object_idx: 10, object_id: 'login', data: { header_variant: 'common' } }); onAuthClick('login'); }}
                className="hidden md:block text-sm text-slate-300 hover:text-white transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => { click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'button', object_idx: 11, object_id: 'signup', data: { header_variant: 'common' } }); onAuthClick('signup'); }}
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
            <Link
              to="/learn"
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              개념 학습
            </Link>
            {isLoggedIn && (
              <Link
                to="/endless"
                onClick={closeMobile}
                className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                무한풀이
              </Link>
            )}
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
