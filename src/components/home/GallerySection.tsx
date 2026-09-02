'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Instagram, X } from 'lucide-react';
import { business } from '@/config/business';
import { GALLERY_CATEGORIES, GALLERY_ITEMS, type GalleryCategory } from '@/config/gallery';
import { SectionHeading } from '@/components/site/SectionHeading';
import { cn } from '@/lib/cn';

/**
 * Trabajos realizados.
 * Sólo se muestran fotografías reales de ARMONY. Si todavía no hay material
 * cargado, se enlaza al Instagram, que sí lo tiene, en vez de rellenar con
 * imágenes que no corresponden.
 */
export function GallerySection() {
  const [filter, setFilter] = useState<GalleryCategory | 'todas'>('todas');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const items = useMemo(
    () => (filter === 'todas' ? GALLERY_ITEMS : GALLERY_ITEMS.filter((i) => i.category === filter)),
    [filter],
  );

  const usedCategories = GALLERY_CATEGORIES.filter((c) =>
    GALLERY_ITEMS.some((i) => i.category === c.id),
  );

  return (
    <section id="trabajos" className="section bg-white">
      <div className="container-page">
        <SectionHeading
          eyebrow="Trabajos"
          title={`Trabajos realizados por ${business.name}`}
          description="Instalaciones y recambios hechos en hogares reales."
        />

        {GALLERY_ITEMS.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-line bg-surface p-8 text-center md:p-12">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-brand-600 ring-1 ring-line">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-muted">
              Estamos preparando esta galería con fotografías propias de nuestras instalaciones.
              Mientras tanto, puedes ver trabajos recientes en nuestro Instagram.
            </p>
            <a
              href={business.contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-13 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-7 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface"
            >
              <Instagram className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              Ver @{business.contact.instagram}
            </a>
          </div>
        ) : (
          <>
            {usedCategories.length > 1 && (
              <div className="no-scrollbar mt-8 -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
                <FilterChip active={filter === 'todas'} onClick={() => setFilter('todas')}>
                  Todas
                </FilterChip>
                {usedCategories.map((c) => (
                  <FilterChip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
                    {c.label}
                  </FilterChip>
                ))}
              </div>
            )}

            <ul className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setLightbox(index)}
                    className="group relative block aspect-square w-full overflow-hidden rounded-2xl border border-line bg-surface"
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {item.commune && (
                      <span className="absolute bottom-2 left-2 rounded-full bg-white/92 px-2.5 py-1 text-xs font-medium text-ink">
                        {item.commune}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {lightbox !== null && items[lightbox] && (
              <Lightbox
                items={items}
                index={lightbox}
                onClose={() => setLightbox(null)}
                onNavigate={setLightbox}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-line bg-white text-ink-soft hover:bg-surface',
      )}
    >
      {children}
    </button>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: typeof GALLERY_ITEMS;
  index: number;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  const item = items[index];
  // Sólo se ofrece el antes/después cuando existe material real de ambos.
  const [showBefore, setShowBefore] = useState(false);
  const shown = showBefore && item.before ? item.before : { src: item.src, alt: item.alt };

  const prev = () => {
    setShowBefore(false);
    onNavigate((index - 1 + items.length) % items.length);
  };
  const next = () => {
    setShowBefore(false);
    onNavigate((index + 1) % items.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.alt}
      className="animate-fade fixed inset-0 z-[90] flex items-center justify-center bg-ink/92 p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
      }}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/12 text-white hover:bg-white/22"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Anterior"
            className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white hover:bg-white/22"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Siguiente"
            className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/12 text-white hover:bg-white/22"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure className="max-h-full w-full max-w-3xl">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink">
          <Image src={shown.src} alt={shown.alt} fill sizes="100vw" className="object-contain" />
        </div>

        {item.before && (
          <div
            role="group"
            aria-label="Comparar antes y después"
            className="mt-4 flex justify-center gap-1 rounded-full bg-white/12 p-1"
            style={{ width: 'fit-content', marginInline: 'auto' }}
          >
            {[
              { label: 'Antes', value: true },
              { label: 'Después', value: false },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => setShowBefore(option.value)}
                aria-pressed={showBefore === option.value}
                className={cn(
                  'h-9 rounded-full px-5 text-sm font-semibold transition-colors',
                  showBefore === option.value
                    ? 'bg-white text-ink'
                    : 'text-white/85 hover:text-white',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        <figcaption className="mt-3 text-center text-sm text-white/80">
          {shown.alt}
          {item.commune && ` · ${item.commune}`}
        </figcaption>
      </figure>
    </div>
  );
}
