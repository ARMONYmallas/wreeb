import { CARE_TIPS } from '@/config/care';
import { SectionHeading } from '@/components/site/SectionHeading';

export function CareSection() {
  return (
    <section id="cuidados" className="section bg-surface">
      <div className="container-page">
        <SectionHeading
          eyebrow="Cuidados"
          title="Cómo cuidar tus mallas."
          description="Recomendaciones generales para mantener una instalación en buen estado por más tiempo."
        />

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARE_TIPS.map(({ icon: Icon, title, description }) => (
            <li key={title} className="rounded-2xl border border-line bg-white p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
