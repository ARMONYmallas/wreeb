'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerSupabase } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/auth';
import {
  blockRangeSchema,
  customerDetailsSchema,
  noteSchema,
  timeSlotSchema,
} from '@/lib/validation';
import { APPOINTMENT_STATUSES, type AppointmentStatus } from '@/types';

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function refreshAdmin(appointmentId?: string) {
  revalidatePath('/admin');
  revalidatePath('/admin/solicitudes');
  revalidatePath('/admin/agenda');
  revalidatePath('/admin/disponibilidad');
  if (appointmentId) revalidatePath(`/admin/solicitudes/${appointmentId}`);
}

function fail(context: string, message: string): ActionResult {
  console.error(`[admin] ${context}: ${message}`);
  if (message.includes('SLOT_UNAVAILABLE')) {
    return { ok: false, error: 'Ese bloque ya no tiene cupos disponibles.' };
  }
  if (message.includes('FORBIDDEN')) {
    return { ok: false, error: 'No tienes permiso para hacer esto.' };
  }
  return { ok: false, error: 'No se pudo guardar. Inténtalo nuevamente.' };
}

// ── Sesión ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ── Solicitudes ─────────────────────────────────────────────────────────────

export async function updateStatus(
  appointmentId: string,
  status: AppointmentStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!APPOINTMENT_STATUSES.includes(status)) {
    return { ok: false, error: 'Estado no válido.' };
  }

  const supabase = await createServerSupabase();
  const { data: current } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentId)
    .maybeSingle();

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);
  if (error) return fail('cambiar estado', error.message);

  await supabase.from('appointment_events').insert({
    appointment_id: appointmentId,
    admin_id: admin.userId,
    author_email: admin.email,
    type: 'status_changed',
    from_status: (current?.status as AppointmentStatus) ?? null,
    to_status: status,
  });

  refreshAdmin(appointmentId);
  return { ok: true };
}

export async function saveCustomerDetails(
  appointmentId: string,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = customerDetailsSchema.safeParse({
    address: formData.get('address') ?? '',
    apartment: formData.get('apartment') ?? '',
    floor: formData.get('floor') ?? '',
    reference: formData.get('reference') ?? '',
    windowCount: formData.get('windowCount') ?? '',
    details: formData.get('details') ?? '',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa los datos.' };
  }

  const v = parsed.data;
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('appointments')
    .update({
      address: v.address || null,
      apartment: v.apartment || null,
      floor: v.floor || null,
      reference: v.reference || null,
      window_count: v.windowCount === '' || v.windowCount === undefined ? null : v.windowCount,
      details: v.details || null,
    })
    .eq('id', appointmentId);
  if (error) return fail('guardar datos del cliente', error.message);

  await supabase.from('appointment_events').insert({
    appointment_id: appointmentId,
    admin_id: admin.userId,
    author_email: admin.email,
    type: 'details_updated',
  });

  refreshAdmin(appointmentId);
  return { ok: true, message: 'Datos guardados.' };
}

export async function addNote(appointmentId: string, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = noteSchema.safeParse({ content: formData.get('content') ?? '' });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Escribe la nota.' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.from('admin_notes').insert({
    appointment_id: appointmentId,
    admin_id: admin.userId,
    author_email: admin.email,
    content: parsed.data.content,
  });
  if (error) return fail('guardar nota', error.message);

  refreshAdmin(appointmentId);
  return { ok: true, message: 'Nota guardada.' };
}

export async function deleteNote(noteId: string, appointmentId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('admin_notes').delete().eq('id', noteId);
  if (error) return fail('borrar nota', error.message);
  refreshAdmin(appointmentId);
  return { ok: true };
}

