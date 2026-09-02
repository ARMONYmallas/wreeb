import { CalendarCheck, MessageCircle, ShieldCheck } from 'lucide-react';
import { business } from '@/config/business';
import { PhotoSlot } from '@/components/site/PhotoSlot';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';
import { TrackedLink } from '@/components/site/TrackedLink';

const HIGHLIGHTS = [
  `${business.yearsExperience} años de experiencia`,
  'Instalación profesional',
  'Revisión y recambio',
  'Atención personalizada',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-white">
      {/* Fondo muy sutil: nada de gradientes fuertes ni efectos. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-40 h-[30rem] w-[30rem] rounded-full bg-brand-50 blur-3xl"
      />

      <div className="container-page relative">
        <div className="grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20">
          <div className="lg:col-span-6">
            <p className="eyebrow">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {business.yearsExperience} años de experiencia en mallas de seguridad
            </p>

            <h1 className="mt-4 text-[2.5rem] leading-[1.05] font-bold text-ink sm:text-5xl lg:text-[3.5rem]">
              Protege lo que más importa.
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {business.shortDescription}
            </p>

            <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
              Cuéntanos qué necesitas y solicita una visita fácilmente desde tu celular.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <TrackedLink
                href="/agendar"
                event="click_agendar"
                location="hero"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-brand-600 px-8 text-base font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Agendar visita
              </TrackedLink>

              <WhatsAppLink
                location="hero"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-8 text-base font-semibold text-ink transition-colors hover:bg-surface"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
                Hablar por WhatsApp
              </WhatsAppLink>
            </div>

            <ul className="mt-9 grid grid-cols-2 gap-x-5 gap-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-medium text-ink-soft">
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="relative">
              <PhotoSlot
                variant="balcony"
                priority
                className="aspect-[4/5] w-full rounded-3xl border border-line sm:aspect-[5/4] lg:aspect-[4/5]"
                sizes="(min-width: 1024px) 45vw, 100vw"
              />

              {/* Sello de trayectoria: dato real, sin estadísticas inventadas. */}
              <div className="absolute -bottom-5 left-5 flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 shadow-[var(--shadow-soft)] sm:left-8">
                <span className="font-display text-4xl leading-none font-bold text-brand-600">
                  {business.yearsExperience}
                </span>
                <span className="text-xs leading-tight font-semibold tracking-wide text-muted uppercase">
                  Años
                  <br />
                  en el rubro
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
