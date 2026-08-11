import { useState, type KeyboardEvent } from 'react';
import type { Blank } from '../../data/learn/types';

interface Props {
  blank: Blank;
  onGrade: (blankId: string, correct: boolean) => void;
}

type Result = 'idle' | 'correct' | 'wrong';

/** 표기 흔들림 흡수 — 대소문자·연속 공백·앞뒤 공백 무시 */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function LearnBlank({ blank, onGrade }: Props) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Result>('idle');

  const grade = () => {
    const input = normalize(value);
    if (input === '') {
      setResult('idle');
      onGrade(blank.id, false);
      return;
    }
    const correct =
      input === normalize(blank.answer) ||
      blank.accepts.some((accept) => normalize(accept) === input);
    setResult(correct ? 'correct' : 'wrong');
    onGrade(blank.id, correct);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      grade();
    }
  };

  const tone =
    result === 'correct'
      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
      : result === 'wrong'
        ? 'border-red-500 bg-red-50 text-red-600'
        : 'border-slate-300 bg-white text-slate-900';

  return (
    <>
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={grade}
        onKeyDown={handleKeyDown}
        size={Math.max(4, blank.answer.length)}
        aria-label="빈칸"
        aria-invalid={result === 'wrong'}
        className={`mx-0.5 inline-block min-w-[5rem] rounded border border-b-2 border-b-primary-500 px-1.5 py-0.5 text-center align-baseline text-[0.94em] outline-none transition-colors focus:border-primary-500 focus:bg-primary-50 ${tone}`}
      />
      {result === 'wrong' && (
        <span className="ml-1 whitespace-nowrap text-[0.82em] font-semibold text-emerald-600">
          → {blank.answer}
        </span>
      )}
    </>
  );
}
