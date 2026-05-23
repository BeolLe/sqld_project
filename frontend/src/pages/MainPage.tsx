// test: direct main push verification
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Terminal, Trophy, ChevronRight, CheckCircle, X } from 'lucide-react';
import ExamScheduleCard from '../components/ExamScheduleCard';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../utils/api';

const FEATURES = [
  {
    icon: BookOpen,
    title: '실전 모의고사',
    desc: (
      <>
        실제 SQLD 시험 형식 반영 (50문항, 90분)
        <br />
      </>
    ), // 따옴표 제거
    color: 'bg-blue-500',
  },
  {
    icon: Terminal,
    title: 'SQL 실습',
    desc: (
      <>
        Oracle 환경 기반 SQL 실행 및 확인
        <br />
      </>
    ), // 따옴표 제거
    color: 'bg-emerald-500',
  },
  {
    icon: Trophy,
    title: '성과 분석',
    desc: '과목별 정답률 시각화 및 오답 노트 자동 생성',
    color: 'bg-amber-500',
  },
];

const EXAM_HIGHLIGHTS = [
  'A4 스케일 레이아웃으로 실제 시험지 재현',
  '남은 시간 카운트다운 실시간 표시',
  '사이드 메모장 입력 내용 자동 저장',
  '합격(60점 이상)/불합격 즉시 판정',
];

interface PopupCampaignField {
  key: string;
  label?: string;
  type: 'boolean' | 'phone' | 'text';
  required?: boolean;
  value?: string;
}

interface PopupCampaignFormSchema {
  modalType?: string;
  fields?: PopupCampaignField[];
}

interface PopupCampaignItem {
  campaignKey: string;
  title: string;
  phaseCode: 'phase1' | 'phase2';
  formSchema: PopupCampaignFormSchema;
  showModal: boolean;
}

interface PopupCampaignModalResponse {
  items: PopupCampaignItem[];
  activeModal: PopupCampaignItem | null;
}

interface PopupCampaignDismissResponse {
  campaignKey: string;
  hiddenUntil: string;
  message: string;
}

interface PopupCampaignSubmitResponse {
  campaignKey: string;
  responseId: number;
  submittedAt: string;
  message: string;
}

