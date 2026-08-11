import { apiFetch } from '../utils/api';

/** `GET /api/education/lessons/by-code/:lessonCode` 응답. */
export interface RemoteLesson {
  lessonId: number;
  lessonCode: string;
  lessonVersionId: number;
  versionNo: number;
  title: string;
  summary: string | null;
  bodyMarkdown: string;
  estimatedMinutes: number | null;
  publishedAt: string | null;
  unit: { unitId: number; title: string };
  curriculum: { curriculumCode: string; title: string; revisionCode: string };
}

export type LessonProgressStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface LessonProgress {
  lessonId: number;
  lessonVersionId: number;
  status: LessonProgressStatus;
  lastViewedAt: string | null;
  completedAt: string | null;
  resumeAnchor: string | null;
  resumeOffsetPx: number | null;
  resumeSavedAt: string | null;
  resumeExpiresAt: string | null;
}

export function fetchLessonByCode(lessonCode: string): Promise<RemoteLesson> {
  return apiFetch<RemoteLesson>(`/education/lessons/by-code/${lessonCode}`);
}

export async function fetchLessonProgress(lessonId: number): Promise<LessonProgress | null> {
  const { progress } = await apiFetch<{ progress: LessonProgress | null }>(
    `/education/lessons/${lessonId}/progress`,
  );
  return progress;
}

export async function saveLessonProgress(
  lessonId: number,
  payload: { lessonVersionId: number; completed?: boolean },
): Promise<LessonProgress | null> {
  const { progress } = await apiFetch<{ progress: LessonProgress | null }>(
    `/education/lessons/${lessonId}/progress`,
    {
      method: 'PUT',
      body: JSON.stringify({
        lessonVersionId: payload.lessonVersionId,
        completed: payload.completed ?? false,
      }),
    },
  );
  return progress;
}
