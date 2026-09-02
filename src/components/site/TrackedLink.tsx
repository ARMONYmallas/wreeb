'use client';

import Link from 'next/link';
import { track, type AnalyticsEvent } from '@/lib/analytics';

/** Enlace interno que reporta un evento de analítica al pulsarlo. */
export function TrackedLink({
  href,
  event,
  location,
  className,
  children,
}: {
  href: string;
  event: AnalyticsEvent;
  location: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => track(event, { location })}>
      {children}
    </Link>
  );
}
