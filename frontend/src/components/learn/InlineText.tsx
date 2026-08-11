import { Fragment, type ReactNode } from 'react';
import type { Blank, Inline } from '../../data/learn/types';
import LearnBlank from './LearnBlank';

interface Props {
  text: Inline;
  blanks: Blank[];
  /** true면 {{id}} 를 입력창으로, false면 정답 텍스트로 렌더링한다. */
  quizMode: boolean;
  onGrade: (blankId: string, correct: boolean) => void;
}

/** `{{b1}}` · `` `code` `` · `**bold**` 를 분해하는 토크나이저 */
const TOKEN = /(\{\{\w+\}\}|`[^`]+`|\*\*[^*]+\*\*)/g;

export default function InlineText({ text, blanks, quizMode, onGrade }: Props) {
  const parts = text.split(TOKEN).filter((part) => part !== '');

  return (
    <>
      {parts.map((part, index) => {
        const key = `${index}-${part.slice(0, 12)}`;

        if (part.startsWith('{{') && part.endsWith('}}')) {
          const id = part.slice(2, -2);
          const blank = blanks.find((b) => b.id === id);
          if (!blank) return null;
          return quizMode ? (
            <LearnBlank key={key} blank={blank} onGrade={onGrade} />
          ) : (
            <span key={key} className="font-bold text-primary-600">
              {blank.answer}
            </span>
          );
        }

        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={key}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.86em] text-slate-900"
            >
              {part.slice(1, -1)}
            </code>
          );
        }

        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={key} className="font-bold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }

        return <Fragment key={key}>{part as ReactNode}</Fragment>;
      })}
    </>
  );
}
