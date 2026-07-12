import { RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { AIStreamStatus } from '../hooks/useAIStream';

interface AIStreamPanelProps {
  status: AIStreamStatus;
  text: string;
  error: string | null;
  onRetry: () => void;
  title?: string;
  icon?: string;
  tone?: 'blue' | 'red';
}

/**
 * CommonMark 규칙상 **강조** 내용이 따옴표/괄호 등 구두점으로 끝나고
 * 뒤에 공백 없이 글자(주로 한글 조사)가 바로 붙으면 닫는 델리미터로
 * 인식되지 않아 별표(**)가 그대로 노출된다. 구두점과 닫는 ** 사이에
 * 폭 없는 공백(zero-width space)을 넣어 우회한다.
 */
const ZERO_WIDTH_SPACE = '\u200B';

function normalizeMarkdownEmphasis(text: string): string {
  return text.replace(
    /\*\*([^\n*]+?)\*\*/g,
    (match, inner: string) =>
      /[\p{P}\p{S}]$/u.test(inner) ? `**${inner}${ZERO_WIDTH_SPACE}**` : match,
  );
}

const markdownComponents: Components = {
  h3: ({ children }) => (
    <h3 className="text-sm font-bold text-slate-800 mt-3 mb-1.5 first:mt-0">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[13px] text-slate-700 leading-[1.8] mb-2">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-primary-700">{children}</strong>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    if (isBlock) {
      return (
        <pre className="bg-slate-900 text-slate-200 text-xs rounded-md px-3.5 py-3 overflow-x-auto font-mono leading-relaxed my-2">
          <code className={className}>{children}</code>
        </pre>
      );
    }
    return (
      <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-[3px] border-primary-500 pl-3.5 my-3 py-2.5 px-3.5 bg-white rounded-lg text-xs text-slate-600">
      {children}
    </blockquote>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 text-[13px] text-slate-700 mb-2">{children}</ul>
  ),
  li: ({ children }) => <li className="leading-[1.8]">{children}</li>,
};

export default function AIStreamPanel({
  status,
  text,
  error,
  onRetry,
  title = 'AI 맞춤 해설',
  icon = '🤖',
  tone = 'blue',
}: AIStreamPanelProps) {
  const containerToneClass =
    tone === 'red' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50';
  const headerBorderToneClass = tone === 'red' ? 'border-red-200' : 'border-blue-200';

  return (
    <div className={`mt-3 rounded-xl border ${containerToneClass} overflow-hidden animate-fadeIn`}>
      {/* 헤더 */}
      <div className={`px-4 py-2.5 bg-white border-b ${headerBorderToneClass} flex items-center gap-2`}>
        <span className="shrink-0" aria-hidden="true">{icon}</span>
        <span className="text-[13px] font-bold text-sqld-navy">{title}</span>
      </div>

      {/* 본문 */}
      <div className="px-4 py-3 max-h-64 overflow-y-auto">
        {status === 'streaming' && !text && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            생성 중
            <span className="inline-flex gap-0.5">
              <span className="animate-bounce delay-0">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </p>
        )}

        {(status === 'streaming' || status === 'done') && text && (
          <div>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {normalizeMarkdownEmphasis(text)}
            </ReactMarkdown>
            {status === 'streaming' && (
              <span className="inline-block w-0.5 h-3.5 bg-primary-500 animate-pulse ml-0.5" />
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2">
            <p className="text-xs text-red-600 flex-1">{error}</p>
            <button
              onClick={onRetry}
              className="shrink-0 flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              재시도
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
