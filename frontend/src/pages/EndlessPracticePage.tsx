import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, ChevronRight, CheckCircle, XCircle, Shuffle, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getExamProblems } from '../data/exams';
import type { Problem } from '../types';
import DescriptionRenderer from '../components/DescriptionRenderer';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getAllProblems(): Problem[] {
  const all: Problem[] = [];
  for (let i = 1; i <= 10; i++) {
    all.push(...getExamProblems(String(i)));
  }
  return all;
}

export default function EndlessPracticePage() {
  const { isLoggedIn, isInitializing } = useAuth();
  const navigate = useNavigate();

  const allProblems = useMemo(() => getAllProblems(), []);
  const [queue, setQueue] = useState<Problem[]>(() => shuffleArray(allProblems));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const problem = queue[currentIndex] ?? null;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === problem?.answer;
  const correctRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const handleSelect = useCallback(
    (option: string) => {
      if (isAnswered || !problem) return;
      setSelectedAnswer(option);
      setTotalAnswered((prev) => prev + 1);
      if (option === problem.answer) {
        setTotalCorrect((prev) => prev + 1);
      }
    },
    [isAnswered, problem],
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      setQueue(shuffleArray(allProblems));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }
    setSelectedAnswer(null);
  }, [currentIndex, queue.length, allProblems]);

  const handleReset = useCallback(() => {
    setQueue(shuffleArray(allProblems));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setTotalAnswered(0);
    setTotalCorrect(0);
  }, [allProblems]);

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

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">문제를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const difficultyLabel = { easy: '기본', medium: '중급', hard: '고급' }[problem.difficulty];
  const difficultyColor = {
    easy: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }[problem.difficulty];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 상단 바 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="홈으로"
            >
              <Home className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-sqld-navy flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-primary-500" />
                무한풀이
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500">
              <span className="font-bold text-sqld-navy">{totalAnswered}</span>문제
              {totalAnswered > 0 && (
                <>
                  <span className="mx-1.5 text-slate-300">·</span>
                  정답률{' '}
                  <span
                    className={`font-bold ${correctRate >= 60 ? 'text-emerald-600' : 'text-red-500'}`}
                  >
                    {correctRate}%
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleReset}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 문제 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 문제 헤더 */}
          <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor}`}>
              {difficultyLabel}
            </span>
            <span className="text-xs text-slate-400">{problem.category}</span>
          </div>

          {/* 문제 지문 */}
          <div className="px-6 py-5">
            <h2 className="text-base font-semibold text-slate-800 leading-relaxed mb-1">
              {problem.title}
            </h2>
            <div className="text-sm text-slate-700 leading-relaxed">
              <DescriptionRenderer text={problem.description} />
            </div>
          </div>

          {/* 선택지 */}
          <div className="px-6 pb-5 space-y-2.5">
            {problem.options?.map((option, idx) => {
              const optionNum = String(idx + 1);
              const isSelected = selectedAnswer === optionNum;
              const isCorrectOption = problem.answer === optionNum;

              let borderClass = 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/30';
              let iconEl = null;

              if (isAnswered) {
                if (isCorrectOption) {
                  borderClass = 'border-emerald-400 bg-emerald-50';
                  iconEl = <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
                } else if (isSelected && !isCorrect) {
                  borderClass = 'border-red-400 bg-red-50';
                  iconEl = <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
                } else {
                  borderClass = 'border-slate-200 opacity-50';
                }
              }

              return (
                <button
                  key={optionNum}
                  onClick={() => handleSelect(optionNum)}
                  disabled={isAnswered}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${borderClass} ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      isAnswered && isCorrectOption
                        ? 'bg-emerald-500 text-white'
                        : isAnswered && isSelected && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {optionNum}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 pt-0.5">{option}</span>
                  {iconEl}
                </button>
              );
            })}
          </div>

          {/* 해설 */}
          {isAnswered && (
            <div className="px-6 pb-5">
              <div
                className={`rounded-xl px-5 py-4 ${
                  isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <p
                  className={`text-xs font-bold mb-1.5 ${
                    isCorrect ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {isCorrect ? '정답입니다!' : `오답 — 정답은 ${problem.answer}번`}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">{problem.explanation}</p>
              </div>
            </div>
          )}

          {/* 다음 문제 */}
          {isAnswered && (
            <div className="px-6 pb-6">
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                다음 문제 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
