'use client';

import { useFormContext } from 'react-hook-form';
import { Info, RefreshCw } from 'lucide-react';
import type { BookingFormValues } from '@/lib/validation';
import type { PublicDay } from '@/types';
import { Input } from '@/components/ui/Field';
import { AvailabilityPicker } from './AvailabilityPicker';

export function StepThree({
  days,
  loadingDays,
  onRefreshAvailability,
}: {
  days: PublicDay[];
  loadingDays: boolean;
  onRefreshAvailability: () => void;
}) {
  const { register, watch, setValue, formState } = useFormContext<BookingFormValues>();
  const { errors } = formState;

  const preferredDate = watch('preferredDate');
  const timeSlotId = watch('timeSlotId');

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AvailabilityPicker
          days={days}
          loading={loadingDays}
          selectedDate={preferredDate}
          selectedSlotId={timeSlotId}
          error={errors.preferredDate?.message ?? errors.timeSlotId?.message}
          onSelect={(date, slotId) => {
            setValue('preferredDate', date, { shouldValidate: true });
            setValue('timeSlotId', slotId, { shouldValidate: Boolean(slotId) });
          }}
        />

        {days.length > 0 && (
          <button
            type="button"
            onClick={onRefreshAvailability}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition-colors hover:text-brand-700"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Actualizar horarios
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">¿Cómo te contactamos?</h2>

        <Input
          label="Nombre"
          autoComplete="given-name"
          enterKeyHint="next"
          placeholder="Tu nombre"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="WhatsApp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          enterKeyHint="next"
          placeholder="+56 9 1234 5678"
          hint="Te escribimos por aquí para confirmar la visita."
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Correo"
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="done"
          optional
          placeholder="tucorreo@ejemplo.cl"
          hint="Si lo dejas, te enviamos una copia de la solicitud."
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      {/* Campo trampa: invisible para las personas, tentador para los bots. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden opacity-0">
        <label htmlFor="website">No completar</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-4">
          <input
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 rounded border-line-strong text-brand-600 accent-brand-600"
            {...register('consent')}
          />
          <span className="text-sm leading-relaxed text-ink-soft">
            He leído y acepto la{' '}
            <a
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-700 underline underline-offset-2"
            >
              Política de Privacidad
            </a>{' '}
            y autorizo a ARMONY a utilizar mis datos para gestionar esta solicitud.
          </span>
        </label>
        {errors.consent && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {errors.consent.message}
          </p>
        )}
      </div>

      {/* La fecha elegida es una preferencia, no una confirmación. */}
      <p className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm leading-relaxed text-brand-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        La fecha y el horario que elijas son una preferencia. Revisamos la disponibilidad y te
        confirmamos la visita al contactarte.
      </p>
    </div>
  );
}
