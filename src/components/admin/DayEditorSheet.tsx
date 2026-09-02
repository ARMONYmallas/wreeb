'use client';

import { useEffect, useState, useTransition } from 'react';
import { CalendarCheck2, CalendarX2, Loader2, SlidersHorizontal } from 'lucide-react';
import { blockDay, customizeDay, restoreDefaultSchedule } from '@/app/admin/actions';
import { Sheet } from '@/components/ui/Sheet';
import { Switch } from '@/components/ui/Switch';
import { formatLongDate, formatTime, relativeDayLabel } from '@/lib/date';
import type { AdminAvailabilityRow } from '@/lib/admin/queries';
import { cn } from '@/lib/cn';

type Mode = 'menu' | 'custom';

/**
 * Editor de un solo día.
 *
 * Tres opciones, en el lenguaje del negocio: usar el horario habitual,
 * personalizar ese día o bloquearlo completo. Bloquear mañana toma dos toques.
 */
export function DayEditorSheet({
  date,
  rows,
  onClose,
}: {
  date: string | null;
  rows: AdminAvailabilityRow[];
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>('menu');
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const dayRows = date ? rows.filter((r) => r.day === date) : [];
  const isBlocked = dayRows.length > 0 && dayRows.every((r) => r.day_blocked);
  const isCustom = dayRows.some((r) => r.is_custom);

  useEffect(() => {
    if (!date) return;
    setMode('menu');
    setError(null);
    setDraft(Object.fromEntries(dayRows.map((r) => [r.slot_id, r.is_available])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  if (!date) return null;

  const run = (action: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setError(result.error ?? 'No se pudo guardar.');
      else onClose();
    });
  };

  const relative = relativeDayLabel(date);
  const subtitle = relative ? `${relative}, ${formatLongDate(date)}` : capitalize(formatLongDate(date));
  // "de hoy" / "de mañana" / "del viernes 18 de septiembre"
  const sheetTitle = relative
    ? `Disponibilidad de ${relative.toLowerCase()}`
    : `Disponibilidad del ${formatLongDate(date)}`;

  const bookedTotal = dayRows.reduce((sum, r) => sum + r.booked, 0);

  return (
    <Sheet
      open
      onClose={onClose}
      title={sheetTitle}
      description={subtitle}
      footer={
        mode === 'custom' ? (
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setMode('menu')}
              className="h-13 flex-1 rounded-full border border-line-strong bg-white text-[0.9375rem] font-semibold text-ink"
            >
              Volver
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(() =>
                  customizeDay(
                    date,
                    dayRows.map((r) => ({ slotId: r.slot_id, isActive: draft[r.slot_id] ?? false })),
                  ),
                )
              }
              className="inline-flex h-13 flex-[1.4] items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Guardar
            </button>
          </div>
        ) : undefined
      }
    >
      {bookedTotal > 0 && (
        <p className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
          Este día ya tiene {bookedTotal} {bookedTotal === 1 ? 'solicitud' : 'solicitudes'}. Si lo
          bloqueas, las visitas no se borran: recuerda avisar y reprogramar.
        </p>
      )}

      {mode === 'menu' ? (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-muted">
            {isBlocked
              ? 'Hoy este día está bloqueado.'
              : isCustom
                ? 'Este día tiene un horario personalizado.'
                : 'Este día usa el horario habitual.'}
          </p>

          <OptionRow
            icon={CalendarCheck2}
            title="Usar horario habitual"
            description="Vuelve al horario normal de la semana."
            active={!isBlocked && !isCustom}
            disabled={pending}
            onClick={() => run(() => restoreDefaultSchedule(date))}
          />

          <OptionRow
            icon={SlidersHorizontal}
            title="Personalizar este día"
            description="Elige qué bloques quedan disponibles sólo en esta fecha."
            active={isCustom}
            disabled={pending}
            onClick={() => setMode('custom')}
          />

          <OptionRow
            icon={CalendarX2}
            title="Bloquear día completo"
            description="Este día deja de aparecer para los clientes."
            active={isBlocked}
            danger
            disabled={pending}
            onClick={() => run(() => blockDay(date))}
          />

          {pending && (
            <p className="inline-flex items-center gap-2 text-sm text-muted">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Guardando…
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <p className="text-sm text-muted">
            Los cambios afectan sólo a esta fecha. El horario habitual no se modifica.
          </p>
          {dayRows.map((row) => (
            <Switch
              key={row.slot_id}
              checked={draft[row.slot_id] ?? false}
              onChange={(next) => setDraft((d) => ({ ...d, [row.slot_id]: next }))}
              label={`${formatTime(row.start_time)}–${formatTime(row.end_time)}`}
              description={[
                row.label,
                `${row.booked} de ${row.capacity} ${row.capacity === 1 ? 'cupo' : 'cupos'} usado${row.booked === 1 ? '' : 's'}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </Sheet>
  );
}

function OptionRow({
  icon: Icon,
  title,
  description,
  active,
  danger,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-autofocus={active ? undefined : true}
      className={cn(
        'flex items-start gap-3.5 rounded-2xl border-2 p-4 text-left transition-colors disabled:opacity-60',
        active
          ? danger
            ? 'border-red-300 bg-red-50'
            : 'border-brand-600 bg-brand-50'
          : 'border-line bg-white hover:bg-surface',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
          active
            ? danger
              ? 'bg-red-600 text-white'
              : 'bg-brand-600 text-white'
            : 'bg-surface text-brand-600',
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{description}</span>
      </span>
    </button>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
