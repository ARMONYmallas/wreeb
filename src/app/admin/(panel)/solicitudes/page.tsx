import { Suspense } from 'react';
import { Inbox } from 'lucide-react';
import { listAppointments } from '@/lib/admin/queries';
import { formatShortDate, relativeDayLabel } from '@/lib/date';
import { AppointmentCard } from '@/components/admin/AppointmentCard';
import { AppointmentFilters } from '@/components/admin/AppointmentFilters';
import { EmptyState, PageHeader } from '@/components/admin/PageHeader';
import { APPOINTMENT_STATUSES, type AppointmentStatus } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; buscar?: string }>;
}) {
  const params = await searchParams;
  const status = (params.estado ?? 'all') as AppointmentStatus | 'all';
  const validStatus = status === 'all' || APPOINTMENT_STATUSES.includes(status) ? status : 'all';

  const appointments = await listAppointments({
    status: validStatus,
    search: params.buscar,
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Solicitudes"
        description={
          appointments.length === 1 ? '1 solicitud' : `${appointments.length} solicitudes`
        }
      />

      <Suspense fallback={<div className="h-28" />}>
        <AppointmentFilters />
      </Suspense>

      <div className="flex flex-col gap-2.5">
        {appointments.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No hay solicitudes que coincidan."
            description="Prueba con otro estado o limpia la búsqueda."
          />
        ) : (
          appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              showDate={
                relativeDayLabel(appointment.preferred_date) ??
                formatShortDate(appointment.preferred_date)
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
