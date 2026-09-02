'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { setWeeklySlot } from '@/app/admin/actions';
import { Switch } from '@/components/ui/Switch';
import { DAY_NAMES, WEEK_ORDER, formatTime } from '@/lib/date';
import type { TimeSlot, WeeklyAvailabilityRow } from '@/types';

/**
 * Horario habitual de la semana.
 * Define la semana normal; las excepciones puntuales se manejan en el
 * calendario y no tocan esto.
 */
export function WeeklyScheduleEditor({
  slots,
  weekly,
}: {
  slots: TimeSlot[];
  weekly: WeeklyAvailabilityRow[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});

  const activeSlots = slots.filter((s) => s.is_active);

  const isActive = (day: number, slotId: string) => {
    const key = `${day}:${slotId}`;
    if (key in optimistic) return optimistic[key];
    return weekly.find((w) => w.day_of_week === day && w.time_slot_id === slotId)?.is_active ?? false;
  };

  const toggle = (day: number, slotId: string, next: boolean) => {
    setError(null);
    setOptimistic((o) => ({ ...o, [`${day}:${slotId}`]: next }));
    startTransition(async () => {
      const result = await setWeeklySlot(day, slotId, next);
      if (!result.ok) {
        setError(result.error);
        setOptimistic((o) => ({ ...o, [`${day}:${slotId}`]: !next }));
      }
    });
  };

  if (activeSlots.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-white px-5 py-8 text-center text-sm text-muted">
        Primero crea al menos un horario en la pestaña &laquo;Horarios&raquo;.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Esta es tu semana normal. Para cerrar un día puntual usa el calendario: no hace falta
        cambiar el horario habitual.
      </p>

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {WEEK_ORDER.map((day) => {
          const activeCount = activeSlots.filter((s) => isActive(day, s.id)).length;
          return (
            <section key={day} className="rounded-2xl border border-line bg-white p-4">
              <div className="flex items-baseline justify-between">
                <h3 className="font-semibold text-ink">{DAY_NAMES[day]}</h3>
                <p className="text-xs font-medium text-muted">
                  {activeCount === 0
                    ? 'No disponible'
                    : `${activeCount} de ${activeSlots.length} bloques`}
                </p>
              </div>

              <div className="mt-3 flex flex-col gap-2">
                {activeSlots.map((slot) => (
                  <Switch
                    key={slot.id}
                    checked={isActive(day, slot.id)}
                    onChange={(next) => toggle(day, slot.id, next)}
                    label={`${formatTime(slot.start_time)}–${formatTime(slot.end_time)}`}
                    description={slot.label ?? undefined}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {pending && (
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      )}
    </div>
  );
}
