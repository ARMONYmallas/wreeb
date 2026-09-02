'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, MapPin } from 'lucide-react';
import { business } from '@/config/business';
import { REGIONS } from '@/data/chile';
import { SectionHeading } from '@/components/site/SectionHeading';
import { Select } from '@/components/ui/Field';
import { TrackedLink } from '@/components/site/TrackedLink';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';

/**
 * Cobertura.
 * No inventamos cobertura: la región principal viene de la configuración y el
 * resto siempre se comunica como "según disponibilidad".
 */
export function CoverageSection() {
  const [regionCode, setRegionCode] = useState('');
  const [commune, setCommune] = useState('');

  const region = useMemo(() => REGIONS.find((r) => r.code === regionCode), [regionCode]);
  const isMainRegion = region ? business.coverage.mainRegions.includes(region.name) : false;

  return (
    <section id="cobertura" className="section bg-white">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Cobertura"
              title="¿Trabajamos en tu comuna?"
              description={`Trabajamos principalmente en la ${business.coverage.mainRegions[0]}. ${business.coverage.otherRegionsNote}`}
            />
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-line bg-surface p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Select
                  label="Región"
                  value={regionCode}
                  onChange={(e) => {
                    setRegionCode(e.target.value);
                    setCommune('');
                  }}
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
                  value={commune}
                  disabled={!region}
                  onChange={(e) => setCommune(e.target.value)}
                >
                  <option value="">{region ? 'Selecciona tu comuna' : 'Elige primero la región'}</option>
                  {region?.communes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </div>

              {commune && region && (
                <div className="animate-rise mt-6 rounded-2xl border border-brand-200 bg-white p-5">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                      {isMainRegion ? (
                        <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <MapPin className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <p className="text-[0.9375rem] font-semibold text-ink">
                        {isMainRegion
                          ? `${commune} está dentro de nuestra zona habitual de trabajo.`
                          : `Consulta disponibilidad para ${commune}.`}
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {isMainRegion
                          ? 'Puedes solicitar una visita ahora y coordinamos el día contigo.'
                          : `Atendemos otras regiones según disponibilidad. Cuéntanos y te confirmamos si podemos llegar a ${region.shortName}.`}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <TrackedLink
                      href={`/agendar?region=${region.code}&comuna=${encodeURIComponent(commune)}`}
                      event="click_agendar"
                      location="cobertura"
                      className="inline-flex h-13 flex-1 items-center justify-center rounded-full bg-brand-600 px-6 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-700"
                    >
                      Agendar visita
                    </TrackedLink>
                    <WhatsAppLink
                      location="cobertura"
                      message={`Hola ARMONY 👋 Quiero consultar si atienden en ${commune}, ${region.shortName}.`}
                      className="inline-flex h-13 flex-1 items-center justify-center rounded-full border border-line-strong bg-white px-6 text-[0.9375rem] font-semibold text-ink transition-colors hover:bg-surface"
                    >
                      Consultar por WhatsApp
                    </WhatsAppLink>
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
