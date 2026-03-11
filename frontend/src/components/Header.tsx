import { Link, useNavigate } from 'react-router-dom';
import { Database, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: (mode: 'login' | 'signup') => void;
}

export default function Header({ onAuthClick }: HeaderProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-sqld-navy border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-xl hover:opacity-80 transition-opacity"
        >
          <Database className="w-6 h-6 text-primary-500" />
          <span>
            Sol<span className="text-primary-500">SQLD</span>
          </span>
        </Link>

        {/* 네비게이션 */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link to="/exams" className="hover:text-white transition-colors">
            모의고사
          </Link>
          <Link to="/sql-practice" className="hover:text-white transition-colors">
            SQL 실습
          </Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="hover:text-white transition-colors">
              대시보드
            </Link>
          )}
        </nav>

        {/* 사용자 영역 */}
        <div className="flex items-center gap-3">
          {isLoggedIn && user ? (
            <>
              <span className="text-sm text-slate-300 hidden sm:block">
                <span className="text-sqld-accent font-semibold">{user.nickname}</span>
                <span className="ml-2 text-xs text-slate-400">{user.points}pt</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-slate-400 hover:text-white text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onAuthClick('login')}
                className="text-sm text-slate-300 hover:text-white transition-colors"
              >
                로그인
              </button>
              <button
                onClick={() => onAuthClick('signup')}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                회원가입
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
