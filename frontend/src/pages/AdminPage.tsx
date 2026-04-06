import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminFeedbackPage from './AdminFeedbackPage';
import AdminUsersPage from './AdminUsersPage';

type AdminTab = 'feedback' | 'users';

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'feedback', label: '피드백 관리', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'users', label: '유저 관리', icon: <Users className="w-4 h-4" /> },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isLoggedIn, isInitializing } = useAuth();
  const [tab, setTab] = useState<AdminTab>('feedback');

  useEffect(() => {
    if (!isInitializing && (!isLoggedIn || !user?.isAdmin)) {
      navigate('/', { replace: true });
    }
  }, [isInitializing, isLoggedIn, user, navigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    );
  }

  if (!isLoggedIn || !user?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* 페이지 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-sqld-navy">관리자</h1>
          <p className="text-sm text-slate-500 mt-1">피드백 관리 및 유저 권한을 관리할 수 있습니다.</p>
        </div>

        {/* 상단 탭 */}
        <div className="flex gap-2 mb-6">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        {tab === 'feedback' && <AdminFeedbackPage />}
        {tab === 'users' && <AdminUsersPage />}
      </div>
    </div>
  );
}
