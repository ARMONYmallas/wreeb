import { Anchor, CloudSun, Gauge, Waves } from 'lucide-react';
import { business } from '@/config/business';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrackedLink } from '@/components/site/TrackedLink';
import { bookingHref } from '@/config/services';

const CHECKS = [
  {
    icon: Gauge,
    title: 'Tensión',
    description:
      'Con el tiempo una instalación puede perder firmeza sin que sea evidente a simple vista.',
  },
  {
    icon: Anchor,
    title: 'Anclajes',
    description: 'Los puntos de fijación son una parte clave y conviene mirarlos periódicamente.',
  },
  {
    icon: Waves,
    title: 'Desgaste',
    description: 'El uso diario y el roce pueden dejar marcas que vale la pena revisar a tiempo.',
  },
  {
    icon: CloudSun,
    title: 'Exposición',
    description: 'Sol, viento y humedad influyen, sobre todo en pisos altos y fachadas expuestas.',
  },
];

export function ProblemSection() {
  return (
    <section className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Mantenimiento"
          title="¿Hace cuánto no revisas tus mallas?"
          description="El sol, la humedad, el viento y el paso del tiempo pueden influir en el estado de una instalación. Una revisión permite evaluar sus condiciones actuales."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHECKS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-2xl border border-line bg-surface p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-brand-600 ring-1 ring-line">
                <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start gap-5 rounded-3xl border border-brand-100 bg-brand-50 p-6 sm:flex-row sm:items-center sm:justify-between md:p-8">
          <p className="max-w-xl text-sm leading-relaxed text-brand-900">
            {business.maintenance.disclaimer}
          </p>
          <TrackedLink
            href={bookingHref({ service: 'revision' })}
            event="click_agendar"
            location="problema"
            className="inline-flex h-13 shrink-0 items-center justify-center rounded-full bg-brand-600 px-7 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Agendar revisión
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
