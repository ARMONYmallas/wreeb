'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, X } from 'lucide-react';
import { track } from '@/lib/analytics';
import {
  ACCEPT_ATTR,
  MAX_PHOTOS,
  compressImage,
  validatePhoto,
  type PreparedPhoto,
} from '@/lib/images';

/**
 * Fotos OPCIONALES (1 a 3).
 * En móvil ofrece cámara y galería por separado. Las imágenes se comprimen en
 * el navegador antes de subirlas. Nunca se obliga al usuario a adjuntar nada.
 */
export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: PreparedPhoto[];
  onChange: (next: PreparedPhoto[]) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Libera las URLs de previsualización al desmontar.
  useEffect(() => {
    return () => photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    // Sólo al desmontar: las urls activas se limpian al quitar cada foto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      setError(null);
      setBusy(true);

      const room = MAX_PHOTOS - photos.length;
      const incoming = Array.from(fileList).slice(0, Math.max(room, 0));
      if (incoming.length < fileList.length) {
        setError(`Puedes adjuntar hasta ${MAX_PHOTOS} fotos.`);
      }

      const prepared: PreparedPhoto[] = [];
      for (const file of incoming) {
        const invalid = validatePhoto(file);
        if (invalid) {
          setError(invalid);
          continue;
        }
        const compressed = await compressImage(file);
        prepared.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file: compressed,
          previewUrl: URL.createObjectURL(compressed),
          originalName: file.name,
        });
      }

      if (prepared.length > 0) {
        track('upload_photo', { count: prepared.length });
        onChange([...photos, ...prepared]);
      }
      setBusy(false);
    },
    [photos, onChange],
  );

  const remove = (id: string) => {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
    setError(null);
  };

  const full = photos.length >= MAX_PHOTOS;

  return (
    <div>
      <p className="text-[0.9375rem] font-semibold text-ink">¿Quieres mostrarnos el espacio?</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        Una foto nos ayuda a entender mejor el espacio, pero puedes continuar sin ella.
      </p>

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-2.5">
          {photos.map((photo) => (
            <li key={photo.id} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface">
                <Image
                  src={photo.previewUrl}
                  alt={`Foto adjunta: ${photo.originalName}`}
                  fill
                  sizes="33vw"
                  unoptimized
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(photo.id)}
                aria-label={`Quitar ${photo.originalName}`}
                className="absolute -top-2 -right-2 grid h-8 w-8 place-items-center rounded-full border border-line bg-white text-ink shadow-[var(--shadow-soft)]"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          disabled={full || busy}
          onClick={() => cameraRef.current?.click()}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-white text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50 sm:hidden"
        >
          <Camera className="h-5 w-5 text-brand-600" aria-hidden="true" />
          Tomar foto
        </button>

        <button
          type="button"
          disabled={full || busy}
          onClick={() => galleryRef.current?.click()}
          className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-2xl border border-line-strong bg-white text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
          ) : (
            <ImagePlus className="h-5 w-5 text-brand-600" aria-hidden="true" />
          )}
          {busy ? 'Preparando…' : photos.length > 0 ? 'Agregar otra' : 'Elegir de la galería'}
        </button>
      </div>

      <p className="mt-2 text-xs text-muted">
        {full
          ? `Ya adjuntaste ${MAX_PHOTOS} fotos, el máximo.`
          : `Hasta ${MAX_PHOTOS} fotos · JPG, PNG, WEBP o HEIC · máx. 8 MB cada una`}
      </p>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        className="sr-only"
        onChange={(e) => {
          void addFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
