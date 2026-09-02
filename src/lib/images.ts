'use client';

export const MAX_PHOTOS = 3;
export const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8 MB por archivo, antes de comprimir
export const ACCEPTED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];
export const ACCEPT_ATTR = '.jpg,.jpeg,.png,.webp,.heic,.heif,image/*';

const MAX_DIMENSION = 1600;
const QUALITY = 0.82;

export type PreparedPhoto = {
  id: string;
  file: File;
  previewUrl: string;
  originalName: string;
};

function extensionOf(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/heic' || type === 'image/heif') return 'heic';
  return 'jpg';
}

/**
 * Comprime una imagen en el navegador para que la subida sea rápida incluso
 * con conexión lenta.
 *
 * Si el navegador no puede decodificar el formato (típicamente HEIC fuera de
 * Safari) se envía el archivo original: el servidor y el bucket lo aceptan.
 * Nunca se bloquea al usuario por el formato de su foto.
 */
export async function compressImage(file: File): Promise<File> {
  if (typeof createImageBitmap !== 'function') return file;

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

    // Ya es pequeña y liviana: no vale la pena recomprimir.
    if (scale === 1 && file.size < 900_000 && file.type === 'image/jpeg') {
      bitmap.close?.();
      return file;
    }

    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'foto';
    return new File([blob], `${base}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function validatePhoto(file: File): string | null {
  const type = file.type.toLowerCase();
  const looksLikeImage = type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
  if (!looksLikeImage) return 'Ese archivo no es una imagen.';
  if (file.size > MAX_FILE_BYTES) return 'La imagen supera los 8 MB.';
  return null;
}

export function photoFileName(index: number, type: string): string {
  return `foto-${index + 1}.${extensionOf(type)}`;
}
