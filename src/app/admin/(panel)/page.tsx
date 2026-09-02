import Link from 'next/link';
import { CalendarCheck, CalendarDays, CalendarRange, Inbox, PhoneCall } from 'lucide-react';
import { getDashboardData } from '@/lib/admin/queries';
import { formatShortDate, relativeDayLabel } from '@/lib/date';
import { AppointmentCard } from '@/components/admin/AppointmentCard';
import { EmptyState, PageHeader } from '@/components/admin/PageHeader';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { newAppointments, todayVisits, upcoming, pendingCount } = await getDashboardData();

  const stats = [
    { label: 'Solicitudes nuevas', value: newAppointments.length, icon: Inbox, href: '/admin/solicitudes?estado=new' },
    { label: 'Visitas de hoy', value: todayVisits.length, icon: CalendarCheck, href: '/admin/agenda?rango=today' },
    { label: 'Próximas visitas', value: upcoming.length, icon: CalendarDays, href: '/admin/agenda?rango=week' },
    { label: 'Por contactar', value: pendingCount, icon: PhoneCall, href: '/admin/solicitudes?estado=new' },
  ];

  return (
    <div className="flex flex-col gap-7">
      <PageHeader title="Inicio" description="Resumen de tu día." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-2xl border border-line bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50"
          >
            <stat.icon className="h-5 w-5 text-brand-600" aria-hidden="true" strokeWidth={1.8} />
            <p className="mt-3 font-display text-3xl leading-none font-bold text-ink">{stat.value}</p>
            <p className="mt-1.5 text-xs leading-tight font-medium text-muted">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Accesos rápidos: lo que ARMONY necesita hacer desde el celular. */}
      <div className="grid gap-2.5 sm:grid-cols-3">
        <QuickAction href="/admin/agenda" icon={CalendarDays} label="Ver agenda" />
        <QuickAction href="/admin/disponibilidad" icon={CalendarRange} label="Editar disponibilidad" primary />
        <QuickAction href="/admin/solicitudes?estado=new" icon={Inbox} label="Nuevas solicitudes" />
      </div>

      <section>
        <h2 className="text-lg font-semibold text-ink">Visitas de hoy</h2>
        <div className="mt-3 flex flex-col gap-2.5">
          {todayVisits.length === 0 ? (
            <EmptyState icon={CalendarCheck} title="No hay visitas para hoy." />
          ) : (
            todayVisits.map((a) => <AppointmentCard key={a.id} appointment={a} />)
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Solicitudes nuevas</h2>
          <Link href="/admin/solicitudes" className="text-sm font-semibold text-brand-700">
            Ver todas
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {newAppointments.length === 0 ? (
            <EmptyState icon={Inbox} title="Sin solicitudes nuevas." description="Aquí aparecerán apenas alguien agende desde la web." />
          ) : (
            newAppointments
              .slice(0, 6)
              .map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  showDate={relativeDayLabel(a.preferred_date) ?? formatShortDate(a.preferred_date)}
                />
              ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-ink">Próximas visitas</h2>
          <Link href="/admin/agenda?rango=week" className="text-sm font-semibold text-brand-700">
            Ver agenda
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          {upcoming.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No hay visitas próximas." />
          ) : (
            upcoming
              .slice(0, 6)
              .map((a) => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  showDate={relativeDayLabel(a.preferred_date) ?? formatShortDate(a.preferred_date)}
                />
              ))
          )}
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  primary,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? 'flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700'
          : 'flex h-14 items-center justify-center gap-2 rounded-2xl border border-line bg-white px-4 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface'
      }
    >
      <Icon className="h-5 w-5" strokeWidth={1.8} />
      {label}
    </Link>
  );
}
