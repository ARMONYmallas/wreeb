'use client';

import { useState, useTransition } from 'react';
import { Check, CalendarClock, Loader2, PhoneCall, X } from 'lucide-react';
import { updateStatus } from '@/app/admin/actions';
import { STATUS_LABELS, type AppointmentStatus } from '@/types';
import { cn } from '@/lib/cn';

const PRIMARY: { status: AppointmentStatus; label: string; icon: typeof Check }[] = [
  { status: 'contacted', label: 'Contactado', icon: PhoneCall },
  { status: 'confirmed', label: 'Confirmar', icon: Check },
  { status: 'reschedule', label: 'Reprogramar', icon: CalendarClock },
];

const SECONDARY: AppointmentStatus[] = ['completed', 'cancelled', 'new'];

export function StatusActions({
  appointmentId,
  current,
  onRequestReschedule,
}: {
  appointmentId: string;
  current: AppointmentStatus;
  onRequestReschedule: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<AppointmentStatus | null>(null);

  const change = (status: AppointmentStatus) => {
    setError(null);
    setBusy(status);
    startTransition(async () => {
      const result = await updateStatus(appointmentId, status);
      if (!result.ok) setError(result.error);
      setBusy(null);
    });
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {PRIMARY.map((action) => {
          const active = current === action.status;
          return (
            <button
              key={action.status}
              type="button"
              disabled={pending}
              onClick={() => {
                if (action.status === 'reschedule') {
                  onRequestReschedule();
                  return;
                }
                change(action.status);
              }}
              className={cn(
                'flex h-14 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-semibold transition-colors',
                active
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-line bg-white text-ink hover:bg-surface',
                pending && 'opacity-70',
              )}
            >
              {busy === action.status ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <action.icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.8} />
              )}
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {SECONDARY.filter((s) => s !== current).map((status) => (
          <button
            key={status}
            type="button"
            disabled={pending}
            onClick={() => change(status)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-xs font-medium text-muted transition-colors hover:bg-surface disabled:opacity-60"
          >
            {status === 'cancelled' && <X className="h-3.5 w-3.5" aria-hidden="true" />}
            Marcar como {STATUS_LABELS[status].toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
