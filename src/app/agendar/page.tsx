import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { business } from '@/config/business';
import { buildMetadata } from '@/lib/seo';
import { Logo } from '@/components/site/Logo';
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
      {/* Encabezado propio y sin distracciones: aquí la única tarea es agendar. */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-5">
          <Logo compact />
          <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-ink">
            Cancelar
          </Link>
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl px-5 py-8 pb-12 sm:py-10">
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
    <div className="animate-pulse">
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
