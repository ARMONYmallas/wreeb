'use client';

import { useState, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import { blockRange } from '@/app/admin/actions';
import { Sheet } from '@/components/ui/Sheet';
import { Input, Select } from '@/components/ui/Field';
import { addDays, todayInChile } from '@/lib/date';

const REASONS = ['Vacaciones', 'Feriado', 'Agenda completa', 'Trabajo fuera de Santiago', 'Personal'];

export function BlockRangeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = todayInChile();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Bloquear varios días"
      description="Esos días dejan de aparecer para los clientes."
    >
      <form
        id="bloquear-rango"
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            const result = await blockRange(formData);
            if (!result.ok) setError(result.error);
            else onClose();
          });
        }}
        className="flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="from"
            type="date"
            label="Desde"
            required
            min={today}
            defaultValue={today}
            data-autofocus
          />
          <Input
            name="to"
            type="date"
            label="Hasta"
            required
            min={today}
            defaultValue={addDays(today, 1)}
          />
        </div>

        <Select name="reason" label="Motivo" optional defaultValue="">
          <option value="">Sin motivo</option>
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </Select>

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
          Bloquear fechas
        </button>
      </form>
    </Sheet>
  );
}
