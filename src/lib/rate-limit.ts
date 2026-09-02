import 'server-only';
import { createAdminSupabase } from '@/lib/supabase/admin';

/**
 * Límite de peticiones respaldado por la base de datos, para que funcione
 * también con varias instancias serverless.
 * Si falla, NO bloquea: preferimos aceptar una solicitud legítima antes que
 * perderla por un problema de infraestructura.
 */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  try {
    const supabase = createAdminSupabase();
    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) {
      console.error('[rate-limit] fallo al comprobar', error.message);
      return true;
    }
    return data !== false;
  } catch {
    return true;
  }
}

/** Mejor aproximación a la IP del cliente detrás de los proxies de Vercel. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'desconocida';
}
