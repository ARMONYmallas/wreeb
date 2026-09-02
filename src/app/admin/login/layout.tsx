import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ingresar · ARMONY',
  robots: { index: false, follow: false },
};

/** El inicio de sesión no pasa por el guardián del panel. */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
