'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarCheck, Menu, MessageCircle, X } from 'lucide-react';
import { MAIN_NAV } from '@/config/navigation';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { Logo } from './Logo';
import { WhatsAppLink } from './WhatsAppButton';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href.split('#')[0]) && href !== '/#como-funciona';

  return (
    <header
      className={cn(
        'sticky top-0 z-[60] w-full transition-all duration-300',
        scrolled ? 'border-b border-line bg-white/90 backdrop-blur-md' : 'bg-white',
      )}
    >
      <div className="container-page">
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-300',
            scrolled ? 'h-16' : 'h-[4.5rem] md:h-20',
          )}
        >
          <Logo />

          <nav aria-label="Navegación principal" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'rounded-full px-3.5 py-2 text-[0.9375rem] font-medium transition-colors',
                      isActive(item.href)
                        ? 'text-brand-700'
                        : 'text-ink-soft hover:bg-surface hover:text-ink',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/agendar"
              onClick={() => track('click_agendar', { location: 'header' })}
              className="hidden h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700 sm:inline-flex"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Agendar visita
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:bg-surface lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          id="menu-movil"
          className="animate-fade fixed inset-x-0 top-16 bottom-0 z-[60] overflow-y-auto border-t border-line bg-white lg:hidden"
        >
          <nav aria-label="Navegación móvil" className="container-page py-4">
            <ul className="flex flex-col">
              {MAIN_NAV.map((item) => (
                <li key={item.href} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    className="flex h-14 items-center text-lg font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/agendar"
                onClick={() => track('click_agendar', { location: 'menu_movil' })}
                className="flex h-14 items-center justify-center gap-2 rounded-full bg-brand-600 text-base font-semibold text-white"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                Agendar visita
              </Link>
              <WhatsAppLink
                location="menu_movil"
                onClick={() => setMenuOpen(false)}
                className="flex h-14 items-center justify-center gap-2 rounded-full border border-line-strong text-base font-semibold text-ink"
              >
                <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
                Hablar por WhatsApp
              </WhatsAppLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
