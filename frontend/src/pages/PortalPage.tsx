import { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, CheckCircle, ChevronRight, Database } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import CreatorCredentials from '../components/CreatorCredentials';
import { useExamSchedules } from '../contexts/ExamScheduleContext';
import { useExamCapabilities } from '../hooks/useExamCapabilities';
import { EXAM_CONFIG, EXAM_TYPES } from '../constants/examTypes';
import type { ExamType } from '../constants/examTypes';
import { ALL_UNITS, ADSP_ALL_UNITS } from '../data/learn/curriculum';
import { filterSchedulesByExam, formatExamDate, getDday, getNextExamDate } from '../data/examSchedule';
import { getLastExamType } from '../utils/examPath';
import { PageviewLog, ClickLog } from '../logging';

const EXAM_ICONS: Record<ExamType, LucideIcon> = { sqld: Database, adsp: BarChart3 };

const UNIT_COUNT: Record<ExamType, number> = { sqld: ALL_UNITS.length, adsp: ADSP_ALL_UNITS.length };

/** 시험별로 무엇을 할 수 있는지 한 줄 요약 */
function menuSummary(type: ExamType, contentReady: boolean): string {
  const config = EXAM_CONFIG[type];
  // 아직 공개되지 않은 시험은 모의고사·무한풀이를 약속하지 않고 개념 학습만 안내한다.
  if (!contentReady) return `개념 학습 ${UNIT_COUNT[type]}항목`;
  const parts = ['모의고사', ...(config.hasSqlPractice ? ['SQL 실습'] : []), `개념 학습 ${UNIT_COUNT[type]}항목`, '무한풀이'];
  return parts.join(' · ');
}

/**
 * 통합 메인 (`/`). SQLD · ADsP 중 준비할 시험을 고른다.
 * 시험별 메인은 `/sqld`, `/adsp` 에 있다.
 */
export default function PortalPage() {
  const navigate = useNavigate();
  const { schedules } = useExamSchedules();
  const { available, checking, failed, refresh } = useExamCapabilities();
  const lastExam = useMemo(() => getLastExamType(), []);
  const pageview = useMemo(() => new PageviewLog({ page_id: 'portal', url: '/' }), []);
  const click = useMemo(() => new ClickLog({ page_id: 'portal', url: '/' }), []);
  const pvSent = useRef(false);

  useEffect(() => {
    if (pvSent.current) return;
    pvSent.current = true;
    pageview.send({ data: { last_exam_type: lastExam } });
  }, [pageview, lastExam]);

  function start(type: ExamType, index: number, learnOnly: boolean) {
    // 미공개 시험은 시험 메인(모의고사·무한풀이 안내) 대신 개념 학습으로 바로 들어간다.
    const target = learnOnly ? `/${type}/learn` : `/${type}`;
    click.send({
      object_section_id: 'exam_select', object_section_idx: 1, object_type: 'card', object_idx: index,
      object_id: 'exam_start', object_url: target, data: { to_exam_type: type, is_last_exam: type === lastExam, learn_only: learnOnly },
    });
    navigate(target);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sqld-navy to-slate-900">
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-14 text-center">
        <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-4 border border-blue-500/30">
          데이터 자격증 합격을 위한 최적의 플랫폼
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          어떤 시험을
          <br />
          <span className="text-primary-400">준비하고 계세요?</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          시험을 고르면 그 시험에 맞춘 모의고사, 개념 학습, 무한풀이로 바로 이어집니다.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-12 grid md:grid-cols-2 gap-6">
        {EXAM_TYPES.map((type, index) => {
          const config = EXAM_CONFIG[type];
          const Icon = EXAM_ICONS[type];
          const next = getNextExamDate(filterSchedulesByExam(schedules, config.scheduleExamType));
          const dday = next?.examDate ? getDday(next.examDate) : null;
          // 확인 중에도 공개를 약속하지 않는다. 조회가 끝내 실패하면 '준비 중'이 아니라 '확인 실패'로 구분한다.
          const contentReady = available[type];
          const showFailed = failed && type !== 'sqld';
          const showPreparing = !contentReady && !showFailed;
          return (
            <div
              key={type}
              className={`bg-slate-800/60 border border-slate-700 rounded-2xl p-7 flex flex-col gap-4 transition-colors ${config.accent.hoverBorder}`}
            >
              <div className="flex items-center gap-3">
                <div className={`${config.accent.iconBg} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-white font-bold text-xl">{config.name}</h2>
                    {!contentReady && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/40">
                        {showFailed ? '상태 확인 실패' : checking ? '확인 중' : '준비 중'}
                      </span>
                    )}
                    {type === lastExam && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        최근 학습
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm">{config.fullName}</p>
                </div>
                {next && dday !== null && dday >= 0 && (
                  <div className="ml-auto text-right shrink-0">
                    <p className="text-2xl font-extrabold text-blue-400">{dday === 0 ? 'D-Day' : `D-${dday}`}</p>
                    <p className="text-xs text-slate-400">
                      {next.roundLabel} {formatExamDate(next.examDate)}
                    </p>
                  </div>
                )}
              </div>
              <ul className="space-y-1.5 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {config.subjects.length}과목 · 50문항 · 90분 · 60점 이상 합격
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  {menuSummary(type, contentReady)}
                </li>
              </ul>
              <button
                type="button"
                onClick={() => start(type, index, !contentReady)}
                className={`mt-1 flex items-center justify-center gap-2 ${config.accent.button} text-white font-bold py-3.5 rounded-xl transition-colors`}
              >
                {contentReady ? `${config.name} 시작하기` : `${config.name} 개념 학습 시작하기`} <ChevronRight className="w-5 h-5" />
              </button>
              {showPreparing && !checking && (
                <p className="text-xs text-slate-400 text-center">모의고사와 무한풀이는 준비 중입니다.</p>
              )}
              {showFailed && (
                <p className="text-xs text-slate-400 text-center">
                  모의고사 공개 상태를 확인하지 못했습니다.{' '}
                  <button type="button" onClick={refresh} className="text-primary-400 hover:underline font-medium">
                    다시 시도
                  </button>
                </p>
              )}
            </div>
          );
        })}
      </section>

      <CreatorCredentials />
    </div>
  );
}