function EventModal({
  modal,
  phoneNumber,
  consentAgreed,
  answers,
  loading,
  error,
  onClose,
  onDismiss,
  onToggleBoolean,
  onPhoneChange,
  onConsentChange,
  onSubmit,
}: {
  modal: PopupCampaignItem;
  phoneNumber: string;
  consentAgreed: boolean;
  answers: Partial<Record<string, boolean>>;
  loading: boolean;
  error: string;
  onClose: () => void;
  onDismiss: () => void;
  onToggleBoolean: (key: string, value: boolean) => void;
  onPhoneChange: (value: string) => void;
  onConsentChange: (value: boolean) => void;
  onSubmit: () => void;
}) {
  const fields = modal.formSchema.fields ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              {modal.phaseCode === 'phase1' ? 'Phase 1 Event' : 'Phase 2 Event'}
            </p>
            <h2 className="text-2xl font-bold text-white">{modal.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            aria-label="모달 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          {fields.map((field) => {
            if (field.type === 'text') {
              return (
                <div
                  key={field.key}
                  className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm leading-relaxed text-blue-100"
                >
                  {field.value}
                </div>
              );
            }

            if (field.type === 'boolean' && field.key !== 'phone_consent_agreed') {
              return (
                <div key={field.key} className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                  <p className="mb-3 text-sm font-semibold text-slate-100">
                    {field.label}
                    {field.required ? <span className="ml-1 text-rose-400">*</span> : null}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleBoolean(field.key, true)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        answers[field.key] === true
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      예
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleBoolean(field.key, false)}
                      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        answers[field.key] === false
                          ? 'border-primary-500 bg-primary-600 text-white'
                          : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      아니오
                    </button>
                  </div>
                </div>
              );
            }

            if (field.type === 'phone') {
              return (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-100">
                    {field.label}
                    {field.required ? <span className="ml-1 text-rose-400">*</span> : null}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(event) => onPhoneChange(event.target.value)}
                    placeholder="01012345678"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-primary-500"
                  />
                </div>
              );
            }

            if (field.key === 'phone_consent_agreed') {
              return (
                <label
                  key={field.key}
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-4"
                >
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(event) => onConsentChange(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm leading-relaxed text-slate-200">{field.label}</span>
                </label>
              );
            }

            return null;
          })}

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onDismiss}
            disabled={loading}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            오늘 하루 안 보기
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? '제출 중...' : '응답 제출'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MainPage() {
  const navigate = useNavigate();
  const { isLoggedIn, isInitializing } = useAuth();
  const [activeModal, setActiveModal] = useState<PopupCampaignItem | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<string, boolean>>>({});
  const [phoneNumber, setPhoneNumber] = useState('');
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const booleanFields = useMemo(
    () =>
      (activeModal?.formSchema.fields ?? []).filter(
        (field) => field.type === 'boolean' && field.key !== 'phone_consent_agreed'
      ),
    [activeModal]
  );

  useEffect(() => {
    if (isInitializing || !isLoggedIn) {
      setActiveModal(null);
      return;
    }

    let cancelled = false;

    async function loadEventModal() {
      try {
        const response = await apiFetch<PopupCampaignModalResponse>('/events/modal');
        if (cancelled) return;
        setActiveModal(response.activeModal);
        setModalError('');
      } catch (error) {
        if (cancelled) return;
        console.error('이벤트 모달 조회 실패', error);
      }
    }

    void loadEventModal();

    return () => {
      cancelled = true;
    };
  }, [isInitializing, isLoggedIn]);

  useEffect(() => {
    if (!activeModal) {
      setAnswers({});
      setPhoneNumber('');
      setConsentAgreed(false);
      setModalError('');
      return;
    }

    setAnswers({});
    setPhoneNumber('');
    setConsentAgreed(false);
    setModalError('');
  }, [activeModal]);

  function closeModal() {
    setActiveModal(null);
    setModalError('');
  }

  async function dismissModalForToday() {
    if (!activeModal) {
      return;
    }

    setModalLoading(true);
    setModalError('');
    try {
      await apiFetch<PopupCampaignDismissResponse>(
        `/events/modal/${activeModal.campaignKey}/dismiss`,
        {
          method: 'POST',
          body: JSON.stringify({ hide_for_today: true }),
        }
      );
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : '모달 숨김 처리에 실패했습니다.');
    } finally {
      setModalLoading(false);
    }
  }

  async function submitModalResponse() {
    if (!activeModal) {
      return;
    }

    for (const field of booleanFields) {
      if (typeof answers[field.key] !== 'boolean') {
        setModalError('필수 질문에 모두 응답해주세요.');
        return;
      }
    }

    if (!phoneNumber.trim()) {
      setModalError('전화번호를 입력해주세요.');
      return;
    }

    if (!consentAgreed) {
      setModalError('개인정보 수집 및 이용 동의가 필요합니다.');
      return;
    }

    setModalLoading(true);
    setModalError('');

    try {
      await apiFetch<PopupCampaignSubmitResponse>(
        `/events/modal/${activeModal.campaignKey}/response`,
        {
          method: 'POST',
          body: JSON.stringify({
            phone_number: phoneNumber,
            phone_consent_agreed: consentAgreed,
            answers,
          }),
        }
      );
      closeModal();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : '설문 제출에 실패했습니다.');
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sqld-navy to-slate-900">
      {activeModal ? (
        <EventModal
          modal={activeModal}
          phoneNumber={phoneNumber}
          consentAgreed={consentAgreed}
          answers={answers}
          loading={modalLoading}
          error={modalError}
          onClose={closeModal}
          onDismiss={dismissModalForToday}
          onToggleBoolean={(key, value) =>
            setAnswers((previous) => ({
              ...previous,
              [key]: value,
            }))
          }
          onPhoneChange={setPhoneNumber}
          onConsentChange={setConsentAgreed}
          onSubmit={submitModalResponse}
        />
      ) : null}

      {/* 히어로 섹션 */}
      <section className="max-w-5xl mx-auto px-4 pt-24 pb-20 text-center">
        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-500/30">
          SQLD 합격을 위한 최적의 플랫폼
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          SQL을 실습하고
          <br />
          <span className="text-primary-400">SQLD를 정복</span>하세요
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Oracle 기반 실시간 SQL 실습 환경과 실제 시험장을 재현한 모의고사로
          <br></br>
          SQLD 자격증 합격을 향한 최단 경로를 제시합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/exams')}
            className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg shadow-primary-900/40"
          >
            모의고사 풀이 <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/sql-practice')}
            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
          >
            SQL 실습 <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* 시험 일정 */}
      <ExamScheduleCard />

      {/* 핵심 기능 카드 */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 hover:border-primary-600 transition-colors"
            >
              <div
                className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 모의고사 하이라이트 */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">실제 시험장 그대로</h2>
          <ul className="space-y-3">
            {EXAM_HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-slate-300">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
