'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, CalendarRange, Inbox, LayoutDashboard, LogOut } from 'lucide-react';
import { Logo } from '@/components/site/Logo';
import { cn } from '@/lib/cn';
import { signOut } from '@/app/admin/actions';

const NAV = [
  { href: '/admin', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox },
  { href: '/admin/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/admin/disponibilidad', label: 'Disponibilidad', icon: CalendarRange },
];

export function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-dvh bg-surface">
      {/* Escritorio: barra lateral */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-white lg:flex">
        <div className="border-b border-line px-5 py-5">
          <Logo compact />
          <p className="mt-2 text-xs font-medium text-muted">Panel administrativo</p>
        </div>
        <nav className="flex-1 p-3">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-xl px-3.5 text-[0.9375rem] font-medium transition-colors',
                    isActive(item.href, item.exact)
                      ? 'bg-brand-50 text-brand-800'
                      : 'text-ink-soft hover:bg-surface',
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" strokeWidth={1.8} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-line p-3">
          <p className="truncate px-3.5 pb-2 text-xs text-muted">{adminName}</p>
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3.5 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:bg-surface"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Móvil: cabecera compacta */}
      <header className="sticky top-0 z-30 border-b border-line bg-white lg:hidden">
        <div className="flex h-15 items-center justify-between px-4" style={{ height: '3.75rem' }}>
          <Logo compact />
          <form action={signOut}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              className="grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-surface"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-5xl px-4 pt-5 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      {/* Móvil: pestañas inferiores, siempre al alcance del pulgar */}
      <nav
        aria-label="Navegación del panel"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2.5 text-[0.6875rem] font-medium transition-colors',
                    active ? 'text-brand-700' : 'text-muted',
                  )}
                >
                  <item.icon
                    className="h-[1.375rem] w-[1.375rem]"
                    aria-hidden="true"
                    strokeWidth={active ? 2.1 : 1.7}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
