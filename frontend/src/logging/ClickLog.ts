import type { ClickTarget, PageParams } from './types';
import { tracker } from './tracker';

export class ClickLog {
  private pageId: string;
  private url: string;
  private defaultPageParams: PageParams;

  constructor(config: { page_id: string; url: string; pageParams?: PageParams }) {
    this.pageId = config.page_id;
    this.url = config.url;
    this.defaultPageParams = config.pageParams ?? {};
  }

  send(target: ClickTarget) {
    const mergedParams: PageParams = {
      ...this.defaultPageParams,
      ...target.page_params,
    };

    tracker.push({
      page_id: this.pageId,
      url: this.url,
      event_type: 'click',
      object_section_id: target.object_section_id,
      object_type: target.object_type,
      page_params: mergedParams,
      object_section_idx: target.object_section_idx,
      object_idx: target.object_idx,
      object_id: target.object_id,
      object_url: target.object_url ?? '',
      data: target.data ?? {},
    });
  }
}
