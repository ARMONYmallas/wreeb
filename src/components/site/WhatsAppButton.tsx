'use client';

import { MessageCircle } from 'lucide-react';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { GENERAL_MESSAGE, whatsappLink } from '@/lib/whatsapp';

/**
 * Enlace a WhatsApp con seguimiento. Si el número no está configurado,
 * no se renderiza nada (nunca un botón que no lleva a ningún lado).
 */
export function WhatsAppLink({
  message = GENERAL_MESSAGE,
  children,
  className,
  location,
  onClick,
}: {
  message?: string;
  children: React.ReactNode;
  className?: string;
  location: string;
  onClick?: () => void;
}) {
  const href = whatsappLink(message);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        track('click_whatsapp', { location });
        onClick?.();
      }}
    >
      {children}
    </a>
  );
}

/** Botón flotante global. Se oculta tras la barra fija en móvil. */
export function WhatsAppFab() {
  return (
    <WhatsAppLink
      location="fab"
      className={cn(
        'fixed right-4 bottom-4 z-50 hidden h-14 w-14 items-center justify-center rounded-full',
        'bg-[#25D366] text-white shadow-[var(--shadow-lift)] transition-transform',
        'hover:scale-105 active:scale-95 lg:flex',
      )}
    >
      <MessageCircle className="h-7 w-7" aria-hidden="true" />
      <span className="sr-only">Hablar por WhatsApp</span>
    </WhatsAppLink>
  );
}