export async function rescheduleAppointment(
  appointmentId: string,
  date: string,
  slotId: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !z.string().uuid().safeParse(slotId).success) {
    return { ok: false, error: 'Elige una fecha y un horario.' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('reschedule_appointment', {
    p_appointment_id: appointmentId,
    p_date: date,
    p_slot_id: slotId,
    p_author_email: admin.email,
  });
  if (error) return fail('reprogramar', error.message);

  refreshAdmin(appointmentId);
  return { ok: true, message: 'Visita reprogramada.' };
}

// ── Bloques horarios ────────────────────────────────────────────────────────

export async function saveTimeSlot(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = timeSlotSchema.safeParse({
    id: formData.get('id') || undefined,
    label: formData.get('label') ?? '',
    startTime: formData.get('startTime') ?? '',
    endTime: formData.get('endTime') ?? '',
    capacity: formData.get('capacity') ?? '1',
    isActive: formData.get('isActive') === 'true',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa el horario.' };
  }

  const v = parsed.data;
  const supabase = await createServerSupabase();

  if (v.id) {
    const { error } = await supabase
      .from('time_slots')
      .update({
        label: v.label || null,
        start_time: v.startTime,
        end_time: v.endTime,
        default_capacity: v.capacity,
        is_active: v.isActive,
      })
      .eq('id', v.id);
    if (error) return fail('editar bloque', error.message);
  } else {
    const { data: last } = await supabase
      .from('time_slots')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: created, error } = await supabase
      .from('time_slots')
      .insert({
        label: v.label || null,
        start_time: v.startTime,
        end_time: v.endTime,
        default_capacity: v.capacity,
        is_active: v.isActive,
        sort_order: ((last?.sort_order as number) ?? 0) + 1,
      })
      .select('id')
      .single();
    if (error || !created) return fail('crear bloque', error?.message ?? 'sin id');

    // Un bloque nuevo nace activo de lunes a sábado, como el horario habitual.
    const rows = [0, 1, 2, 3, 4, 5, 6].map((dow) => ({
      day_of_week: dow,
      time_slot_id: created.id,
      is_active: dow >= 1 && dow <= 6,
    }));
    await supabase.from('weekly_availability').upsert(rows, {
      onConflict: 'day_of_week,time_slot_id',
    });
  }

  refreshAdmin();
  return { ok: true, message: 'Horario guardado.' };
}

export async function deleteTimeSlot(slotId: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();

  // Un bloque con visitas por delante no se borra: se desactiva, para no
  // perder el historial ni dejar solicitudes sin horario.
  const { count } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('time_slot_id', slotId)
    .in('status', ['new', 'contacted', 'confirmed', 'reschedule']);

  if ((count ?? 0) > 0) {
    const { error } = await supabase.from('time_slots').update({ is_active: false }).eq('id', slotId);
    if (error) return fail('desactivar bloque', error.message);
    refreshAdmin();
    return {
      ok: true,
      message: 'El horario tiene visitas asignadas, así que lo desactivamos en vez de eliminarlo.',
    };
  }

  const { error } = await supabase.from('time_slots').delete().eq('id', slotId);
  if (error) return fail('eliminar bloque', error.message);
  refreshAdmin();
  return { ok: true, message: 'Horario eliminado.' };
}

export async function moveTimeSlot(slotId: string, direction: 'up' | 'down'): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { data: slots } = await supabase
    .from('time_slots')
    .select('id, sort_order')
    .order('sort_order')
    .order('start_time');
  if (!slots) return { ok: false, error: 'No se pudo reordenar.' };

  const index = slots.findIndex((s) => s.id === slotId);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= slots.length) return { ok: true };

  const reordered = [...slots];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

  for (const [position, slot] of reordered.entries()) {
    await supabase.from('time_slots').update({ sort_order: position + 1 }).eq('id', slot.id);
  }

  refreshAdmin();
  return { ok: true };
}

// ── Horario habitual ────────────────────────────────────────────────────────

export async function setWeeklySlot(
  dayOfWeek: number,
  slotId: string,
  isActive: boolean,
): Promise<ActionResult> {
  await requireAdmin();
  if (dayOfWeek < 0 || dayOfWeek > 6) return { ok: false, error: 'Día no válido.' };

  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('weekly_availability')
    .upsert(
      { day_of_week: dayOfWeek, time_slot_id: slotId, is_active: isActive },
      { onConflict: 'day_of_week,time_slot_id' },
    );
  if (error) return fail('guardar horario habitual', error.message);

  refreshAdmin();
  return { ok: true };
}

export async function setWeeklyCapacity(
  dayOfWeek: number,
  slotId: string,
  capacity: number | null,
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase
    .from('weekly_availability')
    .upsert(
      { day_of_week: dayOfWeek, time_slot_id: slotId, capacity_override: capacity, is_active: true },
      { onConflict: 'day_of_week,time_slot_id' },
    );
  if (error) return fail('guardar cupos', error.message);
  refreshAdmin();
  return { ok: true };
}

// ── Excepciones por fecha ───────────────────────────────────────────────────

/** Vuelve a dejar la fecha con el horario habitual. */
export async function restoreDefaultSchedule(date: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from('availability_overrides').delete().eq('date', date);
  if (error) return fail('restaurar horario', error.message);
  refreshAdmin();
  return { ok: true, message: 'Ese día vuelve a usar el horario habitual.' };
}

/** Bloquea el día completo. */
export async function blockDay(date: string, reason?: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('block_date_range', {
    p_from: date,
    p_to: date,
    p_reason: reason || null,
  });
  if (error) return fail('bloquear día', error.message);
  refreshAdmin();
  return { ok: true, message: 'Día bloqueado.' };
}

/**
 * Guarda un horario personalizado para una sola fecha.
 * No modifica el horario habitual ni los demás días.
 */
export async function customizeDay(
  date: string,
  slots: { slotId: string; isActive: boolean; capacity?: number | null }[],
): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();

  // Un día personalizado deja de estar bloqueado.
  const { error: clearError } = await supabase
    .from('availability_overrides')
    .delete()
    .eq('date', date);
  if (clearError) return fail('personalizar día', clearError.message);

  if (slots.length > 0) {
    const { error } = await supabase.from('availability_overrides').insert(
      slots.map((s) => ({
        date,
        time_slot_id: s.slotId,
        is_available: s.isActive,
        capacity_override: s.capacity ?? null,
      })),
    );
    if (error) return fail('personalizar día', error.message);
  }

  refreshAdmin();
  return { ok: true, message: 'Horario del día guardado.' };
}

export async function blockRange(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = blockRangeSchema.safeParse({
    from: formData.get('from') ?? '',
    to: formData.get('to') ?? '',
    reason: formData.get('reason') ?? '',
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Revisa las fechas.' };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('block_date_range', {
    p_from: parsed.data.from,
    p_to: parsed.data.to,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) return fail('bloquear rango', error.message);

  refreshAdmin();
  return { ok: true, message: 'Fechas bloqueadas.' };
}

export async function restoreRange(from: string, to: string): Promise<ActionResult> {
  await requireAdmin();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc('restore_date_range', { p_from: from, p_to: to });
  if (error) return fail('restaurar rango', error.message);
  refreshAdmin();
  return { ok: true, message: 'Horario habitual restaurado.' };
}
