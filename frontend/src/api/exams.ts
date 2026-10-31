import type { Problem, ExamScheduleResponse } from '../types';
import { apiRequest, apiFetch } from '../utils/api';
import { getExamProblems } from '../data/exams';
import { EXAM_CONFIG } from '../constants/examTypes';
import type { ExamType } from '../constants/examTypes';
import { withExamType } from '../utils/examPath';

const IS_MOCK = import.meta.env.VITE_AI_MOCK === '1';

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await apiRequest(path, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { detail?: string } | null;
    throw new Error(payload?.detail || '요청을 처리하지 못했습니다.');
  }

  return (await response.json()) as T;
}

export interface ExamSessionResponse {
  attemptId: number;
  attemptUuid: string;
  examId: string;
  remainingSeconds: number;
  currentPageNo: number;
  answers: Record<string, string>;
  memoContent: string;
  durationSeconds: number;
}

/** 응시 저장 호출이 함께 보내는 식별자. 시험 종류와 서버가 내려준 응시 UUID. */
export interface ExamScope {
  examType: ExamType;
  attemptUuid?: string;
}

export function fetchExamSession(examId: string, examType: ExamType): Promise<ExamSessionResponse> {
  if (IS_MOCK) {
    return Promise.resolve({
      attemptId: 1,
      attemptUuid: 'mock-attempt-uuid',
      examId,
      remainingSeconds: 5400,
      currentPageNo: 1,
      answers: {},
      memoContent: '',
      durationSeconds: 5400,
    });
  }
  return request<ExamSessionResponse>(withExamType(`/exams/${examId}/session`, examType));
}

export function saveExamAnswer(
  examId: string,
  scope: ExamScope,
  payload: { problemId: string; selectedAnswer: string; currentPageNo?: number; remainingSeconds?: number }
) {
  if (IS_MOCK) {
    saveMockAnswer(examId, scope.examType, payload.problemId, payload.selectedAnswer);
    return Promise.resolve({ ok: true });
  }
  return request<{ ok: boolean }>(withExamType(`/exams/${examId}/answers`, scope.examType), {
    method: 'PUT',
    body: JSON.stringify({
      attemptUuid: scope.attemptUuid,
      problem_id: payload.problemId,
      selected_answer: payload.selectedAnswer,
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export function saveExamMemo(examId: string, scope: ExamScope, content: string) {
  return request<{ ok: boolean }>(withExamType(`/exams/${examId}/memo`, scope.examType), {
    method: 'PUT',
    body: JSON.stringify({ attemptUuid: scope.attemptUuid, content }),
  });
}

export function syncExamSession(
  examId: string,
  scope: ExamScope,
  payload: { currentPageNo?: number; remainingSeconds?: number }
) {
  return request<{ ok: boolean }>(withExamType(`/exams/${examId}/session`, scope.examType), {
    method: 'PUT',
    body: JSON.stringify({
      attemptUuid: scope.attemptUuid,
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export function persistExamSessionSnapshot(
  examId: string,
  scope: ExamScope,
  payload: { currentPageNo?: number; remainingSeconds?: number }
) {
  return apiRequest(withExamType(`/exams/${examId}/session`, scope.examType), {
    method: 'PUT',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attemptUuid: scope.attemptUuid,
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  }).catch(() => undefined);
}

export interface ExamSubmitResponse {
  attemptId: number;
  score: number;
  answers: Record<string, string>;
  problems: Problem[];
  correctCount: number;
  passed: boolean;
  failedBySubjectCutoff: boolean;
  scorePercent: number;
  awardedPoints?: number;
  totalPoints?: number | null;
}

// mock용 answers 저장소 (submitExam에서 읽기 위해 모듈 스코프에 보관)
// SQLD 1회와 ADsP 1회는 id 가 같으므로 시험 종류까지 합쳐 키를 만든다.
const mockAnswers: Record<string, Record<string, string>> = {};
const mockKey = (examType: ExamType, examId: string) => `${examType}:${examId}`;

export function saveMockAnswer(examId: string, examType: ExamType, problemId: string, answer: string) {
  const key = mockKey(examType, examId);
  if (!mockAnswers[key]) mockAnswers[key] = {};
  mockAnswers[key][problemId] = answer;
}

export function submitExam(
  examId: string,
  scope: ExamScope,
  payload: { currentPageNo?: number; remainingSeconds?: number }
): Promise<ExamSubmitResponse> {
  if (IS_MOCK) {
    const problems = getExamProblems(examId, scope.examType);
    const answers = mockAnswers[mockKey(scope.examType, examId)] ?? {};
    const correctCount = problems.filter((p) => answers[p.id] === p.answer).length;
    const score = Math.round((correctCount / problems.length) * 100);
    const PASS_SCORE = 60;
    // 서버와 같은 규칙: 총점 60점 이상이어도 한 과목이라도 40% 미만이면 불합격
    const config = EXAM_CONFIG[scope.examType];
    const failedBySubjectCutoff = score >= PASS_SCORE && config.subjects.some(({ range: [from, to] }) => {
      const subjectProblems = problems.slice(from - 1, to);
      const correct = subjectProblems.filter((p) => answers[p.id] === p.answer).length;
      return subjectProblems.length > 0 && correct / subjectProblems.length < 0.4;
    });
    return Promise.resolve({
      attemptId: 1,
      score,
      answers,
      problems,
      correctCount,
      passed: score >= PASS_SCORE && !failedBySubjectCutoff,
      failedBySubjectCutoff,
      scorePercent: score,
      awardedPoints: correctCount * 10,
      totalPoints: 320 + correctCount * 10,
    });
  }
  return request<ExamSubmitResponse>(withExamType(`/exams/${examId}/submit`, scope.examType), {
    method: 'POST',
    body: JSON.stringify({
      attemptUuid: scope.attemptUuid,
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export function fetchExamResult(examId: string, examType: ExamType, attemptId?: number): Promise<ExamSubmitResponse> {
  const attemptQuery = attemptId == null ? '' : `&attempt_id=${encodeURIComponent(String(attemptId))}`;
  return request<ExamSubmitResponse>(`${withExamType(`/exams/${examId}/result`, examType)}${attemptQuery}`);
}

export function fetchExamSchedules(year?: number) {
  const y = year ?? new Date().getFullYear();
  return apiFetch<ExamScheduleResponse>(`/exams/schedules?year=${y}`);
}
