import { apiRequest } from '../utils/api';

export interface SurveyPayload {
  helpfulness: number;
  exam_result: string;
  phone: string;
  comment: string;
}

export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  const response = await apiRequest('/survey/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as Record<string, string>;
    throw new Error(body.detail ?? '설문 제출에 실패했습니다.');
  }
}

export async function fetchSurveyStatus(): Promise<boolean> {
  try {
    const response = await apiRequest('/survey/status');
    if (!response.ok) return false;
    const data = (await response.json()) as { submitted: boolean };
    return data.submitted;
  } catch {
    return false;
  }
}
