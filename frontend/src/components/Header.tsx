import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Database, User, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ClickLog } from '../logging';
import { isExamPreviewHost, getPreviewExam, examPreviewPath, readPreviewExam, rememberPreviewExam } from '../utils/examPreview';
import type { PreviewExam } from '../utils/examPreview';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, isLoggedIn, isInitializing, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const previewEnabled = isExamPreviewHost(window.location.hostname);
  const exam = previewEnabled ? getPreviewExam(location.pathname, readPreviewExam()) : 'sqld';
  const isADsP = exam === 'adsp';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (previewEnabled) rememberPreviewExam(exam);
  }, [exam, previewEnabled]);

  function switchExam(nextExam: PreviewExam) {
    if (nextExam === exam) return;
    if (location.pathname === '/endless' && !window.confirm('ADsP로 전환할까요? 현재 무한풀이 화면을 나갑니다.')) return;
    rememberPreviewExam(nextExam);
    setMobileMenuOpen(false);
    navigate(examPreviewPath(location.pathname, nextExam));
    window.scrollTo(0, 0);
  }

  const pageId = useMemo(() => {
    const path = location.pathname.replace(/^\/adsp(?=\/|$)/, '') || '/';
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
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* 로고 */}
          <Link
            to={examPreviewPath('/', exam)}
            onClick={() => { click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 0, object_id: 'home', object_url: examPreviewPath('/', exam), data: { header_variant: 'common' } }); closeMobile(); }}
            className="flex items-center gap-1.5 sm:gap-2 text-white font-bold text-lg sm:text-xl hover:opacity-80 transition-opacity"
          >
            <Database className={`w-5 h-5 sm:w-6 sm:h-6 ${isADsP ? 'text-emerald-400' : 'text-primary-500'}`} />
            <span>
              Sol<span className={isADsP ? 'text-emerald-400' : 'text-primary-500'}>{isADsP ? 'ADsP' : 'SQLD'}</span>
            </span>
          </Link>

          {previewEnabled && (
            <div role="group" aria-label="시험 선택" className="flex rounded-lg border border-slate-600 bg-slate-800 p-1">
              {(['sqld', 'adsp'] as const).map((item) => (
                <button key={item} type="button" aria-pressed={exam === item} onClick={() => switchExam(item)}
                  className={`min-h-9 rounded-md px-3 text-xs sm:text-sm font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${exam === item ? item === 'sqld' ? 'bg-primary-600 text-white' : 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {item === 'sqld' ? 'SQLD' : 'ADsP'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 데스크탑 네비게이션 */}
        <nav className={`${previewEnabled ? 'hidden xl:flex gap-4' : 'hidden md:flex gap-6'} items-center text-sm text-slate-300`}>
          <Link to={examPreviewPath('/exams', exam)} onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 1, object_id: 'exam_list', object_url: examPreviewPath('/exams', exam), data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            모의고사
          </Link>
          {!isADsP && (<Link to="/sql-practice" onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 2, object_id: 'sql_list', object_url: '/sql-practice', data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            SQL 실습
          </Link>)}
          <Link to={examPreviewPath('/learn', exam)} onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 3, object_id: 'learn_index', object_url: examPreviewPath('/learn', exam), data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
            개념 학습
          </Link>
          {isLoggedIn && (
            <Link to={examPreviewPath('/endless', exam)} onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 4, object_id: 'endless', object_url: examPreviewPath('/endless', exam), data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
              무한풀이
            </Link>
          )}
          {isLoggedIn && (
            <Link to={examPreviewPath('/dashboard', exam)} onClick={() => click.send({ object_section_id: 'header', object_section_idx: 0, object_type: 'link', object_idx: 5, object_id: 'dashboard', object_url: examPreviewPath('/dashboard', exam), data: { header_variant: 'common' } })} className="hover:text-white transition-colors">
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
            <span className={`text-sm text-slate-400 ${previewEnabled ? 'hidden sm:inline' : ''}`}>인증 확인 중...</span>
          ) : isLoggedIn && user ? (
            <>
              <span className={`text-sm text-slate-300 ${previewEnabled ? 'hidden 2xl:block' : 'hidden sm:block'}`}>
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
            className={`${previewEnabled ? 'xl:hidden' : 'md:hidden'} text-slate-300 hover:text-white transition-colors`}
            aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 메뉴 */}
      {mobileMenuOpen && (
        <div className={`${previewEnabled ? 'xl:hidden' : 'md:hidden'} bg-sqld-navy border-t border-slate-700`}>
          <nav className="flex flex-col px-4 py-3 space-y-1">
            <Link
              to={examPreviewPath('/exams', exam)}
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              모의고사
            </Link>
            {!isADsP && (<Link
              to="/sql-practice"
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              SQL 실습
            </Link>)}
            <Link
              to={examPreviewPath('/learn', exam)}
              onClick={closeMobile}
              className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
            >
              개념 학습
            </Link>
            {isLoggedIn && (
              <Link
                to={examPreviewPath('/endless', exam)}
                onClick={closeMobile}
                className="py-2.5 text-sm text-slate-300 hover:text-white transition-colors"
              >
                무한풀이
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to={examPreviewPath('/dashboard', exam)}
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
