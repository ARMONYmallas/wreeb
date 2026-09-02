'use client';

import { useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { REGIONS } from '@/data/chile';
import type { BookingFormValues } from '@/lib/validation';
import type { PreparedPhoto } from '@/lib/images';
import { Select } from '@/components/ui/Field';
import { PhotoUploader } from './PhotoUploader';

export function StepTwo({
  photos,
  onPhotosChange,
}: {
  photos: PreparedPhoto[];
  onPhotosChange: (next: PreparedPhoto[]) => void;
}) {
  const { watch, setValue, register, formState } = useFormContext<BookingFormValues>();
  const regionCode = watch('regionCode');
  const region = useMemo(() => REGIONS.find((r) => r.code === regionCode), [regionCode]);
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Región"
          error={errors.regionCode?.message}
          {...register('regionCode', {
            onChange: () => setValue('commune', '', { shouldValidate: false }),
          })}
        >
          <option value="">Selecciona tu región</option>
          {REGIONS.map((r) => (
            <option key={r.code} value={r.code}>
              {r.name}
            </option>
          ))}
        </Select>

        <Select
          label="Comuna"
          disabled={!region}
          error={errors.commune?.message}
          {...register('commune')}
        >
          <option value="">{region ? 'Selecciona tu comuna' : 'Elige primero la región'}</option>
          {region?.communes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
        <PhotoUploader photos={photos} onChange={onPhotosChange} />
      </div>

      {/* No pedimos dirección todavía: la coordinamos por WhatsApp. */}
      <p className="text-sm leading-relaxed text-muted">
        La dirección exacta la coordinamos después contigo por WhatsApp. Por ahora sólo necesitamos
        saber la zona.
      </p>
    </div>
  );
}
