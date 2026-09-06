import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Home, Loader2, ChevronLeft, ChevronRight, BookOpen, Layers, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { PageviewLog, ClickLog } from '../logging';
import { fetchEndlessProblems } from '../api/endless';
import type { Problem } from '../types';
import EndlessPracticePlayer from '../components/EndlessPracticePlayer';

type Step = 'mode-select' | 'subject-select' | 'category-select' | 'playing';

const SUBJECT_1_CATEGORIES = ['데이터모델링', '정규화'];

const SUBJECT_MAP: Record<string, { label: string; description: string }> = {
  '1': { label: '1과목', description: '데이터 모델링의 이해' },
  '2': { label: '2과목', description: 'SQL 기본 및 활용' },
};

function getCategoriesForSubject(subject: string, allCategories: string[]): string[] {
  if (subject === '1') {
    return allCategories.filter((c) => SUBJECT_1_CATEGORIES.includes(c));
  }
  return allCategories.filter((c) => !SUBJECT_1_CATEGORIES.includes(c));
}

export default function EndlessPracticePage() {
  const { isLoggedIn, isInitializing } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('mode-select');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoggedIn || isInitializing) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchEndlessProblems()
      .then((results) => {
        if (!cancelled) setAllProblems(results);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [isLoggedIn, isInitializing]);

  const allCategories = useMemo(
    () => [...new Set(allProblems.map((p) => p.category))].sort(),
    [allProblems],
  );

  const filteredProblems = useMemo(() => {
    if (selectedCategories.length === 0) return allProblems;
    return allProblems.filter((p) => selectedCategories.includes(p.category));
  }, [allProblems, selectedCategories]);

  const handleModeAll = () => {
    setSelectedCategories([]);
    setStep('playing');
  };

  const handleModeCategory = () => {
    setStep('subject-select');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setSelectedCategories([]);
    setStep('category-select');
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSelectAll = () => {
    if (!selectedSubject) return;
    const subjectCategories = getCategoriesForSubject(selectedSubject, allCategories);
    const allSelected = subjectCategories.every((c) => selectedCategories.includes(c));
    if (allSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...subjectCategories]);
    }
  };

  const handleStartPlaying = () => {
    setStep('playing');
  };

  const handleBack = () => {
    if (step === 'playing') {
      setSelectedCategories([]);
      setSelectedSubject(null);
      setStep('mode-select');
    } else if (step === 'category-select') {
      setSelectedSubject(null);
      setSelectedCategories([]);
      setStep('subject-select');
    } else if (step === 'subject-select') {
      setStep('mode-select');
    }
  };

  // ─── 로깅 ──────────────────────────────────────────────────────────────
  const pageview = useMemo(() => new PageviewLog({ page_id: 'endless', url: '/endless' }), []);
  const click = useMemo(() => new ClickLog({ page_id: 'endless', url: '/endless' }), []);
  const lastPvStep = useRef<string | null>(null);

  useEffect(() => {
    if (isInitializing) return;
    if (!isLoggedIn) {
      if (lastPvStep.current !== 'login_required') {
        lastPvStep.current = 'login_required';
        pageview.send({ step: 'login_required' });
      }
      return;
    }
    if (error && lastPvStep.current !== 'load_error') {
      lastPvStep.current = 'load_error';
      pageview.send({ step: 'load_error' });
      return;
    }
    if (loading) return;

    const stepKey = step === 'mode-select' ? 'mode_select'
      : step === 'subject-select' ? 'subject_select'
      : step === 'category-select' ? 'category_select'
      : 'playing';

    if (lastPvStep.current === stepKey) return;
    lastPvStep.current = stepKey;

    if (stepKey === 'mode_select') {
      pageview.send({ step: 'mode_select' });
    } else if (stepKey === 'subject_select') {
      pageview.send({ step: 'subject_select' });
    } else if (stepKey === 'category_select') {
      pageview.send({ step: 'category_select', data: { subject: selectedSubject } });
    }
    // playing pageview is handled by EndlessPracticePlayer
  }, [isInitializing, isLoggedIn, error, loading, step, selectedSubject, pageview]);

  // ─── 비로그인 시 인증 모달 (E-4 fix: 조기 반환 전으로 이동) ─────────────
  useEffect(() => {
    if (!isLoggedIn && !isInitializing) {
      openAuthModal('login');
    }
  }, [isLoggedIn, isInitializing, openAuthModal]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">인증 상태를 확인하는 중입니다.</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">로그인 후 이용 가능합니다.</p>
          <button onClick={() => { click.send({ object_section_id: 'login_notice', object_section_idx: 1, object_type: 'link', object_idx: 0, object_id: 'home', object_url: '/', page_params: { step: 'login_required' } }); navigate('/'); }} className="text-primary-600 hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">문제를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => { click.send({ object_section_id: 'error_notice', object_section_idx: 1, object_type: 'link', object_idx: 0, object_id: 'home', object_url: '/', page_params: { step: 'load_error' } }); navigate('/'); }} className="text-primary-600 hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 플레이 모드
  if (step === 'playing') {
    const playProblems = selectedCategories.length > 0 ? filteredProblems : allProblems;
    const playLabel = selectedCategories.length === 0
      ? '전체 랜덤'
      : selectedCategories.length <= 3
        ? `${SUBJECT_MAP[selectedSubject ?? '']?.label ?? ''} > ${selectedCategories.join(', ')}`
        : `${SUBJECT_MAP[selectedSubject ?? '']?.label ?? ''} > ${selectedCategories.length}개 카테고리`;

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <EndlessPracticePlayer
            key={selectedCategories.join(',') || 'all'}
            problems={playProblems}
            label={playLabel}
            onBack={handleBack}
          />
        </div>
      </div>
    );
  }

  // 선택 플로우
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 상단 헤더 */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => {
              const stepKey = step === 'mode-select' ? 'mode_select' : step === 'subject-select' ? 'subject_select' : step === 'category-select' ? 'category_select' : 'playing';
              if (step === 'mode-select') {
                click.send({ object_section_id: 'title_bar', object_section_idx: 1, object_type: 'button', object_idx: 0, object_id: 'home', object_url: '/', page_params: { step: stepKey } });
                navigate('/');
              } else {
                click.send({ object_section_id: 'title_bar', object_section_idx: 1, object_type: 'button', object_idx: 0, object_id: 'back', page_params: { step: stepKey } });
                handleBack();
              }
            }}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title={step === 'mode-select' ? '홈으로' : '뒤로'}
          >
            {step === 'mode-select' ? <Home className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <h1 className="text-lg font-bold text-sqld-navy flex items-center gap-2">
            <Shuffle className="w-5 h-5 text-primary-500" />
            무한풀이
          </h1>
        </div>

        {/* Step 1: 모드 선택 */}
        {step === 'mode-select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => { click.send({ object_section_id: 'mode_list', object_section_idx: 2, object_type: 'card', object_idx: 0, object_id: 'random_all', page_params: { step: 'mode_select' } }); handleModeAll(); }}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="bg-primary-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
                <Shuffle className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-base font-bold text-sqld-navy mb-1">전체 랜덤</h2>
              <p className="text-sm text-slate-500">
                전체 {allProblems.length}문제를 랜덤으로 풀기
              </p>
              <div className="flex items-center gap-1 mt-4 text-xs text-primary-600 font-medium">
                시작하기 <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            <button
              onClick={() => { click.send({ object_section_id: 'mode_list', object_section_idx: 2, object_type: 'card', object_idx: 1, object_id: 'random_by_category', page_params: { step: 'mode_select' } }); handleModeCategory(); }}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:border-primary-300 hover:shadow-md transition-all"
            >
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                <Layers className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-base font-bold text-sqld-navy mb-1">카테고리별 랜덤</h2>
              <p className="text-sm text-slate-500">
                과목 · 세부과목을 선택해서 풀기
              </p>
              <div className="flex items-center gap-1 mt-4 text-xs text-amber-600 font-medium">
                과목 선택 <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}

        {/* Step 2: 과목 선택 */}
        {step === 'subject-select' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(['1', '2'] as const).map((key) => {
              const info = SUBJECT_MAP[key];
              const categories = getCategoriesForSubject(key, allCategories);
              const count = allProblems.filter((p) => categories.includes(p.category)).length;

              return (
                <button
                  key={key}
                  onClick={() => { click.send({ object_section_id: 'subject_list', object_section_idx: 2, object_type: 'card', object_idx: Number(key) - 1, object_id: `subject_${key}`, page_params: { step: 'subject_select' } }); handleSubjectSelect(key); }}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-left hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="bg-slate-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-slate-500 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <h2 className="text-base font-bold text-sqld-navy mb-1">{info.label}</h2>
                  <p className="text-sm text-slate-500">{info.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {categories.length}개 카테고리 · {count}문제
                  </p>
                  <div className="flex items-center gap-1 mt-4 text-xs text-primary-600 font-medium">
                    세부과목 선택 <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 3: 세부 카테고리 선택 (복수 선택) */}
        {step === 'category-select' && selectedSubject && (() => {
          const subjectCategories = getCategoriesForSubject(selectedSubject, allCategories);
          const isAllSelected = subjectCategories.length > 0 && subjectCategories.every((c) => selectedCategories.includes(c));

          return (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-500">
                  {SUBJECT_MAP[selectedSubject].label} — {SUBJECT_MAP[selectedSubject].description}
                </p>
                <button
                  onClick={() => {
                    click.send({ object_section_id: 'category_list', object_section_idx: 2, object_type: 'button', object_idx: 0, object_id: isAllSelected ? 'deselect_all' : 'select_all', page_params: { step: 'category_select' } });
                    handleSelectAll();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isAllSelected
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {isAllSelected ? '전체 해제' : '전체 선택'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {subjectCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  const count = allProblems.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        const willBeSelected = !isSelected;
                        click.send({ object_section_id: 'category_list', object_section_idx: 2, object_type: 'checkbox', object_idx: 1, object_id: 'category', data: { category: cat, is_selected: willBeSelected }, page_params: { step: 'category_select' } });
                        handleToggleCategory(cat);
                      }}
                      className={`rounded-xl shadow-sm border px-4 py-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary-400 bg-primary-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-sqld-navy">{cat}</h3>
                          <p className="text-xs text-slate-400 mt-1">{count}문제</p>
                        </div>
                        <div
                          className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                {selectedCategories.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 text-center">
                      {selectedCategories.length}개 카테고리 · {filteredProblems.length}문제 선택됨
                    </p>
                    <button
                      onClick={() => { click.send({ object_section_id: 'category_list', object_section_idx: 2, object_type: 'button', object_idx: 2, object_id: 'start', data: { category_count: selectedCategories.length }, page_params: { step: 'category_select' } }); handleStartPlaying(); }}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      시작하기 <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center">
                    풀고 싶은 카테고리를 선택하세요
                  </p>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
