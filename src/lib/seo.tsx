import type { Metadata } from 'next';
import { business, isWhatsAppConfigured } from '@/config/business';
import { FAQ_FOR_SCHEMA } from '@/config/faq';

const SITE_NAME = `${business.name} · ${business.tagline}`;

export function absoluteUrl(path = '/'): string {
  return new URL(path, business.siteUrl).toString();
}

export function buildMetadata({
  title,
  description,
  path = '/',
  noindex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      locale: 'es_CL',
      siteName: SITE_NAME,
      title,
      description,
      url,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

/**
 * JSON-LD de LocalBusiness.
 * No se incluyen `address`, `aggregateRating` ni `review`: ARMONY todavía no
 * entrega dirección física ni reseñas verificables, y no se inventan.
 */
export function localBusinessSchema() {
  const sameAs = [business.contact.instagramUrl];

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': absoluteUrl('/#negocio'),
    name: business.name,
    description: business.shortDescription,
    url: absoluteUrl('/'),
    foundingDate: String(new Date().getFullYear() - business.yearsExperience),
    slogan: business.concept,
    sameAs,
    ...(isWhatsAppConfigured() ? { telephone: `+${business.contact.whatsapp}` } : {}),
    ...(business.contact.email ? { email: business.contact.email } : {}),
    areaServed: business.coverage.mainRegions.map((name) => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    knowsAbout: [
      'Mallas de seguridad',
      'Redes de protección para balcones',
      'Protección de ventanas',
      'Protección de terrazas',
    ],
  };
}

export function serviceSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    serviceType: name,
    url: absoluteUrl(path),
    provider: { '@id': absoluteUrl('/#negocio') },
    areaServed: business.coverage.mainRegions.map((n) => ({
      '@type': 'AdministrativeArea',
      name: n,
    })),
  };
}

/** Sólo entran preguntas con respuesta confirmada. */
export function faqSchema() {
  if (FAQ_FOR_SCHEMA.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_FOR_SCHEMA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function JsonLd({ data }: { data: object | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      // El contenido es generado por nosotros, no proviene del usuario.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
