'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Field';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      // Mensaje genérico a propósito: no revelamos si el correo existe.
      setError('Correo o contraseña incorrectos.');
      setLoading(false);
      return;
    }

    router.replace('/admin');
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
      <Input
        label="Correo"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="Contraseña"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? 'Ingresando…' : 'Ingresar'}
      </button>
    </form>
  );
}
