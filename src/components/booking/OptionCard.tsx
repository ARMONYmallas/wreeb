'use client';

import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Tarjeta grande y táctil para elegir espacio o servicio. */
export function OptionCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
  compact,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3.5 rounded-2xl border-2 text-left transition-all',
        compact ? 'min-h-[3.75rem] px-4 py-3.5' : 'min-h-[5.5rem] px-4 py-4',
        selected
          ? 'border-brand-600 bg-brand-50'
          : 'border-line bg-white hover:border-line-strong hover:bg-surface',
      )}
    >
      {Icon && (
        <span
          className={cn(
            'grid shrink-0 place-items-center rounded-xl transition-colors',
            compact ? 'h-10 w-10' : 'h-12 w-12',
            selected ? 'bg-brand-600 text-white' : 'bg-surface text-brand-600',
          )}
        >
          <Icon className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden="true" strokeWidth={1.7} />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className={cn('block font-semibold', selected ? 'text-brand-900' : 'text-ink')}>
          {title}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm leading-snug text-muted">{description}</span>
        )}
      </span>

      <span
        aria-hidden="true"
        className={cn(
          'grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors',
          selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-line-strong',
        )}
      >
        {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
