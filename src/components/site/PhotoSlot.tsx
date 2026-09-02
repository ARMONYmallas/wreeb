import Image from 'next/image';
import { cn } from '@/lib/cn';

/**
 * Espacio para fotografía.
 *
 * REGLA: mientras no exista una fotografía REAL de ARMONY, no se muestra una
 * imagen que pueda confundirse con un trabajo suyo. En su lugar se dibuja una
 * pieza gráfica propia (una trama que evoca una malla), que es honesta y se ve
 * profesional.
 *
 * Para publicar una foto real basta con pasar `src` y `alt`.
 */
export function PhotoSlot({
  src,
  alt,
  className,
  variant = 'balcony',
  priority,
  sizes = '(min-width: 1024px) 40vw, 100vw',
}: {
  src?: string;
  alt?: string;
  className?: string;
  variant?: 'balcony' | 'window' | 'terrace' | 'plain';
  priority?: boolean;
  sizes?: string;
}) {
  if (src && alt) {
    return (
      <div className={cn('relative overflow-hidden bg-surface', className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn('relative overflow-hidden bg-brand-50', className)}
      role="img"
      aria-label="Ilustración de una malla de seguridad"
    >
      <MeshGraphic variant={variant} />
    </div>
  );
}

function MeshGraphic({ variant }: { variant: 'balcony' | 'window' | 'terrace' | 'plain' }) {
  return (
    <svg
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <pattern id={`mesh-${variant}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 0h14v14H0z" fill="none" />
          <path d="M0 0L14 14M14 0L0 14" stroke="#1e6c52" strokeWidth="0.7" opacity="0.28" />
        </pattern>
        <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#dcede5" />
        </linearGradient>
      </defs>

      <rect width="400" height="500" fill={`url(#sky-${variant})`} />

      {variant === 'window' && (
        <>
          <rect x="58" y="70" width="284" height="360" rx="6" fill="#ffffff" stroke="#c9d8d1" strokeWidth="3" />
          <path d="M200 70v360M58 250h284" stroke="#c9d8d1" strokeWidth="3" />
          <rect x="58" y="70" width="284" height="360" rx="6" fill={`url(#mesh-${variant})`} />
        </>
      )}

      {variant === 'terrace' && (
        <>
          <rect x="30" y="300" width="340" height="14" rx="3" fill="#c9d8d1" />
          <rect x="30" y="120" width="340" height="180" fill={`url(#mesh-${variant})`} />
          <path d="M30 120h340" stroke="#1e6c52" strokeWidth="3" opacity=".5" />
          <circle cx="300" cy="80" r="26" fill="#f0f7f4" />
        </>
      )}

      {(variant === 'balcony' || variant === 'plain') && (
        <>
          <rect x="46" y="60" width="308" height="300" rx="8" fill="#ffffff" opacity=".65" />
          <rect x="46" y="60" width="308" height="300" rx="8" fill={`url(#mesh-${variant})`} />
          <path d="M46 360h308" stroke="#c9d8d1" strokeWidth="10" strokeLinecap="round" />
          <path d="M80 360V60M320 360V60" stroke="#c9d8d1" strokeWidth="4" />
        </>
      )}

      <rect width="400" height="500" fill="none" />
    </svg>
  );
}
