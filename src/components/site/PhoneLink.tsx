'use client';

import { track } from '@/lib/analytics';

/** Enlace para llamar, con seguimiento. No se renderiza si no hay número. */
export function PhoneLink({
  phone,
  children,
  className,
  location,
}: {
  phone: string;
  children: React.ReactNode;
  className?: string;
  location: string;
}) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;

  return (
    <a
      href={`tel:+${digits}`}
      className={className}
      onClick={() => track('click_phone', { location })}
    >
      {children}
    </a>
  );
}
