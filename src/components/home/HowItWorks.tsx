import { CalendarCheck, Camera, MessageSquareText, PhoneCall } from 'lucide-react';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrackedLink } from '@/components/site/TrackedLink';

const STEPS = [
  {
    icon: MessageSquareText,
    title: 'Cuéntanos qué necesitas',
    description: 'Eliges el espacio que quieres proteger y el tipo de trabajo. Toma menos de un minuto.',
  },
  {
    icon: Camera,
    title: 'Muéstranos el espacio',
    description: 'Puedes adjuntar hasta 3 fotos desde tu celular. Es opcional: también puedes continuar sin ellas.',
  },
  {
    icon: CalendarCheck,
    title: 'Solicita tu visita',
    description: 'Eliges el día y el horario que te acomoda, dentro de la disponibilidad real de ARMONY.',
  },
  {
    icon: PhoneCall,
    title: 'Te contactamos',
    description: 'Revisamos tu solicitud, te escribimos para coordinar los detalles y confirmamos la visita.',
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cómo funciona"
          title="Cuatro pasos y listo."
          description="Sin formularios largos y sin tener que medir nada antes."
        />

        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="relative rounded-3xl border border-line bg-surface p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-line">
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
                </span>
                <span className="font-display text-3xl font-bold text-line-strong" aria-hidden="true">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <TrackedLink
            href="/agendar"
            event="click_agendar"
            location="como_funciona"
            className="inline-flex h-13 items-center justify-center rounded-full bg-brand-600 px-7 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Agendar visita
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
