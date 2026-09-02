'use client';

import { useEffect, useState, useTransition } from 'react';
import { Loader2, MessageCircle } from 'lucide-react';
import { rescheduleAppointment } from '@/app/admin/actions';
import { AvailabilityPicker } from '@/components/booking/AvailabilityPicker';
import { Sheet } from '@/components/ui/Sheet';
import { formatLongDate } from '@/lib/date';
import { rescheduleMessage, whatsappLink } from '@/lib/whatsapp';
import type { PublicDay } from '@/types';

/**
 * Reprogramar.
 * Muestra la misma disponibilidad que ve el cliente y, al guardar, prepara el
 * mensaje de WhatsApp. NUNCA lo envía solo: ARMONY decide cuándo enviarlo.
 */
export function RescheduleDialog({
  open,
  onClose,
  appointmentId,
  customerName,
  customerPhone,
}: {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  customerName: string;
  customerPhone: string;
}) {
  const [days, setDays] = useState<PublicDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [slotId, setSlotId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ date: string; slotLabel: string } | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    setSaved(null);
    setError(null);
    setLoading(true);
    fetch('/api/availability', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => setDays(data.days ?? []))
      .catch(() => setDays([]))
      .finally(() => setLoading(false));
  }, [open]);

  const slot = days.find((d) => d.date === date)?.slots.find((s) => s.slotId === slotId);

  const save = () => {
    if (!date || !slotId || !slot) {
      setError('Elige una fecha y un horario.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rescheduleAppointment(appointmentId, date, slotId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved({ date, slotLabel: `${slot.startTime} y ${slot.endTime}` });
    });
  };

  const waHref = saved
    ? whatsappLink(
        rescheduleMessage({
          name: customerName,
          dateISO: saved.date,
          slotLabel: saved.slotLabel,
        }),
        customerPhone,
      )
    : null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Reprogramar visita"
      description={saved ? undefined : 'Elige una nueva fecha y horario disponibles.'}
      footer={
        saved ? (
          <div className="flex flex-col gap-2.5">
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white"
              >
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
                Enviar por WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-13 items-center justify-center rounded-full border border-line-strong bg-white text-[0.9375rem] font-semibold text-ink"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={save}
            disabled={pending || !date || !slotId}
            data-autofocus
            className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-brand-600 text-[0.9375rem] font-semibold text-white disabled:opacity-55"
          >
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            Guardar nueva fecha
          </button>
        )
      }
    >
      {saved ? (
        <div>
          <p className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-brand-900">
            Visita reprogramada para el <strong>{formatLongDate(saved.date)}</strong> entre{' '}
            {saved.slotLabel}.
          </p>
          <p className="mt-4 text-sm font-semibold text-ink">Mensaje para el cliente</p>
          <p className="mt-2 rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed text-ink-soft">
            {rescheduleMessage({
              name: customerName,
              dateISO: saved.date,
              slotLabel: saved.slotLabel,
            })}
          </p>
          <p className="mt-3 text-xs text-muted">
            El mensaje no se envía solo. Revísalo y envíalo cuando quieras.
          </p>
        </div>
      ) : (
        <>
          <AvailabilityPicker
            days={days}
            loading={loading}
            selectedDate={date}
            selectedSlotId={slotId}
            onSelect={(d, s) => {
              setDate(d);
              setSlotId(s);
            }}
            error={error ?? undefined}
          />
        </>
      )}
    </Sheet>
  );
}
