import { ArrowRight } from 'lucide-react';
import { SPACE_SERVICES, WORK_SERVICES, bookingHref } from '@/config/services';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrackedLink } from '@/components/site/TrackedLink';
import { PhotoSlot } from '@/components/site/PhotoSlot';

const SPACE_VARIANTS = { ventanas: 'window', balcones: 'balcony', terrazas: 'terrace' } as const;

export function ServicesSection() {
  return (
    <section id="servicios" className="section bg-surface">
      <div className="container-page">
        <SectionHeading
          eyebrow="Servicios"
          title="Seguridad para cada espacio."
          description="Trabajamos en los lugares donde más se necesita protección dentro del hogar."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {SPACE_SERVICES.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="group overflow-hidden rounded-3xl border border-line bg-white transition-shadow hover:shadow-[var(--shadow-soft)]"
            >
              <PhotoSlot
                variant={SPACE_VARIANTS[service.slug as keyof typeof SPACE_VARIANTS] ?? 'plain'}
                className="aspect-[16/10] w-full"
                sizes="(min-width: 768px) 33vw, 100vw"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ink">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                <TrackedLink
                  href={bookingHref(service.prefill)}
                  event="click_agendar"
                  location={`servicio_${service.slug}`}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-colors hover:text-brand-800"
                >
                  Agendar visita
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </TrackedLink>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {WORK_SERVICES.map((service) => (
            <article
              key={service.slug}
              id={service.slug}
              className="flex flex-col rounded-3xl border border-line bg-white p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <service.icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{service.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {service.description}
              </p>
              <TrackedLink
                href={bookingHref(service.prefill)}
                event="click_agendar"
                location={`servicio_${service.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700"
              >
                Agendar visita
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </TrackedLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
