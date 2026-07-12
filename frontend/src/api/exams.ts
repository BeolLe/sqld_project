import type { Problem, ExamScheduleResponse } from '../types';
import { apiRequest, apiFetch } from '../utils/api';
import { getExamProblems } from '../data/exams';

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

export function fetchExamSession(examId: string): Promise<ExamSessionResponse> {
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
  return request<ExamSessionResponse>(`/exams/${examId}/session`);
}

export function saveExamAnswer(
  examId: string,
  payload: { problemId: string; selectedAnswer: string; currentPageNo?: number; remainingSeconds?: number }
) {
  if (IS_MOCK) {
    saveMockAnswer(examId, payload.problemId, payload.selectedAnswer);
    return Promise.resolve({ ok: true });
  }
  return request<{ ok: boolean }>(`/exams/${examId}/answers`, {
    method: 'PUT',
    body: JSON.stringify({
      problem_id: payload.problemId,
      selected_answer: payload.selectedAnswer,
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export function saveExamMemo(examId: string, content: string) {
  return request<{ ok: boolean }>(`/exams/${examId}/memo`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export function syncExamSession(
  examId: string,
  payload: { currentPageNo?: number; remainingSeconds?: number }
) {
  return request<{ ok: boolean }>(`/exams/${examId}/session`, {
    method: 'PUT',
    body: JSON.stringify({
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export function persistExamSessionSnapshot(
  examId: string,
  payload: { currentPageNo?: number; remainingSeconds?: number }
) {
  return apiRequest(`/exams/${examId}/session`, {
    method: 'PUT',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
const mockAnswers: Record<string, Record<string, string>> = {};

export function saveMockAnswer(examId: string, problemId: string, answer: string) {
  if (!mockAnswers[examId]) mockAnswers[examId] = {};
  mockAnswers[examId][problemId] = answer;
}

export function submitExam(
  examId: string,
  payload: { currentPageNo?: number; remainingSeconds?: number }
): Promise<ExamSubmitResponse> {
  if (IS_MOCK) {
    const problems = getExamProblems(examId);
    const answers = mockAnswers[examId] ?? {};
    const correctCount = problems.filter((p) => answers[p.id] === p.answer).length;
    const score = Math.round((correctCount / problems.length) * 100);
    const PASS_SCORE = 60;
    return Promise.resolve({
      attemptId: 1,
      score,
      answers,
      problems,
      correctCount,
      passed: score >= PASS_SCORE,
      failedBySubjectCutoff: false,
      scorePercent: score,
      awardedPoints: correctCount * 10,
      totalPoints: 320 + correctCount * 10,
    });
  }
  return request<ExamSubmitResponse>(`/exams/${examId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}

export interface ExamResultResponse {
  attemptId: number;
  score: number;
  scorePercent: number;
  passed: boolean;
  failedBySubjectCutoff: boolean;
  answers: Record<string, string>;
  problems: Problem[];
  correctCount: number;
  aiExplanations: Record<string, string>;
}

export function fetchExamResult(examId: string): Promise<ExamResultResponse> {
  return apiFetch<ExamResultResponse>(`/exams/${examId}/result`);
}

export function fetchExamSchedules(year?: number) {
  const y = year ?? new Date().getFullYear();
  return apiFetch<ExamScheduleResponse>(`/exams/schedules?year=${y}`);
}
