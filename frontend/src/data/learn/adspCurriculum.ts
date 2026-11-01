import type { LearnUnit } from './types';
import type { UnitSeed, SubjectSeed } from './curriculum';
import { adsp1Unit } from './units/adsp1';
import { adsp2Unit } from './units/adsp2';
import { adsp3Unit } from './units/adsp3';
import { adsp4Unit } from './units/adsp4';
import { adsp5Unit } from './units/adsp5';
import { adsp6Unit } from './units/adsp6';
import { adsp7Unit } from './units/adsp7';
import { adsp8Unit } from './units/adsp8';

/** 본문이 있는 단원을 목차 항목으로 연결한다. 제목은 공식 표기(목차)를 따른다. */
function withBody(unit: LearnUnit, title: string): UnitSeed {
  return {
    id: unit.id,
    title,
    estimatedMin: unit.estimatedMin,
    priority1: unit.priority1,
    blocks: unit.blocks,
  };
}

/**
 * ADsP(데이터분석 준전문가) 공식 출제범위 (https://www.dataq.or.kr).
 * 세부항목명은 공식 표기를 그대로 쓴다.
 *
 * 본문(blocks)이 있는 항목(`adsp-1-1`~`adsp-1-8`)만 '학습 가능'이고 나머지는 '준비 중'이다.
 * 항목을 채울 때는 SQLD 와 같이 `units/*.ts` 에 블록을 만들고 해당 seed 에 연결한다.
 *
 * id 는 SQLD 항목(dm-, sb-, sa-, ad-)과 겹치지 않게 `adsp-` 또는 별도 접두어를 쓴다.
 * 학습 진도가 id 기준으로 브라우저에 저장되기 때문이다.
 */
export const ADSP_SEED: SubjectSeed[] = [
  {
    subject: 1,
    title: '데이터 이해',
    exam: '10문항 / 20점',
    showFailWarning: true,
    groups: [
      {
        name: '데이터의 이해',
        units: [
          withBody(adsp1Unit, '데이터와 정보'),
          withBody(adsp2Unit, '데이터베이스의 정의와 특징'),
          withBody(adsp3Unit, '데이터베이스 활용'),
        ],
      },
      {
        name: '데이터의 가치와 미래',
        units: [
          withBody(adsp4Unit, '빅데이터의 이해'),
          withBody(adsp5Unit, '빅데이터의 가치와 영향'),
          withBody(adsp6Unit, '비즈니스 모델'),
          withBody(adsp7Unit, '위기 요인과 통제 방안'),
          withBody(adsp8Unit, '미래의 빅데이터'),
        ],
      },
      {
        name: '가치 창조를 위한 데이터 사이언스와 전략 인사이트',
        units: [
          { id: 'ds-insight', title: '빅데이터분석과 전략 인사이트', estimatedMin: 6 },
          { id: 'ds-skill', title: '전략 인사이트 도출을 위한 필요 역량', estimatedMin: 6 },
          { id: 'ds-future', title: '빅데이터 그리고 데이터 사이언스의 미래', estimatedMin: 5 },
        ],
      },
    ],
  },
  {
    subject: 2,
    title: '데이터 분석 기획',
    exam: '10문항 / 20점',
    showFailWarning: true,
    groups: [
      {
        name: '데이터 분석 기획의 이해',
        units: [
          { id: 'ap-direction', title: '분석 기획 방향성 도출', estimatedMin: 8 },
          { id: 'ap-method', title: '분석 방법론', estimatedMin: 10 },
          { id: 'ap-task', title: '분석 과제 발굴', estimatedMin: 9 },
          { id: 'ap-pm', title: '분석 프로젝트 관리 방안', estimatedMin: 7 },
        ],
      },
      {
        name: '분석 마스터 플랜',
        units: [
          { id: 'mp-frame', title: '마스터 플랜 수립 프레임 워크', estimatedMin: 8 },
          { id: 'mp-gov', title: '분석 거버넌스 체계 수립', estimatedMin: 9 },
        ],
      },
    ],
  },
  {
    subject: 3,
    title: '데이터 분석',
    exam: '30문항 / 60점',
    groups: [
      {
        name: 'R기초와 데이터 마트',
        units: [
          { id: 'rb-r', title: 'R기초', estimatedMin: 12 },
          { id: 'rb-mart', title: '데이터 마트', estimatedMin: 9 },
          { id: 'rb-missing', title: '결측값 처리와 이상값 검색', estimatedMin: 8 },
        ],
      },
      {
        name: '통계분석',
        units: [
          { id: 'st-intro', title: '통계학 개론', estimatedMin: 12 },
          { id: 'st-basic', title: '기초 통계분석', estimatedMin: 14 },
          { id: 'st-multi', title: '다변량 분석', estimatedMin: 12 },
          { id: 'st-ts', title: '시계열 예측', estimatedMin: 9 },
          { id: 'st-pca', title: '주성분 분석', estimatedMin: 8 },
        ],
      },
      {
        name: '정형 데이터 마이닝',
        units: [
          { id: 'mn-overview', title: '데이터 마이닝 개요', estimatedMin: 6 },
          { id: 'mn-cls', title: '분류 분석', estimatedMin: 14 },
          { id: 'mn-cluster', title: '군집 분석', estimatedMin: 11 },
          { id: 'mn-assoc', title: '연관 분석', estimatedMin: 9 },
        ],
      },
    ],
  },
];
