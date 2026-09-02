import { GraduationCap, MessagesSquare, Wrench } from 'lucide-react';
import { business } from '@/config/business';

const PILLARS = [
  {
    icon: GraduationCap,
    title: 'Experiencia',
    description: `${business.yearsExperience} años dedicados al mismo rubro, trabajando en ventanas, balcones y terrazas.`,
  },
  {
    icon: MessagesSquare,
    title: 'Asesoría',
    description: 'Revisamos el espacio contigo y te explicamos con claridad qué conviene en tu caso.',
  },
  {
    icon: Wrench,
    title: 'Instalación profesional',
    description: 'Trabajo realizado en terreno, con medición previa y atención a cada detalle.',
  },
];

export function YearsSection() {
  return (
    <section className="section bg-brand-700 text-white">
      <div className="container-page">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="flex items-baseline gap-4">
              <span className="font-display text-[5.5rem] leading-none font-extrabold text-white md:text-[7rem]">
                {business.yearsExperience}
              </span>
              <span className="text-sm leading-tight font-semibold tracking-[0.14em] text-brand-100 uppercase">
                Años de
                <br />
                experiencia
              </span>
            </div>

            <h2 className="mt-8 text-3xl leading-tight font-bold md:text-[2.5rem]">
              Experiencia que entrega tranquilidad.
            </h2>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-brand-100">
              ARMONY lleva {business.yearsExperience} años trabajando en el rubro de las mallas de
              seguridad, ayudando a proteger ventanas, balcones y terrazas.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-4 sm:grid-cols-3">
              {PILLARS.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl bg-brand-800 p-6 ring-1 ring-white/10">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white">
                    <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-100">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
