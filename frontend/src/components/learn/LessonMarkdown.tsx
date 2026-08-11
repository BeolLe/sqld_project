import { Children, isValidElement, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizeMarkdownEmphasis } from '../../utils/markdown';

/**
 * 개념 노트에는 성격이 다른 콜아웃 두 종류가 나온다.
 *   암기 공식 — 외울 것을 압축한 문장 (파랑)
 *   시험 함정 — 헷갈리게 내는 지점 경고 (황색)
 * 본문은 순수 Markdown 으로 저장한다는 설계 결정(body_markdown)을 지키기 위해
 * 별도 문법을 만들지 않고, 인용문 첫 글자가 '암기'인지로 둘을 구분한다.
 */
const MEMORY_PREFIX = '암기';

function flattenText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(flattenText).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return flattenText(node.props.children);
  }
  return '';
}

const markdownComponents: Components = {
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-[1.05rem] font-bold text-slate-900 first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-5 text-[0.95rem] font-bold text-slate-900 first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="my-3.5 leading-[1.8] text-slate-700">{children}</p>,
  strong: ({ children }) => <strong className="font-extrabold text-slate-900">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-600 underline"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-3 list-disc space-y-1.5 pl-6 leading-[1.8] text-slate-700">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 list-decimal space-y-1.5 pl-6 leading-[1.8] text-slate-700">{children}</ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '') || String(children ?? '').includes('\n');
    if (isBlock) {
      return (
        <pre className="my-4 overflow-x-auto rounded-xl bg-slate-50 px-4 py-3.5 font-mono text-[0.86em] leading-relaxed text-slate-800 ring-1 ring-slate-200">
          <code className={className}>{children}</code>
        </pre>
      );
    }
    return (
      <code className="rounded bg-primary-50 px-1.5 py-0.5 font-mono text-[0.86em] font-semibold text-primary-700 ring-1 ring-primary-100">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
  blockquote: ({ children }) => {
    const isMemory = flattenText(Children.toArray(children)).trimStart().startsWith(MEMORY_PREFIX);
    return isMemory ? (
      <aside className="my-5 rounded-xl border border-primary-100 border-l-4 border-l-primary-500 bg-primary-50 px-4 py-3.5 font-bold text-primary-900 [&_p]:my-0 [&_p]:font-bold [&_p]:text-primary-900">
        {children}
      </aside>
    ) : (
      <aside className="my-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-amber-900 [&_p]:my-0 [&_p]:text-amber-900 [&_strong]:text-amber-950">
        {children}
      </aside>
    );
  },
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-xl ring-1 ring-slate-200">
      <table className="w-full border-collapse text-[0.86rem]">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-100">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-3.5 py-2.5 text-left text-[0.78rem] font-bold text-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-200 px-3.5 py-2.5 align-top text-slate-700 [tr:last-child_&]:border-0">
      {children}
    </td>
  ),
  hr: () => <hr className="my-6 border-slate-200" />,
};

interface LessonMarkdownProps {
  markdown: string;
}

export default function LessonMarkdown({ markdown }: LessonMarkdownProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {normalizeMarkdownEmphasis(markdown)}
    </ReactMarkdown>
  );
}
