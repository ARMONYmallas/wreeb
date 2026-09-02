import type { Metadata } from 'next';
import { business } from '@/config/business';
import { JsonLd, buildMetadata, serviceSchema } from '@/lib/seo';
import { ServicesSection } from '@/components/home/ServicesSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CareSection } from '@/components/home/CareSection';
import { FinalCta } from '@/components/home/FinalCta';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrustBar } from '@/components/home/TrustBar';

export const metadata: Metadata = buildMetadata({
  title: 'Servicios · Instalación, recambio y revisión de mallas de seguridad',
  description:
    'Instalación nueva, recambio y revisión de mallas de seguridad para ventanas, balcones y terrazas. Visita en terreno y medición incluida.',
  path: '/servicios',
});

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <SectionHeading
            as="h1"
            eyebrow="Servicios"
            title="Seguridad para ventanas, balcones y terrazas."
            description={`${business.shortDescription} Trabajamos con medición en terreno: no necesitas medir nada antes.`}
          />
        </div>
      </section>

      <TrustBar />
      <ServicesSection />
      <HowItWorks />
      <CareSection />
      <FinalCta />

      <JsonLd
        data={serviceSchema({
          name: 'Instalación de mallas de seguridad',
          description: business.shortDescription,
          path: '/servicios',
        })}
      />
    </>
  );
}
