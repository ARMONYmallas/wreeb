import { z } from 'zod';
import { REGION_BY_CODE } from '@/data/chile';
import { SERVICE_TYPES, SPACE_TYPES } from '@/types';

/**
 * Normaliza un teléfono chileno a formato internacional sin signos.
 * Acepta: +56 9 1234 5678 · 56912345678 · 912345678 · 9 1234 5678
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.startsWith('56') && digits.length === 11) return digits;
  if (digits.startsWith('56') && digits.length === 10) return digits; // fijo
  if (digits.length === 9) return `56${digits}`;
  if (digits.length === 8) return `569${digits}`;
  return null;
}

export function formatPhoneForDisplay(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('569')) {
    return `+56 9 ${d.slice(3, 7)} ${d.slice(7)}`;
  }
  if (d.startsWith('56')) return `+${d}`;
  return phone;
}

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre')
  .max(80, 'El nombre es demasiado largo')
  // Sin URLs ni etiquetas: filtro simple anti-spam.
  .refine((v) => !/https?:\/\/|<[^>]+>/i.test(v), 'El nombre no puede contener enlaces');

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Escribe tu número de WhatsApp')
  .transform((v, ctx) => {
    const normalized = normalizePhone(v);
    if (!normalized) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Revisa el número, por ejemplo +56 9 1234 5678' });
      return z.NEVER;
    }
    return normalized;
  });

const emailSchema = z
  .string()
  .trim()
  .max(120)
  .email('Revisa el correo')
  .optional()
  .or(z.literal('').transform(() => undefined));

export const step1Schema = z.object({
  spaceType: z.enum(SPACE_TYPES, { errorMap: () => ({ message: 'Elige qué necesitas proteger' }) }),
  serviceType: z.enum(SERVICE_TYPES, { errorMap: () => ({ message: 'Elige qué necesitas' }) }),
});

export const step2Schema = z.object({
  regionCode: z.string().min(1, 'Elige tu región'),
  commune: z.string().min(1, 'Elige tu comuna'),
});

export const step3Schema = z.object({
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha'),
  timeSlotId: z.string().uuid('Elige un horario'),
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Necesitamos tu autorización para gestionar la solicitud' }),
  }),
});

/** Esquema completo, el que valida el servidor. */
export const appointmentSchema = z
  .object({
    spaceType: z.enum(SPACE_TYPES),
    serviceType: z.enum(SERVICE_TYPES),
    regionCode: z.string().min(1),
    commune: z.string().min(1),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    timeSlotId: z.string().uuid(),
    name: nameSchema,
    phone: phoneSchema,
    email: emailSchema,
    customerNotes: z.string().trim().max(500).optional().or(z.literal('').transform(() => undefined)),
    consent: z.literal(true, {
      errorMap: () => ({ message: 'Necesitamos tu autorización para gestionar la solicitud' }),
    }),
    /** Campo trampa: los bots lo rellenan, las personas no lo ven. */
    website: z.string().max(0).optional().or(z.literal('')),
    /** Milisegundos que el usuario tardó en completar el formulario. */
    elapsedMs: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    const region = REGION_BY_CODE.get(data.regionCode);
    if (!region) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['regionCode'], message: 'Región no válida' });
      return;
    }
    if (!region.communes.includes(data.commune)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['commune'], message: 'Comuna no válida' });
    }
  });

export type AppointmentInput = z.infer<typeof appointmentSchema>;

// ── Panel administrativo ────────────────────────────────────────────────────

export const timeSlotSchema = z
  .object({
    id: z.string().uuid().optional(),
    label: z.string().trim().max(40).optional().or(z.literal('').transform(() => undefined)),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida'),
    capacity: z.coerce.number().int().min(0).max(50),
    isActive: z.coerce.boolean().optional().default(true),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: 'La hora de término debe ser posterior a la de inicio',
    path: ['endTime'],
  });

export const blockRangeSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige la fecha de inicio'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige la fecha de término'),
    reason: z.string().trim().max(80).optional().or(z.literal('').transform(() => undefined)),
  })
  .refine((d) => d.to >= d.from, {
    message: 'La fecha de término no puede ser anterior a la de inicio',
    path: ['to'],
  });

export const customerDetailsSchema = z.object({
  address: z.string().trim().max(160).optional().or(z.literal('')),
  apartment: z.string().trim().max(40).optional().or(z.literal('')),
  floor: z.string().trim().max(20).optional().or(z.literal('')),
  reference: z.string().trim().max(200).optional().or(z.literal('')),
  windowCount: z
    .union([z.coerce.number().int().min(0).max(200), z.literal('')])
    .optional(),
  details: z.string().trim().max(1000).optional().or(z.literal('')),
});

export const noteSchema = z.object({
  content: z.string().trim().min(1, 'Escribe la nota').max(2000),
});

// ── Formulario del cliente ──────────────────────────────────────────────────
/**
 * Esquema del formulario en el navegador. A diferencia de `appointmentSchema`,
 * no transforma valores: React Hook Form necesita que la entrada y la salida
 * tengan la misma forma. La normalización real ocurre en el servidor.
 */
export const bookingFormSchema = z.object({
  spaceType: z.enum(SPACE_TYPES, {
    errorMap: () => ({ message: 'Elige qué necesitas proteger' }),
  }),
  serviceType: z.enum(SERVICE_TYPES, {
    errorMap: () => ({ message: 'Elige qué necesitas' }),
  }),
  regionCode: z.string().min(1, 'Elige tu región'),
  commune: z.string().min(1, 'Elige tu comuna'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige una fecha'),
  timeSlotId: z.string().uuid('Elige un horario'),
  name: z.string().trim().min(2, 'Escribe tu nombre').max(80, 'El nombre es demasiado largo'),
  phone: z
    .string()
    .trim()
    .min(1, 'Escribe tu número de WhatsApp')
    .refine((v) => normalizePhone(v) !== null, 'Revisa el número, por ejemplo +56 9 1234 5678'),
  email: z
    .string()
    .trim()
    .max(120)
    .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Revisa el correo'),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Necesitamos tu autorización para gestionar la solicitud',
  }),
  website: z.string().max(0).optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const STEP_FIELDS: Record<1 | 2 | 3, (keyof BookingFormValues)[]> = {
  1: ['spaceType', 'serviceType'],
  2: ['regionCode', 'commune'],
  3: ['preferredDate', 'timeSlotId', 'name', 'phone', 'email', 'consent'],
};
