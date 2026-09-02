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

/**
 * Mejor aproximación a la IP del cliente detrás de los proxies de la
 * plataforma.
 *
 * Se prefieren las cabeceras que fija la propia plataforma antes que
 * `x-forwarded-for`, que el cliente puede manipular. Además se sanea y se
 * acorta el valor: es la clave de una tabla, no debe aceptar texto arbitrario.
 */
export function clientIp(request: Request): string {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for')?.split(',')[0],
  ];

  for (const value of candidates) {
    const clean = value?.trim().replace(/[^0-9a-fA-F.:]/g, '') ?? '';
    // Sólo se acepta algo con forma de IPv4 o IPv6.
    if (clean.length >= 3 && clean.length <= 45) return clean;
  }
  return 'desconocida';
}
