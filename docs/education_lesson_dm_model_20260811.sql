-- SQLD 개념교육 · 1과목 데이터 모델링의 이해
-- 커리큘럼/단원 골격 + 레슨 'dm-model'(데이터모델의 이해) 본문 등록
--
-- 작성일 2026-08-11
-- 대상 스키마 education (개념 교육 스키마 설계 v0.2 기준)
--
-- 이 스크립트는 여러 번 실행해도 안전하다.
--   · 커리큘럼과 단원은 code 기준으로 UPSERT 한다.
--   · 레슨 본문은 공개 버전이 이미 있으면 건드리지 않고 NOTICE 만 남긴다.
--     (설계 결정: "배포된 버전은 직접 수정하지 않는다. 수정이 필요하면 새 버전을 만든다")
--
-- 주의: education 스키마의 DDL 은 이 저장소에 없다. 테이블이 이미 존재한다는
--       전제로 INSERT 만 수행한다. 컬럼명은 backend/app/db/education.py 의
--       실제 쿼리에서 확인된 것만 사용했다.


-- 1. 교육 과정 -------------------------------------------------------------

INSERT INTO education.curricula (
    curriculum_code,
    title,
    revision_code,
    description,
    status,
    published_at
) VALUES (
    'sqld_concept',
    'SQLD 개념교육',
    '2026',
    '한국데이터산업진흥원 공식 출제범위의 세부항목을 그대로 따르는 SQLD 개념 학습 과정',
    'PUBLISHED',
    now()
)
ON CONFLICT (curriculum_code, revision_code) DO UPDATE
SET title       = EXCLUDED.title,
    description = EXCLUDED.description,
    status      = 'PUBLISHED',
    published_at = COALESCE(education.curricula.published_at, EXCLUDED.published_at);


-- 2. 과목 단원 (최상위) ----------------------------------------------------

INSERT INTO education.units (
    curriculum_id, parent_unit_id, unit_code, title, description, sort_order, status
)
SELECT c.curriculum_id, NULL, v.unit_code, v.title, v.description, v.sort_order, 'PUBLISHED'
FROM education.curricula c
CROSS JOIN (VALUES
    ('subject-1', '데이터 모델링의 이해', '10문항 / 20점 · 과목 40% 미만 시 과락', 1),
    ('subject-2', 'SQL 기본 및 활용',     '40문항 / 80점',                        2)
) AS v(unit_code, title, description, sort_order)
WHERE c.curriculum_code = 'sqld_concept' AND c.revision_code = '2026'
ON CONFLICT (curriculum_id, unit_code) DO UPDATE
SET title       = EXCLUDED.title,
    description = EXCLUDED.description,
    sort_order  = EXCLUDED.sort_order,
    status      = 'PUBLISHED';


-- 3. 주요항목 단원 (과목의 하위) -------------------------------------------

INSERT INTO education.units (
    curriculum_id, parent_unit_id, unit_code, title, sort_order, status
)
SELECT c.curriculum_id, p.unit_id, v.unit_code, v.title, v.sort_order, 'PUBLISHED'
FROM education.curricula c
JOIN education.units p
  ON p.curriculum_id = c.curriculum_id
CROSS JOIN (VALUES
    ('subject-1', 'dm-basic',  '데이터 모델링의 이해', 1),
    ('subject-1', 'dm-sql',    '데이터 모델과 SQL',    2),
    ('subject-2', 'sb-basic',  'SQL 기본',             1),
    ('subject-2', 'sa-apply',  'SQL 활용',             2),
    ('subject-2', 'ad-manage', '관리 구문',            3)
) AS v(parent_code, unit_code, title, sort_order)
WHERE c.curriculum_code = 'sqld_concept'
  AND c.revision_code = '2026'
  AND p.unit_code = v.parent_code
ON CONFLICT (curriculum_id, unit_code) DO UPDATE
SET parent_unit_id = EXCLUDED.parent_unit_id,
    title          = EXCLUDED.title,
    sort_order     = EXCLUDED.sort_order,
    status         = 'PUBLISHED';


