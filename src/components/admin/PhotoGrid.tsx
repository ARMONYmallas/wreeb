'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Camera, X } from 'lucide-react';

type Photo = { id: string; url: string | null };

/**
 * Fotos enviadas por el cliente.
 * Las URLs son firmadas y de corta duración: el bucket es privado.
 */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const usable = photos.filter((p): p is { id: string; url: string } => Boolean(p.url));

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="flex items-center gap-2 font-semibold text-ink">
        <Camera className="h-[1.125rem] w-[1.125rem] text-brand-600" aria-hidden="true" />
        Fotos del cliente
      </h2>

      {usable.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          {photos.length > 0
            ? 'No pudimos cargar las fotos. Recarga la página.'
            : 'El cliente no adjuntó fotos.'}
        </p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-3 gap-2.5">
            {usable.map((photo) => (
              <li key={photo.id}>
                <button
                  type="button"
                  onClick={() => setOpen(photo.url)}
                  className="relative block aspect-square w-full overflow-hidden rounded-xl border border-line bg-surface"
                >
                  <Image
                    src={photo.url}
                    alt="Foto enviada por el cliente"
                    fill
                    sizes="33vw"
                    unoptimized
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 text-xs text-muted">
            Los enlaces son temporales y sólo funcionan desde el panel.
          </p>
        </>
      )}

      {open && (
        <div
          className="animate-fade fixed inset-0 z-[90] flex items-center justify-center bg-ink/92 p-4"
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
        >
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-[80vh] w-full max-w-3xl">
            <Image src={open} alt="Foto ampliada" fill unoptimized className="object-contain" />
          </div>
        </div>
      )}
    </section>
  );
}
