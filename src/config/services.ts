import type { LucideIcon } from 'lucide-react';
import {
  AppWindow, Building2, Fence, Hammer, RefreshCw, SearchCheck,
} from 'lucide-react';
import type { ServiceType, SpaceType } from '@/types';

export type ServiceCard = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Preselección al entrar al agendamiento desde esta tarjeta. */
  prefill?: { space?: SpaceType; service?: ServiceType };
};

/** Espacios que ARMONY protege. */
export const SPACE_SERVICES: ServiceCard[] = [
  {
    slug: 'ventanas',
    title: 'Ventanas',
    description:
      'Protección para ventanas de departamentos y casas, adaptada a cada tipo de marco y apertura.',
    icon: AppWindow,
    prefill: { space: 'ventanas' },
  },
  {
    slug: 'balcones',
    title: 'Balcones',
    description:
      'Cierre de balcones en altura, uno de los espacios donde más se solicita protección.',
    icon: Building2,
    prefill: { space: 'balcon' },
  },
  {
    slug: 'terrazas',
    title: 'Terrazas',
    description:
      'Soluciones para terrazas y patios en altura, pensadas para el uso diario de la familia.',
    icon: Fence,
    prefill: { space: 'terraza' },
  },
];

/** Tipos de trabajo que realiza ARMONY. */
export const WORK_SERVICES: ServiceCard[] = [
  {
    slug: 'instalacion',
    title: 'Instalación nueva',
    description:
      'Instalación profesional en ventanas, balcones y terrazas, con medición en terreno antes de trabajar.',
    icon: Hammer,
    prefill: { service: 'instalacion' },
  },
  {
    slug: 'recambio',
    title: 'Recambio',
    description:
      'Cambio de mallas antiguas o deterioradas, manteniendo o mejorando la instalación existente.',
    icon: RefreshCw,
    prefill: { service: 'recambio' },
  },
  {
    slug: 'revision',
    title: 'Revisión',
    description:
      'Revisión del estado actual de una instalación: tensión, anclajes, desgaste y exposición.',
    icon: SearchCheck,
    prefill: { service: 'revision' },
  },
];

export const ALL_SERVICES = [...SPACE_SERVICES, ...WORK_SERVICES];

/** Construye el enlace a /agendar con la preselección de la tarjeta. */
export function bookingHref(prefill?: ServiceCard['prefill']): string {
  if (!prefill) return '/agendar';
  const params = new URLSearchParams();
  if (prefill.space) params.set('espacio', prefill.space);
  if (prefill.service) params.set('servicio', prefill.service);
  const qs = params.toString();
  return qs ? `/agendar?${qs}` : '/agendar';
}
