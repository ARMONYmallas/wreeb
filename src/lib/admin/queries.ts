import 'server-only';
import { createServerSupabase } from '@/lib/supabase/server';
import { signPhotoUrl } from '@/lib/upload';
import { addDays, endOfMonth, endOfWeek, startOfWeek, todayInChile } from '@/lib/date';
import type {
  AdminNote,
  AppointmentEvent,
  AppointmentStatus,
  AppointmentWithSlot,
  TimeSlot,
  WeeklyAvailabilityRow,
} from '@/types';

const APPOINTMENT_COLUMNS = `
  id, request_number, name, phone, email, region_code, region_name, commune,
  space_type, service_type, preferred_date, time_slot_id, status,
  address, apartment, floor, reference, window_count, details, customer_notes,
  created_at, updated_at,
  time_slot:time_slots ( id, label, start_time, end_time )
`;

function normalizeSlot(row: Record<string, unknown>): AppointmentWithSlot {
  const slot = row.time_slot as AppointmentWithSlot['time_slot'] | AppointmentWithSlot['time_slot'][] | null;
  return {
    ...(row as unknown as AppointmentWithSlot),
    time_slot: Array.isArray(slot) ? (slot[0] ?? null) : slot,
  };
}

export type AppointmentFilters = {
  status?: AppointmentStatus | 'all';
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export async function listAppointments(filters: AppointmentFilters = {}) {
  const supabase = await createServerSupabase();
  let query = supabase
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .order('preferred_date', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(filters.limit ?? 200);

  if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
  if (filters.from) query = query.gte('preferred_date', filters.from);
  if (filters.to) query = query.lte('preferred_date', filters.to);

  if (filters.search) {
    const term = filters.search.trim().replace(/[%,()]/g, '');
    if (term) {
      const digits = term.replace(/\D/g, '');
      const clauses = [`name.ilike.%${term}%`, `commune.ilike.%${term}%`, `request_number.ilike.%${term}%`];
      if (digits.length >= 4) clauses.push(`phone.ilike.%${digits}%`);
      query = query.or(clauses.join(','));
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('[admin] no se pudieron listar las solicitudes', error.message);
    return [];
  }
  return (data ?? []).map((row) => normalizeSlot(row as Record<string, unknown>));
}

export async function getAppointment(id: string): Promise<AppointmentWithSlot | null> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeSlot(data as Record<string, unknown>);
}

export async function getAppointmentPhotos(appointmentId: string) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('appointment_photos')
    .select('id, storage_path, mime_type, created_at')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: true });

  // Las fotos viven en un bucket privado: se firman por 30 minutos.
  return Promise.all(
    (data ?? []).map(async (photo) => ({
      id: photo.id as string,
      url: await signPhotoUrl(photo.storage_path as string),
      createdAt: photo.created_at as string,
    })),
  );
}

export async function getAppointmentNotes(appointmentId: string): Promise<AdminNote[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('admin_notes')
    .select('id, appointment_id, author_email, content, created_at')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });
  return (data ?? []) as AdminNote[];
}

export async function getAppointmentEvents(appointmentId: string): Promise<AppointmentEvent[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('appointment_events')
    .select('id, appointment_id, author_email, type, from_status, to_status, meta, created_at')
    .eq('appointment_id', appointmentId)
    .order('created_at', { ascending: false });
  return (data ?? []) as AppointmentEvent[];
}

export async function listTimeSlots(includeInactive = true): Promise<TimeSlot[]> {
  const supabase = await createServerSupabase();
  let query = supabase
    .from('time_slots')
    .select('id, label, start_time, end_time, default_capacity, is_active, sort_order')
    .order('sort_order')
    .order('start_time');
  if (!includeInactive) query = query.eq('is_active', true);
  const { data } = await query;
  return (data ?? []) as TimeSlot[];
}

export async function listWeeklyAvailability(): Promise<WeeklyAvailabilityRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from('weekly_availability')
    .select('id, day_of_week, time_slot_id, is_active, capacity_override');
  return (data ?? []) as WeeklyAvailabilityRow[];
}

export type AdminAvailabilityRow = {
  day: string;
  slot_id: string;
  label: string | null;
  start_time: string;
  end_time: string;
  is_available: boolean;
  capacity: number;
  booked: number;
  is_custom: boolean;
  day_blocked: boolean;
  reason: string | null;
};

export async function getAdminAvailability(from: string, to: string): Promise<AdminAvailabilityRow[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc('admin_availability', { p_from: from, p_to: to });
  if (error) {
    console.error('[admin] no se pudo leer la disponibilidad', error.message);
    return [];
  }
  return (data ?? []) as AdminAvailabilityRow[];
}

/** Cifras del tablero: nuevas, visitas de hoy, próximas y por contactar. */
export async function getDashboardData() {
  const supabase = await createServerSupabase();
  const today = todayInChile();

  const [newOnes, todayVisits, upcoming, pending] = await Promise.all([
    supabase
      .from('appointments')
      .select(APPOINTMENT_COLUMNS)
      .eq('status', 'new')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('appointments')
      .select(APPOINTMENT_COLUMNS)
      .eq('preferred_date', today)
      .in('status', ['new', 'contacted', 'confirmed', 'reschedule'])
      .order('created_at', { ascending: true }),
    supabase
      .from('appointments')
      .select(APPOINTMENT_COLUMNS)
      .gt('preferred_date', today)
      .lte('preferred_date', addDays(today, 14))
      .in('status', ['new', 'contacted', 'confirmed', 'reschedule'])
      .order('preferred_date', { ascending: true })
      .limit(30),
    supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'reschedule']),
  ]);

  const map = (res: { data: unknown[] | null }) =>
    (res.data ?? []).map((row) => normalizeSlot(row as Record<string, unknown>));

  return {
    today,
    newAppointments: map(newOnes),
    todayVisits: map(todayVisits),
    upcoming: map(upcoming),
    pendingCount: pending.count ?? 0,
  };
}

export function agendaRange(scope: 'today' | 'week' | 'month') {
  const today = todayInChile();
  if (scope === 'today') return { from: today, to: today };
  if (scope === 'week') return { from: startOfWeek(today), to: endOfWeek(today) };
  return { from: today, to: endOfMonth(today) };
}
