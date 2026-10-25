/**
 * 시험 종류별 설정 (SQLD · ADsP 통합, 화면설계서 A안).
 *
 * URL 첫 세그먼트가 시험을 정한다: `/sqld/...`, `/adsp/...`.
 * 화면 문구·과목 구성·전용 기능 여부는 모두 여기서 읽는다.
 */

export type ExamType = 'sqld' | 'adsp';

export const EXAM_TYPES: readonly ExamType[] = ['sqld', 'adsp'];

export const DEFAULT_EXAM_TYPE: ExamType = 'sqld';

export interface ExamSubjectConfig {
  /** '1' | '2' | '3' */
  no: string;
  /** 예: '1과목' */
  label: string;
  /** 예: '데이터 모델링의 이해' */
  description: string;
  /** 모의고사 문항 번호 범위 (양 끝 포함) */
  range: [number, number];
  /**
   * 무한풀이 카테고리 분류. 생략하면 앞 과목에 속하지 않은 나머지 카테고리를 모두 가져간다.
   * 백엔드 category 값과 같아야 한다.
   */
  categories?: string[];
}

export interface ExamFeatureConfig {
  icon: 'book-open' | 'terminal' | 'layers' | 'trophy';
  title: string;
  description: string;
  color: string;
}

export interface ExamTypeConfig {
  type: ExamType;
  /** 예: 'SQLD' */
  name: string;
  /** 예: 'SQL 개발자' */
  fullName: string;
  /** schedule.exam_schedules.exam_type 값 */
  scheduleExamType: string;
  /**
   * 백엔드 콘텐츠 API가 이 시험을 구분해서 내려주는지 여부.
   * false 면 모의고사·무한풀이·학습현황 API를 호출하지 않고 '준비 중' 화면을 보여준다.
   * (exam_type 파라미터를 모르는 백엔드는 SQLD 데이터를 돌려주기 때문)
   */
  contentReady: boolean;
  /** SQL 실습 메뉴 노출 여부. ADsP는 코드 실습이 없다. */
  hasSqlPractice: boolean;
  subjects: ExamSubjectConfig[];
  /** 시험지 머리말 규칙 문구 */
  examRule: string;
  examListDescription: string;
  hero: {
    badge: string;
    titleLine: string;
    titleHighlight: string;
    descriptionLines: string[];
    secondary: { label: string; path: string };
  };
  features: ExamFeatureConfig[];
  highlights: string[];
  dashboardGreeting: string;
  accent: {
    /** 시험 전환기 선택 상태 배경 */
    switcherActive: string;
    /** 포털 카드 아이콘 배경 */
    iconBg: string;
    /** 포털 카드 시작 버튼 */
    button: string;
    /** 포털 카드 hover 테두리 */
    hoverBorder: string;
  };
}

