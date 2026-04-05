import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Database,
  CheckCircle,
  XCircle,
  Play,
  Send,
  GripVertical,
  GripHorizontal,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Table2,
  FileText,
  BookOpen,
  Key,
  Flag,
} from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import ReportErrorModal from '../components/ReportErrorModal';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { keymap } from '@codemirror/view';
import { logEvent } from '../utils/eventLogger';
import { useAuth } from '../contexts/AuthContext';
import type { SQLResult, Difficulty } from '../types';
import { parseDDL, parseInserts } from '../utils/sqlParser';
import { fetchSQLPractice } from '../api/content';
import { getColumnDescription } from '../constants/columnDescriptions';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'solsqld_access_token';

async function fetchLatestSubmittedQuery(practiceId: string): Promise<string> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}/sql/practices/${practiceId}/latest-submission`, {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail || '마지막 제출 쿼리를 불러오지 못했습니다.');
  }

  const payload = (await response.json()) as { submittedSql?: string };
  return payload.submittedSql ?? '';
}

async function executeSQL(query: string, practiceId: string, action: 'execute' | 'submit'): Promise<SQLResult> {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}/sql/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ query, practice_id: practiceId, action }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail || 'SQL 실행 중 오류가 발생했습니다.');
  }

  return (await response.json()) as SQLResult;
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
  const { user, updatePoints } = useAuth();
  const [problem, setProblem] = useState<{
    id: string;
    title: string;
    description: string;
    schema: string;
    sampleData: string;
    answer: string;
    hint: string;
    difficulty: Difficulty;
    category: string;
    correctRate: number;
  } | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!id || !user) return;

    let mounted = true;

    fetchLatestSubmittedQuery(id)
      .then((submittedSql) => {
        if (!mounted || !submittedSql.trim()) return;
        setQuery(submittedSql);
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, [id, user]);

  useEffect(() => {
    if (!id) return;

    let mounted = true;

    fetchSQLPractice(id)
      .then((problemData) => {
        if (!mounted) return;
        setProblem({
          id: problemData.id,
          title: problemData.title,
          description: problemData.description,
          schema: problemData.schemaSQL || '',
          sampleData: problemData.sampleData || '',
          answer: problemData.answer,
          hint: problemData.explanation,
          difficulty: problemData.difficulty,
          category: problemData.category,
          correctRate: problemData.correctRate,
        });
      })
      .catch((caughtError) => {
        if (!mounted) return;
        setLoadError(caughtError instanceof Error ? caughtError.message : '문제를 불러오지 못했습니다.');
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (problem) {
      logEvent('sql_practice_viewed', { problem_id: problem.id, difficulty: problem.difficulty, category: problem.category });
    }
  }, [problem?.id, problem?.difficulty, problem?.category]);

  // 파싱된 스키마 & 샘플 데이터 (메모이제이션)
  const schemas = useMemo(() => (problem ? parseDDL(problem.schema) : []), [problem?.schema]);
  const sampleTables = useMemo(() => {
    if (!problem?.sampleData) return [];
    const tables = parseInserts(problem.sampleData);
    // INSERT에 컬럼 명시가 없으면 스키마에서 가져옴
    return tables.map((t) => {
      if (t.columns.length === 0) {
        const s = schemas.find((sc) => sc.tableName === t.tableName);
        if (s) return { ...t, columns: s.columns.map((c) => c.name) };
      }
      return t;
    });
  }, [problem?.sampleData, schemas]);

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SQLResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<'correct' | 'wrong' | null>(null);
  const [exitTarget, setExitTarget] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  // 리사이즈 state + refs — ESLint react-hooks/refs 호환을 위해 분리
  const [hRatio, setHRatio] = useState(0.42);
  const hContainerRef = useRef<HTMLDivElement>(null);
  const hOnMouseDown = useResizeDrag(hContainerRef, 'horizontal', setHRatio, 0.2, 0.7);

  const [vRatio, setVRatio] = useState(0.55);
  const vContainerRef = useRef<HTMLDivElement>(null);
  const vOnMouseDown = useResizeDrag(vContainerRef, 'vertical', setVRatio, 0.2, 0.85);

  const handleExecute = useCallback(async () => {
    if (!problem || !query.trim()) return;
    setLoading(true);
    setExecuteError('');
    logEvent('sql_query_executed', { problemId: id, query }, user?.id);
    try {
      const nextResult = await executeSQL(query, problem.id, 'execute');
      setResult(nextResult);
    } catch (caughtError) {
      setResult(null);
      setExecuteError(
        caughtError instanceof Error ? caughtError.message : 'SQL 실행 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [query, id, problem, user?.id]);

  const isMac = useMemo(() => /Mac|iPhone|iPad/.test(navigator.platform), []);

  // 글로벌 키보드 단축키 — 에디터 밖에서도 Cmd/Ctrl+Enter로 실행 가능
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        handleExecute();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleExecute, isMac]);

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

  const handleSubmit = useCallback(async () => {
    if (!problem || !query.trim()) return;
    setExecuteError('');
    setLoading(true);

    try {
      const nextResult = await executeSQL(query, problem.id, 'submit');
      setResult(nextResult);
      const isCorrect = nextResult.isCorrect === true;

      if (nextResult.isCorrect == null) {
        setSubmitResult(null);
        setExecuteError('채점 기준 결과셋이 아직 준비되지 않았습니다.');
        return;
      }

      logEvent('sql_answer_submitted', { problemId: id, query, isCorrect }, user?.id);
      if (typeof nextResult.totalPoints === 'number') {
        updatePoints(nextResult.totalPoints);
      }
      if (isCorrect && (nextResult.awardedPoints ?? 0) > 0) {
        logEvent(
          'system_points_awarded',
          {
            userId: user?.id,
            delta: nextResult.awardedPoints,
            problemId: id,
            source: 'sql',
          },
          user?.id
        );
      }
      setSubmitResult(isCorrect ? 'correct' : 'wrong');
    } catch (caughtError) {
      setResult(null);
      setSubmitResult(null);
      setExecuteError(
        caughtError instanceof Error ? caughtError.message : 'SQL 실행 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  }, [query, problem, id, user?.id]);

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">{loadError || '문제를 불러오는 중입니다.'}</p>
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">SQL 실습은 로그인 후 이용할 수 있습니다.</p>
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
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
              title="문제 오류 제보"
            >
              <Flag className="w-4 h-4" />
              <span>오류 제보</span>
            </button>
          </nav>
        </div>
      </div>

      {/* 메인 3패널 레이아웃 */}
      <div ref={hContainerRef} className="flex flex-1 min-h-0">
        {/* 좌: 문제 설명 */}
        <div
          className="overflow-y-auto bg-slate-50 border-r border-slate-200"
          style={{ width: `${hRatio * 100}%` }}
        >
          <div className="p-6 space-y-5">
            {/* 헤더: 제목 + 메타 뱃지 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wide uppercase ${
                    ({ easy: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', hard: 'bg-red-100 text-red-700' } as Record<Difficulty, string>)[problem.difficulty]
                  }`}
                >
                  {({ easy: 'Easy', medium: 'Medium', hard: 'Hard' } as Record<Difficulty, string>)[problem.difficulty]}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-50 text-primary-700 text-[11px] font-semibold">
                  {problem.category}
                </span>
                <span className="ml-auto text-[11px] text-slate-400">
                  정답률 <span className="font-semibold text-slate-600">{problem.correctRate}%</span>
                </span>
              </div>
              <h1 className="text-lg font-bold text-sqld-navy leading-snug">{problem.title}</h1>
              {(schemas.length > 0 || sampleTables.length > 0) && (
                <div className="mt-3">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    사용 테이블
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(schemas.length > 0 ? schemas : sampleTables).map((table) => {
                      const matchedSample = sampleTables.find(
                        (sampleTable) => sampleTable.tableName === table.tableName
                      );
                      const columnCount =
                        'columns' in table && Array.isArray(table.columns) ? table.columns.length : 0;
                      const rowCount = matchedSample?.rows.length ?? 0;

                      return (
                        <div
                          key={table.tableName}
                          className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs"
                        >
                          <Database className="h-3.5 w-3.5 text-primary-600" />
                          <span className="font-semibold text-primary-800">{table.tableName}</span>
                          <span className="text-primary-600">
                            {columnCount}컬럼
                            {matchedSample ? ` · ${rowCount}행` : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 테이블 구조 섹션 */}
            {schemas.length > 0 && (
              <section>
                <SectionHeader icon={<Table2 className="w-3.5 h-3.5" />} title="테이블 구조" />
                <div className="space-y-3 mt-2">
                  {schemas.map((schema) => (
                    <div key={schema.tableName}>
                      <p className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-primary-500" />
                        <code className="bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded text-[11px]">{schema.tableName}</code>
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-hidden">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="text-left px-3 py-1.5 text-slate-500 font-semibold">Column</th>
                              <th className="text-left px-3 py-1.5 text-slate-500 font-semibold">설명</th>
                              <th className="text-left px-3 py-1.5 text-slate-500 font-semibold">Type</th>
                              <th className="text-center px-3 py-1.5 text-slate-500 font-semibold">Nullable</th>
                              <th className="text-center px-3 py-1.5 text-slate-500 font-semibold">PK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {schema.columns.map((col) => (
                              <tr key={col.name} className="border-t border-slate-100 hover:bg-white transition-colors">
                                <td className="px-3 py-1.5 font-mono font-medium text-slate-800">{col.name}</td>
                                <td className="px-3 py-1.5 text-slate-500">
                                  {getColumnDescription(schema.tableName, col.name) ?? ''}
                                </td>
                                <td className="px-3 py-1.5 font-mono text-slate-500">{col.type}</td>
                                <td className="px-3 py-1.5 text-center">
                                  <span className={`text-[11px] font-medium ${col.nullable ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {col.nullable ? 'YES' : 'NO'}
                                  </span>
                                </td>
                                <td className="px-3 py-1.5 text-center">
                                  {col.isPrimaryKey && <Key className="w-3 h-3 text-amber-500 mx-auto" />}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 문제 섹션 */}
            <section>
              <SectionHeader icon={<FileText className="w-3.5 h-3.5" />} title="문제" />
              <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                <DescriptionRenderer text={problem.description} />
              </div>
            </section>

            {/* 예시 데이터 섹션 */}
            {sampleTables.length > 0 && (
              <CollapsibleSection
                icon={<BookOpen className="w-3.5 h-3.5" />}
                title="예시 데이터"
                defaultOpen
              >
                <div className="space-y-3">
                  {sampleTables.map((table) => (
                    <div key={table.tableName}>
                      <p className="text-xs text-slate-500 mb-1.5">
                        <code className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded text-[11px]">{table.tableName}</code>
                        {' '}테이블 ({table.rows.length}행)
                      </p>
                      <div className="rounded-lg border border-slate-200 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-slate-100">
                              {table.columns.map((col) => (
                                <th key={col} className="text-left px-3 py-1.5 text-slate-500 font-semibold whitespace-nowrap">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.slice(0, 8).map((row, i) => (
                              <tr key={i} className="border-t border-slate-100 hover:bg-white transition-colors">
                                {row.map((val, j) => (
                                  <td key={j} className="px-3 py-1.5 font-mono text-slate-600 whitespace-nowrap">
                                    {val === null ? <span className="text-slate-400 italic">NULL</span> : val}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {table.rows.length > 8 && (
                          <div className="px-3 py-1.5 text-[11px] text-slate-400 bg-slate-50 border-t border-slate-100 text-center">
                            … 외 {table.rows.length - 8}행 더
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* 힌트 섹션 */}
            <CollapsibleSection
              icon={<Lightbulb className="w-3.5 h-3.5" />}
              title="힌트"
              defaultOpen={false}
            >
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
                {problem.hint}
              </div>
            </CollapsibleSection>

            {/* API 에러 표시 */}
            {executeError && (
              <div className="rounded-lg px-4 py-3 text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
                {executeError}
              </div>
            )}

            {/* 정답/오답 피드백은 중앙 모달로 표시 */}
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
                  실행 ({isMac ? '⌘' : 'Ctrl'}+Enter)
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

      {/* 제출 결과 모달 */}
      {submitResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
            {/* 헤더 */}
            <div
              className={`px-6 py-5 flex items-center gap-3 ${
                submitResult === 'correct'
                  ? 'bg-emerald-50'
                  : 'bg-red-50'
              }`}
            >
              {submitResult === 'correct' ? (
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h3
                  className={`text-lg font-bold ${
                    submitResult === 'correct' ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {submitResult === 'correct' ? '정답입니다!' : '오답입니다'}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {submitResult === 'correct'
                    ? (result?.awardedPoints ?? 0) > 0
                      ? `+${result?.awardedPoints ?? 0}pt를 획득했습니다`
                      : '이미 포인트를 획득한 문제입니다'
                    : '다시 시도해보세요'}
                </p>
              </div>
            </div>

            {/* 쿼리 실행 결과 */}
            {result && !result.error && (
              <div className="px-6 py-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  실행 결과 ({result.rows.length}행 · {result.executionTimeMs}ms)
                </p>
                <div className="rounded-lg border border-slate-200 overflow-x-auto max-h-48">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        {result.columns.map((col) => (
                          <th key={col} className="text-left px-3 py-1.5 text-slate-500 font-semibold whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.slice(0, 10).map((row, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          {result.columns.map((col) => (
                            <td key={col} className="px-3 py-1.5 font-mono text-slate-600 whitespace-nowrap">
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
                  {result.rows.length > 10 && (
                    <div className="px-3 py-1.5 text-[11px] text-slate-400 bg-slate-50 border-t border-slate-100 text-center">
                      … 외 {result.rows.length - 10}행 더
                    </div>
                  )}
                </div>
              </div>
            )}
            {result?.error && (
              <div className="px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-red-600 font-mono bg-red-50 rounded-lg px-4 py-3">
                  {result.error}
                </p>
              </div>
            )}

            {/* 닫기 버튼 */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSubmitResult(null)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors ${
                  submitResult === 'correct'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {submitResult === 'correct' ? '확인' : '다시 풀기'}
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 오류 제보 모달 */}
      {showReportModal && problem && (
        <ReportErrorModal
          type="sql_error"
          practiceId={problem.id}
          problemTitle={problem.title}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}

// ─── 헬퍼 컴포넌트 ───────────────────────────────────────────────────────

/** 섹션 라벨 */
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
      {icon}
      {title}
    </div>
  );
}

/** 접이식 섹션 */
function CollapsibleSection({
  icon,
  title,
  defaultOpen = true,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors w-full text-left"
      >
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {icon}
        {title}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </section>
  );
}

/** description 내 마크다운 경량 렌더러 (**bold**, `code`, 줄바꿈) */
function DescriptionRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, i) => (
        <p key={i} className={i > 0 && line.trim() ? 'mt-2' : i > 0 ? 'mt-1' : ''}>
          {renderInline(line)}
        </p>
      ))}
    </>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      parts.push(
        <strong key={match.index} className="font-semibold text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <code
          key={match.index}
          className="bg-slate-200 text-primary-700 px-1 py-0.5 rounded text-[12px] font-mono"
        >
          {match[3]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}
