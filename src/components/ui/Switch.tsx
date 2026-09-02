'use client';

import { cn } from '@/lib/cn';

/**
 * Interruptor accesible con objetivo táctil cómodo.
 * Se usa en el horario habitual y en las excepciones por fecha.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-3.5 text-left transition-colors',
        checked ? 'border-brand-200 bg-brand-50' : 'border-line bg-white',
        disabled ? 'cursor-not-allowed opacity-55' : 'active:scale-[0.995]',
        className,
      )}
    >
      <span className="min-w-0">
        <span className={cn('block text-[0.9375rem] font-semibold', checked ? 'text-brand-900' : 'text-ink')}>
          {label}
        </span>
        {description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-brand-600' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </span>
    </button>
  );
}
