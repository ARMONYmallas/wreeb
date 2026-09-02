'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2, MapPinHouse } from 'lucide-react';
import { saveCustomerDetails } from '@/app/admin/actions';
import { Input, Textarea } from '@/components/ui/Field';
import type { AppointmentWithSlot } from '@/types';

/**
 * Datos que ARMONY completa después del primer contacto.
 * Nunca se le piden al cliente al agendar: eso agregaría fricción.
 */
export function CustomerDetailsForm({ appointment }: { appointment: AppointmentWithSlot }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-ink">
        <MapPinHouse className="h-[1.125rem] w-[1.125rem] text-brand-600" aria-hidden="true" />
        Datos de la visita
      </h2>
      <p className="mt-1 text-sm text-muted">
        Completa esto cuando lo coordines por WhatsApp.
      </p>

      <form
        action={(formData) => {
          setStatus(null);
          startTransition(async () => {
            const result = await saveCustomerDetails(appointment.id, formData);
            setStatus(
              result.ok
                ? { ok: true, message: result.message ?? 'Guardado.' }
                : { ok: false, message: result.error },
            );
          });
        }}
        className="mt-4 flex flex-col gap-4"
      >
        <Input
          name="address"
          label="Dirección"
          defaultValue={appointment.address ?? ''}
          placeholder="Calle y número"
          autoComplete="off"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            name="apartment"
            label="Departamento"
            defaultValue={appointment.apartment ?? ''}
            placeholder="Ej: 802"
            autoComplete="off"
          />
          <Input
            name="floor"
            label="Piso"
            defaultValue={appointment.floor ?? ''}
            placeholder="Ej: 8"
            autoComplete="off"
          />
        </div>

        <Input
          name="reference"
          label="Referencia"
          defaultValue={appointment.reference ?? ''}
          placeholder="Cómo llegar, portería, estacionamiento…"
          autoComplete="off"
        />

        <Input
          name="windowCount"
          label="Cantidad de ventanas"
          type="number"
          inputMode="numeric"
          min={0}
          max={200}
          defaultValue={appointment.window_count ?? ''}
          autoComplete="off"
        />

        <Textarea
          name="details"
          label="Detalles"
          defaultValue={appointment.details ?? ''}
          placeholder="Medidas aproximadas, tipo de instalación, observaciones…"
        />

        <div className="flex items-center justify-between gap-3">
          {status ? (
            <p
              role="status"
              className={
                status.ok
                  ? 'inline-flex items-center gap-1.5 text-sm font-medium text-brand-700'
                  : 'text-sm font-medium text-red-700'
              }
            >
              {status.ok && <Check className="h-4 w-4" aria-hidden="true" />}
              {status.message}
            </p>
          ) : (
            <span />
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar datos
          </button>
        </div>
      </form>
    </section>
  );
}
