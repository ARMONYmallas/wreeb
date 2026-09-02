import Link from 'next/link';
import { getAdminAvailability, listTimeSlots, listWeeklyAvailability } from '@/lib/admin/queries';
import { endOfMonth, startOfMonth, todayInChile } from '@/lib/date';
import { PageHeader } from '@/components/admin/PageHeader';
import { AvailabilityCalendar } from '@/components/admin/AvailabilityCalendar';
import { WeeklyScheduleEditor } from '@/components/admin/WeeklyScheduleEditor';
import { TimeSlotsEditor } from '@/components/admin/TimeSlotsEditor';
import { cn } from '@/lib/cn';

export const dynamic = 'force-dynamic';

const TABS = [
  { id: 'calendario', label: 'Calendario' },
  { id: 'habitual', label: 'Semana' },
  { id: 'horarios', label: 'Bloques' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; mes?: string }>;
}) {
  const params = await searchParams;
  const tab: TabId = TABS.some((t) => t.id === params.tab) ? (params.tab as TabId) : 'calendario';

  const today = todayInChile();
  const monthParam = /^\d{4}-\d{2}$/.test(params.mes ?? '') ? `${params.mes}-01` : today;
  const month = startOfMonth(monthParam);

  const [slots, weekly, rows] = await Promise.all([
    listTimeSlots(),
    listWeeklyAvailability(),
    getAdminAvailability(month, endOfMonth(month)),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Disponibilidad"
        description="Define cuándo puedes recibir visitas. Los cambios se ven de inmediato en la web."
      />

      <nav aria-label="Secciones de disponibilidad">
        <ul className="flex gap-1 rounded-full border border-line bg-white p-1">
          {TABS.map((item) => (
            <li key={item.id} className="flex-1">
              <Link
                href={`/admin/disponibilidad?tab=${item.id}${item.id === 'calendario' ? `&mes=${month.slice(0, 7)}` : ''}`}
                aria-current={tab === item.id ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center justify-center rounded-full px-2 text-center text-[0.8125rem] font-semibold whitespace-nowrap transition-colors sm:text-sm',
                  tab === item.id ? 'bg-brand-600 text-white' : 'text-ink-soft hover:bg-surface',
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {tab === 'calendario' && <AvailabilityCalendar month={month} rows={rows} />}

      {tab === 'habitual' && (
        <div>
          <h2 className="text-lg font-semibold text-ink">Horario habitual de la semana</h2>
          <div className="mt-4">
            <WeeklyScheduleEditor slots={slots} weekly={weekly} />
          </div>
        </div>
      )}

      {tab === 'horarios' && (
        <div>
          <h2 className="text-lg font-semibold text-ink">Bloques horarios</h2>
          <div className="mt-4">
            <TimeSlotsEditor slots={slots} />
          </div>
        </div>
      )}
    </div>
  );
}
