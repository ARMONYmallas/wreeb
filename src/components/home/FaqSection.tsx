'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { FAQ_ITEMS, PENDING_ANSWER, type FaqItem } from '@/config/faq';
import { SectionHeading } from '@/components/site/SectionHeading';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';
import { cn } from '@/lib/cn';

export function FaqSection({
  items = FAQ_ITEMS,
  limit,
  showMoreHref,
}: {
  items?: FaqItem[];
  limit?: number;
  showMoreHref?: string;
}) {
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <section id="preguntas" className="section bg-white">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas." />
            <p className="mt-5 text-sm leading-relaxed text-muted">
              ¿Tienes otra consulta? Escríbenos y te respondemos directamente.
            </p>
            <WhatsAppLink
              location="faq"
              className="mt-4 inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-white px-6 text-sm font-semibold text-ink transition-colors hover:bg-surface"
            >
              Hablar por WhatsApp
            </WhatsAppLink>
          </div>

          <div className="lg:col-span-8">
            <ul className="divide-y divide-line border-y border-line">
              {visible.map((item, i) => (
                <FaqRow key={item.question} item={item} defaultOpen={i === 0} />
              ))}
            </ul>

            {showMoreHref && limit && items.length > limit && (
              <a
                href={showMoreHref}
                className="mt-6 inline-flex items-center text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                Ver todas las preguntas frecuentes
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqRow({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const answer = item.answer ?? PENDING_ANSWER;

  return (
    <li>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-start justify-between gap-4 py-5 text-left"
        >
          <span className="text-[1.0625rem] font-semibold text-ink">{item.question}</span>
          <span
            aria-hidden="true"
            className={cn(
              'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors',
              open ? 'border-brand-600 bg-brand-600 text-white' : 'border-line text-muted',
            )}
          >
            {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </span>
        </button>
      </h3>
      {open && (
        <div className="animate-fade pb-5">
          <p className="max-w-2xl text-[0.9375rem] leading-relaxed text-muted">{answer}</p>
        </div>
      )}
    </li>
  );
}
