'use client';

import { useFormContext } from 'react-hook-form';
import { AppWindow, Building2, Fence, HelpCircle, Hammer, LayoutGrid, RefreshCw, SearchCheck } from 'lucide-react';
import type { BookingFormValues } from '@/lib/validation';
import type { ServiceType, SpaceType } from '@/types';
import { OptionCard } from './OptionCard';

const SPACES: { value: SpaceType; title: string; description: string; icon: typeof AppWindow }[] = [
  { value: 'ventanas', title: 'Ventanas', description: 'Una o varias ventanas del hogar', icon: AppWindow },
  { value: 'balcon', title: 'Balcón', description: 'Cierre de balcón en altura', icon: Building2 },
  { value: 'terraza', title: 'Terraza', description: 'Terraza o patio en altura', icon: Fence },
  { value: 'varios', title: 'Varios espacios', description: 'Más de un lugar de la casa', icon: LayoutGrid },
];

const SERVICES: { value: ServiceType; title: string; icon: typeof Hammer }[] = [
  { value: 'instalacion', title: 'Instalación nueva', icon: Hammer },
  { value: 'recambio', title: 'Cambiar mallas existentes', icon: RefreshCw },
  { value: 'revision', title: 'Revisar mis mallas', icon: SearchCheck },
  { value: 'no_seguro', title: 'No estoy seguro/a', icon: HelpCircle },
];

export function StepOne() {
  const { watch, setValue, formState } = useFormContext<BookingFormValues>();
  const spaceType = watch('spaceType');
  const serviceType = watch('serviceType');
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-8">
      <div role="radiogroup" aria-label="Espacio a proteger">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SPACES.map((s) => (
            <OptionCard
              key={s.value}
              icon={s.icon}
              title={s.title}
              description={s.description}
              selected={spaceType === s.value}
              onClick={() =>
                setValue('spaceType', s.value, { shouldValidate: true, shouldDirty: true })
              }
            />
          ))}
        </div>
        {errors.spaceType && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {errors.spaceType.message}
          </p>
        )}
      </div>

      <div role="radiogroup" aria-labelledby="que-necesitas">
        <h2 id="que-necesitas" className="text-lg font-semibold text-ink">
          ¿Qué necesitas?
        </h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {SERVICES.map((s) => (
            <OptionCard
              key={s.value}
              icon={s.icon}
              title={s.title}
              compact
              selected={serviceType === s.value}
              onClick={() =>
                setValue('serviceType', s.value, { shouldValidate: true, shouldDirty: true })
              }
            />
          ))}
        </div>
        {errors.serviceType && (
          <p role="alert" className="mt-2 text-sm font-medium text-red-700">
            {errors.serviceType.message}
          </p>
        )}
      </div>
    </div>
  );
}
