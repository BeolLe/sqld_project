/**
 * 개념 학습 빈칸 채점 결과를 브라우저에 로컬로 저장한다.
 * 백엔드 DB 연동 전까지의 임시 저장소이며, 기기·브라우저 간 동기화되지 않는다.
 * 같은 빈칸을 다시 풀면 최신 결과로 덮어쓴다(누적 횟수가 아니라 최근 숙련도 스냅샷).
 */
import { ALL_UNITS } from '../data/learn/curriculum';
import type { SubjectStat } from '../types';

const STORAGE_KEY = 'solsqld_learn_blank_results_v1';

type BlankResultMap = Record<string, boolean>; // key: `${unitId}:${blankId}` -> 최근 정답 여부

function readMap(): BlankResultMap {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BlankResultMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: BlankResultMap): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // 시크릿 모드 등 localStorage 사용 불가 시 조용히 무시한다.
  }
}

/** 빈칸 하나를 채점한 직후 호출한다. blankId는 단원 내에서 고유하다. */
export function recordBlankResult(unitId: string, blankId: string, correct: boolean): void {
  const map = readMap();
  map[`${unitId}:${blankId}`] = correct;
  writeMap(map);
}

/**
 * 주요항목(그룹)별 정답률을 계산한다.
 * 아직 한 문제도 채점하지 않은 그룹은 결과에서 제외한다 — "0%"가 아니라 "데이터 없음"으로 다룬다.
 */
export function getLearnSubjectStats(): SubjectStat[] {
  const groupByUnitId = new Map(ALL_UNITS.map((u) => [u.id, u.group] as const));
  const totals = new Map<string, { solved: number; correct: number }>();

  for (const [key, isCorrect] of Object.entries(readMap())) {
    const unitId = key.split(':')[0];
    const group = groupByUnitId.get(unitId);
    if (!group) continue; // 삭제되었거나 이름이 바뀐 단원의 유령 데이터 방어
    const bucket = totals.get(group) ?? { solved: 0, correct: 0 };
    bucket.solved += 1;
    if (isCorrect) bucket.correct += 1;
    totals.set(group, bucket);
  }

  // 커리큘럼에 등장하는 순서 그대로 축 순서를 유지한다.
  const orderedGroups = Array.from(new Set(ALL_UNITS.map((u) => u.group)));

  return orderedGroups
    .map((group) => {
      const bucket = totals.get(group);
      if (!bucket) return null;
      return {
        subjectId: group,
        subjectName: group,
        solvedCount: bucket.solved,
        correctCount: bucket.correct,
        accuracyRate: Math.round((bucket.correct / bucket.solved) * 100),
      };
    })
    .filter((s): s is SubjectStat => s !== null);
}
