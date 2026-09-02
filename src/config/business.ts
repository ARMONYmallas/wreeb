/**
 * ARMONY · Configuración central del negocio
 * ---------------------------------------------------------------------------
 * TODA la información comercial del sitio vive en este archivo.
 * No hardcodear datos de negocio en componentes.
 *
 * Los campos marcados con `pending: true` o valor `null` NO se muestran en la
 * web pública hasta que ARMONY entregue el dato confirmado. Nada se inventa.
 */

/** Marca un dato como pendiente de confirmación por parte de ARMONY. */
export const TODO_CONFIRM_WITH_ARMONY = 'TODO_CONFIRM_WITH_ARMONY' as const;

const env = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, '') || '',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || '',
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};

export const business = {
  name: 'ARMONY',
  legalName: null as string | null, // Pendiente: razón social
  taxId: null as string | null, // Pendiente: RUT
  tagline: 'Mallas de Seguridad',
  concept: '17 años protegiendo lo que más importa.',
  shortDescription:
    'Instalación, revisión y recambio de mallas de seguridad para ventanas, balcones y terrazas.',

  /** Dato REAL entregado por ARMONY. Es el principal argumento de confianza. */
  yearsExperience: 17,

  contact: {
    /** Número en formato internacional sin signos (ej. 56912345678). */
    whatsapp: env.whatsapp,
    /** Teléfono para mostrar / marcar. Si está vacío se usa el de WhatsApp. */
    phone: env.phone,
    email: env.email,
    instagram: 'armony_mallas',
    instagramUrl: 'https://www.instagram.com/armony_mallas/',
  },

  siteUrl: env.siteUrl,

  /** Dirección física: no publicar hasta que ARMONY la confirme. */
  address: null as null | {
    street: string;
    commune: string;
    region: string;
  },

  /**
   * Cobertura. `mainRegions` se muestra como cobertura habitual; el resto se
   * comunica siempre como "según disponibilidad", nunca como cobertura cerrada.
   */
  coverage: {
    mainRegions: ['Región Metropolitana de Santiago'],
    otherRegionsNote: 'Otras regiones según disponibilidad. Consúltanos por WhatsApp.',
  },

  /**
   * Horario de atención comercial (contacto), distinto de la disponibilidad de
   * visitas, que se administra desde /admin/disponibilidad.
   */
  businessHours: {
    weekdays: '09:00 a 18:00',
    saturday: '09:00 a 14:00',
    sunday: 'Cerrado',
    note: 'Los horarios de visita disponibles se muestran al agendar.',
  },

  /**
   * Especificaciones técnicas. NO se publican mientras `confirmed` sea false.
   * Existe información referencial (espesores 0,7–0,8 mm, resistencias, etc.)
   * pero no se presenta como oficial sin documentación de ARMONY.
   */
  technicalSpecs: {
    confirmed: false,
    meshMaterial: null as string | null,
    meshThickness: null as string | null,
    meshResistance: null as string | null,
    meshCertification: null as string | null,
    certificationDocument: null as string | null,
  },

  /** Garantía. No publicar plazos sin confirmación. */
  guarantee: {
    confirmed: false,
    guaranteePeriod: null as string | null,
    details: null as string | null,
  },

  /**
   * Periodos de referencia para revisión/recambio.
   * Se comunican SIEMPRE como orientativos, nunca como fecha de vencimiento.
   */
  maintenance: {
    recommendedReviewPeriod: '2 a 3 años',
    recommendedReplacementPeriod: null as string | null,
    disclaimer:
      'La vida útil puede variar según el material, la instalación, las condiciones de uso y la exposición al ambiente. Por eso es recomendable revisar periódicamente su estado.',
    factors: [
      'Exposición solar',
      'Viento',
      'Humedad',
      'Antigüedad de la instalación',
      'Pérdida de tensión',
      'Estado de los anclajes',
      'Material',
      'Calidad de la instalación',
    ],
  },

  /** ¿La visita tiene costo? Pendiente de confirmar con ARMONY. */
  visitCost: null as string | null,

  /**
   * Sección de información normativa (ej. "Ley Valentín").
   * Se mantiene DESHABILITADA hasta verificar el estado vigente en fuentes
   * oficiales (BCN, Cámara de Diputadas y Diputados, Senado, MINVU,
   * Diario Oficial). No publicar afirmaciones legales sin verificar.
   */
  legalNotice: {
    enabled: false,
    title: null as string | null,
    body: null as string | null,
    sources: [] as { label: string; url: string }[],
  },

  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID || '',
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },
} as const;

/** Teléfono a mostrar: usa el configurado y, si no hay, el de WhatsApp. */
export function displayPhone(): string | null {
  if (business.contact.phone) return business.contact.phone;
  if (!business.contact.whatsapp) return null;
  const n = business.contact.whatsapp;
  // 56912345678 → +56 9 1234 5678
  if (n.length === 11 && n.startsWith('569')) {
    return `+56 9 ${n.slice(3, 7)} ${n.slice(7)}`;
  }
  return `+${n}`;
}

export const isWhatsAppConfigured = () => business.contact.whatsapp.length >= 8;
export const isEmailConfigured = () => business.contact.email.includes('@');
