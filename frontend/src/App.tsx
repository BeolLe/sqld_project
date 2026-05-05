import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ExamScheduleProvider } from './contexts/ExamScheduleContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import MainPage from './pages/MainPage';
import DashboardPage from './pages/DashboardPage';
import ExamListPage from './pages/ExamListPage';
import ExamTakingPage from './pages/ExamTakingPage';
import ExamResultPage from './pages/ExamResultPage';
import MyPage from './pages/MyPage';
import FeedbackPage from './pages/FeedbackPage';
import EndlessPracticePage from './pages/EndlessPracticePage';
import type { AuthMode } from './types';

const SQLPracticeListPage = lazy(() => import('./pages/SQLPracticeListPage'));
const SQLPracticePage = lazy(() => import('./pages/SQLPracticePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function PageFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-500">
      페이지를 불러오는 중입니다...
    </div>
  );
}

function AppShell() {
  const searchParams = new URLSearchParams(window.location.search);
  const hasPendingSocialSignup =
    !!window.sessionStorage.getItem('pendingSocialSignup') ||
    searchParams.get('social_signup_required') === '1';
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: AuthMode }>({
    open: hasPendingSocialSignup,
    mode: hasPendingSocialSignup ? 'signup' : 'login',
  });

  useEffect(() => {
    const currentSearchParams = new URLSearchParams(window.location.search);
    if (
      window.sessionStorage.getItem('pendingSocialSignup') ||
      currentSearchParams.get('social_signup_required') === '1'
    ) {
      setAuthModal({ open: true, mode: 'signup' });
    }
  }, []);

  function openAuth(mode: AuthMode) {
    setAuthModal({ open: true, mode });
  }

  function closeAuth() {
    setAuthModal((prev) => ({ ...prev, open: false }));
  }

  return (
    <>
      {/* 모의고사 풀이 화면은 헤더 없이 */}
      <Routes>
        <Route path="/exams/:id/taking" element={<ExamTakingPage />} />
        <Route
          path="/sql-practice/:id"
          element={
            <Suspense fallback={<PageFallback />}>
              <SQLPracticePage />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <>
              <Header onAuthClick={openAuth} />
              <main>
                <Routes>
                  <Route path="/" element={<MainPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/mypage" element={<MyPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route
                    path="/admin"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <AdminPage />
                      </Suspense>
                    }
                  />
                  <Route path="/exams" element={<ExamListPage />} />
                  <Route path="/exams/:id" element={<ExamListPage />} />
                  <Route path="/exams/:id/result" element={<ExamResultPage />} />
                  <Route path="/endless" element={<EndlessPracticePage />} />
                  <Route
                    path="/sql-practice"
                    element={
                      <Suspense fallback={<PageFallback />}>
                        <SQLPracticeListPage />
                      </Suspense>
                    }
                  />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>

      {authModal.open && (
        <AuthModal
          mode={authModal.mode}
          onClose={closeAuth}
          onModeChange={(mode) => setAuthModal({ open: true, mode })}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ExamScheduleProvider>
          <AppShell />
        </ExamScheduleProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
