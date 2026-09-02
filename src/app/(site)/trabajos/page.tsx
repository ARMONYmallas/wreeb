import type { Metadata } from 'next';
import { business } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { GallerySection } from '@/components/home/GallerySection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { FinalCta } from '@/components/home/FinalCta';
import { SectionHeading } from '@/components/site/SectionHeading';

export const metadata: Metadata = buildMetadata({
  title: 'Trabajos realizados',
  description: `Instalaciones y recambios de mallas de seguridad realizados por ${business.name} en hogares reales.`,
  path: '/trabajos',
});

export default function WorksPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <SectionHeading
            as="h1"
            eyebrow="Trabajos"
            title="Instalaciones reales, en hogares reales."
            description={`Todo lo que publicamos aquí corresponde a trabajos hechos por ${business.name}.`}
          />
        </div>
      </section>

      <GallerySection />
      <TestimonialsSection />
      <FinalCta />
    </>
  );
}
