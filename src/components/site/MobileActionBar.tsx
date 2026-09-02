'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarCheck, MessageCircle } from 'lucide-react';
import { track } from '@/lib/analytics';
import { WhatsAppLink } from './WhatsAppButton';

/**
 * Barra fija inferior en móvil: [WhatsApp] [Agendar visita].
 *
 * · Respeta el safe-area del iPhone.
 * · Se oculta dentro del propio agendamiento (ahí el CTA ya está en pantalla).
 * · Se oculta mientras el teclado virtual está abierto, para no tapar inputs.
 */
export function MobileActionBar() {
  const pathname = usePathname();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    if (!vv) return;
    const onResize = () => {
      // Si el viewport visible se reduce mucho, hay un teclado abierto.
      setKeyboardOpen(vv.height < window.innerHeight * 0.75);
    };
    vv.addEventListener('resize', onResize);
    onResize();
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const hidden = keyboardOpen || pathname.startsWith('/agendar') || pathname.startsWith('/admin');

  if (hidden) return null;

  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <WhatsAppLink
          location="mobile_bar"
          className="flex h-13 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-white text-[0.9375rem] font-semibold text-ink"
        >
          <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
          WhatsApp
        </WhatsAppLink>
        <Link
          href="/agendar"
          onClick={() => track('click_agendar', { location: 'mobile_bar' })}
          className="flex h-13 flex-[1.35] items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white"
        >
          <CalendarCheck className="h-5 w-5" aria-hidden="true" />
          Agendar visita
        </Link>
      </div>
    </div>
  );
}
