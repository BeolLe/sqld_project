import type { PageviewConfig, PageParams } from './types';
import { tracker } from './tracker';

export class PageviewLog {
  private pageId: string;
  private url: string;

  constructor(config: PageviewConfig) {
    this.pageId = config.page_id;
    this.url = config.url;
  }

  send(params?: { step?: string; data?: Record<string, unknown>; pageParams?: PageParams }) {
    const pageParams: PageParams = params?.pageParams ?? {};
    if (params?.step) {
      pageParams.step = params.step;
    }

    tracker.push({
      page_id: this.pageId,
      url: this.url,
      event_type: 'pageview',
      object_section_id: '',
      object_type: '',
      page_params: pageParams,
      object_section_idx: 0,
      object_idx: 0,
      object_id: '',
      object_url: '',
      data: params?.data ?? {},
    });
  }
}
