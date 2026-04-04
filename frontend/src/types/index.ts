// ─── ERD 기반 핵심 타입 정의 ───────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  nickname: string;
  points: number;
  createdAt: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type ProblemType = 'multiple_choice' | 'sql';

export interface Problem {
  id: string;
  title: string;
  description: string;
  type: ProblemType;
  difficulty: Difficulty;
  category: string; // SQL 문법 유형 (DML, DDL, JOIN 등)
  correctRate: number; // 정답률 (0~100)
  answer: string; // 객관식: '1'~'4' / SQL: 정답 쿼리
  explanation: string;
  options?: string[]; // 객관식 보기 (4개)
  schemaSQL?: string; // SQL 실습용 초기 스키마
  sampleData?: string; // SQL 실습용 샘플 데이터
  points: number; // 정답 시 획득 포인트 (기본 10)
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  submittedAnswer: string; // 제출한 답
  isCorrect: boolean;
  queryText?: string; // SQL 실습 시 제출 쿼리
  submittedAt: string;
  executionTimeMs?: number;
}

export interface ExamSession {
  id: string;
  examId: string;
  userId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, string>; // problemId → 선택 보기 번호
  score?: number;
  isPassed?: boolean; // 60점 이상 합격
  notepadContent?: string; // 사이드 메모장 내용
}

export interface Exam {
  id: string;
  title: string; // 예: 'SQLD 모의고사 1회'
  round: number;
  problemCount: number; // 50문항
  avgDifficulty: Difficulty;
  timeLimit: number; // 분 (90분)
  problems: Problem[];
}

// ─── 이벤트 로그 타입 ─────────────────────────────────────────────────────────
// 택소노미: {category}_{object}_{action}  (docs/EVENT_TAXONOMY.md 참조)

export type EventType =
  // Common
  | 'common_signup_succeeded'
  | 'common_login_succeeded'
  | 'common_auth_modal_viewed'
  | 'system_first_visit'
  // Exam
  | 'exam_session_started'
  | 'exam_answer_selected'
  | 'exam_submit_confirmed'
  | 'exam_result_viewed'
  | 'exam_list_viewed'
  | 'exam_card_clicked'
  | 'exam_notepad_typed'
  | 'exam_notepad_saved'
  // SQL
  | 'sql_query_executed'
  | 'sql_answer_submitted'
  | 'sql_list_viewed'
  | 'sql_problem_clicked'
  | 'sql_practice_viewed'
  // System
  | 'system_points_awarded';

export interface EventLog {
  id: string;
  type: EventType;
  userId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ─── 대시보드(학습현황) API 응답 타입 ─────────────────────────────────────────

export interface DashboardStats {
  totalPoints: number;
  totalMockExamAttemptCount: number;
  totalLearningSeconds: number;
  totalSolvedQuestionCount: number;
}

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  solvedCount: number;
  correctCount: number;
  accuracyRate: number;
}

export interface RecentExamResult {
  examId: string;
  examTitle: string;
  attemptNo: number;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
}

export interface RecentSqlAttempt {
  practiceId: string;
  title: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface LearningDay {
  date: string; // 'YYYY-MM-DD'
  eventCount: number;
}

export interface DashboardSummary {
  stats: DashboardStats;
  subjectStats: SubjectStat[];
  recentExamResults: RecentExamResult[];
  recentSqlAttempts: RecentSqlAttempt[];
  learningCalendar: LearningDay[]; // Amplitude ETL 데이터 기반, 미구현 시 빈 배열
}

// ─── 마이페이지 API 응답 타입 ─────────────────────────────────────────────────

export interface UserProfile {
  email: string;
  nickname: string;
  createdAt: string;
  points: number;
  termsAgreedAt: string | null;
  privacyAgreedAt: string | null;
}

// ─── 피드백 타입 ──────────────────────────────────────────────────────────────

export type FeedbackType = 'suggestion' | 'bug' | 'exam_error' | 'sql_error';
export type FeedbackStatus = 'pending' | 'reviewing' | 'resolved';
export type ErrorSubtype = 'wrong_answer' | 'typo' | 'explanation_error' | 'other';

export interface FeedbackTicket {
  ticket_id: string;
  type: FeedbackType;
  status: FeedbackStatus;
  title: string;
  content: string;
  related_exam_id?: string;
  related_problem_id?: string;
  related_problem_no?: number;
  error_subtype?: ErrorSubtype;
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
}

// ─── UI 상태 타입 ────────────────────────────────────────────────────────────

export type AuthMode = 'login' | 'signup';

export interface AuthModalState {
  isOpen: boolean;
  mode: AuthMode;
}

export interface SQLResult {
  columns: string[];
  rows: Record<string, string | number | null>[];
  executionTimeMs: number;
  error?: string;
  isCorrect?: boolean | null;
  awardedPoints?: number;
  totalPoints?: number | null;
  grading?: {
    reason?: string;
    comparisonMode?: 'ordered' | 'unordered' | null;
    userHash?: string;
    expectedHash?: string;
    rowCount?: number;
  } | null;
}
