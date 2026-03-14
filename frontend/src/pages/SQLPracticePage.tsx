import { useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Database,
  CheckCircle,
  XCircle,
  Play,
  Send,
  GripVertical,
  GripHorizontal,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
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

/** 드래그 리사이즈 핸들러 훅 — state는 호출측에서 관리 */
function useResizeDrag(
  containerRef: React.RefObject<HTMLDivElement | null>,
  direction: 'horizontal' | 'vertical',
  setRatio: React.Dispatch<React.SetStateAction<number>>,
  min: number,
  max: number
): (e: React.MouseEvent) => void {
  return useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      let dragging = true;

      const onMouseMove = (ev: MouseEvent) => {
        if (!dragging || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        let newRatio: number;
        if (direction === 'horizontal') {
          newRatio = (ev.clientX - rect.left) / rect.width;
        } else {
          newRatio = (ev.clientY - rect.top) / rect.height;
        }
        setRatio(Math.max(min, Math.min(max, newRatio)));
      };

      const onMouseUp = () => {
        dragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [containerRef, direction, setRatio, min, max]
  );
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
  const [exitTarget, setExitTarget] = useState<string | null>(null);

  // 리사이즈 state + refs — ESLint react-hooks/refs 호환을 위해 분리
  const [hRatio, setHRatio] = useState(0.42);
  const hContainerRef = useRef<HTMLDivElement>(null);
  const hOnMouseDown = useResizeDrag(hContainerRef, 'horizontal', setHRatio, 0.2, 0.7);

  const [vRatio, setVRatio] = useState(0.55);
  const vContainerRef = useRef<HTMLDivElement>(null);
  const vOnMouseDown = useResizeDrag(vContainerRef, 'vertical', setVRatio, 0.2, 0.85);

  const handleExecute = useCallback(() => {
    if (!query.trim()) return;
    setLoading(true);
    logEvent('sql_execute', { problemId: id, query }, user?.id);
    setTimeout(() => {
      setResult(executeMockSQL(query));
      setLoading(false);
    }, 300);
  }, [query, id, user?.id]);

  // CodeMirror extensions (Ctrl+Enter 단축키 포함)
  const editorExtensions = useMemo(
    () => [
      sql(),
      keymap.of([
        {
          key: 'Ctrl-Enter',
          mac: 'Cmd-Enter',
          run: () => {
            handleExecute();
            return true;
          },
        },
      ]),
    ],
    [handleExecute]
  );

  const handleSubmit = useCallback(() => {
    if (!problem || !query.trim()) return;
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
    <div className="h-screen flex flex-col bg-slate-900">
      {/* 상단 네비게이션 */}
      <div className="shrink-0 bg-sqld-navy border-b border-slate-700 shadow-lg">
        <div className="px-4 h-12 flex items-center justify-between">
          <button
            onClick={() => setExitTarget('/')}
            className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <Database className="w-5 h-5 text-primary-500" />
            <span>
              Sol<span className="text-primary-500">SQLD</span>
            </span>
          </button>
          <nav className="flex items-center gap-6 text-sm text-slate-300">
            <button
              onClick={() => setExitTarget('/exams')}
              className="hover:text-white transition-colors"
            >
              모의고사
            </button>
            <button
              onClick={() => setExitTarget('/sql-practice')}
              className="hover:text-white transition-colors"
            >
              SQL 실습
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 3패널 레이아웃 */}
      <div ref={hContainerRef} className="flex flex-1 min-h-0">
        {/* 좌: 문제 설명 */}
        <div
          className="overflow-y-auto bg-white border-r border-slate-200"
          style={{ width: `${hRatio * 100}%` }}
        >
          <div className="p-6">
            <h1 className="text-lg font-bold text-sqld-navy mb-4">{problem.title}</h1>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-4">
              {problem.description}
            </p>

            <div className="bg-white border border-slate-800 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-700 font-mono whitespace-pre-line">
                {problem.schema}
              </p>
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
        </div>

        {/* 좌우 리사이즈 핸들 */}
        <div
          onMouseDown={hOnMouseDown}
          className="w-1.5 shrink-0 bg-slate-200 hover:bg-primary-400 cursor-col-resize flex items-center justify-center transition-colors group"
        >
          <GripVertical className="w-3 h-3 text-slate-400 group-hover:text-white" />
        </div>

        {/* 우: 코드 에디터 + 결과 */}
        <div
          ref={vContainerRef}
          className="flex flex-col min-w-0"
          style={{ width: `${(1 - hRatio) * 100}%` }}
        >
          {/* 우상: 코드 에디터 */}
          <div
            className="flex flex-col min-h-0 overflow-hidden"
            style={{ height: `${vRatio * 100}%` }}
          >
            {/* 에디터 헤더 */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">SQL Editor</span>
              <div className="flex gap-2">
                <button
                  onClick={handleExecute}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                >
                  <Play className="w-3 h-3" />
                  실행 (Ctrl+Enter)
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
                >
                  <Send className="w-3 h-3" />
                  제출
                </button>
              </div>
            </div>
            {/* CodeMirror */}
            <div className="flex-1 overflow-hidden">
              <CodeMirror
                value={query}
                height="100%"
                extensions={editorExtensions}
                theme={oneDark}
                onChange={setQuery}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: false,
                  autocompletion: true,
                }}
                className="h-full [&_.cm-editor]:!h-full [&_.cm-scroller]:!overflow-auto"
              />
            </div>
          </div>

          {/* 상하 리사이즈 핸들 */}
          <div
            onMouseDown={vOnMouseDown}
            className="h-1.5 shrink-0 bg-slate-200 hover:bg-primary-400 cursor-row-resize flex items-center justify-center transition-colors group"
          >
            <GripHorizontal className="w-3 h-3 text-slate-400 group-hover:text-white" />
          </div>

          {/* 우하: 결과 출력 */}
          <div
            className="flex flex-col min-h-0 overflow-hidden bg-white"
            style={{ height: `${(1 - vRatio) * 100}%` }}
          >
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-600">
                {result ? (result.error ? '오류' : `결과 (${result.rows.length}행)`) : '결과'}
              </span>
              {result && <span className="text-xs text-slate-400">{result.executionTimeMs}ms</span>}
            </div>

            <div className="flex-1 overflow-auto">
              {!result && (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  쿼리를 실행하면 결과가 여기에 표시됩니다
                </div>
              )}
              {result?.error && (
                <div className="px-4 py-3 text-sm text-red-600 font-mono bg-red-50 h-full">
                  {result.error}
                </div>
              )}
              {result && !result.error && (
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 font-semibold text-slate-700 border-r border-slate-200 last:border-r-0"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100 hover:bg-slate-50">
                        {result.columns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-2 font-mono text-slate-600 border-r border-slate-100 last:border-r-0 whitespace-nowrap"
                          >
                            {row[col] === null ? (
                              <span className="text-slate-400 italic">NULL</span>
                            ) : (
                              String(row[col])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 이탈 확인 모달 */}
      {exitTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-sqld-navy mb-2">실습을 나가시겠습니까?</h3>
            <p className="text-sm text-slate-500 mb-1">작성 중인 쿼리는 저장되지 않습니다.</p>
            <p className="text-sm text-slate-500 mb-6">나가기 전에 필요한 내용을 복사해 주세요.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setExitTarget(null)}
                className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                계속 풀기
              </button>
              <button
                onClick={() => navigate(exitTarget)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                나가기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
