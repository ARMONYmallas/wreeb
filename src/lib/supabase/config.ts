export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Permite que el sitio se construya y se sirva aunque falten credenciales.
 * Las secciones que dependen de Supabase muestran un estado degradado claro
 * en vez de romper la página.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const PHOTOS_BUCKET = 'appointment-photos';
