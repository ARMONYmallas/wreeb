'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { CalendarOff, ChevronLeft, ChevronRight, Loader2, RotateCcw } from 'lucide-react';
import { blockDay, restoreRange } from '@/app/admin/actions';
import {
  addDays,
  addMonths,
  daysInMonth,
  dayOfWeek,
  endOfMonth,
  endOfWeek,
  formatMonthTitle,
  startOfMonth,
  startOfWeek,
  todayInChile,
} from '@/lib/date';
import type { AdminAvailabilityRow } from '@/lib/admin/queries';
import { cn } from '@/lib/cn';
import { DayEditorSheet } from './DayEditorSheet';
import { BlockRangeSheet } from './BlockRangeSheet';
import type { DayAvailabilityState } from '@/types';

const STATE_STYLES: Record<DayAvailabilityState, string> = {
  available: 'bg-brand-50 text-brand-800 ring-1 ring-brand-100 ring-inset',
  partial: 'bg-amber-50 text-amber-900 ring-1 ring-amber-200 ring-inset',
  blocked: 'bg-red-50 text-red-800 ring-1 ring-red-200 ring-inset',
  no_schedule: 'bg-white text-muted-soft ring-1 ring-line ring-inset',
};

const LEGEND: { state: DayAvailabilityState; label: string }[] = [
  { state: 'available', label: 'Disponible' },
  { state: 'partial', label: 'Parcial' },
  { state: 'blocked', label: 'Bloqueado' },
  { state: 'no_schedule', label: 'Sin horario' },
];

export function AvailabilityCalendar({
  month,
  rows,
}: {
  month: string;
  rows: AdminAvailabilityRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [rangeOpen, setRangeOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const today = todayInChile();

  const byDay = useMemo(() => {
    const map = new Map<string, AdminAvailabilityRow[]>();
    for (const row of rows) {
      if (!map.has(row.day)) map.set(row.day, []);
      map.get(row.day)!.push(row);
    }
    return map;
  }, [rows]);

  const cells = useMemo(() => buildMonthCells(month), [month]);

  const goMonth = (delta: number) => {
    const next = addMonths(month, delta).slice(0, 7);
    router.push(`/admin/disponibilidad?mes=${next}`);
  };

  const quick = (label: string, action: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      setMessage(result.ok ? (result.message ?? `${label} listo.`) : (result.error ?? 'No se pudo guardar.'));
    });
  };

  const weekendFrom = nextWeekendStart(today);

  return (
    <div className="flex flex-col gap-5">
      {/* Acciones rápidas: lo que ARMONY hace más seguido, en un solo toque. */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <QuickButton
          disabled={pending}
          onClick={() => quick('Bloquear hoy', () => blockDay(today))}
          icon={CalendarOff}
        >
          Bloquear hoy
        </QuickButton>
        <QuickButton
          disabled={pending}
          onClick={() => quick('Bloquear mañana', () => blockDay(addDays(today, 1)))}
          icon={CalendarOff}
        >
          Bloquear mañana
        </QuickButton>
        <QuickButton
          disabled={pending}
          onClick={() =>
            quick('Bloquear fin de semana', () =>
              import('@/app/admin/actions').then((m) => {
                const fd = new FormData();
                fd.set('from', weekendFrom);
                fd.set('to', addDays(weekendFrom, 1));
                fd.set('reason', 'Fin de semana');
                return m.blockRange(fd);
              }),
            )
          }
          icon={CalendarOff}
        >
          Bloquear fin de semana
        </QuickButton>
        <QuickButton disabled={pending} onClick={() => setRangeOpen(true)} icon={CalendarOff}>
          Bloquear un rango
        </QuickButton>
        <QuickButton
          disabled={pending}
          onClick={() =>
            quick('Restaurar horario habitual', () =>
              restoreRange(startOfMonth(month), endOfMonth(month)),
            )
          }
          icon={RotateCcw}
        >
          Restaurar este mes
        </QuickButton>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900"
        >
          {message}
        </p>
      )}

      <div className="rounded-2xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => goMonth(-1)}
            aria-label="Mes anterior"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink hover:bg-surface"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p className="text-[0.9375rem] font-semibold text-ink capitalize">
            {formatMonthTitle(month)}
          </p>
          <button
            type="button"
            onClick={() => goMonth(1)}
            aria-label="Mes siguiente"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink hover:bg-surface"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1" aria-hidden="true">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <span key={d} className="py-1 text-center text-[0.6875rem] font-semibold text-muted-soft">
              {d}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((cell, index) => {
            if (!cell) return <span key={`e-${index}`} aria-hidden="true" />;
            const dayRows = byDay.get(cell) ?? [];
            const state = dayState(dayRows);
            const past = cell < today;
            const booked = dayRows.reduce((sum, r) => sum + r.booked, 0);

            return (
              <button
                key={cell}
                type="button"
                disabled={past}
                onClick={() => setSelectedDay(cell)}
                aria-label={`Editar disponibilidad del ${cell}`}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-xl text-[0.9375rem] font-semibold transition-colors',
                  past ? 'bg-white text-muted-soft/50' : STATE_STYLES[state],
                  !past && 'hover:brightness-[0.97]',
                  cell === today && 'ring-2 ring-brand-600',
                )}
              >
                {Number(cell.slice(8, 10))}
                {booked > 0 && !past && (
                  <span className="mt-0.5 text-[0.5625rem] leading-none font-bold opacity-80">
                    {booked}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-line pt-3">
          {LEGEND.map((item) => (
            <li key={item.state} className="flex items-center gap-1.5 text-xs text-muted">
              <span
                aria-hidden="true"
                className={cn('h-3 w-3 rounded', STATE_STYLES[item.state])}
              />
              {item.label}
            </li>
          ))}
        </ul>

        <p className="mt-2 text-xs text-muted">
          El número pequeño indica cuántas solicitudes hay ese día. Toca un día para editarlo.
        </p>
      </div>

      {pending && (
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      )}

      <DayEditorSheet date={selectedDay} rows={rows} onClose={() => setSelectedDay(null)} />
      <BlockRangeSheet open={rangeOpen} onClose={() => setRangeOpen(false)} />
    </div>
  );
}

function QuickButton({
  children,
  onClick,
  disabled,
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-55"
    >
      <Icon className="h-4 w-4 text-muted" />
      {children}
    </button>
  );
}

function dayState(rows: AdminAvailabilityRow[]): DayAvailabilityState {
  if (rows.length === 0) return 'no_schedule';
  if (rows.every((r) => r.day_blocked)) return 'blocked';
  const open = rows.filter((r) => r.is_available);
  if (open.length === 0) return 'no_schedule';
  if (open.length < rows.length) return 'partial';
  return 'available';
}

function buildMonthCells(monthISO: string): (string | null)[] {
  const first = startOfMonth(monthISO);
  const year = Number(first.slice(0, 4));
  const monthIndex = Number(first.slice(5, 7)) - 1;
  const total = daysInMonth(year, monthIndex);
  const leading = (dayOfWeek(first) + 6) % 7;

  const cells: (string | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= total; d++) {
    cells.push(`${first.slice(0, 8)}${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/** Sábado de la semana en curso, o el siguiente si ya pasó. */
function nextWeekendStart(today: string): string {
  const saturday = addDays(startOfWeek(today), 5);
  return saturday >= today ? saturday : addDays(endOfWeek(today), 6);
}
