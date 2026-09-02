import { business } from '@/config/business';
import { formatLongDate } from '@/lib/date';
import { formatPhoneForDisplay } from '@/lib/validation';
import { SERVICE_LABELS, SPACE_LABELS, type ServiceType, type SpaceType } from '@/types';
import { absoluteUrl } from '@/lib/seo';
import { whatsappLink } from '@/lib/whatsapp';

export type AppointmentEmailData = {
  appointmentId: string;
  requestNumber: string;
  name: string;
  phone: string;
  email: string | null;
  regionName: string;
  commune: string;
  spaceType: SpaceType;
  serviceType: ServiceType;
  preferredDate: string;
  timeSlot: { label: string | null; startTime: string; endTime: string } | null;
  photoCount: number;
};

const GREEN = '#1e6c52';
const INK = '#16211d';
const MUTED = '#5b6b65';
const LINE = '#e5eae8';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:24px 12px;background:#f7f9f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">
    <tr><td style="padding:0 0 20px">
      <span style="font-size:16px;font-weight:700;letter-spacing:.14em;color:${INK}">${business.name}</span>
      <span style="display:block;font-size:10px;letter-spacing:.18em;color:${MUTED};text-transform:uppercase;margin-top:4px">${business.tagline}</span>
    </td></tr>
    <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:16px;padding:28px">${body}</td></tr>
    <tr><td style="padding:18px 4px 0;font-size:12px;color:${MUTED};line-height:1.6">
      ${business.name} · ${business.yearsExperience} años en el rubro<br />
      Este correo se generó automáticamente desde el sitio web.
    </td></tr>
  </table>
</body></html>`;
}

function detailRows(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-top:18px">
    ${rows
      .map(
        ([label, value]) => `<tr>
      <td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${MUTED}">${escapeHtml(label)}</td>
      <td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:14px;font-weight:600;text-align:right;color:${INK}">${escapeHtml(value)}</td>
    </tr>`,
      )
      .join('')}
  </table>`;
}

function button(href: string, label: string, primary = true): string {
  const bg = primary ? GREEN : '#ffffff';
  const color = primary ? '#ffffff' : INK;
  const border = primary ? GREEN : LINE;
  return `<a href="${href}" style="display:inline-block;padding:13px 22px;border-radius:999px;background:${bg};color:${color};border:1px solid ${border};font-size:14px;font-weight:600;text-decoration:none">${escapeHtml(label)}</a>`;
}

function slotText(data: AppointmentEmailData): string {
  return data.timeSlot ? `${data.timeSlot.startTime}–${data.timeSlot.endTime}` : 'Por definir';
}

/** Correo interno para ARMONY. */
export function adminEmail(data: AppointmentEmailData) {
  const wa = whatsappLink(
    `Hola ${data.name}, somos ${business.name} 👋 Recibimos tu solicitud de ${SERVICE_LABELS[data.serviceType].toLowerCase()}.`,
    data.phone,
  );
  const detailUrl = absoluteUrl(`/admin/solicitudes/${data.appointmentId}`);

  const body = `
    <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${GREEN}">Nueva solicitud</p>
    <h1 style="margin:8px 0 0;font-size:22px;line-height:1.25;color:${INK}">${escapeHtml(data.name)} · ${escapeHtml(data.commune)}</h1>
    <p style="margin:8px 0 0;font-size:14px;color:${MUTED}">Solicitud ${escapeHtml(data.requestNumber)}</p>
    ${detailRows([
      ['WhatsApp', formatPhoneForDisplay(data.phone)],
      ['Email', data.email ?? 'No indicado'],
      ['Región', data.regionName],
      ['Comuna', data.commune],
      ['Servicio', SERVICE_LABELS[data.serviceType]],
      ['Espacio', SPACE_LABELS[data.spaceType]],
      ['Fecha preferida', formatLongDate(data.preferredDate)],
      ['Horario preferido', slotText(data)],
      ['Fotos adjuntas', data.photoCount > 0 ? `${data.photoCount}` : 'Sin fotos'],
    ])}
    <p style="margin:24px 0 0">
      ${wa ? button(wa, 'Contactar por WhatsApp') : ''}
      ${wa ? '&nbsp;&nbsp;' : ''}${button(detailUrl, 'Ver solicitud', !wa)}
    </p>
    <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:${MUTED}">
      La fecha indicada es la preferencia del cliente. Confirma o reprograma desde el panel.
    </p>`;

  return {
    subject: `Nueva solicitud de visita | ${business.name}`,
    html: shell('Nueva solicitud de visita', body),
    text: [
      `Nueva solicitud ${data.requestNumber}`,
      `${data.name} · ${formatPhoneForDisplay(data.phone)}`,
      `${data.commune}, ${data.regionName}`,
      `${SERVICE_LABELS[data.serviceType]} · ${SPACE_LABELS[data.spaceType]}`,
      `Fecha preferida: ${formatLongDate(data.preferredDate)} ${slotText(data)}`,
      data.photoCount > 0 ? `Fotos: ${data.photoCount}` : 'Sin fotos',
      `Ver solicitud: ${detailUrl}`,
    ].join('\n'),
  };
}

/** Copia para el cliente. Nunca dice que la visita está confirmada. */
export function customerEmail(data: AppointmentEmailData) {
  const body = `
    <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK}">Hola ${escapeHtml(data.name)},</h1>
    <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:${MUTED}">
      Recibimos correctamente tu solicitud.
    </p>
    ${detailRows([
      ['Servicio', SERVICE_LABELS[data.serviceType]],
      ['Espacio', SPACE_LABELS[data.spaceType]],
      ['Comuna', data.commune],
      ['Fecha preferida', formatLongDate(data.preferredDate)],
      ['Horario preferido', slotText(data)],
      ['Número de solicitud', data.requestNumber],
    ])}
    <p style="margin:22px 0 0;font-size:15px;line-height:1.65;color:${MUTED}">
      Nuestro equipo revisará la información y se pondrá en contacto contigo para confirmar.
    </p>
    <p style="margin:14px 0 0;font-size:15px;line-height:1.65;color:${MUTED}">
      Gracias por confiar en ${business.name}.
    </p>`;

  return {
    subject: `Recibimos tu solicitud | ${business.name}`,
    html: shell('Recibimos tu solicitud', body),
    text: [
      `Hola ${data.name},`,
      '',
      'Recibimos correctamente tu solicitud.',
      '',
      `Servicio: ${SERVICE_LABELS[data.serviceType]}`,
      `Comuna: ${data.commune}`,
      `Fecha preferida: ${formatLongDate(data.preferredDate)}`,
      `Horario: ${slotText(data)}`,
      `Número de solicitud: ${data.requestNumber}`,
      '',
      'Nuestro equipo revisará la información y se pondrá en contacto contigo para confirmar.',
      '',
      `Gracias por confiar en ${business.name}.`,
    ].join('\n'),
  };
}
