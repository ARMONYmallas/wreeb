import 'server-only';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export type AdminSession = {
  userId: string;
  email: string;
  fullName: string | null;
};

/**
 * Comprueba que haya sesión y que el usuario esté en `public.admins`.
 * Estar autenticado no basta: el alta de administradores es manual.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from('admins')
    .select('email, full_name')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!admin) return null;

  return {
    userId: user.id,
    email: (admin.email as string) ?? user.email ?? '',
    fullName: (admin.full_name as string | null) ?? null,
  };
}

/** Igual que `getAdminSession`, pero redirige al inicio de sesión. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  return session;
}
