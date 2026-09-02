'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Check, MessageCircle } from 'lucide-react';
import { business } from '@/config/business';
import { formatLongDate } from '@/lib/date';
import { successMessage } from '@/lib/whatsapp';
import { SERVICE_LABELS, SPACE_LABELS, type ServiceType, type SpaceType } from '@/types';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';

export type BookingResult = {
  requestNumber: string;
  name: string;
  spaceType: SpaceType;
  serviceType: ServiceType;
  commune: string;
  preferredDate: string;
  timeSlot: { startTime: string; endTime: string; label: string | null } | null;
};

/**
 * Solicitud recibida — NO confirmada.
 * ARMONY revisa la disponibilidad y confirma después.
 */
export function SuccessScreen({ result }: { result: BookingResult }) {
  useEffect(() => {
    // Evita que el usuario reenvíe el formulario con el botón atrás.
    window.history.replaceState(null, '', '/agendar');
    // Si venía con la página desplazada, la confirmación se ve desde arriba.
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const rows = [
    { label: 'Servicio', value: SERVICE_LABELS[result.serviceType] },
    { label: 'Espacio', value: SPACE_LABELS[result.spaceType] },
    { label: 'Comuna', value: result.commune },
    { label: 'Fecha preferida', value: capitalize(formatLongDate(result.preferredDate)) },
    {
      label: 'Horario preferido',
      value: result.timeSlot ? `${result.timeSlot.startTime}–${result.timeSlot.endTime}` : '—',
    },
    { label: 'Número de solicitud', value: result.requestNumber },
  ];

  return (
    <div className="animate-rise">
      <div className="text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-600 text-white">
          <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-3xl font-bold text-ink">¡Solicitud recibida!</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-muted">
          Gracias, {result.name}. Recibimos correctamente tu solicitud. Nuestro equipo revisará la
          información y se pondrá en contacto contigo para confirmar la visita.
        </p>
      </div>

      <dl className="mt-8 divide-y divide-line overflow-hidden rounded-3xl border border-line bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4 px-5 py-3.5">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="text-right text-sm font-semibold text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        <WhatsAppLink
          location="exito"
          message={successMessage({
            name: result.name,
            serviceLabel: SERVICE_LABELS[result.serviceType],
            commune: result.commune,
            dateISO: result.preferredDate,
          })}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-base font-semibold text-white transition-colors hover:bg-brand-700"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Hablar con {business.name} por WhatsApp
        </WhatsAppLink>

        <Link
          href="/"
          className="inline-flex h-14 items-center justify-center rounded-full border border-line-strong bg-white px-7 text-base font-semibold text-ink transition-colors hover:bg-surface"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
