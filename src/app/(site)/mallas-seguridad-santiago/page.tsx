import type { Metadata } from 'next';
import { business } from '@/config/business';
import { REGION_BY_CODE } from '@/data/chile';
import { JsonLd, buildMetadata, serviceSchema } from '@/lib/seo';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrustBar } from '@/components/home/TrustBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FaqSection } from '@/components/home/FaqSection';
import { FinalCta } from '@/components/home/FinalCta';
import { TrackedLink } from '@/components/site/TrackedLink';
import { PhotoSlot } from '@/components/site/PhotoSlot';

export const metadata: Metadata = buildMetadata({
  title: 'Mallas de seguridad en Santiago',
  description: `Instalación, revisión y recambio de mallas de seguridad en la Región Metropolitana. ${business.yearsExperience} años de experiencia. Agenda una visita desde tu celular.`,
  path: '/mallas-seguridad-santiago',
});

/**
 * Única página local, con contenido real y propio.
 *
 * Deliberadamente NO se generan páginas automáticas por comuna: serían
 * contenido pobre y repetido. Si más adelante ARMONY quiere una página para una
 * comuna concreta, debe tener contenido propio (trabajos reales de esa zona,
 * particularidades del sector) antes de publicarse.
 */
export default function SantiagoPage() {
  const rm = REGION_BY_CODE.get('CL-RM');
  const communes = rm?.communes ?? [];

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <SectionHeading
              as="h1"
              eyebrow="Región Metropolitana"
              title="Mallas de seguridad en Santiago."
              description={`Instalamos, revisamos y cambiamos mallas de seguridad en departamentos y casas de la Región Metropolitana. ${business.yearsExperience} años trabajando en el rubro.`}
            />
            <div className="mt-8">
              <TrackedLink
                href="/agendar"
                event="click_agendar"
                location="santiago_hero"
                className="inline-flex h-14 items-center justify-center rounded-full bg-brand-600 px-8 text-base font-semibold text-white transition-colors hover:bg-brand-700"
              >
                Agendar visita
              </TrackedLink>
            </div>
          </div>
          <div className="lg:col-span-6">
            <PhotoSlot
              variant="balcony"
              className="aspect-[4/3] w-full rounded-3xl border border-line"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      <TrustBar />

      <section className="section bg-white">
        <div className="container-page">
          <div className="prose-armony mx-auto max-w-2xl">
            <h2>Departamentos en altura</h2>
            <p>
              Buena parte de nuestro trabajo en Santiago son departamentos. Los balcones y ventanas
              en altura tienen particularidades: el acceso, el tipo de barandas, los reglamentos de
              copropiedad y la exposición al viento cambian de un edificio a otro. Por eso siempre
              revisamos el espacio en terreno antes de proponer una solución.
            </p>

            <h2>Casas y patios</h2>
            <p>
              En casas trabajamos principalmente ventanas, terrazas y patios interiores. Aquí lo que
              suele cambiar es el tipo de marco y el material de los muros, que definen cómo se
              resuelven los anclajes.
            </p>

            <h2>El clima de Santiago importa</h2>
            <p>
              La Región Metropolitana combina veranos de fuerte radiación solar con inviernos
              húmedos. Esa alternancia influye en el estado de una instalación con el paso de los
              años, sobre todo en fachadas orientadas al poniente y en pisos altos, donde además
              pega más el viento. {business.maintenance.disclaimer}
            </p>

            <h2>Comunas donde trabajamos</h2>
            <p>
              Atendemos en toda la Región Metropolitana. Estas son sus {communes.length} comunas:
            </p>
          </div>

          <ul className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
            {communes.map((commune) => (
              <li
                key={commune}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-muted"
              >
                {commune}
              </li>
            ))}
          </ul>

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-relaxed text-muted">
            {business.coverage.otherRegionsNote}
          </p>
        </div>
      </section>

      <HowItWorks />
      <FaqSection limit={6} showMoreHref="/preguntas-frecuentes" />
      <FinalCta />

      <JsonLd
        data={serviceSchema({
          name: 'Mallas de seguridad en Santiago',
          description:
            'Instalación, revisión y recambio de mallas de seguridad para ventanas, balcones y terrazas en la Región Metropolitana.',
          path: '/mallas-seguridad-santiago',
        })}
      />
    </>
  );
}
