import Link from 'next/link';
import { cn } from '@/lib/cn';
import { business } from '@/config/business';

/**
 * Marca ARMONY.
 *
 * PENDIENTE: reemplazar por el logotipo oficial cuando ARMONY lo entregue.
 * Mientras tanto se usa un logotipo tipográfico propio (no un placeholder
 * genérico), con un símbolo que evoca la trama de una malla.
 */
export function Logo({
  className,
  compact = false,
  asLink = true,
}: {
  className?: string;
  compact?: boolean;
  asLink?: boolean;
}) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-600 text-white"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 2.5 20 6v6.2c0 4.4-3.2 7.7-8 9.3-4.8-1.6-8-4.9-8-9.3V6l8-3.5Z" strokeLinejoin="round" />
          <path d="M8 8.5v8M12 7v10M16 8.5v8" strokeLinecap="round" opacity=".55" />
          <path d="M5.5 10.5h13M5.5 14h13" strokeLinecap="round" opacity=".55" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.0625rem] font-bold tracking-[0.14em] text-ink">
          {business.name}
        </span>
        {!compact && (
          <span className="mt-1 text-[0.625rem] font-medium tracking-[0.18em] text-muted uppercase">
            {business.tagline}
          </span>
        )}
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label={`${business.name} · Inicio`} className="rounded-lg">
      {content}
    </Link>
  );
}
