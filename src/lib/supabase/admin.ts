import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

/**
 * Cliente con `service_role`. NUNCA debe llegar al navegador.
 * Se usa sólo en route handlers para crear solicitudes, subir fotos y firmar
 * URLs; el resto del panel opera con la sesión del administrador y RLS.
 */
let cached: SupabaseClient | null = null;

export function createAdminSupabase(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error(
      'Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.',
    );
  }
  if (!cached) {
    cached = createClient(SUPABASE_URL, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cached;
}

export function hasServiceRole(): boolean {
  return Boolean(SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
