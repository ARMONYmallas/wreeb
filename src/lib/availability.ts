import 'server-only';
import { createPublicSupabase } from '@/lib/supabase/public';
import { addDays, todayInChile } from '@/lib/date';
import type { PublicDay } from '@/types';

type Row = {
  day: string;
  slot_id: string;
  label: string | null;
  start_time: string;
  end_time: string;
  remaining: number;
};

/**
 * Disponibilidad pública para un rango.
 *
 * Se calcula siempre en la base de datos (horario habitual + excepciones +
 * cupos − solicitudes activas). Si Supabase no está configurado devuelve una
 * lista vacía: el calendario muestra un estado claro en vez de romperse.
 */
export async function getPublicAvailability(
  fromISO: string,
  toISO: string,
): Promise<{ days: PublicDay[]; configured: boolean }> {
  const supabase = createPublicSupabase();
  if (!supabase) return { days: [], configured: false };

  const { data, error } = await supabase.rpc('public_availability', {
    p_from: fromISO,
    p_to: toISO,
  });

  if (error) {
    console.error('[availability] error consultando disponibilidad', error.message);
    return { days: [], configured: true };
  }

  const byDate = new Map<string, PublicDay>();
  for (const row of (data ?? []) as Row[]) {
    const date = row.day;
    if (!byDate.has(date)) byDate.set(date, { date, slots: [] });
    byDate.get(date)!.slots.push({
      slotId: row.slot_id,
      label: row.label,
      startTime: row.start_time.slice(0, 5),
      endTime: row.end_time.slice(0, 5),
      remaining: row.remaining,
    });
  }

  return { days: [...byDate.values()], configured: true };
}

/** Rango por defecto que consulta el calendario del cliente. */
export function defaultAvailabilityRange() {
  const from = todayInChile();
  return { from, to: addDays(from, 89) };
}
