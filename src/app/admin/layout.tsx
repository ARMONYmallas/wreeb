import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/admin/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'Panel · ARMONY',
  robots: { index: false, follow: false },
};

/** Todo el panel se renderiza siempre al día: nunca con datos cacheados. */
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return <AdminShell adminName={admin.fullName ?? admin.email}>{children}</AdminShell>;
}
