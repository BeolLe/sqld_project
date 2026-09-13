/**
 * 개념 학습 탭 콘텐츠 타입.
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

export type VizCell = string | number;

export interface VizTableSpec {
  label: string;
  columns: string[];
  rows: VizCell[][];
}

interface VizBaseSpec {
  /** 상단에 표시할 쿼리문 */
  query: string;
  /** 재생 완료 후 표시할 문구 */
  doneNote: string;
}

interface RowFilterVizSpec extends VizBaseSpec {
  kind: 'row-filter';
  sourceLabel: string;
  columns: string[];
  rows: VizCell[][];
  filter: { columnIndex: number; min: number };
}

interface RowReferenceVizSpec extends VizBaseSpec {
  kind: 'row-reference';
  sourceLabel: string;
  columns: string[];
  rows: VizCell[][];
  reference: { outputColumn: string; sourceColumnIndex: number };
}

export interface StagedVizStep {
  note: string;
  resultLabel: string;
  columns: string[];
  rows: VizCell[][];
}

interface StagedVizSpec extends VizBaseSpec {
  /** 여러 입력과 중간 결과를 정답이 정해진 단계별 시뮬레이션으로 재생한다. */
  kind: 'staged';
  sources: VizTableSpec[];
  steps: StagedVizStep[];
}

/** 실제 DB에 접속하지 않는 결정적 쿼리 동작 시뮬레이션. */
export type VizSpec = RowFilterVizSpec | RowReferenceVizSpec | StagedVizSpec;

/**
 * IE(정보공학) 표기법 관계 다이어그램 명세.
 * min·max 는 그 끝에 붙은 엔터티가 **반대편 한 건에 대해** 몇 건인지를 뜻한다.
 * 기호는 엔터티에 가까운 쪽이 max(관계차수), 먼 쪽이 min(관계선택사양)이다.
 */
export interface ErdSpec {
  left: { label: string; min: 'one' | 'zero'; max: 'one' | 'many' };
  right: { label: string; min: 'one' | 'zero'; max: 'one' | 'many' };
  /** 관계선 위에 적을 관계명 */
  relation: string;
  /** 그림 아래에 붙는 설명 */
  caption?: string;
}

export type LearnNode =
  | { kind: 'p'; text: Inline }
  | { kind: 'list'; items: Inline[] }
  | { kind: 'table'; head: Inline[]; rows: Inline[][] }
  | { kind: 'analogy'; lead: Inline; body: Inline[] }
  /** 외울 것을 한 줄로 압축한 암기 공식. 함정(trap)과 달리 경고가 아니라 요약이다. */
  | { kind: 'memory'; text: Inline }
  /** 한 블록 안에서 여러 하위 항목을 다룰 때 쓰는 소제목 (예: '3-1. 형태 기준'). */
  | { kind: 'subheading'; text: Inline }
  | { kind: 'trap'; text: Inline }
  | { kind: 'viz'; spec: VizSpec }
  | { kind: 'erd'; spec: ErdSpec };

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
