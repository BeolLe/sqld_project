export type EventType = 'pageview' | 'click';

export type ObjectType =
  | 'button'
  | 'link'
  | 'card'
  | 'tab'
  | 'checkbox'
  | 'radio_button'
  | 'input'
  | 'icon'
  | '';

/**
 * page_params 에 허용되는 키 화이트리스트 (의사결정 E-5 / B-4).
 *
 * page_params 는 "그 시점 지면의 맥락"만 담는다. 개별 오브젝트의 속성은 data 로 보낸다.
 * 새 키가 필요하면 여기에 추가하는 것이 곧 명세 개정이며, 로그명세 시트의
 * `page_params` 탭과 항상 일치해야 한다.
 */
export type PageParamKey =
  | 'step'
  | 'unit_id'
  | 'exam_id'
  | 'problem_id'
  | 'mode'
  | 'subject';

export type PageParams = Partial<Record<PageParamKey, unknown>>;

export interface LogEvent {
  page_id: string;
  url: string;
  event_type: EventType;
  schema_version: string;
  object_section_id: string;
  object_type: ObjectType | string;
  page_params: PageParams;
  /**
   * 화면 영역의 위치 순번. 본문 흐름상의 자리를 뜻하므로 모달·오버레이처럼
   * 페이지 흐름 밖에 뜨는 섹션은 이 값을 갖지 않는다 (의사결정 D-2).
   * 그 경우 object_section_id 만으로 식별한다.
   */
  object_section_idx?: number;
  object_idx: number;
  object_id: string;
  object_url: string;
  data: Record<string, unknown>;
  platform: string;
  timestamp: string;
  user_id?: string;
  /** 로그인 사용자 세션 */
  session_id?: string;
  /** 비로그인 포함 브라우저 단위 식별자 (의사결정 E-2) */
  device_id?: string;
}

export interface PageviewConfig {
  page_id: string;
  url: string;
}

export interface ClickTarget {
  object_section_id: string;
  /** 모달·오버레이 섹션은 생략한다 (의사결정 D-2). */
  object_section_idx?: number;
  object_type: ObjectType | string;
  object_idx: number;
  object_id: string;
  object_url?: string;
  page_params?: PageParams;
  data?: Record<string, unknown>;
}
