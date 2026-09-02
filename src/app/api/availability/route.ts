import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getPublicAvailability, defaultAvailabilityRange } from '@/lib/availability';
import { addDays, todayInChile } from '@/lib/date';

/**
 * Disponibilidad pública.
 * Siempre dinámica y sin caché: cuando ARMONY cambia la disponibilidad desde
 * el panel, la web pública lo refleja de inmediato, sin redeploy.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const querySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Parámetros inválidos' }, { status: 400 });
  }

  const fallback = defaultAvailabilityRange();
  const today = todayInChile();
  const from = parsed.data.from && parsed.data.from > today ? parsed.data.from : today;
  // Tope duro: nunca más de 120 días hacia adelante.
  const maxTo = addDays(today, 120);
  const requestedTo = parsed.data.to ?? fallback.to;
  const to = requestedTo > maxTo ? maxTo : requestedTo;

  if (to < from) {
    return NextResponse.json({ error: 'Rango inválido' }, { status: 400 });
  }

  const { days, configured } = await getPublicAvailability(from, to);

  return NextResponse.json(
    { from, to, days, configured },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
