import { CalendarCheck, MessageCircle } from 'lucide-react';
import { business } from '@/config/business';
import { TrackedLink } from '@/components/site/TrackedLink';
import { WhatsAppLink } from '@/components/site/WhatsAppButton';

export function FinalCta() {
  return (
    <section className="bg-white">
      <div className="container-page pb-16 md:pb-20">
        <div className="rounded-3xl bg-brand-700 px-6 py-12 text-center text-white md:px-12 md:py-16">
          <h2 className="mx-auto max-w-2xl text-3xl leading-tight font-bold md:text-[2.5rem]">
            {business.yearsExperience} años protegiendo lo que más importa.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-brand-100">
            Cuéntanos qué necesitas y solicita una visita fácilmente desde tu celular.
          </p>

          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <TrackedLink
              href="/agendar"
              event="click_agendar"
              location="cta_final"
              className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-white px-7 text-base font-semibold text-brand-800 transition-colors hover:bg-brand-50"
            >
              <CalendarCheck className="h-5 w-5" aria-hidden="true" />
              Agendar visita
            </TrackedLink>
            <WhatsAppLink
              location="cta_final"
              className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              WhatsApp
            </WhatsAppLink>
          </div>
        </div>
      </div>
    </section>
  );
}
