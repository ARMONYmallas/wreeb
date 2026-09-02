/**
 * Normaliza la URL del proyecto de Supabase.
 *
 * Es fácil pegar de más: la página «Data API» del panel muestra el endpoint
 * completo (`https://xxx.supabase.co/rest/v1`) y copiar una dirección suele
 * arrastrar una barra final. Cualquiera de las dos cosas hace que la librería
 * arme una ruta inválida y todas las consultas fallen con
 * «Invalid path specified in request URL», que no dice nada sobre la causa.
 *
 * Aquí se recorta hasta el dominio para que ambas formas funcionen igual.
 */
function normalizeSupabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    return `${url.protocol}//${url.host}`;
  } catch {
    // Sin protocolo o con algún carácter suelto: se limpia a mano.
    return trimmed.replace(/\/+$/, '').split('/')[0];
  }
}

export const SUPABASE_URL = normalizeSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

/**
 * Permite que el sitio se construya y se sirva aunque falten credenciales.
 * Las secciones que dependen de Supabase muestran un estado degradado claro
 * en vez de romper la página.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const PHOTOS_BUCKET = 'appointment-photos';
