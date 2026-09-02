import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel · ARMONY',
  robots: { index: false, follow: false },
};

/**
 * Contenedor de todo lo que cuelga de /admin, incluido el inicio de sesión.
 * A propósito NO comprueba la sesión aquí: si lo hiciera, /admin/login
 * heredaría el guardián y quedaría en un bucle de redirecciones.
 * La protección vive en el grupo (panel).
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
