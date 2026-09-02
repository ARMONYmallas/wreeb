import Link from 'next/link';
import { Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import { business, displayPhone, isEmailConfigured, isWhatsAppConfigured } from '@/config/business';
import { FOOTER_LEGAL, FOOTER_SERVICES, MAIN_NAV } from '@/config/navigation';
import { GENERAL_MESSAGE, whatsappLink } from '@/lib/whatsapp';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();
  const phone = displayPhone();
  const wa = whatsappLink(GENERAL_MESSAGE);

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-page py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {business.shortDescription}
            </p>
            <p className="mt-4 text-sm font-semibold text-brand-700">
              {business.yearsExperience} años en el rubro
            </p>
          </div>

          <nav aria-label="Navegación del pie" className="md:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Sitio</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-brand-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Servicios" className="md:col-span-3">
            <h2 className="text-sm font-semibold text-ink">Servicios</h2>
            <ul className="mt-3 flex flex-col gap-2.5">
              {FOOTER_SERVICES.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted transition-colors hover:text-brand-700">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <h2 className="text-sm font-semibold text-ink">Contacto</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand-700"
                  >
                    <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    WhatsApp
                  </a>
                </li>
              )}
              {phone && isWhatsAppConfigured() && (
                <li>
                  <a
                    href={`tel:+${business.contact.whatsapp}`}
                    className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand-700"
                  >
                    <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {phone}
                  </a>
                </li>
              )}
              {isEmailConfigured() && (
                <li>
                  <a
                    href={`mailto:${business.contact.email}`}
                    className="inline-flex items-center gap-2 text-sm break-all text-muted transition-colors hover:text-brand-700"
                  >
                    <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {business.contact.email}
                  </a>
                </li>
              )}
              <li>
                <a
                  href={business.contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-brand-700"
                >
                  <Instagram className="h-4 w-4 shrink-0" aria-hidden="true" />
                  @{business.contact.instagram}
                </a>
              </li>
            </ul>

            <div className="mt-5 rounded-2xl border border-line bg-white p-4">
              <h3 className="text-xs font-semibold tracking-wide text-ink uppercase">Cobertura</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {business.coverage.mainRegions.join(', ')}. {business.coverage.otherRegionsNote}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            © {year} {business.legalName ?? business.name}. Todos los derechos reservados.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LEGAL.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-xs text-muted transition-colors hover:text-brand-700">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
