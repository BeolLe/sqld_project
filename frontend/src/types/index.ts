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

// ─── 이벤트 로그 타입 (11개 트리거) ─────────────────────────────────────────

export type EventType =
  | 'user_signup' // 1. 회원가입 성공
  | 'user_login' // 1. 로그인 성공
  | 'user_first_visit' // 1. 최초 접속
  | 'sql_execute' // 2. SQL 실행
  | 'sql_submit' // 2. SQL 제출 (정답 여부 포함)
  | 'choice_select' // 3. 객관식 보기 선택
  | 'exam_start' // 3. 모의고사 시작
  | 'exam_submit' // 3. 모의고사 최종 제출
  | 'notepad_update' // 4. 사이드 메모장 입력
  | 'points_update' // 5. 포인트 업데이트
  | 'stats_update'; // 6. 누적 통계 업데이트

export interface EventLog {
  id: string;
  type: EventType;
  userId?: string;
  payload: Record<string, unknown>;
  timestamp: string;
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
}
