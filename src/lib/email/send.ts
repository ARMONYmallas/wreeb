import 'server-only';
import { Resend } from 'resend';
import { adminEmail, customerEmail, type AppointmentEmailData } from './templates';

/**
 * Envío de notificaciones.
 *
 * Regla de oro: una solicitud NUNCA se pierde porque falle el correo. Esta
 * función se llama después de guardar en base de datos y sólo registra errores.
 */
export async function sendNewAppointmentEmails(data: AppointmentEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const adminTo = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!apiKey || !from) {
    console.warn('[email] Resend no está configurado; se omite la notificación', {
      requestNumber: data.requestNumber,
    });
    return;
  }

  const resend = new Resend(apiKey);

  if (adminTo) {
    const message = adminEmail(data);
    const { error } = await resend.emails.send({
      from,
      to: adminTo,
      replyTo: data.email ?? undefined,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      console.error('[email] no se pudo notificar a ARMONY', {
        requestNumber: data.requestNumber,
        error: error.message,
      });
    }
  } else {
    console.warn('[email] falta ADMIN_NOTIFICATION_EMAIL; ARMONY no será notificada por correo');
  }

  // Copia al cliente sólo si dejó su correo.
  if (data.email) {
    const message = customerEmail(data);
    const { error } = await resend.emails.send({
      from,
      to: data.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if (error) {
      console.error('[email] no se pudo enviar la copia al cliente', {
        requestNumber: data.requestNumber,
        error: error.message,
      });
    }
  }
}
