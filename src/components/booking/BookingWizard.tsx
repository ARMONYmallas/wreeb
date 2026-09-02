'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { STEP_FIELDS, bookingFormSchema, type BookingFormValues } from '@/lib/validation';
import { SERVICE_TYPES, SPACE_TYPES, type PublicDay, type ServiceType, type SpaceType } from '@/types';
import { track } from '@/lib/analytics';
import type { PreparedPhoto } from '@/lib/images';
import { ProgressBar } from './ProgressBar';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { SuccessScreen, type BookingResult } from './SuccessScreen';

const STORAGE_KEY = 'armony:agenda';

const EMPTY: BookingFormValues = {
  spaceType: '' as SpaceType,
  serviceType: '' as ServiceType,
  regionCode: '',
  commune: '',
  preferredDate: '',
  timeSlotId: '',
  name: '',
  phone: '',
  email: '',
  consent: false,
  website: '',
};

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<PreparedPhoto[]>([]);
  const [days, setDays] = useState<PublicDay[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);

  const startedAt = useRef<number>(Date.now());
  const topRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    mode: 'onTouched',
    defaultValues: EMPTY,
  });

  // ── Preselección desde la home (/agendar?espacio=balcon&servicio=revision) ──
  useEffect(() => {
    const space = searchParams.get('espacio');
    const service = searchParams.get('servicio');
    const region = searchParams.get('region');
    const commune = searchParams.get('comuna');
    if (space && (SPACE_TYPES as readonly string[]).includes(space)) {
      form.setValue('spaceType', space as SpaceType);
    }
    if (service && (SERVICE_TYPES as readonly string[]).includes(service)) {
      form.setValue('serviceType', service as ServiceType);
    }
    if (region) form.setValue('regionCode', region);
    if (commune) form.setValue('commune', commune);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persistencia entre pasos y recargas ──────────────────────────────────
  // Si el usuario vuelve atrás o recarga, no pierde lo que ya escribió.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<BookingFormValues>;
        for (const [key, value] of Object.entries(saved)) {
          if (value !== undefined && value !== '' && key in EMPTY) {
            form.setValue(key as keyof BookingFormValues, value as never);
          }
        }
      }
    } catch {
      // Almacenamiento no disponible (modo privado): seguimos sin persistencia.
    }
    restored.current = true;
    track('start_booking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = form.watch((values) => {
      if (!restored.current) return;
      try {
        // La casilla de consentimiento nunca se recuerda: debe marcarse siempre.
        const { consent, website, ...rest } = values;
        void consent;
        void website;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
      } catch {
        // Sin almacenamiento: no es crítico.
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // ── Disponibilidad ────────────────────────────────────────────────────────
  const loadAvailability = useCallback(async () => {
    setLoadingDays(true);
    try {
      const res = await fetch('/api/availability', { cache: 'no-store' });
      if (!res.ok) throw new Error('availability');
      const data = (await res.json()) as { days: PublicDay[] };
      setDays(data.days ?? []);
    } catch {
      setDays([]);
    } finally {
      setLoadingDays(false);
    }
  }, []);

  useEffect(() => {
    void loadAvailability();
  }, [loadAvailability]);

  const scrollTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goNext = async () => {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    if (step === 1) track('booking_step_1');
    if (step === 2) track('booking_step_2');
    setStep((s) => (s === 3 ? 3 : ((s + 1) as 1 | 2 | 3)));
    scrollTop();
  };

  const goBack = () => {
    if (step === 1) {
      router.push('/');
      return;
    }
    setStep((s) => (s - 1) as 1 | 2 | 3);
    scrollTop();
  };

  const onSubmit = async (values: BookingFormValues) => {
    setSubmitting(true);
    setSubmitError(null);

    const body = new FormData();
    body.set('spaceType', values.spaceType);
    body.set('serviceType', values.serviceType);
    body.set('regionCode', values.regionCode);
    body.set('commune', values.commune);
    body.set('preferredDate', values.preferredDate);
    body.set('timeSlotId', values.timeSlotId);
    body.set('name', values.name);
    body.set('phone', values.phone);
    if (values.email) body.set('email', values.email);
    body.set('consent', 'true');
    body.set('website', values.website ?? '');
    body.set('elapsedMs', String(Date.now() - startedAt.current));
    photos.forEach((photo) => body.append('photos', photo.file, photo.file.name));

    try {
      const res = await fetch('/api/appointments', { method: 'POST', body });
      const data = await res.json();

      if (!res.ok) {
        if (data?.code === 'SLOT_UNAVAILABLE') {
          // Otra persona tomó el último cupo mientras completaba el formulario.
          setSubmitError(
            'Ese horario se acaba de ocupar. Elige otro y volvemos a intentarlo.',
          );
          form.setValue('timeSlotId', '');
          await loadAvailability();
        } else {
          setSubmitError(
            data?.error ?? 'No pudimos enviar tu solicitud. Inténtalo nuevamente en unos segundos.',
          );
        }
        setSubmitting(false);
        return;
      }

      track('complete_booking', {
        service: values.serviceType,
        space: values.spaceType,
        commune: values.commune,
      });
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        /* sin almacenamiento */
      }
      photos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
      setResult(data as BookingResult);
    } catch {
      setSubmitError('Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = useMemo(
    () => ({
      1: '¿Qué necesitas proteger?',
      2: '¿Dónde necesitas el servicio?',
      3: '¿Cuándo prefieres que te visitemos?',
    }),
    [],
  );

  if (result) return <SuccessScreen result={result} />;

  return (
    <div ref={topRef} className="scroll-mt-24">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <ProgressBar step={step} />

          <h1 className="mt-6 text-2xl leading-tight font-bold text-ink sm:text-3xl">
            {stepTitles[step]}
          </h1>

          <div className="mt-6">
            {step === 1 && <StepOne />}
            {step === 2 && <StepTwo photos={photos} onPhotosChange={setPhotos} />}
            {step === 3 && (
              <StepThree
                days={days}
                loadingDays={loadingDays}
                onRefreshAvailability={loadAvailability}
              />
            )}
          </div>

          {submitError && (
            <p
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-800"
            >
              {submitError}
            </p>
          )}

          {/* Acciones: en móvil quedan fijas y siempre alcanzables con el pulgar. */}
          <div className="safe-bottom sticky bottom-0 z-30 mt-8 -mx-5 border-t border-line bg-white/95 px-5 py-3.5 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-14 shrink-0 items-center justify-center gap-1.5 rounded-full border border-line-strong bg-white px-5 text-[0.9375rem] font-semibold text-ink-soft transition-colors hover:bg-surface"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">{step === 1 ? 'Salir' : 'Volver'}</span>
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-base font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  Continuar
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-7 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
                  {submitting ? 'Enviando…' : 'Solicitar visita'}
                </button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
