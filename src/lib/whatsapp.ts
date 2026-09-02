import { business } from '@/config/business';
import { formatLongDate } from '@/lib/date';

const BASE = 'https://wa.me';

export function whatsappLink(message: string, phone = business.contact.whatsapp): string | null {
  const number = phone.replace(/\D/g, '');
  if (number.length < 8) return null;
  return `${BASE}/${number}?text=${encodeURIComponent(message)}`;
}

/** Mensaje del botón flotante y del header. */
export const GENERAL_MESSAGE =
  'Hola ARMONY 👋 Vi su página web y me gustaría consultar por mallas de seguridad.';

/** Mensaje de la pantalla de éxito, con los datos de la solicitud. */
export function successMessage(params: {
  name: string;
  serviceLabel: string;
  commune: string;
  dateISO: string;
}): string {
  return `Hola ARMONY 👋 Soy ${params.name}. Acabo de enviar una solicitud desde su página web para ${params.serviceLabel.toLowerCase()} en ${params.commune}, idealmente el ${formatLongDate(params.dateISO)}.`;
}

/** Mensaje que ARMONY envía al reprogramar. Nunca se envía solo. */
export function rescheduleMessage(params: {
  name: string;
  dateISO: string;
  slotLabel: string;
}): string {
  return `Hola ${params.name}, somos ARMONY. Recibimos tu solicitud. Para poder coordinar mejor, tenemos disponible el ${formatLongDate(params.dateISO)} entre ${params.slotLabel}. ¿Te acomoda?`;
}

/** Primer contacto desde la ficha del cliente. */
export function firstContactMessage(params: { name: string; serviceLabel: string }): string {
  return `Hola ${params.name}, somos ARMONY 👋 Recibimos tu solicitud de ${params.serviceLabel.toLowerCase()}. Para coordinar la visita, ¿nos puedes confirmar la dirección (calle, número, y departamento o piso si corresponde)?`;
}
