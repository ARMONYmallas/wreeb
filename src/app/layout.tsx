import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { business } from '@/config/business';
import { JsonLd, absoluteUrl, localBusinessSchema } from '@/lib/seo';
import { Analytics } from '@/components/site/Analytics';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL(business.siteUrl),
  title: {
    default: `${business.name} · Mallas de seguridad para ventanas, balcones y terrazas`,
    template: `%s · ${business.name}`,
  },
  description: business.shortDescription,
  applicationName: business.name,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    type: 'website',
    locale: 'es_CL',
    siteName: `${business.name} · ${business.tagline}`,
    url: absoluteUrl('/'),
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#ffffff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand-600 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
        >
          Saltar al contenido
        </a>
        {children}
        <JsonLd data={localBusinessSchema()} />
        <Analytics />
      </body>
    </html>
  );
}