-- 4. 레슨 -----------------------------------------------------------------
-- lesson_code 는 프론트 URL(/learn/:unitId)과 1:1 로 대응한다.

INSERT INTO education.lessons (unit_id, lesson_code, sort_order, status)
SELECT u.unit_id, 'dm-model', 1, 'PUBLISHED'
FROM education.units u
JOIN education.curricula c ON c.curriculum_id = u.curriculum_id
WHERE c.curriculum_code = 'sqld_concept'
  AND c.revision_code = '2026'
  AND u.unit_code = 'dm-basic'
ON CONFLICT (unit_id, lesson_code) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    status     = 'PUBLISHED';


-- 5. 레슨 본문 (버전 1) ----------------------------------------------------

DO $seed$
DECLARE
    v_lesson_id BIGINT;
    v_existing  BIGINT;
BEGIN
    SELECT l.lesson_id INTO v_lesson_id
    FROM education.lessons l
    JOIN education.units u      ON u.unit_id = l.unit_id
    JOIN education.curricula c  ON c.curriculum_id = u.curriculum_id
    WHERE c.curriculum_code = 'sqld_concept'
      AND c.revision_code = '2026'
      AND l.lesson_code = 'dm-model';

    IF v_lesson_id IS NULL THEN
        RAISE EXCEPTION 'lesson dm-model 을 찾지 못했습니다. 앞 단계가 실패했는지 확인하세요.';
    END IF;

    SELECT lesson_version_id INTO v_existing
    FROM education.lesson_versions
    WHERE lesson_id = v_lesson_id AND status = 'PUBLISHED';

    IF v_existing IS NOT NULL THEN
        RAISE NOTICE
            'dm-model 에 이미 공개 버전(%)이 있어 본문을 건드리지 않았습니다. 내용을 바꾸려면 새 버전을 만들어 교체하세요.',
            v_existing;
        RETURN;
    END IF;

    INSERT INTO education.lesson_versions (
        lesson_id,
        version_no,
        title,
        summary,
        body_markdown,
        estimated_minutes,
        status,
        published_at
    ) VALUES (
        v_lesson_id,
        COALESCE((SELECT MAX(version_no) FROM education.lesson_versions WHERE lesson_id = v_lesson_id), 0) + 1,
        '데이터모델의 이해',
        '데이터 모델링의 개념, 단계, 데이터 독립성, ERD 기본, 품질 검증 기준을 학습합니다.',
        $md$## 데이터 모델링의 개념

데이터 모델링은 **현실 세계의 데이터를 추상화하여 체계적으로 표현하는 과정**입니다. 업무에서 관리할 데이터와 관계를 찾아 데이터 구조로 설계합니다.

| 특징 | 의미 |
| --- | --- |
| 추상화 | 현실에서 필요한 핵심만 골라 표현합니다. |
| 단순화 | 복잡한 현실을 정해진 규칙으로 쉽게 표현합니다. |
| 명확화 | 누구나 같은 의미로 이해하도록 정확하게 표현합니다. |

> 암기: 추·단·명 = 추상화·단순화·명확화

모델링의 중요성은 다음 세 가지로 정리합니다.

- 업무나 시스템이 변경될 때 데이터 구조에 미치는 영향을 파악할 수 있습니다.
- 복잡한 업무 요구사항을 간결하게 표현할 수 있습니다.
- 중복과 불일치를 줄여 데이터 품질을 유지할 수 있습니다.

모델링할 때는 다음 문제를 주의해야 합니다.

| 유의사항 | 발생하는 문제 |
| --- | --- |
| 중복 | 같은 데이터를 여러 곳에 저장해 값이 달라질 수 있습니다. |
| 비유연성 | 작은 업무 변경에도 데이터 구조가 크게 바뀝니다. |
| 비일관성 | 같은 의미의 데이터를 서로 다른 기준으로 관리합니다. |

> **시험 함정** — **추상화·단순화·명확화**는 모델링의 특징입니다. `성능 최적화`는 데이터 모델링 자체의 주된 목적이 아니며, 구체적인 성능 설계는 물리적 모델링에서 다룹니다.

## 데이터 모델링의 관점과 단계

세 가지 관점은 질문과 바로 연결해서 외웁니다. **데이터 관점은 What, 프로세스 관점은 How, 상관 관점은 데이터와 프로세스의 상호작용**입니다.

| 관점 | 핵심 질문 | 확인하는 내용 |
| --- | --- | --- |
| 데이터 관점 | What | 업무에서 무엇을 관리하는가 · 데이터 구조와 관계 |
| 프로세스 관점 | How | 업무가 실제로 어떻게 처리되는가 |
| 데이터와 프로세스의 상관 관점 | Interaction | 프로세스가 데이터에 어떤 변화를 주는가 |

모델링은 **개념적 → 논리적 → 물리적 모델링** 순서로 구체화됩니다.

| 단계 | 설계 내용 | 핵심 특징 |
| --- | --- | --- |
| 개념적 모델링 | 핵심 엔터티와 관계를 도출합니다. | 가장 높은 추상화 · 전사적 관점 · DBMS 독립 |
| 논리적 모델링 | KEY, 속성, 관계와 정규화를 정의합니다. | 논리 구조 · DBMS 독립 |
| 물리적 모델링 | 테이블, 컬럼, 자료형과 인덱스를 설계합니다. | 실제 구현 · DBMS 종속 |

> 암기: 개·논·물

- 엔터티와 관계의 큰 그림은 개념적 모델링입니다.
- KEY, 속성, 관계와 정규화는 논리적 모델링입니다.
- 테이블, 인덱스와 특정 DBMS는 물리적 모델링입니다.

> **시험 함정** — 특정 DBMS의 자료형이나 인덱스를 결정하는 단계는 **물리적 모델링**입니다.

## 3단계 스키마와 데이터 독립성

3단계 스키마는 **외부·개념·내부 스키마**입니다. 사용자별 화면, 데이터베이스 전체의 논리 구조, 물리적 저장 구조 순서로 구분합니다.

| 스키마 | 관점 | 설명 |
| --- | --- | --- |
| 외부 스키마 | 사용자 관점 | 사용자나 프로그램별 뷰 · 여러 개 존재 가능 |
| 개념 스키마 | 전체 조직 관점 | 데이터베이스 전체의 통합된 논리 구조 · 일반적으로 1개 |
| 내부 스키마 | 저장장치 관점 | 파일·저장 위치·인덱스 등 물리적 저장 구조 |

스키마를 단계별로 나누는 목적은 한 단계의 변경이 다른 단계에 미치는 영향을 줄이는 **데이터 독립성**을 확보하는 것입니다.

| 독립성 | 변경되는 대상 | 영향을 최소화할 대상 |
| --- | --- | --- |
| 논리적 독립성 | 개념 스키마 변경 | 외부 스키마에 영향을 주지 않음 |
| 물리적 독립성 | 내부 스키마 변경 | 개념 스키마에 영향을 주지 않음 |

> 암기 공식: 논리 = 개념 변경 → 외부 보호 / 물리 = 내부 변경 → 개념 보호

논리적 독립성은 외부–개념 사이, 물리적 독립성은 개념–내부 사이의 독립성입니다.

> **시험 함정** — 개념 스키마가 바뀌어도 사용자 뷰가 유지되면 **논리적 독립성**입니다. 인덱스·파일·저장 위치가 바뀌어도 논리 구조가 유지되면 **물리적 독립성**입니다.

## ERD 기본

ERD(Entity Relationship Diagram)의 3요소는 **엔터티·속성·관계**입니다. `인덱스`는 ERD 구성요소가 아니라 물리적 설계 요소입니다.

Peter Chen 표기법의 기본 도형은 다음과 같습니다.

| 구성요소 | 도형 |
| --- | --- |
| 엔터티 | 사각형 |
| 관계 | 마름모 |
| 속성 | 타원 |

IE 표기법은 **선택성(최소 개수)**과 **카디널리티(최대 개수)**를 조합합니다. 관계선 끝의 기호는 그 끝에 있는 엔터티가 반대편 한 건과 몇 건 연결되는지를 뜻합니다.

| IE 기호 | 쉬운 의미 | 판단 기준 |
| --- | --- | --- |
| `\|` | 반드시 연결되어야 함 | 최소 1개 |
| `O` | 연결되지 않아도 됨 | 최소 0개 |
| 까마귀발 | 여러 개까지 연결 가능 | 최대 여러 개 |

기호는 다음처럼 바로 연결해서 외웁니다.

| 기호 조합 | 읽는 방법 |
| --- | --- |
| `O\|` | 0개 또는 1개 |
| `\|\|` | 반드시 1개 |
| `O + 까마귀발` | 0개 이상 |
| `\| + 까마귀발` | 1개 이상 |

> 암기: O = 선택(0), \| = 필수(1), 까마귀발 = 다수

ERD의 일반적인 작성 순서는 다음과 같습니다.

1. 엔터티를 도출합니다.
2. 엔터티를 배치합니다.
3. 엔터티 사이의 관계를 설정합니다.
4. 관계명을 작성합니다.
5. 관계 참여도를 표시합니다.
6. 관계의 필수 여부를 표시합니다.

> **시험 함정** — IE 표기법은 기호를 따로 외우는 것이 아니라 **최소 개수와 최대 개수를 나타내는 기호를 합쳐서** 읽어야 합니다.

## 데이터 모델 품질 검증

품질 검증 문제는 기준 이름과 핵심 단어를 짝지어 외웁니다. 특히 **일관성과 중복성**, **준거성과 정확성**을 바꾼 선지가 자주 나옵니다.

| 검증 기준 | 확인하는 내용 |
| --- | --- |
| 정확성 | 업무 규칙과 요구사항을 올바르게 반영했는가? |
| 완전성 | 필수 엔터티·속성·관계가 빠짐없이 포함됐는가? |
| 준수성(준거성) | 표기법·명명 규칙·도메인 등 표준을 지켰는가? |
| 일관성 | 같은 개념을 모순 없이 동일하게 표현했는가? |
| 중복성 | 같은 정보를 여러 곳에 중복 저장하지 않았는가? |
| 활용성 | 실제 업무 활용과 향후 확장에 적합한가? |

> **시험 함정** — **일관성 = 동일 개념을 같은 방식으로 표현 / 중복성 = 동일 정보를 여러 곳에 저장하지 않음.** `물리적 저장 공간의 효율성`은 일관성의 정의가 아닙니다.

## 핵심 정리

- 데이터 모델링의 세 가지 특징은 **추상화·단순화·명확화**입니다.
- 모델링의 세 단계는 **개념적·논리적·물리적 모델링**입니다.
- 3단계 스키마는 **외부·개념·내부 스키마**입니다.
- 논리적 독립성과 물리적 독립성이 보호하는 대상을 구분해야 합니다.
- Peter Chen 표기법에서 엔터티는 사각형, 관계는 마름모, 속성은 타원입니다.
- IE 표기법은 최소 참여 개수와 최대 참여 개수를 나타내는 기호를 함께 읽습니다.
- 데이터 모델 품질은 정확성, 완전성, 준수성, 일관성, 중복성, 활용성으로 검증합니다.$md$,
        10,
        'PUBLISHED',
        now()
    );

    RAISE NOTICE 'dm-model 본문을 등록했습니다.';
END
$seed$;


-- 6. 확인 -----------------------------------------------------------------

SELECT
    c.curriculum_code,
    u.unit_code,
    l.lesson_code,
    v.version_no,
    v.status,
    length(v.body_markdown) AS body_len
FROM education.lesson_versions v
JOIN education.lessons l    ON l.lesson_id = v.lesson_id
JOIN education.units u      ON u.unit_id = l.unit_id
JOIN education.curricula c  ON c.curriculum_id = u.curriculum_id
WHERE l.lesson_code = 'dm-model';
