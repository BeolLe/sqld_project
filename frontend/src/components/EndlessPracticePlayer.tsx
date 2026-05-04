import { useState, useCallback, useEffect } from 'react';
import { RotateCcw, ChevronRight, CheckCircle, XCircle, Shuffle, ChevronLeft } from 'lucide-react';
import type { Problem } from '../types';
import DescriptionRenderer from './DescriptionRenderer';
import { fetchEndlessStats, resetEndlessStats, submitEndlessAnswer } from '../api/endless';
import { useAuth } from '../contexts/AuthContext';

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface Props {
  problems: Problem[];
  label: string;
  onBack: () => void;
}

export default function EndlessPracticePlayer({ problems, label, onBack }: Props) {
  const { updatePoints } = useAuth();
  const [queue, setQueue] = useState<Problem[]>(() => shuffleArray(problems));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const problem = queue[currentIndex] ?? null;
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === problem?.answer;
  const correctRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    setActionError(null);

    fetchEndlessStats()
      .then((stats) => {
        if (cancelled) return;
        setTotalAnswered(stats.totalAnswered ?? 0);
        setTotalCorrect(stats.totalCorrect ?? 0);
        if (typeof stats.totalPoints === 'number') {
          updatePoints(stats.totalPoints);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setActionError(error instanceof Error ? error.message : '무한풀이 통계를 불러오지 못했습니다.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [updatePoints]);

  const handleSelect = useCallback(
    async (option: string) => {
      if (isAnswered || !problem || isSubmitting) return;
      setActionError(null);
      setIsSubmitting(true);

      try {
        const stats = await submitEndlessAnswer({
          problemId: problem.id,
          selectedAnswer: option,
          category: problem.category,
          difficulty: problem.difficulty,
        });
        setSelectedAnswer(option);
        setTotalAnswered(stats.totalAnswered ?? 0);
        setTotalCorrect(stats.totalCorrect ?? 0);
        if (typeof stats.totalPoints === 'number') {
          updatePoints(stats.totalPoints);
        }
      } catch (error) {
        setActionError(error instanceof Error ? error.message : '정답 저장에 실패했습니다.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAnswered, isSubmitting, problem, updatePoints],
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      setQueue(shuffleArray(problems));
      setCurrentIndex(0);
    } else {
      setCurrentIndex(nextIndex);
    }
    setSelectedAnswer(null);
  }, [currentIndex, queue.length, problems]);

  const handleReset = useCallback(async () => {
    setActionError(null);
    setQueue(shuffleArray(problems));
    setCurrentIndex(0);
    setSelectedAnswer(null);

    try {
      const stats = await resetEndlessStats();
      setTotalAnswered(stats.totalAnswered ?? 0);
      setTotalCorrect(stats.totalCorrect ?? 0);
      if (typeof stats.totalPoints === 'number') {
        updatePoints(stats.totalPoints);
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '무한풀이 초기화에 실패했습니다.');
      setTotalAnswered(0);
      setTotalCorrect(0);
    }
  }, [problems, updatePoints]);

  if (!problem) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">해당 카테고리에 문제가 없습니다.</p>
        <button onClick={onBack} className="text-primary-600 hover:underline">
          돌아가기
        </button>
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
    <>
      {/* 상단 바 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="모드 선택으로"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-sqld-navy flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-primary-500" />
              무한풀이
            </h1>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-500">
            <span className="font-bold text-sqld-navy">{totalAnswered}</span>문제
            {!statsLoading && totalAnswered > 0 && (
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
            onClick={() => {
              void handleReset();
            }}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 문제 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${difficultyColor}`}>
            {difficultyLabel}
          </span>
          <span className="text-xs text-slate-400">{problem.category}</span>
        </div>

        <div className="px-6 py-5">
          {actionError && (
            <p className="mb-3 text-sm text-red-500">{actionError}</p>
          )}
          <h2 className="text-base font-semibold text-slate-800 leading-relaxed mb-1">
            {problem.title}
          </h2>
          <div className="text-sm text-slate-700 leading-relaxed">
            <DescriptionRenderer text={problem.description} />
          </div>
        </div>

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
                onClick={() => {
                  void handleSelect(optionNum);
                }}
                disabled={isAnswered || isSubmitting}
                className={`w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl border transition-all ${borderClass} ${
                  isAnswered || isSubmitting ? 'cursor-default' : 'cursor-pointer'
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

        {isAnswered && (
          <div className="flex flex-col-reverse md:flex-col">
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

            <div className="px-6 pb-6">
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                다음 문제 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
