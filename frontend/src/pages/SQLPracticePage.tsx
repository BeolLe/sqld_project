import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import SQLEditor from '../components/SQLEditor';
import { logEvent } from '../utils/eventLogger';
import { useAuth } from '../contexts/AuthContext';
import type { SQLResult } from '../types';

// 목업 SQL 문제 상세
const SQL_PROBLEM_DETAIL: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    schema: string;
    answer: string;
    hint: string;
  }
> = {
  sql2: {
    id: 'sql2',
    title: 'GROUP BY와 HAVING 절',
    description: `아래 EMP 테이블에서 부서별 평균 급여가 2000을 초과하는 부서번호(DEPTNO)와 해당 부서의 평균 급여(AVG_SAL)를 조회하세요.\n\n- 평균 급여는 소수점 없이 반올림(ROUND)하여 출력\n- 결과는 평균 급여 내림차순 정렬`,
    schema: `-- EMP 테이블\n-- EMPNO, ENAME, JOB, MGR, HIREDATE, SAL, COMM, DEPTNO`,
    answer: `SELECT DEPTNO, ROUND(AVG(SAL)) AS AVG_SAL
FROM EMP
GROUP BY DEPTNO
HAVING AVG(SAL) > 2000
ORDER BY AVG_SAL DESC`,
    hint: 'GROUP BY → HAVING 순서로 작성하고, 집계 함수(AVG)는 SELECT와 HAVING에서 사용할 수 있습니다.',
  },
};

// 더미 SQL 실행 함수 (실제 서비스에서는 백엔드 API 호출)
function executeMockSQL(query: string): SQLResult {
  const normalized = query.trim().toUpperCase();
  if (normalized.includes('ERROR') || normalized === '') {
    return {
      columns: [],
      rows: [],
      executionTimeMs: 12,
      error: 'ORA-00942: table or view does not exist',
    };
  }
  return {
    columns: ['DEPTNO', 'AVG_SAL'],
    rows: [
      { DEPTNO: 20, AVG_SAL: 2875 },
      { DEPTNO: 30, AVG_SAL: 2850 },
    ],
    executionTimeMs: Math.floor(Math.random() * 100) + 20,
  };
}

export default function SQLPracticePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const problem = id ? SQL_PROBLEM_DETAIL[id] : null;
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SQLResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);

  const handleExecute = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    logEvent('sql_execute', { problemId: id, query }, user?.id);
    setTimeout(() => {
      setResult(executeMockSQL(query));
      setLoading(false);
    }, 300);
  }, [query, id, user?.id]);

  const handleSubmit = useCallback(() => {
    if (!problem || !query.trim()) return;
    // 간단한 정답 비교 (실제 서비스에서는 백엔드 비교)
    const isCorrect =
      query.trim().toUpperCase().includes('AVG(SAL)') &&
      query.trim().toUpperCase().includes('HAVING');
    logEvent('sql_submit', { problemId: id, query, isCorrect }, user?.id);
    if (isCorrect) {
      logEvent('points_update', { userId: user?.id, delta: 10 }, user?.id);
    }
    setSubmitResult(isCorrect ? 'correct' : 'wrong');
  }, [query, problem, id, user?.id]);

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">문제를 찾을 수 없습니다. (현재 sql2 문제만 지원)</p>
          <button
            onClick={() => navigate('/sql-practice')}
            className="text-primary-600 hover:underline"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* 뒤로가기 */}
        <button
          onClick={() => navigate('/sql-practice')}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          SQL 실습 목록
        </button>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* 문제 설명 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h1 className="text-lg font-bold text-sqld-navy mb-4">{problem.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
              {problem.description}
            </p>

            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-400 font-mono">{problem.schema}</p>
            </div>

            <button
              onClick={() => setShowHint((v) => !v)}
              className="text-xs text-primary-600 hover:underline"
            >
              {showHint ? '힌트 숨기기' : '힌트 보기'}
            </button>
            {showHint && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
                {problem.hint}
              </div>
            )}

            {/* 제출 결과 */}
            {submitResult && (
              <div
                className={`mt-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold ${
                  submitResult === 'correct'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-600 border border-red-200'
                }`}
              >
                {submitResult === 'correct' ? (
                  <>
                    <CheckCircle className="w-5 h-5" /> 정답입니다! +10pt 획득
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" /> 오답입니다. 다시 시도해보세요.
                  </>
                )}
              </div>
            )}
          </div>

          {/* SQL 편집기 + 결과 */}
          <div>
            <SQLEditor
              value={query}
              onChange={setQuery}
              onExecute={handleExecute}
              onSubmit={handleSubmit}
              result={result}
              loading={loading}
              mode="practice"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
