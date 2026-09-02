'use client';

import { useEffect } from 'react';
import { track, type AnalyticsEvent } from '@/lib/analytics';

/** Dispara un evento una sola vez al montar la página. */
export function PageViewTracker({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
  }, [event]);
  return null;
}
