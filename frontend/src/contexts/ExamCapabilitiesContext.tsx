import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { fetchExamCapabilities } from '../api/content';
import type { ExamCapabilities } from '../api/content';
import { ExamCapabilitiesContext, FALLBACK_AVAILABLE } from '../hooks/useExamCapabilities';
import type { ExamCapabilitiesState } from '../hooks/useExamCapabilities';

/** 실패 시 자동 재시도 간격(ms). 최대 3회. */
const RETRY_DELAYS_MS = [1000, 3000, 3000];

/**
 * GET /api/content/exam-capabilities 를 조회해 시험별 공개 여부를 내려준다.
 * 실패하면 자동으로 최대 3회 다시 시도하고, 끝내 실패하면 `failed` 로 미공개와 구분한다.
 * 실패 중에도 기본값(SQLD 사용 가능, ADsP 차단)을 유지하므로 SQLD 는 기다리지 않는다.
 */
export function ExamCapabilitiesProvider({ children }: { children: ReactNode }) {
  const [capabilities, setCapabilities] = useState<ExamCapabilities | null>(null);
  const [checking, setChecking] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    function attempt(retryCount: number) {
      fetchExamCapabilities()
        .then((result) => {
          if (cancelled) return;
          setCapabilities(result);
          setFailed(false);
          setChecking(false);
        })
        .catch(() => {
          if (cancelled) return;
          if (retryCount < RETRY_DELAYS_MS.length) {
            timer = window.setTimeout(() => attempt(retryCount + 1), RETRY_DELAYS_MS[retryCount]);
            return;
          }
          // 끝내 실패: SQLD 는 사용 가능, ADsP 는 차단하되 '준비 중'이 아니라 '확인 실패'로 표시한다.
          setCapabilities(null);
          setFailed(true);
          setChecking(false);
        });
    }

    attempt(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [reloadKey]);

  const refresh = useCallback(() => {
    setChecking(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  }, []);

  const value = useMemo<ExamCapabilitiesState>(
    () => ({
      checking,
      schemaState: capabilities?.schemaState ?? null,
      available: capabilities
        ? { sqld: capabilities.sqld.available, adsp: capabilities.adsp.available }
        : FALLBACK_AVAILABLE,
      failed,
      refresh,
    }),
    [capabilities, checking, failed, refresh],
  );

  return <ExamCapabilitiesContext.Provider value={value}>{children}</ExamCapabilitiesContext.Provider>;
}
