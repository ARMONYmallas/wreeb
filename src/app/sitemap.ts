import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { hasGallery } from '@/config/gallery';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes: { path: string; priority: number; changeFrequency: 'weekly' | 'monthly' | 'yearly' }[] = [
    { path: '/', priority: 1, changeFrequency: 'weekly' },
    { path: '/servicios', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/mallas-seguridad-santiago', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/nosotros', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/preguntas-frecuentes', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacidad', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/terminos', priority: 0.3, changeFrequency: 'yearly' },
  ];

  // La galería sólo se indexa cuando tiene trabajos reales publicados.
  if (hasGallery) {
    routes.splice(3, 0, { path: '/trabajos', priority: 0.8, changeFrequency: 'monthly' });
  }

  return routes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
