import Link from 'next/link';
import { CalendarDays, Lock } from 'lucide-react';
import { agendaRange, getAdminAvailability, listAppointments } from '@/lib/admin/queries';
import { formatLongDate, formatTime, relativeDayLabel, todayInChile } from '@/lib/date';
import { APPOINTMENT_STATUSES, type AppointmentStatus, type AppointmentWithSlot } from '@/types';
import { AppointmentCard } from '@/components/admin/AppointmentCard';
import { EmptyState, PageHeader } from '@/components/admin/PageHeader';
import type { AdminAvailabilityRow } from '@/lib/admin/queries';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

const SCOPES = [
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
] as const;

const STATUS_FILTERS = [
  { id: 'all', label: 'Todas' },
  { id: 'new', label: 'Nuevas' },
  { id: 'confirmed', label: 'Confirmadas' },
  { id: 'pending', label: 'Pendientes' },
] as const;

type Scope = (typeof SCOPES)[number]['id'];
type StatusFilter = (typeof STATUS_FILTERS)[number]['id'];

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ rango?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const scope: Scope = SCOPES.some((s) => s.id === params.rango) ? (params.rango as Scope) : 'week';
  const statusFilter: StatusFilter = STATUS_FILTERS.some((s) => s.id === params.estado)
    ? (params.estado as StatusFilter)
    : 'all';

  const { from, to } = agendaRange(scope);

  const [appointments, availability] = await Promise.all([
    listAppointments({ from, to, limit: 300 }),
    getAdminAvailability(from, to),
  ]);

  const visible = appointments.filter((a) => matchesFilter(a.status, statusFilter));

  // Se muestran los días que tienen visitas o algún bloque configurado.
  const days = new Set<string>([
    ...visible.map((a) => a.preferred_date),
    ...availability.map((r) => r.day),
  ]);
  const orderedDays = [...days].sort();

  const byDay = new Map<string, AppointmentWithSlot[]>();
  for (const appointment of visible) {
    const list = byDay.get(appointment.preferred_date) ?? [];
    list.push(appointment);
    byDay.set(appointment.preferred_date, list);
  }

  const availabilityByDay = new Map<string, AdminAvailabilityRow[]>();
  for (const row of availability) {
    const list = availabilityByDay.get(row.day) ?? [];
    list.push(row);
    availabilityByDay.set(row.day, list);
  }

  const today = todayInChile();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agenda"
        description={`${visible.length} ${visible.length === 1 ? 'solicitud' : 'solicitudes'} en el período.`}
        action={
          <Link
            href="/admin/disponibilidad"
            className="inline-flex h-11 items-center justify-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Editar disponibilidad
          </Link>
        }
      />

      <div className="flex flex-col gap-2.5">
        <FilterRow items={SCOPES} active={scope} paramName="rango" other={`estado=${statusFilter}`} />
        <FilterRow items={STATUS_FILTERS} active={statusFilter} paramName="estado" other={`rango=${scope}`} />
      </div>

      {orderedDays.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nada agendado en este período."
          description="Cuando entren solicitudes las verás organizadas por día y bloque."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {orderedDays.map((day) => {
            const dayAppointments = byDay.get(day) ?? [];
            const daySlots = availabilityByDay.get(day) ?? [];
            const blocked = daySlots.length > 0 && daySlots.every((s) => s.day_blocked);

            // Días sin visitas ni bloques abiertos no aportan nada a la lista.
            if (dayAppointments.length === 0 && !blocked && daySlots.every((s) => !s.is_available)) {
              return null;
            }

            return (
              <section key={day}>
                <h2 className="flex items-baseline gap-2 text-lg font-semibold text-ink">
                  <span className={cn(day === today && 'text-brand-700')}>
                    {relativeDayLabel(day) ?? capitalize(formatLongDate(day))}
                  </span>
                  {relativeDayLabel(day) && (
                    <span className="text-sm font-normal text-muted">{formatLongDate(day)}</span>
                  )}
                </h2>

                {/* Resumen por bloque: lo primero que se quiere ver en el celular. */}
                <ul className="mt-3 flex flex-col gap-1.5">
                  {blocked ? (
                    <li className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-800">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      Día bloqueado
                    </li>
                  ) : (
                    daySlots.map((slot) => {
                      const count = dayAppointments.filter(
                        (a) => a.time_slot_id === slot.slot_id,
                      ).length;
                      return (
                        <li
                          key={slot.slot_id}
                          className={cn(
                            'flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm',
                            slot.is_available
                              ? 'border-line bg-white'
                              : 'border-dashed border-line-strong bg-surface text-muted',
                          )}
                        >
                          <span className="font-semibold">
                            {formatTime(slot.start_time)}–{formatTime(slot.end_time)}
                          </span>
                          <span className={slot.is_available ? 'text-muted' : ''}>
                            {!slot.is_available
                              ? 'Bloqueado'
                              : count === 0
                                ? `Sin solicitudes · ${slot.capacity} ${slot.capacity === 1 ? 'cupo' : 'cupos'}`
                                : `${count} de ${slot.capacity} ${count === 1 ? 'solicitud' : 'solicitudes'}`}
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>

                {dayAppointments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-2.5">
                    {dayAppointments
                      .slice()
                      .sort((a, b) =>
                        (a.time_slot?.start_time ?? '').localeCompare(b.time_slot?.start_time ?? ''),
                      )
                      .map((appointment) => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterRow<T extends string>({
  items,
  active,
  paramName,
  other,
}: {
  items: readonly { id: T; label: string }[];
  active: T;
  paramName: string;
  other: string;
}) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/admin/agenda?${other}&${paramName}=${item.id}`}
          aria-current={active === item.id ? 'page' : undefined}
          className={cn(
            'inline-flex h-10 shrink-0 items-center rounded-full border px-4 text-sm font-semibold transition-colors',
            active === item.id
              ? 'border-brand-600 bg-brand-600 text-white'
              : 'border-line bg-white text-ink-soft hover:bg-surface',
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function matchesFilter(status: AppointmentStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return APPOINTMENT_STATUSES.includes(status);
  if (filter === 'pending') return status === 'new' || status === 'contacted' || status === 'reschedule';
  return status === filter;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
