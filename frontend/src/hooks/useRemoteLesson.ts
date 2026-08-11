import { useCallback, useEffect, useState } from 'react';
import {
  fetchLessonByCode,
  fetchLessonProgress,
  saveLessonProgress,
  type LessonProgress,
  type RemoteLesson,
} from '../api/education';
import { useAuth } from '../contexts/AuthContext';

export type RemoteLessonStatus = 'loading' | 'not-found' | 'error' | 'ready';

interface UseRemoteLessonReturn {
  status: RemoteLessonStatus;
  lesson: RemoteLesson | null;
  progress: LessonProgress | null;
  markComplete: () => void;
  completing: boolean;
}

/**
 * lessonCode(=unitId) 기준으로 백엔드 개념교육 레슨을 조회한다.
 * 로그인 상태에서만 진도(첫 열람 → IN_PROGRESS)를 기록한다 — 비로그인 사용자의
 * 진도는 DB에 저장하지 않는다는 education 스키마 정책을 그대로 따른다.
 */
export function useRemoteLesson(lessonCode: string | undefined): UseRemoteLessonReturn {
  const { isLoggedIn } = useAuth();
  const [asyncStatus, setStatus] = useState<RemoteLessonStatus>('loading');
  const [lesson, setLesson] = useState<RemoteLesson | null>(null);
  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!lessonCode) return;

    let cancelled = false;
    setStatus('loading');
    setLesson(null);
    setProgress(null);

    fetchLessonByCode(lessonCode)
      .then(async (fetched) => {
        if (cancelled) return;
        setLesson(fetched);
        setStatus('ready');

        if (!isLoggedIn) return;

        try {
          const existing = await fetchLessonProgress(fetched.lessonId);
          if (cancelled) return;
          setProgress(existing);

          if (existing?.status !== 'COMPLETED') {
            const updated = await saveLessonProgress(fetched.lessonId, {
              lessonVersionId: fetched.lessonVersionId,
            });
            if (!cancelled && updated) setProgress(updated);
          }
        } catch {
          // 진도 저장 실패는 열람 자체를 막지 않는다.
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : '';
        setStatus(message.includes('404') || /찾을 수 없|not found/i.test(message) ? 'not-found' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [lessonCode, isLoggedIn]);

  const status: RemoteLessonStatus = lessonCode ? asyncStatus : 'not-found';

  const markComplete = useCallback(() => {
    if (!lesson || !isLoggedIn || completing) return;
    setCompleting(true);
    saveLessonProgress(lesson.lessonId, {
      lessonVersionId: lesson.lessonVersionId,
      completed: true,
    })
      .then((updated) => {
        if (updated) setProgress(updated);
      })
      .finally(() => setCompleting(false));
  }, [lesson, isLoggedIn, completing]);

  return { status, lesson, progress, markComplete, completing };
}
