'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import { APPOINTMENT_STATUSES, STATUS_LABELS, type AppointmentStatus } from '@/types';
import { cn } from '@/lib/cn';

const FILTERS: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  ...APPOINTMENT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
];

export function AppointmentFilters({ counts }: { counts?: Partial<Record<string, number>> }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const status = params.get('estado') ?? 'all';
  const [search, setSearch] = useState(params.get('buscar') ?? '');

  // Búsqueda con retardo: no dispara una consulta por cada tecla.
  useEffect(() => {
    const current = params.get('buscar') ?? '';
    if (search === current) return;
    const timeout = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (search) next.set('buscar', search);
      else next.delete('buscar');
      startTransition(() => router.replace(`/admin/solicitudes?${next.toString()}`));
    }, 350);
    return () => clearTimeout(timeout);
  }, [search, params, router]);

  const setStatus = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === 'all') next.delete('estado');
    else next.set('estado', value);
    startTransition(() => router.replace(`/admin/solicitudes?${next.toString()}`));
  };

  return (
    <div className={cn('flex flex-col gap-3', pending && 'opacity-70')}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o comuna"
          aria-label="Buscar solicitudes"
          className="h-13 w-full rounded-2xl border border-line bg-white pr-11 pl-11 text-ink placeholder:text-muted-soft focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
          style={{ height: '3.25rem' }}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label="Limpiar búsqueda"
            className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {FILTERS.map((filter) => {
          const active = status === filter.value;
          const count = counts?.[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              aria-pressed={active}
              className={cn(
                'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold transition-colors',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-white text-ink-soft hover:bg-surface',
              )}
            >
              {filter.label}
              {count !== undefined && count > 0 && (
                <span className={cn('text-xs', active ? 'text-brand-100' : 'text-muted-soft')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
