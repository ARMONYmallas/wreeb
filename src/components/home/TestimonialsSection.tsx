import Image from 'next/image';
import { Instagram, Quote } from 'lucide-react';
import { TESTIMONIALS, hasTestimonials } from '@/config/testimonials';
import { SectionHeading } from '@/components/site/SectionHeading';

/**
 * Testimonios reales.
 * Si no hay testimonios cargados, la sección no se renderiza: preferimos no
 * mostrar nada antes que inventar reseñas o estrellas.
 */
export function TestimonialsSection() {
  if (!hasTestimonials) return null;

  return (
    <section className="section bg-surface">
      <div className="container-page">
        <SectionHeading eyebrow="Testimonios" title="Experiencias que generan confianza." />

        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.id} className="flex flex-col rounded-3xl border border-line bg-white p-6">
              <Quote className="h-6 w-6 text-brand-300" aria-hidden="true" />
              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-ink-soft">
                {t.text}
              </blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                {t.photo ? (
                  <Image
                    src={t.photo}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                    {t.name.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{t.name}</p>
                  <p className="truncate text-xs text-muted">
                    {[t.service, t.location].filter(Boolean).join(' · ')}
                  </p>
                </div>
                {t.instagram && (
                  <a
                    href={`https://www.instagram.com/${t.instagram}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Instagram de ${t.name}`}
                    className="ml-auto text-muted transition-colors hover:text-brand-700"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
