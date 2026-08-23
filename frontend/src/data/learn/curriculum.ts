import type { LearnBlock, LearnSubject, LearnUnit } from './types';
import { dmModelBlocks } from './units/dmModel';
import { dmEntityBlocks } from './units/dmEntity';
import { dmNormBlocks } from './units/dmNorm';
import { dmJoinBlocks } from './units/dmJoin';
import { dmTrxBlocks } from './units/dmTrx';
import { dmNullBlocks } from './units/dmNull';
import { dmNatkeyBlocks } from './units/dmNatkey';
import { saWindowBlocks } from './units/saWindow';
import { dmAttrBlocks } from './units/dmAttr';

/**
 * 한국데이터산업진흥원 공식 출제범위 (https://www.dataq.or.kr/www/sub/a_04.do).
 * 세부항목명은 공식 표기를 그대로 쓴다 — 수험생이 타 교재·기출과 대조하기 때문이다.
 * 콘텐츠가 없는 항목도 목록에는 노출하고 '미학습'으로 표시한다.
 */

interface UnitSeed {
  id: string;
  title: string;
  estimatedMin: number;
  priority1?: boolean;
  blocks?: LearnBlock[];
}

interface GroupSeed {
  name: string;
  units: UnitSeed[];
}

interface SubjectSeed {
  subject: 1 | 2;
  title: string;
  exam: string;
  showFailWarning?: boolean;
  groups: GroupSeed[];
}

const SEED: SubjectSeed[] = [
  {
    subject: 1,
    title: '데이터 모델링의 이해',
    exam: '10문항 / 20점',
    showFailWarning: true,
    groups: [
      {
        name: '데이터 모델링의 이해',
        units: [
          {
            id: 'dm-model',
            title: '데이터모델의 이해',
            estimatedMin: 10,
            blocks: dmModelBlocks,
          },
          {
            id: 'dm-entity',
            title: '엔터티',
            estimatedMin: 7,
            priority1: true,
            blocks: dmEntityBlocks,
          },
          { id: 'dm-attr', title: '속성', estimatedMin: 6, priority1: true, blocks: dmAttrBlocks },
          { id: 'dm-rel', title: '관계', estimatedMin: 7, priority1: true },
          { id: 'dm-key', title: '식별자', estimatedMin: 8, priority1: true },
        ],
      },
      {
        name: '데이터 모델과 SQL',
        units: [
          {
            id: 'dm-norm',
            title: '정규화',
            estimatedMin: 9,
            priority1: true,
            blocks: dmNormBlocks,
          },
          {
            id: 'dm-join',
            title: '관계와 조인의 이해',
            estimatedMin: 7,
            blocks: dmJoinBlocks,
          },
          {
            id: 'dm-trx',
            title: '모델이 표현하는 트랜잭션의 이해',
            estimatedMin: 6,
            blocks: dmTrxBlocks,
          },
          {
            id: 'dm-null',
            title: 'Null 속성의 이해',
            estimatedMin: 5,
            priority1: true,
            blocks: dmNullBlocks,
          },
          {
            id: 'dm-natkey',
            title: '본질식별자 vs 인조식별자',
            estimatedMin: 6,
            blocks: dmNatkeyBlocks,
          },
        ],
      },
    ],
  },
  {
    subject: 2,
    title: 'SQL 기본 및 활용',
    exam: '40문항 / 80점',
    groups: [
      {
        name: 'SQL 기본',
        units: [
          { id: 'sb-rdb', title: '관계형 데이터베이스 개요', estimatedMin: 5 },
          { id: 'sb-select', title: 'SELECT 문', estimatedMin: 8, priority1: true },
          { id: 'sb-func', title: '함수', estimatedMin: 10, priority1: true },
          { id: 'sb-where', title: 'WHERE 절', estimatedMin: 8, priority1: true },
          { id: 'sb-group', title: 'GROUP BY, HAVING 절', estimatedMin: 8, priority1: true },
          { id: 'sb-order', title: 'ORDER BY 절', estimatedMin: 5 },
          { id: 'sb-join', title: '조인', estimatedMin: 10, priority1: true },
          { id: 'sb-sjoin', title: '표준 조인', estimatedMin: 9, priority1: true },
        ],
      },
      {
        name: 'SQL 활용',
        units: [
          { id: 'sa-sub', title: '서브쿼리', estimatedMin: 10, priority1: true },
          { id: 'sa-set', title: '집합 연산자', estimatedMin: 6 },
          { id: 'sa-gfunc', title: '그룹 함수', estimatedMin: 8 },
          {
            id: 'sa-window',
            title: '윈도우 함수',
            estimatedMin: 10,
            priority1: true,
            blocks: saWindowBlocks,
          },
          { id: 'sa-topn', title: 'Top N 쿼리', estimatedMin: 6 },
          { id: 'sa-hier', title: '계층형 질의와 셀프 조인', estimatedMin: 9 },
          { id: 'sa-pivot', title: 'PIVOT 절과 UNPIVOT 절', estimatedMin: 6 },
          { id: 'sa-regex', title: '정규 표현식', estimatedMin: 6 },
        ],
      },
      {
        name: '관리 구문',
        units: [
          { id: 'ad-dml', title: 'DML', estimatedMin: 7, priority1: true },
          { id: 'ad-tcl', title: 'TCL', estimatedMin: 6 },
          // adDdlBlocks 는 작성되어 있으나 1차 공개 범위에서 제외한다 — blocks 만 다시 연결하면 바로 노출된다.
          { id: 'ad-ddl', title: 'DDL', estimatedMin: 8, priority1: true },
          { id: 'ad-dcl', title: 'DCL', estimatedMin: 5 },
        ],
      },
    ],
  },
];

let order = 0;

export const CURRICULUM: LearnSubject[] = SEED.map((subject) => ({
  subject: subject.subject,
  title: subject.title,
  exam: subject.exam,
  showFailWarning: subject.showFailWarning ?? false,
  groups: subject.groups.map((group) => ({
    name: group.name,
    units: group.units.map<LearnUnit>((unit) => ({
      id: unit.id,
      subject: subject.subject,
      group: group.name,
      order: ++order,
      title: unit.title,
      estimatedMin: unit.estimatedMin,
      priority1: unit.priority1 ?? false,
      blocks: unit.blocks ?? [],
    })),
  })),
}));

/** 공식 출제범위 순서대로 평탄화한 전체 세부항목 */
export const ALL_UNITS: LearnUnit[] = CURRICULUM.flatMap((s) => s.groups.flatMap((g) => g.units));

export function findUnit(id: string): LearnUnit | undefined {
  return ALL_UNITS.find((u) => u.id === id);
}

export function countBlanks(unit: LearnUnit): number {
  return unit.blocks.reduce((sum, block) => sum + block.blanks.length, 0);
}
