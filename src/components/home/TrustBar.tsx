import { HeartHandshake, RefreshCw, ShieldCheck, Wrench } from 'lucide-react';
import { business } from '@/config/business';

const ITEMS = [
  { icon: ShieldCheck, label: `${business.yearsExperience} años de experiencia` },
  { icon: Wrench, label: 'Instalación profesional' },
  { icon: RefreshCw, label: 'Revisión y recambio' },
  { icon: HeartHandshake, label: 'Atención personalizada' },
];

export function TrustBar() {
  return (
    <section aria-label="Por qué elegir ARMONY" className="border-b border-line bg-surface">
      <div className="container-page">
        {/* Móvil: grilla compacta de 2×2. Escritorio: fila horizontal. */}
        <ul className="grid grid-cols-2 gap-x-4 gap-y-4 py-6 md:flex md:items-center md:justify-between md:gap-6 md:py-5">
          {ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-brand-600 ring-1 ring-line">
                <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" strokeWidth={1.8} />
              </span>
              <span className="text-[0.8125rem] leading-tight font-semibold text-ink-soft md:text-sm">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
