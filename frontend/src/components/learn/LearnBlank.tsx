import { useMemo, useState, type KeyboardEvent } from 'react';
import { useParams } from 'react-router-dom';
import type { Blank } from '../../data/learn/types';
import { ClickLog } from '../../logging';

interface Props {
  blank: Blank;
  /** 로그의 block_id 로 쓰인다. */
  blockId: string;
  onGrade: (blankId: string, correct: boolean) => void;
}

type Result = 'idle' | 'correct' | 'wrong';

/** 표기 흔들림 흡수 — 대소문자·연속 공백·앞뒤 공백 무시 */
function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default function LearnBlank({ blank, blockId, onGrade }: Props) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<Result>('idle');

  const { unitId } = useParams<{ unitId: string }>();
  const click = useMemo(
    () => new ClickLog({ page_id: 'learn_unit', url: `/learn/${unitId ?? ''}` }),
    [unitId]
  );

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
        // 빈칸 시도 착수 시점을 남긴다. 입력값과 채점 결과는 담지 않는다 (의사결정 A-2 · D-4).
        onFocus={() =>
          click.send({
            object_section_id: 'note',
            object_section_idx: 2,
            object_type: 'input',
            object_idx: 0,
            object_id: 'blank',
            page_params: { unit_id: unitId, step: 'quiz' },
            data: { block_id: blockId, blank_id: blank.id },
          })
        }
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
