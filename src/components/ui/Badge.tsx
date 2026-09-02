import { cn } from '@/lib/cn';
import type { AppointmentStatus } from '@/types';
import { STATUS_LABELS } from '@/types';

const statusStyles: Record<AppointmentStatus, string> = {
  new: 'bg-brand-600 text-white',
  contacted: 'bg-amber-100 text-amber-900 border border-amber-200',
  confirmed: 'bg-brand-50 text-brand-800 border border-brand-200',
  reschedule: 'bg-orange-100 text-orange-900 border border-orange-200',
  completed: 'bg-surface-2 text-muted border border-line',
  cancelled: 'bg-white text-muted-soft border border-line line-through',
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        statusStyles[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Chip({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'warn';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-surface text-muted border-line',
    brand: 'bg-brand-50 text-brand-800 border-brand-200',
    warn: 'bg-amber-50 text-amber-900 border-amber-200',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
