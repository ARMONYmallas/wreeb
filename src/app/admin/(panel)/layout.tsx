import { requireAdmin } from '@/lib/admin/auth';
import { AdminShell } from '@/components/admin/AdminShell';

/** El panel se renderiza siempre al día: nunca con datos cacheados. */
export const dynamic = 'force-dynamic';

/**
 * Guardián del panel. Todo lo que está dentro de este grupo exige una sesión
 * activa cuyo usuario esté dado de alta en `public.admins`.
 * `/admin/login` queda fuera del grupo y por eso no pasa por aquí.
 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell adminName={admin.fullName ?? admin.email}>{children}</AdminShell>;
}
