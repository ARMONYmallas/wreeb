import type { Metadata } from 'next';
import { business } from '@/config/business';
import { JsonLd, buildMetadata, faqSchema } from '@/lib/seo';
import { PageViewTracker } from '@/components/site/PageViewTracker';
import { Hero } from '@/components/home/Hero';
import { TrustBar } from '@/components/home/TrustBar';
import { ProblemSection } from '@/components/home/ProblemSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { YearsSection } from '@/components/home/YearsSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { FamilySection } from '@/components/home/FamilySection';
import { GallerySection } from '@/components/home/GallerySection';
import { SelfCheck } from '@/components/home/SelfCheck';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CoverageSection } from '@/components/home/CoverageSection';
import { CareSection } from '@/components/home/CareSection';
import { FaqSection } from '@/components/home/FaqSection';
import { LegalNotice } from '@/components/home/LegalNotice';
import { FinalCta } from '@/components/home/FinalCta';

export const metadata: Metadata = buildMetadata({
  title: `${business.name} · Mallas de seguridad para ventanas, balcones y terrazas`,
  description: `${business.yearsExperience} años instalando, revisando y cambiando mallas de seguridad en ventanas, balcones y terrazas. Solicita una visita desde tu celular.`,
  path: '/',
});

export default function HomePage() {
  return (
    <>
      <PageViewTracker event="view_home" />
      <Hero />
      <TrustBar />
      <ProblemSection />
      <ServicesSection />
      <YearsSection />
      <HowItWorks />
      <FamilySection />
      <GallerySection />
      <SelfCheck />
      <TestimonialsSection />
      <CoverageSection />
      <CareSection />
      <FaqSection limit={7} showMoreHref="/preguntas-frecuentes" />
      <LegalNotice />
      <FinalCta />
      <JsonLd data={faqSchema()} />
    </>
  );
}
