import type { Problem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ACCESS_TOKEN_KEY = 'solsqld_access_token';

function getAuthHeaders() {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
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

export function fetchExamSession(examId: string) {
  return request<ExamSessionResponse>(`/exams/${examId}/session`);
}

export function saveExamAnswer(
  examId: string,
  payload: { problemId: string; selectedAnswer: string; currentPageNo?: number; remainingSeconds?: number }
) {
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

export interface ExamSubmitResponse {
  attemptId: number;
  score: number;
  answers: Record<string, string>;
  problems: Problem[];
  correctCount: number;
  passed: boolean;
  scorePercent: number;
}

export function submitExam(
  examId: string,
  payload: { currentPageNo?: number; remainingSeconds?: number }
) {
  return request<ExamSubmitResponse>(`/exams/${examId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      current_page_no: payload.currentPageNo,
      remaining_seconds: payload.remainingSeconds,
    }),
  });
}
