import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/admin';
import { PHOTOS_BUCKET } from '@/lib/supabase/config';

export const MAX_PHOTOS = 3;
export const MAX_BYTES = 8 * 1024 * 1024;

/** Firmas de archivo aceptadas. No confiamos en el `Content-Type` declarado. */
const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    mime: 'image/png',
    ext: 'png',
    test: (b) =>
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    mime: 'image/webp',
    ext: 'webp',
    test: (b) =>
      b[0] === 0x52 &&
      b[1] === 0x49 &&
      b[2] === 0x46 &&
      b[3] === 0x46 &&
      b[8] === 0x57 &&
      b[9] === 0x45 &&
      b[10] === 0x42 &&
      b[11] === 0x50,
  },
  {
    // HEIC/HEIF: caja ISO-BMFF 'ftyp' con marca heic/heix/hevc/mif1/msf1.
    mime: 'image/heic',
    ext: 'heic',
    test: (b) => {
      if (!(b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70)) return false;
      const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
      return ['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1', 'heim', 'heis'].includes(brand);
    },
  },
];

export type PhotoUploadResult = {
  uploaded: { storagePath: string; mimeType: string; sizeBytes: number }[];
  rejected: number;
};

/**
 * Sube las fotos al bucket privado.
 *
 * Se valida el tipo real por firma binaria y el tamaño. Un archivo inválido se
 * descarta en silencio: la solicitud del cliente nunca se pierde por una foto.
 */
export async function uploadAppointmentPhotos(
  appointmentId: string,
  files: File[],
): Promise<PhotoUploadResult> {
  const supabase = createAdminSupabase();
  const uploaded: PhotoUploadResult['uploaded'] = [];
  let rejected = 0;

  for (const [index, file] of files.slice(0, MAX_PHOTOS).entries()) {
    if (file.size === 0 || file.size > MAX_BYTES) {
      rejected += 1;
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const head = new Uint8Array(buffer.subarray(0, 16));
    const signature = SIGNATURES.find((s) => s.test(head));

    if (!signature) {
      rejected += 1;
      continue;
    }

    const storagePath = `${appointmentId}/${index + 1}-${crypto.randomUUID().slice(0, 8)}.${signature.ext}`;
    const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(storagePath, buffer, {
      contentType: signature.mime,
      upsert: false,
      cacheControl: '3600',
    });

    if (error) {
      console.error('[upload] no se pudo subir la foto', error.message);
      rejected += 1;
      continue;
    }

    uploaded.push({ storagePath, mimeType: signature.mime, sizeBytes: file.size });
  }

  if (uploaded.length > 0) {
    const { error } = await supabase.from('appointment_photos').insert(
      uploaded.map((u) => ({
        appointment_id: appointmentId,
        storage_path: u.storagePath,
        mime_type: u.mimeType,
        size_bytes: u.sizeBytes,
      })),
    );
    if (error) console.error('[upload] no se pudo registrar la foto', error.message);
  }

  return { uploaded, rejected };
}

/** URL firmada de corta duración, sólo para el panel administrativo. */
export async function signPhotoUrl(storagePath: string, seconds = 60 * 30): Promise<string | null> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrl(storagePath, seconds);
    if (error) return null;
    return data?.signedUrl ?? null;
  } catch {
    return null;
  }
}
