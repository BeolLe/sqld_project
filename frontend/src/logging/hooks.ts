import { useEffect, useRef, useMemo } from 'react';
import { PageviewLog } from './PageviewLog';
import { ClickLog } from './ClickLog';
import type { PageParams } from './types';

export function usePageview(
  config: { page_id: string; url: string },
  params?: { step?: string; data?: Record<string, unknown>; pageParams?: PageParams },
  deps: unknown[] = [],
) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const pv = new PageviewLog(config);
    pv.send(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function useClickLog(config: {
  page_id: string;
  url: string;
  pageParams?: PageParams;
}): ClickLog {
  return useMemo(
    () => new ClickLog(config),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.page_id, config.url],
  );
}
