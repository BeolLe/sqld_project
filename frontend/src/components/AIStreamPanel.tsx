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
 * CommonMark 규칙상 강조(**bold** 또는 __bold__) 내용이 따옴표/괄호 등
 * 구두점으로 끝나고 뒤에 공백 없이 글자(주로 한글 조사)가 바로 붙으면
 * 닫는 델리미터로 인식되지 않아 마커(** 또는 __)가 그대로 노출된다.
 * 구두점과 닫는 마커 사이에 폭 없는 공백(zero-width space)을 넣어 우회한다.
 *
 * AI 응답 모델(Gemini / Claude 등)마다 강조 마커 관습이 다를 수 있어
 * ** 뿐 아니라 __ 도 함께 처리하여 모델과 무관하게 동일하게 렌더한다.
 */
const ZERO_WIDTH_SPACE = '\u200B';

function normalizeMarkdownEmphasis(text: string): string {
  return text
    .replace(/\*\*([^\n*]+?)\*\*/g, (match, inner: string) =>
      /[\p{P}\p{S}]$/u.test(inner) ? `**${inner}${ZERO_WIDTH_SPACE}**` : match,
    )
    .replace(/__([^\n_]+?)__/g, (match, inner: string) =>
      /[\p{P}\p{S}]$/u.test(inner) ? `__${inner}${ZERO_WIDTH_SPACE}__` : match,
    );
}

// 모델마다 헤더 레벨(##/###/####)·강조·코드펜스 관습이 달라, 모든 헤더
// 레벨과 요소를 동일 스타일 계열로 매핑해 모델과 무관하게 일관 렌더한다.
const headingClass = 'text-sm font-bold text-slate-800 mt-3 mb-1.5 first:mt-0';

const markdownComponents: Components = {
  h1: ({ children }) => <h3 className={headingClass}>{children}</h3>,
  h2: ({ children }) => <h3 className={headingClass}>{children}</h3>,
  h3: ({ children }) => <h3 className={headingClass}>{children}</h3>,
  h4: ({ children }) => <h4 className={headingClass}>{children}</h4>,
  h5: ({ children }) => <h5 className={headingClass}>{children}</h5>,
  h6: ({ children }) => <h6 className={headingClass}>{children}</h6>,
  p: ({ children }) => (
    <p className="text-[13px] text-slate-700 leading-[1.8] mb-2">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-primary-700">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 underline break-all"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    // language- 클래스(언어 태그가 있는 펜스)뿐 아니라, 언어 태그가 없어도
    // 줄바꿈이 포함된 코드는 블록으로 간주한다. (모델마다 ```lang / ``` 혼용)
    const isBlock =
      /language-/.test(className ?? '') || String(children ?? '').includes('\n');
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
  hr: () => <hr className="my-3 border-slate-200" />,
  ul: ({ children }) => (
    <ul className="list-disc list-inside space-y-1 text-[13px] text-slate-700 mb-2">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside space-y-1 text-[13px] text-slate-700 mb-2">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-[1.8]">{children}</li>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="w-full text-xs text-slate-700 border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-200 px-2 py-1 align-top">{children}</td>
  ),
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

      {/* AI 외부 전송 · 민감정보 입력 금지 고지 */}
      <div className={`px-4 py-2 bg-white/70 border-t ${headerBorderToneClass}`}>
        <p className="text-[11px] leading-snug text-slate-400">
          AI 사용 시 입력 내용과 문제 정보가 외부 AI 제공업체(Google Gemini, Anthropic Claude)로 전송될 수 있습니다.
          비밀번호·카드정보 등 민감한 정보는 입력하지 마세요.
        </p>
      </div>
    </div>
  );
}
