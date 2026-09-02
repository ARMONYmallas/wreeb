import Link from 'next/link';
import { ChevronRight, Clock, MapPin } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { formatRange } from '@/lib/date';
import { formatPhoneForDisplay } from '@/lib/validation';
import { SERVICE_LABELS_SHORT, SPACE_LABELS, type AppointmentWithSlot } from '@/types';

export function AppointmentCard({
  appointment,
  showDate,
}: {
  appointment: AppointmentWithSlot;
  showDate?: string;
}) {
  return (
    <Link
      href={`/admin/solicitudes/${appointment.id}`}
      className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-colors hover:border-line-strong hover:bg-surface"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-ink">{appointment.name}</p>
          <StatusBadge status={appointment.status} />
        </div>

        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {appointment.commune}
          </span>
          <span>
            {SERVICE_LABELS_SHORT[appointment.service_type]} ·{' '}
            {SPACE_LABELS[appointment.space_type]}
          </span>
        </p>

        <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-soft">
          {showDate && <span>{showDate}</span>}
          {appointment.time_slot && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
              {formatRange(appointment.time_slot.start_time, appointment.time_slot.end_time)}
            </span>
          )}
          <span>{formatPhoneForDisplay(appointment.phone)}</span>
        </p>
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-muted-soft" aria-hidden="true" />
    </Link>
  );
}
