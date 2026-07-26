/**
 * SQLD 교육 탭 콘텐츠 타입.
 *
 * 구조는 한국데이터산업진흥원 공식 출제범위를 그대로 따른다.
 *   과목(2) → 주요항목(5) → 세부항목(30)
 * 세부항목 하나가 개념 노트 한 편이며 `/learn/:unitId` 에 대응한다.
 */

/** 빈칸 정답 정의. 표기 흔들림은 accepts 로 흡수한다. */
export interface Blank {
  /** 본문의 {{id}} 토큰과 대응 */
  id: string;
  /** 화면에 표시할 정답 */
  answer: string;
  /** 정답으로 인정할 입력. 소문자·공백 정규화 후 비교한다. */
  accepts: string[];
}

/**
 * 인라인 마크업을 허용하는 문자열.
 * - `{{b1}}` 빈칸
 * - `` `code` `` 코드
 * - `**bold**` 강조
 */
export type Inline = string;

/** 쿼리 동작 시각화 명세. 단원별로 데이터만 갈아끼워 재사용한다. */
export interface VizSpec {
  /** row-filter: 조건에 맞는 행만 통과 / row-reference: 이전 행 값을 참조 */
  kind: 'row-filter' | 'row-reference';
  /** 상단에 표시할 쿼리문 */
  query: string;
  sourceLabel: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  /** row-filter 전용 — 판정 대상 컬럼과 임계값 */
  filter?: { columnIndex: number; min: number };
  /** row-reference 전용 — 결과에 덧붙는 컬럼명과 참조할 원본 컬럼 */
  reference?: { outputColumn: string; sourceColumnIndex: number };
  /** 재생 완료 후 표시할 문구 */
  doneNote: string;
}

export type LearnNode =
  | { kind: 'p'; text: Inline }
  | { kind: 'list'; items: Inline[] }
  | { kind: 'table'; head: Inline[]; rows: Inline[][] }
  | { kind: 'analogy'; lead: Inline; body: Inline[] }
  | { kind: 'trap'; text: Inline }
  | { kind: 'viz'; spec: VizSpec };

/** 개념 노트의 한 단락. 목차 항목이자 빈칸 채점 단위. */
export interface LearnBlock {
  id: string;
  heading: string;
  nodes: LearnNode[];
  blanks: Blank[];
}

export interface LearnUnit {
  /** 예: 'sa-window' */
  id: string;
  subject: 1 | 2;
  /** 주요항목명 */
  group: string;
  /** 공식 출제범위 순서 기준 통합 순번 */
  order: number;
  /** 세부항목명. 공식 표기를 그대로 쓴다. */
  title: string;
  estimatedMin: number;
  /** 출제 빈도 기준 1차 제작 대상 여부 */
  priority1: boolean;
  /** 미제작 항목은 빈 배열. 목록에는 노출하되 '미학습'으로 표시한다. */
  blocks: LearnBlock[];
}

export interface LearnGroup {
  /** 주요항목명 */
  name: string;
  units: LearnUnit[];
}

export interface LearnSubject {
  subject: 1 | 2;
  title: string;
  /** 예: '10문항 / 20점' */
  exam: string;
  /** 과락(과목 40% 미만) 경고 노출 여부 */
  showFailWarning: boolean;
  groups: LearnGroup[];
}

export type UnitProgress = 'new' | 'reading' | 'done';
