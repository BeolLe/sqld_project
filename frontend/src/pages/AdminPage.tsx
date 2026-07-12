import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, MessageSquare, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AIStreamPanel from '../components/AIStreamPanel';
import { useAIStream } from '../hooks/useAIStream';
import { streamAIAdminProviderTest } from '../api/ai';
import AdminFeedbackPage from './AdminFeedbackPage';
import AdminUsersPage from './AdminUsersPage';
import type { AIAdminProviderTestRequest, AIAdminSampleMeta } from '../types';

type AdminTab = 'feedback' | 'users' | 'ai_test';

const TABS: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
  { key: 'feedback', label: '피드백 관리', icon: <MessageSquare className="w-4 h-4" /> },
  { key: 'users', label: '유저 관리', icon: <Users className="w-4 h-4" /> },
  { key: 'ai_test', label: 'AI 테스트', icon: <Bot className="w-4 h-4" /> },
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
        {tab === 'ai_test' && <AdminAITestPage />}
      </div>
    </div>
  );
}

function AdminAITestPage() {
  const [sampleType, setSampleType] = useState<AIAdminProviderTestRequest['sample_type']>('exam');
  const [scenario, setScenario] = useState<AIAdminProviderTestRequest['scenario']>('wrong');
  const [sampleSeed, setSampleSeed] = useState(() => crypto.randomUUID());

  const handleSampleTypeChange = (value: AIAdminProviderTestRequest['sample_type']) => {
    setSampleType(value);
    setSampleSeed(crypto.randomUUID());
  };

  const handleScenarioChange = (value: AIAdminProviderTestRequest['scenario']) => {
    setScenario(value);
    setSampleSeed(crypto.randomUUID());
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-sqld-navy">AI 응답 비교 조건</h2>
        <p className="mt-1 text-sm text-slate-500">
          랜덤 문제 하나를 가져와 선택한 상황으로 Gemini와 Claude 응답을 비교합니다.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            테스트 유형
            <select
              value={sampleType}
              onChange={(event) =>
                handleSampleTypeChange(event.target.value as AIAdminProviderTestRequest['sample_type'])
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="exam">모의고사 오답 해설</option>
              <option value="endless">무한풀이 오답 해설</option>
              <option value="sql">SQL 실습 쿼리 리뷰</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">
            테스트 상황
            <select
              value={scenario}
              onChange={(event) =>
                handleScenarioChange(event.target.value as AIAdminProviderTestRequest['scenario'])
              }
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              <option value="wrong">틀린 응답 가정</option>
              <option value="unanswered">응답 없음 가정</option>
            </select>
          </label>
        </div>
        <button
          onClick={() => setSampleSeed(crypto.randomUUID())}
          className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          랜덤 문제 다시 뽑기
        </button>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <ProviderTestCard
          provider="google"
          sampleType={sampleType}
          scenario={scenario}
          sampleSeed={sampleSeed}
          title="Gemini 연결 테스트"
          description="무료 모델 연결, SSE 스트리밍, 기본 응답 품질을 확인합니다."
          buttonLabel="Gemini 테스트"
          tone="blue"
        />
        <ProviderTestCard
          provider="anthropic"
          sampleType={sampleType}
          scenario={scenario}
          sampleSeed={sampleSeed}
          title="Claude 연결 테스트"
          description="유료 모델 키 주입, Anthropic API 호출, 응답 품질을 확인합니다."
          buttonLabel="Claude 테스트"
          tone="red"
        />
      </div>
    </div>
  );
}

function ProviderTestCard({
  provider,
  sampleType,
  scenario,
  sampleSeed,
  title,
  description,
  buttonLabel,
  tone,
}: {
  provider: AIAdminProviderTestRequest['provider'];
  sampleType: AIAdminProviderTestRequest['sample_type'];
  scenario: AIAdminProviderTestRequest['scenario'];
  sampleSeed: string;
  title: string;
  description: string;
  buttonLabel: string;
  tone: 'blue' | 'red';
}) {
  const { status, text, usage, error, sample, start, retry } =
    useAIStream<AIAdminProviderTestRequest>(streamAIAdminProviderTest);

  const handleClick = () => {
    if (status === 'streaming') return;
    start({ provider, sample_type: sampleType, scenario, sample_seed: sampleSeed });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-bold text-sqld-navy">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <button
        onClick={handleClick}
        disabled={status === 'streaming'}
        className="inline-flex w-full items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'streaming' ? '호출 중...' : buttonLabel}
      </button>
      {sample && <AdminSamplePreview sample={sample} />}
      {status !== 'idle' && (
        <AIStreamPanel
          status={status}
          text={text}
          error={error}
          onRetry={retry}
          title={title}
          icon={provider === 'google' ? '✨' : '🧠'}
          tone={tone}
        />
      )}
      {usage && (
        <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          input tokens: <span className="font-semibold text-slate-700">{usage.input}</span>
          {' · '}
          output tokens: <span className="font-semibold text-slate-700">{usage.output}</span>
        </div>
      )}
    </section>
  );
}

function AdminSamplePreview({ sample }: { sample: AIAdminSampleMeta }) {
  const questionText = sample.questionText?.trim();
  const preview =
    questionText && questionText.length > 180
      ? `${questionText.slice(0, 180)}...`
      : questionText;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700">
          {sample.sampleType === 'sql'
            ? 'SQL 실습'
            : sample.sampleType === 'endless'
              ? '무한풀이'
              : '모의고사'}
        </span>
        <span className="rounded-full bg-white px-2 py-0.5 font-semibold text-slate-700">
          {sample.scenario === 'unanswered' ? '응답 없음' : '오답'}
        </span>
      </div>
      <p className="font-semibold text-sqld-navy">{sample.title || sample.problemId || '랜덤 샘플'}</p>
      {preview && <p className="mt-1 leading-relaxed">{preview}</p>}
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
        {sample.userAnswer && <span>가정 응답: {sample.userAnswer}</span>}
        {sample.correctAnswer && <span>정답: {sample.correctAnswer}</span>}
      </div>
    </div>
  );
}
