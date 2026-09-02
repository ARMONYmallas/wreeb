/**
 * Testimonios de clientes reales de ARMONY.
 *
 * REGLA: sólo testimonios reales y autorizados. No inventar nombres, textos,
 * estrellas ni cantidades. Si el arreglo está vacío, la sección no se muestra.
 */

export type Testimonial = {
  id: string;
  name: string;
  /** Comuna o referencia, si el cliente autoriza mostrarla. */
  location?: string;
  text: string;
  service?: string;
  /** Foto real, dentro de /public. Opcional. */
  photo?: string;
  /** Usuario de Instagram sin @, si el cliente autoriza enlazarlo. */
  instagram?: string;
};

export const TESTIMONIALS: Testimonial[] = [
  // Pendiente: testimonios reales entregados y autorizados por ARMONY.
];

export const hasTestimonials = TESTIMONIALS.length > 0;
