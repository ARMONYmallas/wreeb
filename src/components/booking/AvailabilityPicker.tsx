'use client';

import { useMemo, useState } from 'react';
import { CalendarX2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  DAY_NAMES_SHORT,
  addMonths,
  dayOfWeek,
  daysInMonth,
  formatLongDate,
  formatMonthTitle,
  relativeDayLabel,
  startOfMonth,
  todayInChile,
} from '@/lib/date';
import { cn } from '@/lib/cn';
import type { PublicDay } from '@/types';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';

/**
 * Calendario del cliente.
 *
 * Sólo muestra lo que ARMONY habilitó: fechas pasadas, días bloqueados,
 * horarios deshabilitados y bloques sin cupo simplemente no aparecen.
 */
export function AvailabilityPicker({
  days,
  loading,
  selectedDate,
  selectedSlotId,
  onSelect,
  error,
}: {
  days: PublicDay[];
  loading: boolean;
  selectedDate: string;
  selectedSlotId: string;
  onSelect: (date: string, slotId: string) => void;
  error?: string;
}) {
  const today = todayInChile();
  const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);

  const firstAvailable = days[0]?.date;
  const lastAvailable = days[days.length - 1]?.date;

  const [month, setMonth] = useState(() =>
    startOfMonth(selectedDate || firstAvailable || today),
  );

  const monthCells = useMemo(() => buildMonthCells(month), [month]);
  const selectedDay = selectedDate ? byDate.get(selectedDate) : undefined;

  const canGoBack = month > startOfMonth(today);
  const canGoForward = lastAvailable ? month < startOfMonth(lastAvailable) : false;

  if (loading) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-3xl border border-line bg-surface">
        <span className="inline-flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Buscando horarios disponibles…
        </span>
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-surface p-6 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-muted ring-1 ring-line">
          <CalendarX2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-4 text-[0.9375rem] font-semibold text-ink">
          Por ahora no tenemos horarios publicados.
        </p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
          Escríbenos por WhatsApp y coordinamos la visita contigo directamente.
        </p>
        <WhatsAppLink
          location="agenda_sin_disponibilidad"
          message="Hola ARMONY 👋 Quiero solicitar una visita, pero no vi horarios disponibles en la página."
          className="mt-5 inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-white px-6 text-sm font-semibold text-ink"
        >
          Hablar por WhatsApp
        </WhatsAppLink>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, -1))}
            disabled={!canGoBack}
            aria-label="Mes anterior"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface disabled:opacity-35"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <p aria-live="polite" className="text-[0.9375rem] font-semibold text-ink capitalize">
            {formatMonthTitle(month)}
          </p>
          <button
            type="button"
            onClick={() => setMonth(addMonths(month, 1))}
            disabled={!canGoForward}
            aria-label="Mes siguiente"
            className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface disabled:opacity-35"
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
          {monthCells.map((cell, i) => {
            if (!cell) return <span key={`e-${i}`} aria-hidden="true" />;
            const available = byDate.has(cell);
            const isSelected = cell === selectedDate;
            const dayNum = Number(cell.slice(8, 10));
            return (
              <button
                key={cell}
                type="button"
                disabled={!available}
                aria-pressed={isSelected}
                aria-label={`${formatLongDate(cell)}${available ? '' : ', sin horarios disponibles'}`}
                onClick={() => {
                  const day = byDate.get(cell);
                  if (!day) return;
                  // Si sólo queda un bloque, se selecciona solo.
                  onSelect(cell, day.slots.length === 1 ? day.slots[0].slotId : '');
                }}
                className={cn(
                  'relative flex aspect-square items-center justify-center rounded-xl text-[0.9375rem] font-medium transition-colors',
                  isSelected && 'bg-brand-600 font-semibold text-white',
                  !isSelected && available && 'bg-brand-50 text-brand-800 hover:bg-brand-100',
                  !available && 'text-muted-soft/60',
                  cell === today && !isSelected && 'ring-1 ring-brand-300 ring-inset',
                )}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-xs text-muted">
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded bg-brand-50 ring-1 ring-brand-200" />
          Días con horarios disponibles
        </p>
      </div>

      {selectedDay && (
        <div className="animate-rise mt-5">
          <p className="text-[0.9375rem] font-semibold text-ink">
            Horarios para el{' '}
            <span className="text-brand-700">
              {relativeDayLabel(selectedDay.date)?.toLowerCase() ?? formatLongDate(selectedDay.date)}
            </span>
          </p>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {selectedDay.slots.map((slot) => {
              const active = slot.slotId === selectedSlotId;
              return (
                <button
                  key={slot.slotId}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelect(selectedDay.date, slot.slotId)}
                  className={cn(
                    'flex h-14 items-center justify-between gap-3 rounded-2xl border px-4 text-left transition-colors',
                    active
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-line bg-white text-ink hover:border-brand-300 hover:bg-brand-50',
                  )}
                >
                  <span className="text-[0.9375rem] font-semibold">
                    {slot.startTime}–{slot.endTime}
                  </span>
                  {slot.label && (
                    <span className={cn('text-xs', active ? 'text-brand-100' : 'text-muted')}>
                      {slot.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

/** Celdas del mes con lunes como primer día. */
function buildMonthCells(monthISO: string): (string | null)[] {
  const first = startOfMonth(monthISO);
  const year = Number(first.slice(0, 4));
  const monthIndex = Number(first.slice(5, 7)) - 1;
  const total = daysInMonth(year, monthIndex);

  const firstDow = dayOfWeek(first); // 0 = domingo
  const leading = (firstDow + 6) % 7; // lunes = 0

  const cells: (string | null)[] = Array(leading).fill(null);
  for (let d = 1; d <= total; d++) {
    cells.push(`${first.slice(0, 8)}${String(d).padStart(2, '0')}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export { DAY_NAMES_SHORT };
