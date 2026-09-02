/**
 * Utilidades de fecha ancladas a la zona horaria de Chile.
 *
 * Todas las fechas de agenda se manejan como 'YYYY-MM-DD' (fecha civil, sin
 * hora ni zona). El servidor puede correr en UTC, por lo que "hoy" siempre se
 * calcula con la zona horaria del negocio y nunca con `new Date()` a secas.
 */

export const BUSINESS_TIMEZONE = 'America/Santiago';

const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha de hoy en Chile como 'YYYY-MM-DD'. */
export function todayInChile(): string {
  return isoFormatter.format(new Date());
}

/** Hora local de Chile como 'HH:MM'. */
export function nowTimeInChile(): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: BUSINESS_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
}

/** Crea un Date en UTC a mediodía para evitar corrimientos de día. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toISODate(d);
}

export function addMonths(iso: string, months: number): string {
  const d = parseISODate(iso);
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = daysInMonth(d.getUTCFullYear(), d.getUTCMonth());
  d.setUTCDate(Math.min(day, lastDay));
  return toISODate(d);
}

export function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

/** 0 = domingo … 6 = sábado. */
export function dayOfWeek(iso: string): number {
  return parseISODate(iso).getUTCDay();
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso: string): string {
  const d = parseISODate(iso);
  return toISODate(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 12)));
}

/** Lunes de la semana que contiene `iso`. */
export function startOfWeek(iso: string): string {
  const dow = dayOfWeek(iso);
  const diff = dow === 0 ? -6 : 1 - dow;
  return addDays(iso, diff);
}

export function endOfWeek(iso: string): string {
  return addDays(startOfWeek(iso), 6);
}

export function eachDay(fromISO: string, toISO: string): string[] {
  const out: string[] = [];
  let cur = fromISO;
  let guard = 0;
  while (cur <= toISO && guard++ < 800) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
}

export const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
export const DAY_NAMES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
/** Orden de la semana para la interfaz: lunes primero. */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
export const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** 'viernes 18 de septiembre' */
export function formatLongDate(iso: string): string {
  const d = parseISODate(iso);
  return `${DAY_NAMES[d.getUTCDay()].toLowerCase()} ${d.getUTCDate()} de ${MONTH_NAMES[d.getUTCMonth()]}`;
}

/** 'Vie 18 sep' */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${DAY_NAMES_SHORT[d.getUTCDay()]} ${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()].slice(0, 3)}`;
}

/** '18/09/2026' */
export function formatNumericDate(iso: string): string {
  const d = parseISODate(iso);
  return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()}`;
}

export function formatMonthTitle(iso: string): string {
  const d = parseISODate(iso);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** '09:00:00' → '09:00' */
export function formatTime(time: string): string {
  return time.slice(0, 5);
}

/** '09:00–12:00' */
export function formatRange(start: string, end: string): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

export function relativeDayLabel(iso: string): string | null {
  const today = todayInChile();
  if (iso === today) return 'Hoy';
  if (iso === addDays(today, 1)) return 'Mañana';
  return null;
}

/** Fecha y hora de creación para el admin: '18/09/2026 14:32'. */
export function formatDateTime(isoTimestamp: string): string {
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: BUSINESS_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(isoTimestamp));
}
