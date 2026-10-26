import { ALL_UNITS, CURRICULUM } from './curriculum';
import { ADSP_UNITS, ADSP_CURRICULUM } from './adspCurriculum';

export type LearnExamType = 'sqld' | 'adsp';

/** Local concept content remains available before the optional DB import. */
export function getLearnCatalog(examType: LearnExamType = 'sqld') {
  return examType === 'adsp'
    ? {
        units: ADSP_UNITS,
        subjects: ADSP_CURRICULUM,
        basePath: '/adsp/learn',
        homePath: '/adsp',
        label: 'ADsP',
      }
    : { units: ALL_UNITS, subjects: CURRICULUM, basePath: '/learn', homePath: '/', label: 'SQLD' };
}

export function findLearnUnit(id: string, examType: LearnExamType = 'sqld') {
  return getLearnCatalog(examType).units.find((unit) => unit.id === id);
}