export const EXAM_CONFIG: Record<ExamType, ExamTypeConfig> = {
  sqld: {
    type: 'sqld',
    name: 'SQLD',
    fullName: 'SQL 개발자',
    scheduleExamType: 'SQL 개발자',
    contentReady: true,
    hasSqlPractice: true,
    subjects: [
      { no: '1', label: '1과목', description: '데이터 모델링의 이해', range: [1, 10], categories: ['데이터모델링', '정규화'] },
      { no: '2', label: '2과목', description: 'SQL 기본 및 활용', range: [11, 50] },
    ],
    examRule: '총 50문항 · 제한시간 90분 · 60점 이상 합격 · 과목별 40점 미만 과락',
    examListDescription: '실제 SQLD 시험 형식의 모의고사로 실력을 점검하세요. (1~3회 기본 / 4~6회 중급 / 7~10회 고급)',
    hero: {
      badge: 'SQLD 합격을 위한 최적의 플랫폼',
      titleLine: 'SQL을 실습하고',
      titleHighlight: 'SQLD를 정복',
      descriptionLines: [
        'Oracle 기반 실시간 SQL 실습 환경과 실제 시험장을 재현한 모의고사로',
        'SQLD 자격증 합격을 향한 최단 경로를 제시합니다.',
      ],
      secondary: { label: 'SQL 실습', path: '/sql-practice' },
    },
    features: [
      { icon: 'book-open', title: '실전 모의고사', description: '실제 SQLD 시험 형식 반영 (50문항, 90분)', color: 'bg-blue-500' },
      { icon: 'terminal', title: 'SQL 실습', description: 'Oracle 환경 기반 SQL 실행 및 확인', color: 'bg-emerald-500' },
      { icon: 'trophy', title: '성과 분석', description: '과목별 정답률 시각화 및 오답 노트 자동 생성', color: 'bg-amber-500' },
    ],
    highlights: [
      'A4 스케일 레이아웃으로 실제 시험지 재현',
      '남은 시간 카운트다운 실시간 표시',
      '사이드 메모장 입력 내용 자동 저장',
      '합격(60점 이상)/불합격 즉시 판정',
    ],
    dashboardGreeting: '오늘도 SQL 실력을 키워보세요.',
    accent: {
      switcherActive: 'bg-primary-600 text-white',
      iconBg: 'bg-blue-500',
      button: 'bg-primary-600 hover:bg-primary-700',
      hoverBorder: 'hover:border-primary-500',
    },
  },
  adsp: {
    type: 'adsp',
    name: 'ADsP',
    fullName: '데이터분석 준전문가',
    scheduleExamType: '데이터분석 준전문가',
    // 백엔드가 exam_type 을 지원하면 true 로 바꾼다. 목업 모드(VITE_AI_MOCK=1)는 프론트 데이터(data/adsp)로 동작한다.
    contentReady: import.meta.env.VITE_AI_MOCK === '1',
    hasSqlPractice: false,
    subjects: [
      { no: '1', label: '1과목', description: '데이터 이해', range: [1, 10], categories: ['데이터의 이해', '데이터의 가치와 미래', '데이터 사이언스와 전략 인사이트'] },
      { no: '2', label: '2과목', description: '데이터 분석 기획', range: [11, 20], categories: ['데이터 분석 기획의 이해', '분석 마스터 플랜'] },
      { no: '3', label: '3과목', description: '데이터 분석', range: [21, 50] },
    ],
    examRule: '총 50문항 · 제한시간 90분 · 60점 이상 합격 · 과목별 40점 미만 과락',
    examListDescription: '실제 ADsP 시험 형식(3과목 · 50문항 · 90분)의 모의고사로 실력을 점검하세요. (1~2회 기본 / 3~4회 중급 / 5회 고급)',
    hero: {
      badge: 'ADsP 합격을 위한 최적의 플랫폼',
      titleLine: '개념을 잡고',
      titleHighlight: 'ADsP를 정복',
      descriptionLines: [
        '3과목 출제범위를 그대로 따른 개념 학습과 실제 시험장을 재현한 모의고사로',
        'ADsP 자격증 합격을 향한 최단 경로를 제시합니다.',
      ],
      secondary: { label: '개념 학습', path: '/learn' },
    },
    features: [
      { icon: 'book-open', title: '실전 모의고사', description: '실제 ADsP 시험 형식 반영 (50문항, 90분)', color: 'bg-blue-500' },
      { icon: 'layers', title: '개념 학습', description: '3과목 세부항목별 개념 노트와 빈칸 복습', color: 'bg-emerald-500' },
      { icon: 'trophy', title: '성과 분석', description: '과목별 정답률과 과락 위험 과목 확인', color: 'bg-amber-500' },
    ],
    highlights: [
      'A4 스케일 레이아웃으로 실제 시험지 재현',
      '남은 시간 카운트다운 실시간 표시',
      '사이드 메모장 입력 내용 자동 저장',
      '합격(60점 이상)/불합격 즉시 판정 · 3과목 과락 자동 확인',
    ],
    dashboardGreeting: '오늘도 데이터 분석 실력을 키워보세요.',
    accent: {
      switcherActive: 'bg-emerald-600 text-white',
      iconBg: 'bg-emerald-500',
      button: 'bg-emerald-600 hover:bg-emerald-700',
      hoverBorder: 'hover:border-emerald-500',
    },
  },
};

export function isExamType(value: unknown): value is ExamType {
  return typeof value === 'string' && (EXAM_TYPES as readonly string[]).includes(value);
}

/**
 * 무한풀이 과목별 카테고리. 설정에 categories 가 없는 과목은 나머지를 가져간다.
 */
export function getCategoriesForSubject(
  config: ExamTypeConfig,
  subjectNo: string,
  allCategories: string[],
): string[] {
  const subject = config.subjects.find((s) => s.no === subjectNo);
  if (!subject) return [];
  if (subject.categories) {
    return allCategories.filter((c) => subject.categories!.includes(c));
  }
  const claimed = config.subjects.flatMap((s) => s.categories ?? []);
  return allCategories.filter((c) => !claimed.includes(c));
}
