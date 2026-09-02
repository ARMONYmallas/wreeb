import type { Metadata } from 'next';
import { Instagram } from 'lucide-react';
import { business } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { SectionHeading } from '@/components/site/SectionHeading';
import { PhotoSlot } from '@/components/site/PhotoSlot';
import { YearsSection } from '@/components/home/YearsSection';
import { FinalCta } from '@/components/home/FinalCta';

export const metadata: Metadata = buildMetadata({
  title: 'Nosotros',
  description: `${business.yearsExperience} años dedicados a las mallas de seguridad para ventanas, balcones y terrazas.`,
  path: '/nosotros',
});

/**
 * No se inventan fundadores, fecha exacta, equipo, premios ni cantidad de
 * clientes. Sólo se comunica lo que ARMONY confirmó: su trayectoria.
 */
export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid items-center gap-10 py-12 md:py-16 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <SectionHeading
              as="h1"
              eyebrow="Nosotros"
              title={`${business.yearsExperience} años dedicados a lo mismo.`}
              description={`${business.name} es una empresa chilena especializada en mallas de seguridad. Llevamos ${business.yearsExperience} años en el rubro, instalando, revisando y cambiando mallas en ventanas, balcones y terrazas.`}
            />
            <a
              href={business.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-full border border-line-strong bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />@{business.contact.instagram}
            </a>
          </div>
          <div className="lg:col-span-6">
            <PhotoSlot
              variant="terrace"
              className="aspect-[4/3] w-full rounded-3xl border border-line"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container-page">
          <div className="prose-armony mx-auto max-w-2xl">
            <h2>En qué nos especializamos</h2>
            <p>
              Trabajamos exclusivamente en mallas de seguridad. No hacemos de todo un poco: hacemos
              esto, y lo hacemos hace {business.yearsExperience} años. Esa especialización es lo que
              nos permite reconocer rápido qué necesita cada espacio.
            </p>

            <h2>Cómo trabajamos</h2>
            <p>
              Partimos por conocer el lugar. Vamos a terreno, revisamos el espacio, tomamos las
              medidas y conversamos contigo las alternativas antes de instalar. Preferimos explicar
              bien y decidir juntos, en vez de vender rápido.
            </p>
            <ul>
              <li>Visita y medición en terreno, sin que tengas que medir nada.</li>
              <li>Revisión del estado de instalaciones existentes, sean nuestras o de terceros.</li>
              <li>Instalación con atención al detalle en anclajes y tensión.</li>
            </ul>

            <h2>Atención personalizada</h2>
            <p>
              Cada hogar es distinto: un balcón en un piso alto no es lo mismo que una ventana de
              casa, y un hogar con niños pequeños tiene necesidades distintas a uno con mascotas. Por
              eso conversamos caso a caso, por WhatsApp y en la visita.
            </p>

            <h2>Nuestro compromiso</h2>
            <p>
              Preferimos ser claros antes que prometer de más. Si algo no aplica a tu caso, te lo
              decimos. Si conviene esperar o revisar antes de cambiar, también.
            </p>
          </div>
        </div>
      </section>

      <YearsSection />
      <FinalCta />
    </>
  );
}
