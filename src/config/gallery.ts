/**
 * Trabajos realizados por ARMONY.
 *
 * REGLA: sólo fotografías REALES de ARMONY. No usar imágenes de stock ni
 * generadas por IA presentándolas como trabajos propios.
 *
 * Mientras este arreglo esté vacío, la sección "Trabajos" muestra un estado
 * honesto que enlaza al Instagram de ARMONY (que sí tiene material real),
 * en vez de rellenar con fotos que no corresponden.
 *
 * Para publicar trabajos:
 *   1. Dejar las imágenes en `public/trabajos/`.
 *   2. Agregar una entrada aquí con su categoría y un alt descriptivo.
 */

export const GALLERY_CATEGORIES = [
  { id: 'ventanas', label: 'Ventanas' },
  { id: 'balcones', label: 'Balcones' },
  { id: 'terrazas', label: 'Terrazas' },
  { id: 'recambios', label: 'Recambios' },
] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]['id'];

export type GalleryItem = {
  id: string;
  category: GalleryCategory;
  /** Ruta dentro de /public, ej. '/trabajos/balcon-nunoa.jpg' */
  src: string;
  /** Texto alternativo real y descriptivo (accesibilidad y SEO). */
  alt: string;
  /** Comuna del trabajo, si ARMONY autoriza mostrarla. */
  commune?: string;
  width: number;
  height: number;
  /** Sólo si existe material real de antes y después. */
  before?: { src: string; alt: string };
};

export const GALLERY_ITEMS: GalleryItem[] = [
  // Pendiente: fotografías reales de ARMONY.
];

export const hasGallery = GALLERY_ITEMS.length > 0;
