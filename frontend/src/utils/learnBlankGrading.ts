import type { Blank } from '../data/learn/types';

/** 기본 채점은 기존대로 단어 경계를 보존한다. 용어 빈칸만 띄어쓰기를 무시한다. */
function normalize(value: string, mode: Blank['matchMode']): string {
  const normalized = value.trim().toLowerCase();
  return normalized.replace(/\s+/g, mode === 'term' ? '' : ' ');
}

/** 표기만 비교한다. 유사어·부분 일치·의미 추측은 하지 않고 accepts를 명시해야 한다. */
export function isBlankAnswerCorrect(blank: Blank, value: string): boolean {
  const input = normalize(value, blank.matchMode);
  if (input === '') return false;
  return [blank.answer, ...blank.accepts].some(
    (answer) => normalize(answer, blank.matchMode) === input
  );
}
