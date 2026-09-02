'use client';

import { useState } from 'react';
import { ArrowRight, RotateCcw, SearchCheck } from 'lucide-react';
import { bookingHref } from '@/config/services';
import { SectionHeading } from '@/components/site/SectionHeading';
import { TrackedLink } from '@/components/site/TrackedLink';
import { cn } from '@/lib/cn';

/**
 * Autoevaluación opcional (2 preguntas).
 * Va FUERA del agendamiento para no agregar fricción.
 * El resultado nunca afirma que una malla sea insegura: sólo sugiere revisar.
 */
const AGE_OPTIONS = [
  { id: 'menos1', label: 'Menos de 1 año' },
  { id: '1a2', label: '1 a 2 años' },
  { id: '2a3', label: '2 a 3 años' },
  { id: 'mas3', label: 'Más de 3 años' },
  { id: 'nose', label: 'No lo sé' },
];

const SIGNAL_OPTIONS = [
  { id: 'floja', label: 'Está floja' },
  { id: 'dano', label: 'Tiene daño visible' },
  { id: 'desgaste', label: 'Hay desgaste' },
  { id: 'nose', label: 'No estoy seguro/a' },
];

export function SelfCheck() {
  const [age, setAge] = useState<string | null>(null);
  const [signal, setSignal] = useState<string | null>(null);

  const done = age !== null && signal !== null;

  return (
    <section className="section bg-white">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Opcional"
              title="¿Tu malla necesita una revisión?"
              description="Dos preguntas rápidas para orientarte. No reemplaza una revisión en terreno, pero ayuda a decidir."
            />
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
              <fieldset>
                <legend className="text-[0.9375rem] font-semibold text-ink">
                  ¿Hace cuánto aproximadamente está instalada?
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {AGE_OPTIONS.map((o) => (
                    <OptionChip key={o.id} selected={age === o.id} onClick={() => setAge(o.id)}>
                      {o.label}
                    </OptionChip>
                  ))}
                </div>
              </fieldset>

              <fieldset className="mt-7">
                <legend className="text-[0.9375rem] font-semibold text-ink">
                  ¿Has notado algún cambio?
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SIGNAL_OPTIONS.map((o) => (
                    <OptionChip
                      key={o.id}
                      selected={signal === o.id}
                      onClick={() => setSignal(o.id)}
                    >
                      {o.label}
                    </OptionChip>
                  ))}
                </div>
              </fieldset>

              {done && (
                <div className="animate-rise mt-7 rounded-2xl border border-brand-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <SearchCheck className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[0.9375rem] leading-relaxed font-semibold text-ink">
                        Puede ser recomendable realizar una revisión profesional.
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        Con esta información no es posible determinar el estado real de una
                        instalación. Una revisión en terreno permite evaluar tensión, anclajes y
                        desgaste con precisión.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                    <TrackedLink
                      href={bookingHref({ service: 'revision' })}
                      event="click_agendar"
                      location="autoevaluacion"
                      className="inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                      Agendar revisión
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </TrackedLink>
                    <button
                      type="button"
                      onClick={() => {
                        setAge(null);
                        setSignal(null);
                      }}
                      className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-5 text-sm font-semibold text-ink-soft transition-colors hover:bg-surface"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Empezar de nuevo
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'h-11 rounded-full border px-4 text-sm font-medium transition-colors',
        selected
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-line bg-white text-ink-soft hover:border-line-strong hover:bg-white',
      )}
    >
      {children}
    </button>
  );
}
