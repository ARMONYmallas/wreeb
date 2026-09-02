import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, History } from 'lucide-react';
import {
  getAppointment,
  getAppointmentEvents,
  getAppointmentNotes,
  getAppointmentPhotos,
} from '@/lib/admin/queries';
import { formatDateTime, formatLongDate, formatRange } from '@/lib/date';
import { formatPhoneForDisplay } from '@/lib/validation';
import { SERVICE_LABELS, SPACE_LABELS, STATUS_LABELS } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { AppointmentActions } from '@/components/admin/AppointmentActions';
import { CustomerDetailsForm } from '@/components/admin/CustomerDetailsForm';
import { NotesPanel } from '@/components/admin/NotesPanel';
import { PhotoGrid } from '@/components/admin/PhotoGrid';

export const dynamic = 'force-dynamic';

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const appointment = await getAppointment(id);
  if (!appointment) notFound();

  const [photos, notes, events] = await Promise.all([
    getAppointmentPhotos(id),
    getAppointmentNotes(id),
    getAppointmentEvents(id),
  ]);

  const rows: [string, string][] = [
    ['WhatsApp', formatPhoneForDisplay(appointment.phone)],
    ['Email', appointment.email ?? 'No indicado'],
    ['Región', appointment.region_name],
    ['Comuna', appointment.commune],
    ['Servicio', SERVICE_LABELS[appointment.service_type]],
    ['Espacio', SPACE_LABELS[appointment.space_type]],
    ['Fecha preferida', capitalize(formatLongDate(appointment.preferred_date))],
    [
      'Horario preferido',
      appointment.time_slot
        ? formatRange(appointment.time_slot.start_time, appointment.time_slot.end_time)
        : 'Sin horario',
    ],
    ['Recibida', formatDateTime(appointment.created_at)],
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/admin/solicitudes"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Solicitudes
      </Link>

      <header className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-ink">{appointment.name}</h1>
            <p className="mt-1 text-sm text-muted">
              {appointment.request_number} · {appointment.commune}
            </p>
          </div>
          <StatusBadge status={appointment.status} />
        </div>

        <div className="mt-5">
          <AppointmentActions appointment={appointment} />
        </div>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="font-semibold text-ink">Solicitud</h2>
        <dl className="mt-3 divide-y divide-line">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="text-right text-sm font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        {appointment.customer_notes && (
          <div className="mt-4 rounded-xl bg-surface p-4">
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              Comentario del cliente
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              {appointment.customer_notes}
            </p>
          </div>
        )}
      </section>

      <PhotoGrid photos={photos} />

      <CustomerDetailsForm appointment={appointment} />

      <NotesPanel appointmentId={appointment.id} notes={notes} />

      {events.length > 0 && (
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-semibold text-ink">
            <History className="h-[1.125rem] w-[1.125rem] text-brand-600" aria-hidden="true" />
            Historial
          </h2>
          <ol className="mt-4 flex flex-col gap-3">
            {events.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-300"
                />
                <div className="min-w-0">
                  <p className="text-sm text-ink-soft">{describeEvent(event)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {event.author_email ? `${event.author_email} · ` : ''}
                    {formatDateTime(event.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function describeEvent(event: {
  type: string;
  from_status: string | null;
  to_status: string | null;
}): string {
  if (event.type === 'created') return 'Solicitud recibida desde la web.';
  if (event.type === 'rescheduled') return 'Visita reprogramada.';
  if (event.type === 'details_updated') return 'Se actualizaron los datos de la visita.';
  if (event.type === 'status_changed') {
    const to = event.to_status ? STATUS_LABELS[event.to_status as keyof typeof STATUS_LABELS] : '—';
    const from = event.from_status
      ? STATUS_LABELS[event.from_status as keyof typeof STATUS_LABELS]
      : null;
    return from ? `Estado: ${from} → ${to}.` : `Estado: ${to}.`;
  }
  return event.type;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
