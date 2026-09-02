import { Baby, PawPrint } from 'lucide-react';
import { SectionHeading } from '@/components/site/SectionHeading';
import { PhotoSlot } from '@/components/site/PhotoSlot';

/**
 * Niños y mascotas.
 * Tono preventivo y tranquilizador: nunca miedo ni alarmismo.
 */
const GROUPS = [
  {
    icon: Baby,
    title: 'Con niños en casa',
    text: 'Cuando los niños comienzan a explorar, preparar ventanas y balcones se vuelve especialmente importante.',
    note: 'Preparar el hogar también es una forma de cuidar.',
  },
  {
    icon: PawPrint,
    title: 'Con mascotas',
    text: 'Una protección adecuada permite disfrutar ventanas, balcones y terrazas con mayor tranquilidad.',
    note: 'La prevención comienza antes de que aparezca un problema.',
  },
];

export function FamilySection() {
  return (
    <section className="section bg-surface">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Hogar"
              title="Más tranquilidad para toda la familia."
              description="Cada hogar es distinto. En la visita revisamos el espacio y vemos qué solución se acomoda mejor a tu caso."
            />
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-2">
              {GROUPS.map(({ icon: Icon, title, text, note }) => (
                <article key={title} className="overflow-hidden rounded-3xl border border-line bg-white">
                  <PhotoSlot variant="window" className="aspect-[16/9] w-full" sizes="(min-width: 640px) 40vw, 100vw" />
                  <div className="p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-ink">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                    <p className="mt-3 border-t border-line pt-3 text-sm font-medium text-brand-700">
                      {note}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
