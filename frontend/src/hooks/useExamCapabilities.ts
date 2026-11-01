import { createContext, useContext } from 'react';
import type { ExamSchemaState } from '../api/content';
import type { ExamType } from '../constants/examTypes';
import { useExamType } from './useExamType';

export interface ExamCapabilitiesState {
  /** 조회가 끝났는지. 끝나기 전에는 ADsP 를 '확인 중'으로 본다. */
  checking: boolean;
  /** 조회 실패 시 null */
  schemaState: ExamSchemaState | null;
  /** 시험별 공개 여부 */
  available: Record<ExamType, boolean>;
  /** 자동 재시도까지 끝내 조회에 실패했는지. 미공개(available=false)와 구분한다. */
  failed: boolean;
  /** 조회를 처음부터 다시 시도한다. */
  refresh: () => void;
}

// 조회 전·실패 시 기본값: SQLD 는 기존대로 사용 가능, ADsP 는 준비 중.
export const FALLBACK_AVAILABLE: Record<ExamType, boolean> = { sqld: true, adsp: false };

export const ExamCapabilitiesContext = createContext<ExamCapabilitiesState>({
  checking: true,
  schemaState: null,
  available: FALLBACK_AVAILABLE,
  failed: false,
  refresh: () => undefined,
});

export function useExamCapabilities() {
  return useContext(ExamCapabilitiesContext);
}

/**
 * 현재 시험의 콘텐츠(모의고사·무한풀이·학습현황) 공개 여부.
 * 개념 학습은 로컬 콘텐츠라 이 값과 무관하게 항상 열려 있다.
 * `checking` 이 true 인 동안 ADsP 는 아직 알 수 없으므로 화면은 로딩으로 둔다.
 */
export function useContentReady(): { ready: boolean; checking: boolean; failed: boolean; refresh: () => void } {
  const { examType } = useExamType();
  const { checking, available, failed, refresh } = useExamCapabilities();
  // SQLD 는 capabilities 를 기다리지 않고, 조회 실패와도 무관하게 기존대로 연다.
  return {
    ready: available[examType],
    checking: checking && examType !== 'sqld',
    failed: failed && examType !== 'sqld',
    refresh,
  };
}
