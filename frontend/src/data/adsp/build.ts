import type { Difficulty, Problem } from '../../types';

/**
 * ADsP 문항 원본 한 줄.
 * [카테고리, 난이도, 짧은 제목, 문제 본문, 보기 4개, 정답 번호, 해설]
 *
 * 카테고리는 무한풀이 과목 분류(constants/examTypes.ts)와 같은 값을 쓴다.
 * 본문에 R 코드·출력은 ```r 블록, 표는 파이프(|) 행으로 적는다.
 * 보기 번호는 정답 위치 균형을 위해 자동으로 돌아가므로, 해설에서 "N번"처럼 보기 번호를 언급하지 않는다.
 */
export type AdspCategory =
  | '데이터의 이해'
  | '데이터의 가치와 미래'
  | '데이터 사이언스와 전략 인사이트'
  | '데이터 분석 기획의 이해'
  | '분석 마스터 플랜'
  | 'R기초와 데이터 마트'
  | '통계분석'
  | '정형 데이터 마이닝';

type Answer = '1' | '2' | '3' | '4';

export type AdspQuestion = [
  category: AdspCategory,
  difficulty: Difficulty,
  title: string,
  description: string,
  options: [string, string, string, string],
  answer: Answer,
  explanation: string,
];

const SUBJECT_1: AdspCategory[] = ['데이터의 이해', '데이터의 가치와 미래', '데이터 사이언스와 전략 인사이트'];
const SUBJECT_2: AdspCategory[] = ['데이터 분석 기획의 이해', '분석 마스터 플랜'];

/** 시험 1회 과목별 문항 수 (1과목 10 · 2과목 10 · 3과목 30) */
const QUOTA = { 1: 10, 2: 10, 3: 30 } as const;

function subjectOf(category: AdspCategory): 1 | 2 | 3 {
  if (SUBJECT_1.includes(category)) return 1;
  if (SUBJECT_2.includes(category)) return 2;
  return 3;
}

/** 난이도별 기본 정답률(시드). 실제 정답률은 응시 데이터가 쌓이면 서버가 덮어쓴다. */
const SEED_RATE: Record<Difficulty, number> = { easy: 78, medium: 61, hard: 43 };

/** 보기가 모두 숫자(크기순 나열)면 순서를 바꾸지 않는다. */
function isOrderedNumeric(options: string[]): boolean {
  return options.every((o) => /^[약\s]*-?\d+(\.\d+)?(%|배|개|번|일|시간|점)?$/.test(o.trim()));
}

/**
 * 정답 위치가 한 번호에 몰리지 않도록 보기를 회전시킨다.
 * 회전이라 다른 보기의 상대 순서는 그대로 유지된다. 결과는 항상 같다(결정적).
 */
function balanceAnswers(rows: AdspQuestion[]): AdspQuestion[] {
  const used: Record<Answer, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
  return rows.map((row, index) => {
    const [category, difficulty, title, description, options, answer, explanation] = row;
    if (isOrderedNumeric(options)) {
      used[answer] += 1;
      return row;
    }
    // 가장 적게 쓰인 번호 중, 문항 순번에 따라 정해지는 번호를 우선한다
    const min = Math.min(...Object.values(used));
    const candidates = (['1', '2', '3', '4'] as Answer[]).filter((a) => used[a] === min);
    const target = candidates[index % candidates.length];
    const shift = (Number(target) - Number(answer) + 4) % 4;
    const rotated = options.map((_, i) => options[(i - shift + 4) % 4]) as AdspQuestion[4];
    used[target] += 1;
    return [category, difficulty, title, description, rotated, target, explanation];
  });
}

function toProblems(idPrefix: string, rows: AdspQuestion[], numbered: boolean): Problem[] {
  return rows.map(([category, difficulty, title, description, options, answer, explanation], index) => ({
    id: `${idPrefix}${index + 1}`,
    title: numbered ? `${index + 1}. ${title}` : title,
    description,
    type: 'multiple_choice',
    difficulty,
    category,
    // 같은 난이도 안에서도 문항마다 조금씩 다르게
    correctRate: SEED_RATE[difficulty] + ((index * 7) % 11) - 5,
    answer,
    explanation,
    options,
    points: 10,
  }));
}

/**
 * 모의고사 1회분을 만든다. 과목별 정원(10 · 10 · 30)을 앞에서부터 채우고,
 * 정원을 넘는 문항은 extras 로 돌려 무한풀이 문제 풀에 쓴다.
 */
export function buildExam(idPrefix: string, rows: AdspQuestion[]): { problems: Problem[]; extras: AdspQuestion[] } {
  const bySubject: Record<1 | 2 | 3, AdspQuestion[]> = { 1: [], 2: [], 3: [] };
  rows.forEach((row) => bySubject[subjectOf(row[0])].push(row));
  const missing = ([1, 2, 3] as const).filter((s) => bySubject[s].length < QUOTA[s]);
  if (missing.length) throw new Error(`${idPrefix}: 과목 ${missing.join(', ')} 문항이 부족합니다`);
  const picked = ([1, 2, 3] as const).flatMap((s) => bySubject[s].slice(0, QUOTA[s]));
  const extras = ([1, 2, 3] as const).flatMap((s) => bySubject[s].slice(QUOTA[s]));
  return { problems: toProblems(idPrefix, balanceAnswers(picked), true), extras };
}

/** 무한풀이 문제 풀 */
export function buildPool(idPrefix: string, rows: AdspQuestion[]): Problem[] {
  return toProblems(idPrefix, balanceAnswers(rows), false);
}
