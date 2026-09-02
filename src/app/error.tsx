'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[error]', error.message, error.digest);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-5 py-16 text-center">
      <h1 className="text-2xl font-bold text-ink">Algo salió mal.</h1>
      <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
        Ocurrió un error inesperado. Vuelve a intentarlo; si sigue pasando, escríbenos por WhatsApp.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Reintentar
      </button>
    </div>
  );
}
