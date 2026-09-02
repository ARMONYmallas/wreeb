import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ShieldCheck } from 'lucide-react';
import { business } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { BookingWizard } from '@/components/booking/BookingWizard';

export const metadata: Metadata = buildMetadata({
  title: 'Agendar visita',
  description:
    'Solicita una visita en menos de un minuto: cuéntanos qué necesitas, dónde estás y cuándo prefieres que te visitemos.',
  path: '/agendar',
  noindex: true,
});

/**
 * El agendamiento vive fuera del grupo `(site)` a propósito: no lleva
 * navegación ni pie de página. En esta pantalla la única tarea es agendar.
 */
export default function BookingPage() {
  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto w-full max-w-2xl px-5 pb-12">
        <Suspense fallback={<WizardSkeleton />}>
          <BookingWizard />
        </Suspense>

        <p className="mt-10 flex items-center justify-center gap-2 text-center text-xs text-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />
          {business.yearsExperience} años de experiencia · Tus datos se usan sólo para gestionar
          esta solicitud
        </p>
      </div>
    </div>
  );
}

function WizardSkeleton() {
  return (
    <div className="animate-pulse pt-24">
      <div className="h-4 w-28 rounded bg-surface-2" />
      <div className="mt-3 h-1.5 rounded-full bg-surface-2" />
      <div className="mt-7 h-9 w-3/4 rounded bg-surface-2" />
      <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-22 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
