import type { LearnSubject, LearnUnit } from './types';
import { adsp1Unit } from './units/adsp1';
import { adsp2Unit } from './units/adsp2';
import { adsp3Unit } from './units/adsp3';
import { adsp4Unit } from './units/adsp4';
import { adsp5Unit } from './units/adsp5';
import { adsp6Unit } from './units/adsp6';
import { adsp7Unit } from './units/adsp7';
import { adsp8Unit } from './units/adsp8';

export const ADSP_UNITS: LearnUnit[] = [
  adsp1Unit,
  adsp2Unit,
  adsp3Unit,
  adsp4Unit,
  adsp5Unit,
  adsp6Unit,
  adsp7Unit,
  adsp8Unit,
];
export const ADSP_CURRICULUM: LearnSubject[] = [
  {
    subject: 1,
    title: '데이터 이해',
    exam: '첫 두 장 · 8개 주제',
    showFailWarning: false,
    groups: ['데이터의 이해', '데이터의 가치와 미래'].map((name) => ({
      name,
      units: ADSP_UNITS.filter((u) => u.group === name),
    })),
  },
];
