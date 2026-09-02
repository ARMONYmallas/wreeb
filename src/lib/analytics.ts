'use client';

/**
 * Capa de eventos. Si no hay GA4 ni Meta Pixel configurados, no hace nada:
 * no se carga ningún script de terceros ni se pierde rendimiento.
 */
export type AnalyticsEvent =
  | 'view_home'
  | 'click_agendar'
  | 'start_booking'
  | 'booking_step_1'
  | 'booking_step_2'
  | 'complete_booking'
  | 'click_whatsapp'
  | 'upload_photo'
  | 'click_phone';

type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const META_STANDARD: Partial<Record<AnalyticsEvent, string>> = {
  start_booking: 'InitiateCheckout',
  complete_booking: 'Lead',
  click_whatsapp: 'Contact',
};

export function track(event: AnalyticsEvent, params: Params = {}): void {
  if (typeof window === 'undefined') return;
  try {
    window.gtag?.('event', event, params);
    const metaEvent = META_STANDARD[event];
    if (metaEvent) {
      window.fbq?.('track', metaEvent, params);
    } else {
      window.fbq?.('trackCustom', event, params);
    }
  } catch {
    // La analítica nunca puede romper la experiencia.
  }
}
