export type NavItem = { label: string; href: string };

export const MAIN_NAV: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Cómo funciona', href: '/#como-funciona' },
  { label: 'Trabajos', href: '/trabajos' },
  { label: 'Nosotros', href: '/nosotros' },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
];

export const FOOTER_SERVICES: NavItem[] = [
  { label: 'Mallas para ventanas', href: '/servicios#ventanas' },
  { label: 'Mallas para balcones', href: '/servicios#balcones' },
  { label: 'Mallas para terrazas', href: '/servicios#terrazas' },
  { label: 'Instalación nueva', href: '/servicios#instalacion' },
  { label: 'Recambio de mallas', href: '/servicios#recambio' },
  { label: 'Revisión de mallas', href: '/servicios#revision' },
];

export const FOOTER_LEGAL: NavItem[] = [
  { label: 'Política de privacidad', href: '/privacidad' },
  { label: 'Términos y condiciones', href: '/terminos' },
];
