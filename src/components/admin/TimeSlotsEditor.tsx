'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteTimeSlot, moveTimeSlot, saveTimeSlot } from '@/app/admin/actions';
import { Sheet } from '@/components/ui/Sheet';
import { Input } from '@/components/ui/Field';
import { Switch } from '@/components/ui/Switch';
import { formatTime } from '@/lib/date';
import type { TimeSlot } from '@/types';
import { cn } from '@/lib/cn';

/**
 * Horarios de visita.
 * Se crean, editan, ordenan y eliminan desde aquí: nada está fijado en el
 * código. Cambiar 09:00–12:00 por 10:00–13:00 es cosa de segundos.
 */
export function TimeSlotsEditor({ slots }: { slots: TimeSlot[] }) {
  const [editing, setEditing] = useState<TimeSlot | 'new' | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const act = (action: () => Promise<{ ok: boolean; error?: string; message?: string }>) => {
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) setMessage(result.error ?? 'No se pudo guardar.');
      else if (result.message) setMessage(result.message);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted">
        Estos son los bloques que verán tus clientes al agendar. Los cupos indican cuántas visitas
        aceptas en ese bloque.
      </p>

      {message && (
        <p
          role="status"
          className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-900"
        >
          {message}
        </p>
      )}

      <ul className="flex flex-col gap-2.5">
        {slots.map((slot, index) => (
          <li
            key={slot.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border bg-white p-4',
              slot.is_active ? 'border-line' : 'border-dashed border-line-strong opacity-70',
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-ink">
                {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                {!slot.is_active && (
                  <span className="ml-2 text-xs font-medium text-muted">Desactivado</span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {[
                  slot.label,
                  `${slot.default_capacity} ${slot.default_capacity === 1 ? 'cupo' : 'cupos'}`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Subir"
                disabled={pending || index === 0}
                onClick={() => act(() => moveTimeSlot(slot.id, 'up'))}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Bajar"
                disabled={pending || index === slots.length - 1}
                onClick={() => act(() => moveTimeSlot(slot.id, 'down'))}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Editar ${formatTime(slot.start_time)}`}
                onClick={() => setEditing(slot)}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-surface"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={`Eliminar ${formatTime(slot.start_time)}`}
                disabled={pending}
                onClick={() => act(() => deleteTimeSlot(slot.id))}
                className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => setEditing('new')}
        className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-white text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface"
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
        Agregar horario
      </button>

      {pending && (
        <p className="inline-flex items-center gap-2 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Guardando…
        </p>
      )}

      <SlotSheet slot={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function SlotSheet({ slot, onClose }: { slot: TimeSlot | 'new' | null; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const editing = slot && slot !== 'new' ? slot : null;
  const [active, setActive] = useState(editing ? editing.is_active : true);

  if (!slot) return null;

  return (
    <Sheet
      open
      onClose={onClose}
      title={editing ? 'Editar horario' : 'Agregar horario'}
      description="Los clientes verán este rango al elegir cuándo prefieren la visita."
    >
      <form
        action={(formData) => {
          setError(null);
          formData.set('isActive', String(active));
          startTransition(async () => {
            const result = await saveTimeSlot(formData);
            if (!result.ok) setError(result.error);
            else onClose();
          });
        }}
        className="flex flex-col gap-4"
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <Input
          name="label"
          label="Nombre"
          optional
          maxLength={40}
          placeholder="Ej: Mañana"
          defaultValue={editing?.label ?? ''}
          data-autofocus
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="startTime"
            type="time"
            label="Desde"
            required
            defaultValue={editing ? formatTime(editing.start_time) : '09:00'}
          />
          <Input
            name="endTime"
            type="time"
            label="Hasta"
            required
            defaultValue={editing ? formatTime(editing.end_time) : '12:00'}
          />
        </div>

        <Input
          name="capacity"
          type="number"
          inputMode="numeric"
          label="Cupos"
          required
          min={0}
          max={50}
          hint="Cuántas visitas aceptas en este bloque. Al llenarse, deja de ofrecerse."
          defaultValue={editing?.default_capacity ?? 2}
        />

        <Switch
          checked={active}
          onChange={setActive}
          label="Horario activo"
          description={active ? 'Se ofrece a los clientes.' : 'No se ofrece a nadie.'}
        />

        {error && (
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Guardar horario
        </button>
      </form>
    </Sheet>
  );
}
