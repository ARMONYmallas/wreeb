import type { LucideIcon } from 'lucide-react';
import { Droplets, Hand, ShieldAlert, Sun, Wrench, MessageCircleQuestion } from 'lucide-react';

export type CareTip = {
  title: string;
  description: string;
  icon: LucideIcon;
};

/** Recomendaciones generales de cuidado. Nada de esto son especificaciones técnicas. */
export const CARE_TIPS: CareTip[] = [
  {
    title: 'Evita objetos cortopunzantes',
    description:
      'Tijeras, cuchillos o herramientas cerca de la malla pueden dañar el material sin que se note de inmediato.',
    icon: ShieldAlert,
  },
  {
    title: 'Evita químicos abrasivos',
    description:
      'Para limpiarla, prefiere agua y un paño suave. Los productos fuertes pueden afectar el material con el tiempo.',
    icon: Droplets,
  },
  {
    title: 'Observa la tensión',
    description:
      'Si la malla se siente más floja que antes o cede al apoyarse, conviene revisarla.',
    icon: Hand,
  },
  {
    title: 'Revisa las fijaciones',
    description:
      'Los anclajes y puntos de sujeción son parte clave de la instalación. Vale la pena mirarlos de vez en cuando.',
    icon: Wrench,
  },
  {
    title: 'Considera la exposición',
    description:
      'El sol, el viento y la humedad influyen en el estado de una instalación, sobre todo en pisos altos y fachadas expuestas.',
    icon: Sun,
  },
  {
    title: 'Consulta ante cualquier daño',
    description:
      'Si ves un corte, un desgaste o algo que no estaba antes, es mejor consultarlo que esperar.',
    icon: MessageCircleQuestion,
  },
];
