import Link from 'next/link';
import { Logo } from '@/components/site/Logo';

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-5 py-16 text-center">
      <Logo asLink={false} />
      <p className="mt-10 font-display text-6xl font-bold text-brand-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-ink">No encontramos esta página.</h1>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
        Es posible que el enlace haya cambiado. Vuelve al inicio o solicita una visita directamente.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-13 items-center justify-center rounded-full border border-line-strong bg-white px-7 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface"
        >
          Volver al inicio
        </Link>
        <Link
          href="/agendar"
          className="inline-flex h-13 items-center justify-center rounded-full bg-brand-600 px-7 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Agendar visita
        </Link>
      </div>
    </div>
  );
}
