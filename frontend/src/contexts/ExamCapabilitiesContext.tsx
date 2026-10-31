import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchExamCapabilities } from '../api/content';
import type { ExamCapabilities } from '../api/content';
import { ExamCapabilitiesContext, FALLBACK_AVAILABLE } from '../hooks/useExamCapabilities';
import type { ExamCapabilitiesState } from '../hooks/useExamCapabilities';

/** GET /api/content/exam-capabilities 를 한 번 조회해 시험별 공개 여부를 내려준다. */
export function ExamCapabilitiesProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<ExamCapabilities | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchExamCapabilities()
      .then((result) => {
        if (!cancelled) setCapabilities(result);
      })
      .catch(() => {
        // 조회 실패: SQLD 는 사용 가능, ADsP 는 준비 중으로 처리한다.
        if (!cancelled) setCapabilities(null);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<ExamCapabilitiesState>(
    () => ({
      checking,
      schemaState: capabilities?.schemaState ?? null,
      available: capabilities
        ? { sqld: capabilities.sqld.available, adsp: capabilities.adsp.available }
        : FALLBACK_AVAILABLE,
    }),
    [capabilities, checking],
  );

  return <ExamCapabilitiesContext.Provider value={value}>{children}</ExamCapabilitiesContext.Provider>;
}
