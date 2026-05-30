import { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ExamScheduleProvider } from './contexts/ExamScheduleContext';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import EventPopup from './components/EventPopup';
import SurveyPopup from './components/SurveyPopup';
import ExamCheerPopup, { shouldShowCheerPopup } from './components/ExamCheerPopup';
import { apiFetch } from './utils/api';
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

interface FormField {
  key: string;
  type: string;
  label: string;
}

interface ActiveModal {
  campaignKey: string;
  phaseCode: 'phase1' | 'phase2';
  formSchema?: { fields: FormField[] };
}

interface EventModalResponse {
  activeModal: ActiveModal | null;
}

function AppShell() {
  const { user } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const hasPendingSocialSignup =
    !!window.sessionStorage.getItem('pendingSocialSignup') ||
    searchParams.get('social_signup_required') === '1';
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: AuthMode }>({
    open: hasPendingSocialSignup,
    mode: hasPendingSocialSignup ? 'signup' : 'login',
  });
  const [showEventPopup, setShowEventPopup] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<ActiveModal | null>(null);
  const [showCheerPopup, setShowCheerPopup] = useState(false);

  useEffect(() => {
    if (!user || authModal.open) {
      setShowEventPopup(false);
      setActiveCampaign(null);
      return;
    }

    let cancelled = false;

    async function loadActiveEventModal() {
      try {
        const response = await apiFetch<EventModalResponse>('/events/modal');
        if (cancelled) return;
        setShowEventPopup(Boolean(response.activeModal));
        setActiveCampaign(response.activeModal);
      } catch (error) {
        if (cancelled) return;
        console.error('이벤트 팝업 노출 여부 조회 실패', error);
        setShowEventPopup(false);
        setActiveCampaign(null);
      }
    }

    void loadActiveEventModal();

    return () => {
      cancelled = true;
    };
  }, [authModal.open, user]);

  useEffect(() => {
    if (user && !authModal.open && shouldShowCheerPopup()) {
      setShowCheerPopup(true);
    }
  }, [user, authModal.open]);

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

  function closeEventPopup(dismissForToday: boolean, hideUntilCampaignEnd = false) {
    const campaign = activeCampaign;
    setShowEventPopup(false);

    if ((!dismissForToday && !hideUntilCampaignEnd) || !campaign) {
      return;
    }

    void apiFetch(`/events/modal/${campaign.campaignKey}/dismiss`, {
      method: 'POST',
      body: JSON.stringify({
        hide_for_today: dismissForToday,
        hide_until_campaign_end: hideUntilCampaignEnd,
      }),
    }).catch((error) => {
      console.error('이벤트 팝업 숨김 처리 실패', error);
    });
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

      {showCheerPopup && (
        <ExamCheerPopup onClose={() => setShowCheerPopup(false)} />
      )}

      {showEventPopup && activeCampaign && (
        activeCampaign.phaseCode === 'phase2' && activeCampaign.formSchema ? (
          <SurveyPopup
            campaignKey={activeCampaign.campaignKey}
            formSchema={activeCampaign.formSchema}
            onClose={closeEventPopup}
          />
        ) : (
          <EventPopup
            phaseCode={activeCampaign.phaseCode}
            onClose={closeEventPopup}
          />
        )
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
