import { NextResponse } from 'next/server';
import { appointmentSchema } from '@/lib/validation';
import { REGION_BY_CODE } from '@/data/chile';
import { createAdminSupabase, hasServiceRole } from '@/lib/supabase/admin';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { uploadAppointmentPhotos, MAX_PHOTOS } from '@/lib/upload';
import { sendNewAppointmentEmails } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Tiempo mínimo razonable para completar tres pasos. Menos es un bot. */
const MIN_ELAPSED_MS = 2500;

export async function POST(request: Request) {
  if (!hasServiceRole()) {
    console.error('[appointments] Supabase no está configurado en el servidor');
    return NextResponse.json(
      { error: 'El agendamiento no está disponible en este momento. Escríbenos por WhatsApp.' },
      { status: 503 },
    );
  }

  // ── 1. Límite de peticiones ───────────────────────────────────────────────
  const ip = clientIp(request);
  const allowed = await checkRateLimit(`appointments:${ip}`, 5, 60 * 60);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Recibimos varias solicitudes desde este dispositivo. Escríbenos por WhatsApp y te ayudamos.' },
      { status: 429 },
    );
  }

  // ── 2. Lectura del formulario ─────────────────────────────────────────────
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'No pudimos leer el formulario.' }, { status: 400 });
  }

  const raw = {
    spaceType: form.get('spaceType'),
    serviceType: form.get('serviceType'),
    regionCode: form.get('regionCode'),
    commune: form.get('commune'),
    preferredDate: form.get('preferredDate'),
    timeSlotId: form.get('timeSlotId'),
    name: form.get('name'),
    phone: form.get('phone'),
    email: form.get('email') ?? '',
    customerNotes: form.get('customerNotes') ?? '',
    consent: form.get('consent') === 'true',
    website: form.get('website') ?? '',
    elapsedMs: form.get('elapsedMs') ?? '0',
  };

  // ── 3. Anti-spam ──────────────────────────────────────────────────────────
  if (typeof raw.website === 'string' && raw.website.length > 0) {
    // Campo trampa relleno: respondemos como si todo estuviera bien.
    return NextResponse.json({ error: 'No pudimos procesar la solicitud.' }, { status: 400 });
  }
  if (Number(raw.elapsedMs) > 0 && Number(raw.elapsedMs) < MIN_ELAPSED_MS) {
    return NextResponse.json({ error: 'No pudimos procesar la solicitud.' }, { status: 400 });
  }

  // ── 4. Validación en servidor ─────────────────────────────────────────────
  const parsed = appointmentSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { error: first?.message ?? 'Revisa los datos e inténtalo nuevamente.', field: first?.path?.[0] },
      { status: 400 },
    );
  }
  const input = parsed.data;
  const region = REGION_BY_CODE.get(input.regionCode)!;

  const supabase = createAdminSupabase();

  // ── 5. Creación transaccional ─────────────────────────────────────────────
  // La disponibilidad se vuelve a validar dentro de la transacción, con un
  // bloqueo sobre fecha:bloque. Dos personas no pueden tomar el último cupo.
  const { data, error } = await supabase.rpc('create_appointment', {
    p_name: input.name,
    p_phone: input.phone,
    p_email: input.email ?? '',
    p_region_code: region.code,
    p_region_name: region.name,
    p_commune: input.commune,
    p_space_type: input.spaceType,
    p_service_type: input.serviceType,
    p_preferred_date: input.preferredDate,
    p_time_slot_id: input.timeSlotId,
    p_customer_notes: input.customerNotes ?? '',
    p_source: 'web',
  });

  if (error) {
    if (error.message.includes('SLOT_UNAVAILABLE')) {
      return NextResponse.json(
        {
          code: 'SLOT_UNAVAILABLE',
          error: 'Ese horario ya no está disponible. Elige otro, por favor.',
        },
        { status: 409 },
      );
    }
    console.error('[appointments] no se pudo crear la solicitud', error.message);
    return NextResponse.json(
      { error: 'No pudimos registrar tu solicitud. Inténtalo nuevamente en unos segundos.' },
      { status: 500 },
    );
  }

  const created = Array.isArray(data) ? data[0] : data;
  if (!created?.id) {
    return NextResponse.json({ error: 'No pudimos registrar tu solicitud.' }, { status: 500 });
  }

  // ── 6. Desde aquí la solicitud YA está guardada ───────────────────────────
  // Nada de lo que siga puede hacer que se pierda.
  const photos = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  let photoCount = 0;
  if (photos.length > 0) {
    try {
      const result = await uploadAppointmentPhotos(created.id, photos.slice(0, MAX_PHOTOS));
      photoCount = result.uploaded.length;
    } catch (err) {
      console.error('[appointments] fallo al subir fotos', err);
    }
  }

  const { data: slot } = await supabase
    .from('time_slots')
    .select('label, start_time, end_time')
    .eq('id', input.timeSlotId)
    .maybeSingle();

  const timeSlot = slot
    ? {
        label: slot.label as string | null,
        startTime: (slot.start_time as string).slice(0, 5),
        endTime: (slot.end_time as string).slice(0, 5),
      }
    : null;

  // ── 7. Notificaciones (nunca bloquean ni pierden la solicitud) ────────────
  try {
    await sendNewAppointmentEmails({
      appointmentId: created.id,
      requestNumber: created.request_number,
      name: input.name,
      phone: input.phone,
      email: input.email ?? null,
      regionName: region.name,
      commune: input.commune,
      spaceType: input.spaceType,
      serviceType: input.serviceType,
      preferredDate: input.preferredDate,
      timeSlot,
      photoCount,
    });
  } catch (err) {
    console.error('[appointments] fallo al notificar por correo', err);
  }

  return NextResponse.json(
    {
      requestNumber: created.request_number,
      name: input.name,
      spaceType: input.spaceType,
      serviceType: input.serviceType,
      commune: input.commune,
      preferredDate: input.preferredDate,
      timeSlot,
    },
    { status: 201 },
  );
}
