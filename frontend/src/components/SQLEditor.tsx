import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { Play, Send } from 'lucide-react';
import type { SQLResult } from '../types';

interface SQLEditorProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: () => void;
  onSubmit?: () => void;
  result?: SQLResult | null;
  loading?: boolean;
  mode?: 'practice' | 'view';
}

export default function SQLEditor({
  value,
  onChange,
  onExecute,
  onSubmit,
  result,
  loading = false,
  mode = 'practice',
}: SQLEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* 편집기 */}
      <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
          <span className="text-xs text-slate-400 font-mono">SQL Editor</span>
          <div className="flex gap-2">
            <button
              onClick={onExecute}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <Play className="w-3 h-3" />
              실행 (Ctrl+Enter)
            </button>
            {mode === 'practice' && onSubmit && (
              <button
                onClick={onSubmit}
                disabled={loading}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
              >
                <Send className="w-3 h-3" />
                제출
              </button>
            )}
          </div>
        </div>
        <CodeMirror
          value={value}
          height="200px"
          extensions={[sql()]}
          theme={oneDark}
          onChange={onChange}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              onExecute();
            }
          }}
          basicSetup={{ lineNumbers: true, foldGutter: false, autocompletion: true }}
        />
      </div>

      {/* 결과 패널 */}
      {result && (
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow">
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
            <span className="text-xs font-semibold text-slate-600">
              {result.error ? '오류' : `결과 (${result.rows.length}행)`}
            </span>
            <span className="text-xs text-slate-400">{result.executionTimeMs}ms</span>
          </div>

          {result.error ? (
            <div className="px-4 py-3 text-sm text-red-600 font-mono bg-red-50">{result.error}</div>
          ) : (
            <div className="overflow-x-auto max-h-60">
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}
