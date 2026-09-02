import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LoginForm } from '@/components/admin/LoginForm';
import { Logo } from '@/components/site/Logo';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  const session = await getAdminSession();
  if (session) redirect('/admin');

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-surface px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo asLink={false} />
        </div>

        <div className="mt-8 rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h1 className="text-xl font-bold text-ink">Panel administrativo</h1>
          <p className="mt-1.5 text-sm text-muted">Ingresa con tu correo y contraseña.</p>

          {isSupabaseConfigured ? (
            <LoginForm />
          ) : (
            <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              El panel todavía no está conectado. Completa las variables de Supabase en el archivo
              de entorno para poder ingresar.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          El acceso se otorga manualmente. Si no puedes ingresar, contacta al responsable del sitio.
        </p>
      </div>
    </div>
  );
}
