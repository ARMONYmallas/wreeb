import type { Metadata } from 'next';
import { JsonLd, buildMetadata, faqSchema } from '@/lib/seo';
import { FaqSection } from '@/components/home/FaqSection';
import { FinalCta } from '@/components/home/FinalCta';
import { SectionHeading } from '@/components/site/SectionHeading';

export const metadata: Metadata = buildMetadata({
  title: 'Preguntas frecuentes',
  description:
    'Dónde trabajamos, cuándo conviene revisar una malla, qué la deteriora, si puedes enviar fotos y cómo funciona la visita.',
  path: '/preguntas-frecuentes',
});

export default function FaqPage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 md:py-16">
          <SectionHeading
            as="h1"
            eyebrow="Preguntas frecuentes"
            title="Todo lo que suelen preguntarnos."
            description="Si tu duda no está aquí, escríbenos por WhatsApp y te respondemos directamente."
          />
        </div>
      </section>

      <FaqSection />
      <FinalCta />
      <JsonLd data={faqSchema()} />
    </>
  );
}
