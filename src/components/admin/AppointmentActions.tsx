'use client';

import { useState } from 'react';
import { Mail, MessageCircle, Phone } from 'lucide-react';
import { StatusActions } from './StatusActions';
import { RescheduleDialog } from './RescheduleDialog';
import { firstContactMessage, whatsappLink } from '@/lib/whatsapp';
import { SERVICE_LABELS, type AppointmentWithSlot } from '@/types';

/** Barra de acciones de la ficha: contactar, cambiar estado y reprogramar. */
export function AppointmentActions({ appointment }: { appointment: AppointmentWithSlot }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  const wa = whatsappLink(
    firstContactMessage({
      name: appointment.name,
      serviceLabel: SERVICE_LABELS[appointment.service_type],
    }),
    appointment.phone,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl bg-brand-600 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <MessageCircle className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
            WhatsApp
          </a>
        )}
        <a
          href={`tel:+${appointment.phone}`}
          className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white text-xs font-semibold text-ink transition-colors hover:bg-surface"
        >
          <Phone className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
          Llamar
        </a>
        {appointment.email ? (
          <a
            href={`mailto:${appointment.email}`}
            className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-line bg-white text-xs font-semibold text-ink transition-colors hover:bg-surface"
          >
            <Mail className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
            Email
          </a>
        ) : (
          <span className="flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line bg-white text-xs font-medium text-muted-soft">
            <Mail className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
            Sin email
          </span>
        )}
      </div>

      <StatusActions
        appointmentId={appointment.id}
        current={appointment.status}
        onRequestReschedule={() => setRescheduleOpen(true)}
      />

      <RescheduleDialog
        open={rescheduleOpen}
        onClose={() => setRescheduleOpen(false)}
        appointmentId={appointment.id}
        customerName={appointment.name}
        customerPhone={appointment.phone}
      />
    </div>
  );
}
