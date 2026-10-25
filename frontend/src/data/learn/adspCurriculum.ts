import type { SubjectSeed } from './curriculum';

/**
 * ADsP(데이터분석 준전문가) 공식 출제범위 (https://www.dataq.or.kr).
 * 세부항목명은 공식 표기를 그대로 쓴다.
 *
 * 본문(blocks)은 추후 업로드한다. 항목을 채울 때는 SQLD 와 같이
 * `units/*.ts` 에 블록을 만들고 해당 seed 에 `blocks` 를 연결하면 '학습 가능'으로 바뀐다.
 *
 * id 는 SQLD 항목(dm-, sb-, sa-, ad-)과 겹치지 않게 접두어를 나눈다.
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
          { id: 'du-data', title: '데이터와 정보', estimatedMin: 8 },
          { id: 'du-db', title: '데이터베이스의 정의와 특징', estimatedMin: 7 },
          { id: 'du-dbuse', title: '데이터베이스 활용', estimatedMin: 6 },
        ],
      },
      {
        name: '데이터의 가치와 미래',
        units: [
          { id: 'dv-bigdata', title: '빅데이터의 이해', estimatedMin: 8 },
          { id: 'dv-value', title: '빅데이터의 가치와 영향', estimatedMin: 6 },
          { id: 'dv-bm', title: '비즈니스 모델', estimatedMin: 6 },
          { id: 'dv-risk', title: '위기 요인과 통제 방안', estimatedMin: 7 },
          { id: 'dv-future', title: '미래의 빅데이터', estimatedMin: 5 },
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
