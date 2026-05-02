import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shuffle, Home, Loader2, ChevronLeft, ChevronRight, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { fetchExamList, fetchExamProblems } from '../api/content';
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
  const navigate = useNavigate();

  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('mode-select');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn || isInitializing) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchExamList()
      .then((exams) =>
        Promise.all(exams.map((exam) => fetchExamProblems(exam.id)))
      )
      .then((results) => {
        if (!cancelled) setAllProblems(results.flat());
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
    if (!selectedCategory) return allProblems;
    return allProblems.filter((p) => p.category === selectedCategory);
  }, [allProblems, selectedCategory]);

  const handleModeAll = () => {
    setSelectedCategory(null);
    setStep('playing');
  };

  const handleModeCategory = () => {
    setStep('subject-select');
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setStep('category-select');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep('playing');
  };

  const handleBack = () => {
    if (step === 'playing') {
      setSelectedCategory(null);
      setSelectedSubject(null);
      setStep('mode-select');
    } else if (step === 'category-select') {
      setSelectedSubject(null);
      setStep('subject-select');
    } else if (step === 'subject-select') {
      setStep('mode-select');
    }
  };

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
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
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
          <button onClick={() => navigate('/')} className="text-primary-600 hover:underline">
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 플레이 모드
  if (step === 'playing') {
    const playProblems = selectedCategory ? filteredProblems : allProblems;
    const playLabel = selectedCategory
      ? `${SUBJECT_MAP[selectedSubject ?? '']?.label ?? ''} > ${selectedCategory}`
      : '전체 랜덤';

    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <EndlessPracticePlayer
            key={selectedCategory ?? 'all'}
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
            onClick={step === 'mode-select' ? () => navigate('/') : handleBack}
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
              onClick={handleModeAll}
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
              onClick={handleModeCategory}
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
                  onClick={() => handleSubjectSelect(key)}
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

        {/* Step 3: 세부 카테고리 선택 */}
        {step === 'category-select' && selectedSubject && (
          <div>
            <p className="text-sm text-slate-500 mb-4">
              {SUBJECT_MAP[selectedSubject].label} — {SUBJECT_MAP[selectedSubject].description}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getCategoriesForSubject(selectedSubject, allCategories).map((cat) => {
                const count = allProblems.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-4 text-left hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <h3 className="text-sm font-semibold text-sqld-navy">{cat}</h3>
                    <p className="text-xs text-slate-400 mt-1">{count}문제</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
